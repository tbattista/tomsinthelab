// Reddit ingestion.
//
// Reddit blocks anonymous requests from datacenter IPs (Railway included) with
// HTTP 403, so production needs OAuth. We use the "app-only" client_credentials
// flow, which reads public listings with just a client id + secret — no user
// login required.
//
// SETUP (one time, free):
//   1. Go to https://www.reddit.com/prefs/apps  -> "create another app"
//   2. Choose type "script", set redirect uri to http://localhost:8080
//   3. Copy the client id (under the app name) and the secret
//   4. Set env vars on Railway:
//        REDDIT_CLIENT_ID=...
//        REDDIT_CLIENT_SECRET=...
//        REDDIT_USER_AGENT="tomsinthelab-housewives-tracker/0.1 by u/yourname"
//
// Without those vars we fall back to the anonymous .json endpoints, which work
// from a residential IP (local dev) but 403 on Railway.

const config = require('./config');

const CLIENT_ID = process.env.REDDIT_CLIENT_ID;
const CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET;
const USER_AGENT =
  process.env.REDDIT_USER_AGENT ||
  'tomsinthelab-housewives-tracker/0.1 (personal project)';

const useOAuth = Boolean(CLIENT_ID && CLIENT_SECRET);

// --- OAuth token management ------------------------------------------------

let token = null;
let tokenExpiresAt = 0;

async function getToken() {
  if (token && Date.now() < tokenExpiresAt) return token;

  const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  const res = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': USER_AGENT,
    },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) {
    throw new Error(`Reddit token HTTP ${res.status}: ${await res.text()}`);
  }
  const json = await res.json();
  token = json.access_token;
  // Refresh a minute before actual expiry.
  tokenExpiresAt = Date.now() + (json.expires_in - 60) * 1000;
  return token;
}

// --- Search ----------------------------------------------------------------

function buildSearchUrl(base, subreddit, term) {
  return (
    `${base}/r/${encodeURIComponent(subreddit)}/search.json` +
    `?q=${encodeURIComponent(term)}` +
    `&restrict_sr=1&sort=new&limit=25&t=week`
  );
}

async function searchSubreddit(subreddit, term) {
  let url;
  let headers = { 'User-Agent': USER_AGENT };

  if (useOAuth) {
    url = buildSearchUrl('https://oauth.reddit.com', subreddit, term);
    headers.Authorization = `Bearer ${await getToken()}`;
  } else {
    url = buildSearchUrl('https://www.reddit.com', subreddit, term);
  }

  try {
    const res = await fetch(url, { headers });
    if (!res.ok) {
      console.error(`[reddit] ${subreddit} "${term}" -> HTTP ${res.status}`);
      return [];
    }
    const json = await res.json();
    const children = json?.data?.children || [];
    return children.map((c) => c.data).filter(Boolean);
  } catch (err) {
    console.error(`[reddit] fetch failed for ${subreddit} "${term}":`, err.message);
    return [];
  }
}

// Poll every subreddit x search term, returning normalized candidate posts
// within the freshness window, de-duplicated by post id.
async function fetchCandidates() {
  const cutoffSec = (Date.now() - config.freshnessWindowMs) / 1000;
  const byId = new Map();

  for (const subreddit of config.subreddits) {
    for (const term of config.searchTerms) {
      const posts = await searchSubreddit(subreddit, term);
      for (const p of posts) {
        if (!p.id || byId.has(p.id)) continue;
        if (p.created_utc < cutoffSec) continue;
        byId.set(p.id, {
          sourceId: `reddit_${p.id}`,
          subreddit: p.subreddit,
          title: p.title || '',
          body: p.selftext || '',
          author: p.author,
          url: `https://www.reddit.com${p.permalink}`,
          postedAt: Math.round(p.created_utc * 1000),
        });
      }
      // Be a polite client (Reddit's guideline is <= ~1 req/sec).
      await new Promise((r) => setTimeout(r, 600));
    }
  }

  return [...byId.values()];
}

module.exports = { fetchCandidates, useOAuth };
