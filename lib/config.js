// Central configuration for the Road Trip Map Maker feature.
// Every external provider is overridable through environment variables so the
// tile / routing / geocoding services can be swapped without code changes.

const config = {
  PORT: process.env.PORT || 3000,

  // OSM-derived vector tiles. Default: OpenFreeMap (https://openfreemap.org),
  // whose terms allow free production use without an API key.
  // Full interactive style used for the "Standard" map view:
  TILE_STYLE_URL: process.env.TILE_STYLE_URL || 'https://tiles.openfreemap.org/styles/liberty',
  // TileJSON endpoint for the raw vector source (OpenMapTiles schema),
  // used by the generated "Coloring Map" style:
  TILE_JSON_URL: process.env.TILE_JSON_URL || 'https://tiles.openfreemap.org/planet',
  // Glyphs (font PBFs) for the generated style:
  TILE_GLYPHS_URL: process.env.TILE_GLYPHS_URL || 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
  // Required attribution for the tile provider + OpenStreetMap:
  TILE_ATTRIBUTION: process.env.TILE_ATTRIBUTION ||
    '<a href="https://openfreemap.org" target="_blank">OpenFreeMap</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',

  // OSRM-compatible routing engine (driving profile).
  OSRM_URL: process.env.OSRM_URL || 'https://router.project-osrm.org',

  // Nominatim-compatible geocoder. Requests are proxied through this server so
  // a proper User-Agent is sent and requests are throttled to 1/sec.
  GEOCODER_URL: process.env.GEOCODER_URL || 'https://nominatim.openstreetmap.org',
  GEOCODER_USER_AGENT: process.env.GEOCODER_USER_AGENT ||
    'TomsInTheLab-RoadTripMapMaker/1.0 (https://tomsinthelab.com; tbattista@gmail.com)',

  // Export tuning.
  EXPORT_TIMEOUT_MS: parseInt(process.env.EXPORT_TIMEOUT_MS || '120000', 10),
  // Optional explicit Chromium binary (useful in sandboxes / self-hosted setups).
  CHROMIUM_EXECUTABLE_PATH: process.env.CHROMIUM_EXECUTABLE_PATH || undefined,
};

module.exports = config;
