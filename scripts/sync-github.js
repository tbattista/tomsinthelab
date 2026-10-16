#!/usr/bin/env node
// Refreshes content/activity-snapshot.json from GitHub.
// Usage: GITHUB_TOKEN=... npm run sync
const fs = require('fs');
const { loadProjects } = require('../lib/content');
const { refresh, SNAPSHOT_PATH } = require('../lib/github');

if (!process.env.GITHUB_TOKEN) {
  console.error('Set GITHUB_TOKEN to a token that can read your repos.');
  process.exit(1);
}

refresh(loadProjects())
  .then((result) => {
    delete result.untracked; // not needed in the committed snapshot
    fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(result, null, 2) + '\n');
    console.log(`Wrote ${Object.keys(result.repos).length} repos to ${SNAPSHOT_PATH}`);
    if (result.errors.length) console.warn('Errors:', result.errors);
  })
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
