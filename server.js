const express = require('express');
const path = require('path');
const app = express();

// Get port from environment variable (Railway provides this)
const PORT = process.env.PORT || 3000;

// Serve static files from the website directory
app.use(express.static(path.join(__dirname, 'website')));

// Handle all routes by serving index.html (for SPA-like behavior)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'website', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});