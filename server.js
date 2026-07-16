const express = require('express');
const path = require('path');
const app = express();

const poller = require('./tracker/poller');
const store = require('./tracker/store');

// Get port from environment variable (Railway provides this)
const PORT = process.env.PORT || 3000;

// --- Housewives tracker API ------------------------------------------------

// Current sightings (newest first, within the freshness window).
app.get('/api/sightings', (req, res) => {
  res.json({ sightings: store.all(), status: poller.status() });
});

// Trigger a poll on demand (handy for the "Refresh" button / testing).
app.post('/api/refresh', async (req, res) => {
  const result = await poller.runOnce();
  res.json({ result, sightings: store.all() });
});

// --- Static site -----------------------------------------------------------

// Serve static files from the website directory
app.use(express.static(path.join(__dirname, 'website')));

// Handle all routes by serving index.html (for SPA-like behavior)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'website', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  // Kick off the background Reddit poller.
  poller.start();
});
