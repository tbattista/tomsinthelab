// Loads curated project + lab-note content from /content.
const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.join(__dirname, '..', 'content');
const NOTES_DIR = path.join(CONTENT_DIR, 'notes');

function loadProjects() {
  const raw = fs.readFileSync(path.join(CONTENT_DIR, 'projects.json'), 'utf8');
  return JSON.parse(raw).projects.filter((p) => !p.hidden);
}

// Minimal front-matter parser: `key: value` lines between --- fences.
// Values that look like [a, b] become arrays; true/false become booleans.
function parseFrontMatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { meta: {}, body: text };
  const meta = {};
  for (const line of match[1].split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!m) continue;
    let value = m[2].trim().replace(/^["']|["']$/g, '');
    if (/^\[.*\]$/.test(value)) {
      value = value.slice(1, -1).split(',').map((v) => v.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    } else if (value === 'true' || value === 'false') {
      value = value === 'true';
    }
    meta[m[1]] = value;
  }
  return { meta, body: match[2] };
}

function slugFromFile(file) {
  return file.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '');
}

function loadNotes({ includeBody = false } = {}) {
  if (!fs.existsSync(NOTES_DIR)) return [];
  return fs.readdirSync(NOTES_DIR)
    .filter((f) => f.endsWith('.md') && !f.startsWith('_'))
    .map((file) => {
      const { meta, body } = parseFrontMatter(fs.readFileSync(path.join(NOTES_DIR, file), 'utf8'));
      const note = {
        slug: meta.slug || slugFromFile(file),
        title: meta.title || slugFromFile(file),
        date: meta.date || file.slice(0, 10),
        project: meta.project || null,
        tags: Array.isArray(meta.tags) ? meta.tags : [],
        summary: meta.summary || '',
        cover: meta.cover || null,
        draft: meta.draft === true,
      };
      if (includeBody) note.body = body;
      return note;
    })
    .filter((n) => !n.draft)
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

function loadNote(slug) {
  return loadNotes({ includeBody: true }).find((n) => n.slug === slug) || null;
}

module.exports = { loadProjects, loadNotes, loadNote, parseFrontMatter };
