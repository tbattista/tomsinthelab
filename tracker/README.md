# Housewives Sighting Tracker

A live map + feed of possible *Real Housewives* filming sightings, built from
Reddit posts. It polls Housewives subreddits, uses an LLM to keep only real
"we just saw them filming" posts, geocodes the location, and plots it.

Visit **`/tracker.html`** on the deployed site.

## Pipeline

```
Reddit search  ->  classify (Claude)  ->  geocode (Nominatim)  ->  store  ->  /tracker.html
tracker/reddit    tracker/extract        tracker/geocode          store.js   website/tracker.html
```

A background poller (`tracker/poller.js`) runs the whole thing every 5 minutes
and on server boot. The page auto-refreshes every minute and has a manual
**Refresh** button (`POST /api/refresh`).

## Setup / environment variables

Everything runs for free. Two integrations need credentials:

### Reddit (required in production)

Reddit blocks anonymous requests from datacenter IPs (Railway, etc.) with HTTP
403, so you must register a free app:

1. Go to <https://www.reddit.com/prefs/apps> → **create another app**
2. Type **script**, redirect uri `http://localhost:8080`
3. Copy the client id (shown under the app name) and the secret
4. Set on Railway:
   - `REDDIT_CLIENT_ID`
   - `REDDIT_CLIENT_SECRET`
   - `REDDIT_USER_AGENT` — e.g. `housewives-tracker/0.1 by u/yourname`

Without these it falls back to anonymous access, which works from a home IP
(local dev) but 403s on Railway.

### Claude (recommended)

- `ANTHROPIC_API_KEY` — enables smart filtering + precise location extraction
  ("saw them at Short Hills Mall" → an exact pin).

Without it, the tracker still runs on a keyword heuristic: lower precision, and
locations fall back to the show's home metro (shown as "approx" on the map).

### Optional tuning

| Var | Default | Meaning |
|-----|---------|---------|
| `POLL_INTERVAL_MS` | `300000` | How often to poll Reddit (5 min) |
| `FRESHNESS_WINDOW_MS` | `259200000` | Ignore posts older than this (3 days) |
| `MAX_SIGHTINGS` | `500` | Cap on stored sightings |
| `ANTHROPIC_MODEL` | `claude-haiku-4-5-20251001` | Classifier model |

## What to configure next

- **Subreddits / cast keywords:** edit `tracker/config.js`.
- **Persistence:** `store.js` writes to `data/sightings.json`, which Railway
  wipes on redeploy (fine for an MVP — it re-polls on boot). For durability,
  swap in Postgres or a Railway volume; the `load/all/upsert` interface stays.
- **More sources:** add an `instagram.js` / `x.js` that returns the same
  candidate shape `{ sourceId, subreddit, title, body, author, url, postedAt }`
  and feed it into the poller.
