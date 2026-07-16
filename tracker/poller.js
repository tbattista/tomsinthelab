// The pipeline orchestrator: ingest -> classify -> geocode -> store.
// Runs on an interval, and can be triggered on-demand via runOnce().

const config = require('./config');
const reddit = require('./reddit');
const extract = require('./extract');
const geocode = require('./geocode');
const store = require('./store');

let running = false;
let lastRun = null;
let lastError = null;

// Turn a classified post into a stored sighting (with coordinates when we can).
async function toSighting(post, cls) {
  // Prefer the specific place the post named; fall back to the franchise's
  // home metro so a show-only sighting still lands somewhere sensible.
  const placeQuery =
    cls.locationText ||
    (cls.show && config.franchiseHomeCity[cls.show]) ||
    null;

  const geo = await geocode.geocode(placeQuery);

  return {
    sourceId: post.sourceId,
    source: 'reddit',
    subreddit: post.subreddit,
    url: post.url,
    author: post.author,
    postedAt: post.postedAt,
    show: cls.show || null,
    cast: Array.isArray(cls.cast) ? cls.cast : [],
    confidence: cls.confidence || 'low',
    summary: cls.summary || post.title,
    locationText: cls.locationText || null,
    locationResolved: geo ? geo.displayName : null,
    approximate: !cls.locationText, // true when we used the franchise fallback
    lat: geo ? geo.lat : null,
    lng: geo ? geo.lng : null,
  };
}

// One full pass of the pipeline. Returns { candidates, sightings, added }.
async function runOnce() {
  if (running) return { skipped: true };
  running = true;
  lastError = null;
  const started = Date.now();
  try {
    const candidates = await reddit.fetchCandidates();
    const sightings = [];

    for (const post of candidates) {
      const cls = await extract.classify(post);
      if (!cls || !cls.isSighting) continue;
      sightings.push(await toSighting(post, cls));
    }

    const added = store.upsert(sightings);
    lastRun = {
      at: started,
      durationMs: Date.now() - started,
      candidates: candidates.length,
      sightings: sightings.length,
      added,
      usingClaude: extract.usingClaude,
    };
    console.log(
      `[poller] ${candidates.length} candidates -> ${sightings.length} sightings (${added} new)`
    );
    return lastRun;
  } catch (err) {
    lastError = err.message;
    console.error('[poller] run failed:', err.message);
    return { error: err.message };
  } finally {
    running = false;
  }
}

// Start the background loop. Runs once immediately, then on the configured interval.
function start() {
  store.load();
  runOnce();
  setInterval(runOnce, config.pollIntervalMs);
  console.log(
    `[poller] started; interval ${config.pollIntervalMs / 1000}s; ` +
      `classifier: ${extract.usingClaude ? 'Claude' : 'heuristic (no ANTHROPIC_API_KEY)'}`
  );
}

function status() {
  return { running, lastRun, lastError };
}

module.exports = { start, runOnce, status };
