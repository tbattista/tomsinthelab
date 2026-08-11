// Server-side print/export pipeline.
//
// A headless Chromium (Playwright) loads /map-print.html, which renders the
// route map with MapLibre GL at the exact pixel dimensions needed for the
// requested paper size and DPI. The resulting screenshot is embedded into a
// correctly-sized PDF with pdf-lib — either as a single page (Letter / 17x22 /
// 24x36) or tiled across 8.5x11 pages with overlap and assembly labels.

const { chromium } = require('playwright');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const config = require('./config');

const POINTS_PER_INCH = 72;

// Paper formats (inches, portrait) and render DPI. Poster DPI is kept at 150
// to bound render memory; letter renders at 200 for crisper small pages.
const FORMATS = {
  letter: { width: 8.5, height: 11, dpi: 200, label: 'US Letter 8.5x11' },
  '17x22': { width: 17, height: 22, dpi: 150, label: 'Poster 17x22' },
  '24x36': { width: 24, height: 36, dpi: 150, label: 'Poster 24x36' },
  // Tiled: rendered at 24x36 then split across home-printable letter sheets.
  tiled: { width: 24, height: 36, dpi: 150, label: 'Tiled 8.5x11 (24x36 poster)', tiled: true },
};

const TILE_PAGE = { width: 8.5, height: 11, margin: 0.25, overlap: 0.5 };

let browserPromise = null;
let renderQueue = Promise.resolve();

function getFormats() {
  return FORMATS;
}

async function getBrowser() {
  if (!browserPromise) {
    const launchOptions = {
      headless: true,
      executablePath: config.CHROMIUM_EXECUTABLE_PATH,
      args: [
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--enable-unsafe-swiftshader',
        '--use-angle=swiftshader',
      ],
    };
    // Honor an outbound proxy if the host environment requires one, but never
    // proxy the loopback fetch of our own print page. Raw Chromium switches
    // are used instead of Playwright's proxy option because the latter always
    // appends "<-loopback>", which would force our localhost page through the
    // proxy too.
    const proxy = process.env.PLAYWRIGHT_PROXY || process.env.HTTPS_PROXY || process.env.https_proxy;
    if (proxy) {
      launchOptions.args.push(`--proxy-server=${proxy}`, '--proxy-bypass-list=localhost;127.0.0.1');
    }
    browserPromise = chromium.launch(launchOptions).catch((err) => {
      browserPromise = null;
      throw err;
    });
  }
  return browserPromise;
}

async function newRenderPage(pageOptions) {
  let browser = await getBrowser();
  if (!browser.isConnected()) {
    // The cached browser died (crash, container restart) — relaunch once.
    browserPromise = null;
    browser = await getBrowser();
  }
  try {
    return await browser.newPage(pageOptions);
  } catch (err) {
    browserPromise = null;
    const fresh = await getBrowser();
    return fresh.newPage(pageOptions);
  }
}

async function renderMapPng(jobId, widthIn, heightIn, dpi) {
  // The page is laid out at CSS-standard 96dpi and rendered with a
  // deviceScaleFactor that brings the raster up to the target DPI, so text
  // and line widths come out at physically correct sizes on paper.
  const page = await newRenderPage({
    viewport: { width: Math.round(widthIn * 96), height: Math.round(heightIn * 96) },
    deviceScaleFactor: dpi / 96,
    ignoreHTTPSErrors: process.env.EXPORT_IGNORE_HTTPS_ERRORS === '1',
  });
  try {
    if (process.env.DEBUG_EXPORT === '1') {
      page.on('console', (msg) => console.log('[print-page]', msg.type(), msg.text()));
      page.on('pageerror', (err) => console.log('[print-page] pageerror', err.message));
    }
    await page.goto(`http://127.0.0.1:${config.PORT}/map-print.html?job=${jobId}`, {
      waitUntil: 'load',
      timeout: config.EXPORT_TIMEOUT_MS,
    });
    await page.waitForFunction(
      () => window.__MAP_STATUS__ === 'ready' || String(window.__MAP_STATUS__ || '').startsWith('error'),
      undefined,
      { timeout: config.EXPORT_TIMEOUT_MS }
    );
    const status = await page.evaluate(() => window.__MAP_STATUS__);
    if (status !== 'ready') {
      throw new Error(`Map render failed: ${status}`);
    }
    // Small settle delay so the last-drawn frame is fully composited.
    await page.waitForTimeout(400);
    return await page.screenshot({ type: 'png' });
  } finally {
    await page.close().catch(() => {});
  }
}

function queueRender(fn) {
  const run = renderQueue.then(fn, fn);
  // Keep the queue alive even when a render fails.
  renderQueue = run.catch(() => {});
  return run;
}

async function buildSinglePagePdf(png, widthIn, heightIn) {
  const doc = await PDFDocument.create();
  const image = await doc.embedPng(png);
  const page = doc.addPage([widthIn * POINTS_PER_INCH, heightIn * POINTS_PER_INCH]);
  page.drawImage(image, {
    x: 0,
    y: 0,
    width: page.getWidth(),
    height: page.getHeight(),
  });
  return doc.save();
}

async function buildTiledPdf(png, posterWIn, posterHIn) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const image = await doc.embedPng(png);

  const { width: pw, height: ph, margin, overlap } = TILE_PAGE;
  const usableW = pw - 2 * margin;
  const usableH = ph - 2 * margin;
  const stepW = usableW - overlap;
  const stepH = usableH - overlap;
  const cols = Math.max(1, Math.ceil((posterWIn - overlap) / stepW));
  const rows = Math.max(1, Math.ceil((posterHIn - overlap) / stepH));

  const imgWPts = posterWIn * POINTS_PER_INCH;
  const imgHPts = posterHIn * POINTS_PER_INCH;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const page = doc.addPage([pw * POINTS_PER_INCH, ph * POINTS_PER_INCH]);
      const offsetXIn = col * stepW;
      const offsetYIn = row * stepH; // measured from the top of the poster

      const clipX = margin * POINTS_PER_INCH;
      const clipY = margin * POINTS_PER_INCH;
      const clipW = usableW * POINTS_PER_INCH;
      const clipH = usableH * POINTS_PER_INCH;

      // pdf-lib's y-axis starts at the bottom. Position the full poster image
      // so that the (offsetXIn, offsetYIn) region lands inside the margins.
      const drawX = clipX - offsetXIn * POINTS_PER_INCH;
      const drawY = clipY + clipH - imgHPts + offsetYIn * POINTS_PER_INCH;

      page.drawImage(image, { x: drawX, y: drawY, width: imgWPts, height: imgHPts });

      // Mask the margins so only the tile region shows (pdf-lib has no
      // clipping API, so paint white over the spill).
      const white = rgb(1, 1, 1);
      const pagePtsW = pw * POINTS_PER_INCH;
      const pagePtsH = ph * POINTS_PER_INCH;
      page.drawRectangle({ x: 0, y: 0, width: pagePtsW, height: clipY, color: white });
      page.drawRectangle({ x: 0, y: clipY + clipH, width: pagePtsW, height: pagePtsH - clipY - clipH, color: white });
      page.drawRectangle({ x: 0, y: 0, width: clipX, height: pagePtsH, color: white });
      page.drawRectangle({ x: clipX + clipW, y: 0, width: pagePtsW - clipX - clipW, height: pagePtsH, color: white });

      // Trim border on top of the masks marks the overlap/cut line.
      page.drawRectangle({
        x: clipX,
        y: clipY,
        width: clipW,
        height: clipH,
        borderColor: rgb(0.7, 0.7, 0.7),
        borderWidth: 0.5,
      });

      page.drawText(
        `Tile row ${row + 1}/${rows}, column ${col + 1}/${cols} — trim/overlap ${overlap}" — assemble left-to-right, top-to-bottom`,
        {
          x: clipX,
          y: clipY - 12,
          size: 7,
          font,
          color: rgb(0.4, 0.4, 0.4),
        }
      );
    }
  }
  return doc.save();
}

/**
 * Renders a job (stored payload from POST /api/export) into a PDF buffer.
 * The orientation swaps the paper dimensions; tiled output is always
 * assembled from portrait letter sheets.
 */
async function exportPdf(job) {
  const format = FORMATS[job.format];
  if (!format) throw new Error(`Unknown format: ${job.format}`);

  const landscape = job.orientation === 'landscape';
  const widthIn = landscape ? format.height : format.width;
  const heightIn = landscape ? format.width : format.height;

  const png = await queueRender(() => renderMapPng(job.id, widthIn, heightIn, format.dpi));

  const pdfBytes = format.tiled
    ? await buildTiledPdf(png, widthIn, heightIn)
    : await buildSinglePagePdf(png, widthIn, heightIn);
  return Buffer.from(pdfBytes);
}

async function closeBrowser() {
  if (browserPromise) {
    const browser = await browserPromise.catch(() => null);
    browserPromise = null;
    if (browser) await browser.close().catch(() => {});
  }
}

module.exports = { exportPdf, getFormats, closeBrowser };
