// Configuration for the Real Housewives filming-location tracker.
// Everything the pipeline needs to know about WHAT to look for lives here.

module.exports = {
  // How often the background poller runs (milliseconds).
  pollIntervalMs: Number(process.env.POLL_INTERVAL_MS) || 5 * 60 * 1000, // 5 min

  // How many sightings to keep in the store before pruning oldest.
  maxSightings: Number(process.env.MAX_SIGHTINGS) || 500,

  // Drop sightings older than this from the "live" feed (milliseconds).
  // Reddit posts older than this are ignored on ingest.
  freshnessWindowMs: Number(process.env.FRESHNESS_WINDOW_MS) || 3 * 24 * 60 * 60 * 1000, // 3 days

  // Subreddits to poll. The main hub plus franchise-specific communities.
  subreddits: [
    'realhousewives',
    'BravoRealHousewives',
    'RHONJ',
    'RHOBH',
    'RHOA',
    'RHONY',
    'RHOP',
    'RHOSLC',
    'RHOC',
    'RHOM',
  ],

  // Search terms sent to Reddit. Kept broad; the classifier does the real filtering.
  searchTerms: ['filming', 'spotted', 'sighting', 'saw them', 'seen filming'],

  // Known franchises -> home metro. Used as a geocoding fallback when a post
  // names the show but not a specific place ("the RHONJ girls are filming!").
  franchiseHomeCity: {
    RHONJ: 'New Jersey, USA',
    RHOBH: 'Beverly Hills, California, USA',
    RHOA: 'Atlanta, Georgia, USA',
    RHONY: 'New York, New York, USA',
    RHOP: 'Potomac, Maryland, USA',
    RHOSLC: 'Salt Lake City, Utah, USA',
    RHOC: 'Orange County, California, USA',
    RHOM: 'Miami, Florida, USA',
    RHODubai: 'Dubai, UAE',
  },

  // Claude model used for classification/extraction. Haiku is cheap and fast,
  // which matters because we run it on every candidate post.
  anthropicModel: process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001',
};
