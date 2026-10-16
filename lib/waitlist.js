// Stores "I'd use this" email sign-ups for private apps.
// On Railway, attach a Volume and set DATA_DIR to its mount path (e.g. /data)
// so sign-ups survive redeploys. Without DATA_DIR they go to ./data, which
// Railway wipes on every deploy.
const fs = require('fs');
const path = require('path');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const FILE = path.join(DATA_DIR, 'waitlist.json');
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

let writeQueue = Promise.resolve();

function readAll() {
  try {
    return JSON.parse(fs.readFileSync(FILE, 'utf8'));
  } catch {
    return [];
  }
}

function add({ project, email, name, note, source }) {
  email = String(email || '').trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return Promise.reject(Object.assign(new Error('Please enter a valid email address.'), { status: 400 }));
  }
  const entry = {
    project: String(project).slice(0, 80),
    email,
    name: String(name || '').trim().slice(0, 120),
    note: String(note || '').trim().slice(0, 1000),
    source: String(source || '').slice(0, 200),
    createdAt: new Date().toISOString(),
  };
  // Serialize writes so concurrent sign-ups can't clobber each other.
  const job = writeQueue.then(() => {
    const all = readAll();
    const existing = all.find((e) => e.project === entry.project && e.email === entry.email);
    if (existing) return { duplicate: true };
    all.push(entry);
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const tmp = FILE + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(all, null, 2));
    fs.renameSync(tmp, FILE);
    return { duplicate: false };
  });
  writeQueue = job.catch(() => {});
  return job;
}

function list(project) {
  const all = readAll();
  return project ? all.filter((e) => e.project === project) : all;
}

function toCsv(rows) {
  const cols = ['project', 'email', 'name', 'note', 'source', 'createdAt'];
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return [cols.join(','), ...rows.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\n') + '\n';
}

module.exports = { add, list, toCsv, DATA_DIR };
