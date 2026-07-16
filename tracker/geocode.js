// Geocoding via OpenStreetMap's Nominatim — free, no API key.
//
// Nominatim's usage policy: max 1 request/second and a valid User-Agent. We
// cache results in-memory so we never look up the same place twice per run.
// For higher volume, swap to Mapbox/Google (add a key) — same interface.

const cache = new Map();

const USER_AGENT =
  process.env.NOMINATIM_USER_AGENT ||
  'tomsinthelab-housewives-tracker/0.1 (personal project)';

let lastCallAt = 0;

async function rateLimit() {
  const wait = 1100 - (Date.now() - lastCallAt);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastCallAt = Date.now();
}

// Resolve a free-text place to { lat, lng, displayName } or null.
async function geocode(place) {
  if (!place) return null;
  const key = place.trim().toLowerCase();
  if (cache.has(key)) return cache.get(key);

  await rateLimit();
  const url =
    'https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' +
    encodeURIComponent(place);

  try {
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    if (!res.ok) {
      console.error(`[geocode] "${place}" -> HTTP ${res.status}`);
      cache.set(key, null);
      return null;
    }
    const arr = await res.json();
    if (!arr.length) {
      cache.set(key, null);
      return null;
    }
    const result = {
      lat: Number(arr[0].lat),
      lng: Number(arr[0].lon),
      displayName: arr[0].display_name,
    };
    cache.set(key, result);
    return result;
  } catch (err) {
    console.error(`[geocode] failed for "${place}":`, err.message);
    cache.set(key, null);
    return null;
  }
}

module.exports = { geocode };
