const express = require('express');
const path = require('path');
const crypto = require('crypto');

const config = require('./lib/config');
const { buildColoringStyle, buildAtlasStyle, normalizeDetail } = require('./lib/map-styles');

// Route outbound fetches through an HTTPS proxy when the host environment
// requires one (no-op on Railway, where no proxy vars are set).
try {
  const undici = require('undici');
  const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  if (proxy && undici.EnvHttpProxyAgent) {
    undici.setGlobalDispatcher(new undici.EnvHttpProxyAgent());
  } else if (proxy && undici.ProxyAgent) {
    undici.setGlobalDispatcher(new undici.ProxyAgent(proxy));
  }
} catch (_) { /* undici optional; global fetch works without a proxy */ }

const app = express();
const PORT = config.PORT;

app.use(express.json({ limit: '10mb' }));

// ---------------------------------------------------------------------------
// Road Trip Map Maker API
// ---------------------------------------------------------------------------

// Client configuration: which styles to load and what attribution to show.
app.get('/api/config', (req, res) => {
  res.json({
    styles: {
      standard: config.TILE_STYLE_URL,
      atlas: '/api/styles/atlas.json',
      coloring: '/api/styles/coloring.json',
    },
    attribution: config.TILE_ATTRIBUTION,
    routingAttribution: 'Routing by <a href="https://project-osrm.org" target="_blank">OSRM</a>',
    geocodingAttribution: 'Geocoding by <a href="https://nominatim.org" target="_blank">Nominatim</a>',
  });
});

// Printable styles, generated from the configured vector source.
// ?detail=simple|medium|detailed controls how much appears on the map.
app.get('/api/styles/coloring.json', (req, res) => {
  res.set('Cache-Control', 'public, max-age=300');
  res.json(buildColoringStyle(config, normalizeDetail(req.query.detail)));
});

app.get('/api/styles/atlas.json', (req, res) => {
  res.set('Cache-Control', 'public, max-age=300');
  res.json(buildAtlasStyle(config, normalizeDetail(req.query.detail)));
});

// --- Geocoding proxy (Nominatim usage policy: identify + max 1 req/sec) ---
const geocodeCache = new Map();
const GEOCODE_CACHE_MAX = 500;
let geocodeChain = Promise.resolve(0);

function throttledGeocodeFetch(url) {
  const next = geocodeChain.then(async (lastAt) => {
    const wait = Math.max(0, lastAt + 1100 - Date.now());
    if (wait) await new Promise((r) => setTimeout(r, wait));
    const response = await fetch(url, {
      headers: { 'User-Agent': config.GEOCODER_USER_AGENT, Accept: 'application/json' },
    });
    return { at: Date.now(), response };
  });
  geocodeChain = next.then(({ at }) => at, () => Date.now());
  return next.then(({ response }) => response);
}

app.get('/api/geocode', async (req, res) => {
  const q = String(req.query.q || '').trim();
  if (q.length < 2) return res.status(400).json({ error: 'Query too short' });

  const cacheKey = q.toLowerCase();
  const cached = geocodeCache.get(cacheKey);
  if (cached && cached.expires > Date.now()) return res.json({ results: cached.results });

  try {
    const url = `${config.GEOCODER_URL}/search?format=jsonv2&limit=5&q=${encodeURIComponent(q)}`;
    const response = await throttledGeocodeFetch(url);
    if (!response.ok) throw new Error(`Geocoder responded ${response.status}`);
    const data = await response.json();
    const results = (Array.isArray(data) ? data : []).map((r) => ({
      name: r.display_name,
      lat: parseFloat(r.lat),
      lon: parseFloat(r.lon),
    }));
    if (geocodeCache.size >= GEOCODE_CACHE_MAX) {
      geocodeCache.delete(geocodeCache.keys().next().value);
    }
    geocodeCache.set(cacheKey, { results, expires: Date.now() + 24 * 3600 * 1000 });
    res.json({ results });
  } catch (err) {
    console.error('Geocode error:', err.message);
    res.status(502).json({ error: 'Geocoding service unavailable' });
  }
});

// --- Driving route via OSRM-compatible engine ---
function parseLonLat(value) {
  const parts = String(value || '').split(',').map(Number);
  if (parts.length !== 2 || parts.some((n) => !Number.isFinite(n))) return null;
  const [lon, lat] = parts;
  if (lon < -180 || lon > 180 || lat < -90 || lat > 90) return null;
  return [lon, lat];
}

app.get('/api/route', async (req, res) => {
  const start = parseLonLat(req.query.start);
  const end = parseLonLat(req.query.end);
  if (!start || !end) {
    return res.status(400).json({ error: 'start and end must be "lon,lat" coordinates' });
  }
  try {
    const url =
      `${config.OSRM_URL}/route/v1/driving/${start[0]},${start[1]};${end[0]},${end[1]}` +
      '?overview=full&geometries=geojson&steps=false';
    const response = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`OSRM responded ${response.status}`);
    const data = await response.json();
    if (data.code !== 'Ok' || !data.routes || !data.routes.length) {
      return res.status(404).json({ error: 'No drivable route found between those points' });
    }
    const route = data.routes[0];
    res.json({
      geometry: route.geometry,
      distanceMeters: route.distance,
      durationSeconds: route.duration,
    });
  } catch (err) {
    console.error('Routing error:', err.message);
    res.status(502).json({ error: 'Routing service unavailable' });
  }
});

// --- PDF export via server-side Playwright rendering ---
// Jobs hold the payload the print page needs; they are short-lived.
const exportJobs = new Map();
const EXPORT_JOB_TTL_MS = 10 * 60 * 1000;

function pruneJobs() {
  const now = Date.now();
  for (const [id, job] of exportJobs) {
    if (job.createdAt + EXPORT_JOB_TTL_MS < now) exportJobs.delete(id);
  }
}

// Debug helper (enabled only with DEBUG_EXPORT=1): store a job without
// rendering it, so /map-print.html can be inspected in a browser directly.
if (process.env.DEBUG_EXPORT === '1') {
  app.post('/api/export/job', (req, res) => {
    const id = crypto.randomUUID();
    exportJobs.set(id, { ...req.body, id, createdAt: Date.now() });
    res.json({ id });
  });
}

app.get('/api/export/job/:id', (req, res) => {
  const job = exportJobs.get(req.params.id);
  if (!job) return res.status(404).json({ error: 'Unknown export job' });
  res.json(job);
});

app.post('/api/export', async (req, res) => {
  const { exportPdf, getFormats } = require('./lib/exporter');
  const { format, orientation, style, detail, start, end, route, title,
          showRoute, kidsActivities } = req.body || {};

  if (!getFormats()[format]) return res.status(400).json({ error: 'Invalid format' });
  if (!route || !route.geometry || route.geometry.type !== 'LineString' ||
      !Array.isArray(route.geometry.coordinates) || route.geometry.coordinates.length < 2) {
    return res.status(400).json({ error: 'Missing route geometry' });
  }
  if (!start || !end || !Number.isFinite(start.lon) || !Number.isFinite(start.lat) ||
      !Number.isFinite(end.lon) || !Number.isFinite(end.lat)) {
    return res.status(400).json({ error: 'Missing start/end coordinates' });
  }

  pruneJobs();
  const id = crypto.randomUUID();
  const job = {
    id,
    createdAt: Date.now(),
    format,
    orientation: orientation === 'landscape' ? 'landscape' : 'portrait',
    style: ['standard', 'atlas', 'coloring'].includes(style) ? style : 'standard',
    detail: normalizeDetail(detail),
    showRoute: showRoute !== false,
    kidsActivities: kidsActivities === true,
    start: { name: String(start.name || 'Start').slice(0, 200), lon: start.lon, lat: start.lat },
    end: { name: String(end.name || 'Destination').slice(0, 200), lon: end.lon, lat: end.lat },
    route: {
      geometry: route.geometry,
      distanceMeters: Number(route.distanceMeters) || 0,
      durationSeconds: Number(route.durationSeconds) || 0,
    },
    title: String(title || '').slice(0, 120),
  };
  exportJobs.set(id, job);

  try {
    const pdf = await exportPdf(job);
    const stamp = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="road-trip-map-${format}-${stamp}.pdf"`);
    res.send(pdf);
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ error: 'Export failed. Please try again.' });
  } finally {
    exportJobs.delete(id);
  }
});

// ---------------------------------------------------------------------------
// Static site
// ---------------------------------------------------------------------------

// Short alias for the Road Trip Map Maker page.
app.get('/roadtrip-map', (req, res) => {
  res.redirect('/road-trip-map-maker.html');
});

// Serve static files from the website directory
app.use(express.static(path.join(__dirname, 'website')));

// Handle all routes by serving index.html (for SPA-like behavior)
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Not found' });
  res.sendFile(path.join(__dirname, 'website', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
