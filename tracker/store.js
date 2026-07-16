// Dead-simple JSON-file persistence for sightings.
//
// NOTE: Railway's filesystem is ephemeral — this file is wiped on every
// redeploy. That's fine for an MVP (we re-poll Reddit on boot). If you want
// sightings to survive deploys, swap this module for a Postgres table or a
// Railway volume; the interface (load/all/upsert) stays the same.

const fs = require('fs');
const path = require('path');
const config = require('./config');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'sightings.json');

let sightings = [];

function load() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      sightings = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
  } catch (err) {
    console.error('[store] failed to load, starting empty:', err.message);
    sightings = [];
  }
  return sightings;
}

function persist() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(sightings, null, 2));
  } catch (err) {
    console.error('[store] failed to persist:', err.message);
  }
}

// Insert new sightings, de-duplicating by source post id. Returns count added.
function upsert(items) {
  const seen = new Set(sightings.map((s) => s.sourceId));
  let added = 0;
  for (const item of items) {
    if (!item || seen.has(item.sourceId)) continue;
    sightings.push(item);
    seen.add(item.sourceId);
    added += 1;
  }
  // Keep newest first, prune to cap.
  sightings.sort((a, b) => b.postedAt - a.postedAt);
  if (sightings.length > config.maxSightings) {
    sightings = sightings.slice(0, config.maxSightings);
  }
  if (added > 0) persist();
  return added;
}

// Return sightings within the freshness window, newest first.
function all() {
  const cutoff = Date.now() - config.freshnessWindowMs;
  return sightings.filter((s) => s.postedAt >= cutoff);
}

module.exports = { load, upsert, all };
