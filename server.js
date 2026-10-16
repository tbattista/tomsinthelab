const express = require('express');
const crypto = require('crypto');
const path = require('path');
const { loadProjects, loadNotes, loadNote } = require('./lib/content');
const { getActivity } = require('./lib/github');
const waitlist = require('./lib/waitlist');

const app = express();
app.set('trust proxy', 1); // Railway sits behind a proxy; needed for per-IP rate limits
const PORT = process.env.PORT || 3000;
const SITE_DIR = path.join(__dirname, 'website');

app.use(express.json({ limit: '20kb' }));

// ---------------------------------------------------------------------------
// Projects + activity
// ---------------------------------------------------------------------------

// Merge curated project info with live GitHub activity.
function withActivity(project, activity) {
  const repo = activity.repos[project.slug];
  const out = { ...project };
  delete out.repo; // only linked when repoPublic is set
  if (project.repo && project.repoPublic) out.repoUrl = `https://github.com/${project.repo.includes('/') ? project.repo : 'tbattista/' + project.repo}`;
  if (repo) {
    const showMessages = project.activity !== 'dates';
    out.lastWorkedOn = repo.lastWorkedOn;
    out.lastCommit = repo.lastCommit && showMessages ? repo.lastCommit : null;
    out.commits = showMessages ? repo.commits : [];
  } else {
    out.lastWorkedOn = project.updated || null;
    out.commits = [];
  }
  // Notes count as "work" too (physical builds have no repo).
  const notes = loadNotes().filter((n) => n.project === project.slug);
  if (notes[0] && (!out.lastWorkedOn || notes[0].date > out.lastWorkedOn)) out.lastWorkedOn = notes[0].date;
  out.noteCount = notes.length;
  return out;
}

app.get('/api/projects', async (req, res, next) => {
  try {
    const projects = loadProjects();
    const activity = await getActivity(projects);
    const list = projects.map((p) => {
      const full = withActivity(p, activity);
      delete full.commits; // keep the list payload small
      delete full.body;
      return full;
    });
    res.json({ updatedAt: activity.fetchedAt, source: activity.source, projects: list });
  } catch (err) {
    next(err);
  }
});

app.get('/api/projects/:slug', async (req, res, next) => {
  try {
    const projects = loadProjects();
    const project = projects.find((p) => p.slug === req.params.slug);
    if (!project) return res.status(404).json({ error: 'Not found' });
    const activity = await getActivity(projects);
    const notes = loadNotes().filter((n) => n.project === project.slug);
    // "Next project" follows the portfolio order (most recently worked on first).
    const ordered = projects
      .map((p) => withActivity(p, activity))
      .sort((a, b) => String(b.lastWorkedOn || '').localeCompare(String(a.lastWorkedOn || '')));
    const i = ordered.findIndex((p) => p.slug === project.slug);
    const n = ordered[(i + 1) % ordered.length];
    const next = n && n.slug !== project.slug
      ? { slug: n.slug, title: n.title, tagline: n.tagline || '', image: n.image || null, page: n.page || null }
      : null;
    res.json({ ...withActivity(project, activity), notes, next });
  } catch (err) {
    next(err);
  }
});

// Combined timeline of commits + lab notes across everything.
app.get('/api/activity', async (req, res, next) => {
  try {
    const projects = loadProjects();
    const activity = await getActivity(projects);
    const items = [];
    for (const p of projects) {
      const full = withActivity(p, activity);
      for (const c of full.commits) {
        items.push({ type: 'commit', date: c.date, project: p.slug, projectTitle: p.title, text: c.message });
      }
      const repo = activity.repos[p.slug];
      if (p.activity === 'dates' && repo?.lastWorkedOn) {
        items.push({ type: 'commit', date: repo.lastWorkedOn, project: p.slug, projectTitle: p.title, text: 'Pushed updates' });
      }
    }
    for (const n of loadNotes()) {
      const p = projects.find((x) => x.slug === n.project);
      items.push({ type: 'note', date: n.date, project: n.project, projectTitle: p?.title || null, text: n.title, slug: n.slug, summary: n.summary });
    }
    items.sort((a, b) => String(b.date).localeCompare(String(a.date)));
    const limit = Math.min(Number(req.query.limit) || 60, 200);
    res.json({ updatedAt: activity.fetchedAt, items: items.slice(0, limit) });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// Lab notes (markdown in content/notes)
// ---------------------------------------------------------------------------

app.get('/api/notes', (req, res) => {
  const notes = loadNotes();
  res.json({ notes: req.query.project ? notes.filter((n) => n.project === req.query.project) : notes });
});

app.get('/api/notes/:slug', (req, res) => {
  const note = loadNote(req.params.slug);
  if (!note) return res.status(404).json({ error: 'Not found' });
  res.json(note);
});

// ---------------------------------------------------------------------------
// Waitlist sign-ups
// ---------------------------------------------------------------------------

const recentSignups = new Map(); // ip -> [timestamps]
function rateLimited(ip) {
  const now = Date.now();
  const hits = (recentSignups.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  hits.push(now);
  recentSignups.set(ip, hits);
  return hits.length > 5;
}

app.post('/api/waitlist', async (req, res) => {
  const { project, email, name, note, website } = req.body || {};
  if (website) return res.json({ ok: true }); // honeypot field: bots fill it in
  if (!loadProjects().some((p) => p.slug === project && p.waitlist)) {
    return res.status(400).json({ error: 'Unknown project.' });
  }
  if (rateLimited(req.ip)) return res.status(429).json({ error: 'Too many sign-ups, try again later.' });
  try {
    const result = await waitlist.add({ project, email, name, note, source: req.get('referer') });
    res.json({ ok: true, duplicate: result.duplicate });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.status ? err.message : 'Could not save your sign-up.' });
  }
});

// ---------------------------------------------------------------------------
// Admin (protected by ADMIN_TOKEN)
// ---------------------------------------------------------------------------

function requireAdmin(req, res, next) {
  const token = process.env.ADMIN_TOKEN;
  const given = (req.get('authorization') || '').replace(/^Bearer\s+/i, '') || req.query.token;
  if (!token) return res.status(503).json({ error: 'Set ADMIN_TOKEN on the server to enable admin.' });
  const a = crypto.createHash('sha256').update(String(given)).digest();
  const b = crypto.createHash('sha256').update(token).digest();
  if (!crypto.timingSafeEqual(a, b)) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

app.get('/api/admin/waitlist', requireAdmin, (req, res) => {
  const rows = waitlist.list(req.query.project);
  if (req.query.format === 'csv') {
    res.type('text/csv').attachment(`waitlist${req.query.project ? '-' + req.query.project : ''}.csv`);
    return res.send(waitlist.toCsv(rows));
  }
  res.json({ count: rows.length, rows });
});

app.get('/api/admin/activity', requireAdmin, async (req, res, next) => {
  try {
    const activity = await getActivity(loadProjects(), { force: req.query.refresh === '1' });
    res.json({ fetchedAt: activity.fetchedAt, source: activity.source, untracked: activity.untracked || [], errors: activity.errors || [] });
  } catch (err) {
    next(err);
  }
});

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------

app.use(express.static(SITE_DIR, { extensions: ['html'] }));

// Pretty URLs for data-driven pages. Hand-written pages in website/projects/
// are served by express.static above and take precedence.
app.get('/projects/:slug', (req, res) => res.sendFile(path.join(SITE_DIR, 'project.html')));
app.get('/notes/:slug', (req, res) => res.sendFile(path.join(SITE_DIR, 'note.html')));

app.get('*', (req, res) => {
  res.sendFile(path.join(SITE_DIR, 'index.html'));
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  if (!process.env.GITHUB_TOKEN) console.log('GITHUB_TOKEN not set: using activity snapshot.');
  if (!process.env.DATA_DIR) console.log(`DATA_DIR not set: waitlist saved to ${waitlist.DATA_DIR} (not persistent on Railway).`);
  // Warm the activity cache.
  getActivity(loadProjects()).catch(() => {});
});
