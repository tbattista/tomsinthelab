// Pulls "last worked on" activity for each project's GitHub repo.
// Needs GITHUB_TOKEN (a fine-grained PAT with read-only Contents + Metadata
// on your repos) to see private repos. Without a token it falls back to the
// committed snapshot in content/activity-snapshot.json.
const fs = require('fs');
const path = require('path');

const API = 'https://api.github.com';
const SNAPSHOT_PATH = path.join(__dirname, '..', 'content', 'activity-snapshot.json');
const DEFAULT_OWNER = process.env.GITHUB_OWNER || 'tbattista';
const CACHE_MS = (Number(process.env.ACTIVITY_CACHE_MINUTES) || 60) * 60 * 1000;
const COMMITS_PER_REPO = 8;

let cache = null; // { fetchedAt, source, repos: { [slug]: activity }, untracked: [] }
let inflight = null;
let lastAttempt = 0;
const RETRY_MS = 5 * 60 * 1000; // after a failure, wait before hitting GitHub again

function cachePath() {
  return process.env.DATA_DIR ? path.join(process.env.DATA_DIR, 'activity-cache.json') : null;
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

async function gh(url) {
  const res = await fetch(url.startsWith('http') ? url : API + url, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'tomsinthelab-site',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
    },
  });
  if (res.status === 409) return []; // empty repository
  if (!res.ok) throw new Error(`GitHub ${res.status} for ${url}`);
  return res.json();
}

function splitRepo(repo) {
  const [owner, name] = repo.includes('/') ? repo.split('/') : [DEFAULT_OWNER, repo];
  return { owner, name };
}

function isNoise(message) {
  return /^Merge (pull request|branch|remote-tracking)/i.test(message);
}

async function fetchRepoActivity(project) {
  const { owner, name } = splitRepo(project.repo);
  const [meta, commits] = await Promise.all([
    gh(`/repos/${owner}/${name}`),
    gh(`/repos/${owner}/${name}/commits?per_page=${COMMITS_PER_REPO * 2}`),
  ]);
  const recent = commits
    .map((c) => ({
      sha: c.sha.slice(0, 7),
      date: c.commit.author?.date || c.commit.committer?.date,
      message: c.commit.message.split('\n')[0].trim(),
    }))
    .filter((c) => !isNoise(c.message))
    .slice(0, COMMITS_PER_REPO);

  const dates = [meta.pushed_at, recent[0]?.date].filter(Boolean).sort();
  return {
    lastWorkedOn: dates[dates.length - 1] || null,
    lastCommit: recent[0] || null,
    commits: recent,
    language: meta.language || null,
    private: meta.private,
  };
}

// Repos you've pushed to recently that aren't in projects.json yet.
async function fetchUntracked(projects) {
  if (!process.env.GITHUB_TOKEN) return [];
  const tracked = new Set(projects.filter((p) => p.repo).map((p) => splitRepo(p.repo).name.toLowerCase()));
  const repos = await gh('/user/repos?affiliation=owner&sort=pushed&per_page=50');
  return repos
    .filter((r) => !r.fork && !tracked.has(r.name.toLowerCase()) && r.name !== 'tomsinthelab')
    .slice(0, 20)
    .map((r) => ({ repo: r.full_name, private: r.private, pushedAt: r.pushed_at, description: r.description }));
}

async function refresh(projects) {
  const withRepos = projects.filter((p) => p.repo);
  const repos = {};
  const errors = [];
  await Promise.all(withRepos.map(async (p) => {
    try {
      repos[p.slug] = await fetchRepoActivity(p);
    } catch (err) {
      errors.push(`${p.slug}: ${err.message}`);
    }
  }));
  if (errors.length) console.warn('[activity] some repos failed:', errors.join('; '));
  if (!Object.keys(repos).length) throw new Error('no repo activity could be fetched');

  let untracked = [];
  try {
    untracked = await fetchUntracked(projects);
  } catch (err) {
    console.warn('[activity] untracked lookup failed:', err.message);
  }

  const result = { fetchedAt: new Date().toISOString(), source: 'github', repos, untracked, errors };
  const file = cachePath();
  if (file) {
    try {
      fs.writeFileSync(file, JSON.stringify(result, null, 2));
    } catch (err) {
      console.warn('[activity] could not persist cache:', err.message);
    }
  }
  return result;
}

function fallback() {
  const file = cachePath();
  const persisted = file && readJson(file);
  if (persisted) return { ...persisted, source: 'cache' };
  const snapshot = readJson(SNAPSHOT_PATH);
  return snapshot ? { ...snapshot, source: 'snapshot' } : { fetchedAt: null, source: 'none', repos: {}, untracked: [] };
}

// Returns cached activity immediately; refreshes in the background when stale.
async function getActivity(projects, { force = false } = {}) {
  if (!cache) cache = fallback();
  const stale = !cache.fetchedAt || cache.source !== 'github' || Date.now() - Date.parse(cache.fetchedAt) > CACHE_MS;
  const backingOff = Date.now() - lastAttempt < RETRY_MS;
  if (process.env.GITHUB_TOKEN && ((stale && !backingOff) || force) && !inflight) {
    lastAttempt = Date.now();
    inflight = refresh(projects)
      .then((result) => { cache = result; })
      .catch((err) => console.warn('[activity] refresh failed:', err.message))
      .finally(() => { inflight = null; });
    if (force || cache.source === 'none') await inflight;
  }
  return cache;
}

module.exports = { getActivity, refresh, SNAPSHOT_PATH };
