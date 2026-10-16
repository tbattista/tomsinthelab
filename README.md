# Tom's in the Lab

Portfolio + live lab log for everything I build. Runs on Railway as a small
Express server (`server.js`) that serves the static site in `website/` plus a
few JSON APIs.

## How the site is organized

| What | Where | Notes |
| --- | --- | --- |
| Project list | `content/projects.json` | Single source of truth for the portfolio grid, homepage picks and menu. |
| Lab notes / posts | `content/notes/*.md` | Markdown with front matter. See `content/notes/_template.md`. |
| Project images | `website/images/projects/<slug>/` | Reference them as `/images/projects/<slug>/file.jpg`. |
| GitHub activity snapshot | `content/activity-snapshot.json` | Fallback used when `GITHUB_TOKEN` isn't set. |
| Hand-built project pages | `website/projects/*.html` | Still work; point a project at one with `"page"`. |

Pages:

- `/` homepage: "Right now in the lab" strip + featured projects
- `/portfolio-masonry.html` all projects, filterable (Software / Things I've Built / Work / Private Beta)
- `/projects/<slug>` auto-generated project page (unless the project has a hand-built `page`)
- `/lab` Lab Log: activity timeline + notes
- `/notes/<slug>` a single note
- `/admin` waitlist sign-ups (CSV export) + GitHub sync status

## Adding a project

Add an entry to `content/projects.json`:

```json
{
  "slug": "plants",
  "title": "Plants",
  "tagline": "One line shown on cards.",
  "description": "A short paragraph shown at the top of the project page.",
  "body": "Optional longer write-up in **Markdown**.",
  "kind": "software",            // software | build | work
  "category": "Web app",
  "repo": "plants",              // GitHub repo name (or owner/name). Omit for physical builds.
  "private": true,               // hides the code link and marks it "Private beta"
  "waitlist": true,              // shows the "Would you use this?" email sign-up
  "liveUrl": "https://...",      // shown as "Visit" button when not private
  "activity": "full",            // "full" shows commit messages, "dates" shows only dates
  "featured": true,              // homepage picks + menu
  "image": "/images/projects/plants/cover.jpg",
  "gallery": [{ "src": "/images/projects/plants/1.jpg", "caption": "Dashboard" }],
  "features": ["..."],
  "stack": ["Node", "Express"],
  "started": "2026",
  "updated": "2026-10-01"        // for projects without a repo; notes also bump this
}
```

Projects without a repo (physical builds, work) get their "last worked on" date
from `updated` or their most recent note.

`hidden: true` keeps an entry in the file but off the site.

## Writing a note

Copy `content/notes/_template.md` to `content/notes/YYYY-MM-DD-some-title.md`,
set `project` to a project slug to attach it to that project page, commit, push.
Notes show up on the Lab Log and on the project page.

## Railway setup

Environment variables:

| Variable | Needed for | Value |
| --- | --- | --- |
| `GITHUB_TOKEN` | Live activity (incl. private repos) | Fine-grained personal access token, **read-only**: Repository access "All repositories", permissions *Contents: Read* and *Metadata: Read*. |
| `ADMIN_TOKEN` | `/admin` page and admin API | Any long random string. |
| `DATA_DIR` | Keeping waitlist sign-ups across deploys | Mount path of a Railway Volume, e.g. `/data`. |
| `ACTIVITY_CACHE_MINUTES` | Optional | How often to re-check GitHub (default 60). |

Attach a **Volume** to the service (Railway → service → Settings → Volumes),
mount it at `/data`, and set `DATA_DIR=/data`. Without it, sign-ups are lost on
every deploy.

## Local dev

```bash
npm install
npm start                          # http://localhost:3000
GITHUB_TOKEN=... npm run sync      # refresh content/activity-snapshot.json
```

## Getting sign-ups out

- `/admin` → paste `ADMIN_TOKEN` → table + "Download CSV"
- or `curl -H "Authorization: Bearer $ADMIN_TOKEN" https://<site>/api/admin/waitlist?format=csv`
