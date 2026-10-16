---
title: This site now keeps itself up to date
date: 2026-10-16
summary: Rebuilt the portfolio so project pages pull "last worked on" dates and recent changes straight from GitHub, with room for builds, work projects and notes like this one.
tags: [meta, web]
---

I'm always building something, but this site only changed when I remembered to
hand-edit HTML. So I rebuilt the plumbing behind it without changing how it looks.

## How it works now

- **One list of projects.** Everything I make (apps, sites, physical builds,
  work projects) lives in a single `projects.json` file. The portfolio grid,
  the homepage picks and the menu are all generated from it.
- **Automatic activity.** The server checks GitHub every hour for each project's
  latest commits, so every card shows when I last worked on it and what I changed.
  The [Lab Log](/lab) puts it all on one timeline.
- **Private apps get a page too.** Some things I build (like my plant tracker) aren't
  public. Those pages show screenshots and what the app does, plus a sign-up form
  for anyone who'd want to use it.
- **Notes.** For things GitHub can't see, like what happens in the shop, I write
  short notes in Markdown, like this one.
