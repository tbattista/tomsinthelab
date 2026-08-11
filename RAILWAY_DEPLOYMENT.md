# Railway Deployment Guide - Toms in the Lab

## 🚀 Quick Start Deployment

Your website is now ready to deploy to Railway using **Node.js/Express**!

### Repository
**GitHub:** https://github.com/tbattista/tomsinthelab.git

## 📋 Deployment Files

✅ [`server.js`](server.js:1) - Express.js server (static site + Road Trip Map Maker API)  
✅ [`package.json`](package.json:1) - Node.js dependencies  
✅ [`Dockerfile`](Dockerfile:1) - Playwright/Chromium container build (required for PDF export)  
✅ [`railway.toml`](railway.toml:1) - Railway platform settings (uses the Dockerfile builder)  

> **Note:** The build switched from Nixpacks to the Dockerfile builder when the
> Road Trip Map Maker was added — its print/export feature renders maps
> server-side with headless Chromium, which the Playwright base image provides.

## 🎯 Why Node.js/Express?

We switched from Docker/Nginx to Node.js/Express because:
- ✅ Railway handles Node.js deployments natively
- ✅ Better PORT environment variable management
- ✅ Simpler configuration and faster builds
- ✅ More reliable routing and health checks
- ✅ Easier debugging with clear logs

## 🚢 Deployment Steps

### Step 1: Files Already Committed ✅

All deployment files have been committed and pushed to GitHub:
- `server.js` - Express server
- `package.json` - Dependencies
- `nixpacks.toml` - Build config
- `railway.toml` - Deploy settings

### Step 2: Connect Railway to GitHub (Recommended)

1. Go to [Railway Dashboard](https://railway.app/project/8b98b501-1bc5-4893-bf1a-9cc1799ae380)
2. Click **"Settings"** → **"Service"**
3. Under **"Source"**, click **"Connect Repo"**
4. Select **`tbattista/tomsinthelab`**
5. Railway will automatically:
   - Detect `package.json`
   - Install dependencies with npm
   - Run `node server.js`
   - Assign dynamic PORT
6. Wait 2-3 minutes for deployment

### Step 3: Get Your Website URL

After deployment completes:

1. In Railway dashboard, go to **"Settings"** → **"Domains"**
2. Click **"Generate Domain"**
3. You'll get a URL like: `tomsinthelab.up.railway.app`
4. Visit your live website! 🎉

## 🧪 Local Testing

Test the deployment locally before pushing:

```bash
# Install dependencies
npm install

# Start the server
npm start

# Visit http://localhost:3000
```

The server will:
- Serve files from `website/` directory
- Listen on PORT 3000 (or Railway's PORT in production)
- Log all requests to console

## 🔄 Updating Your Website

After initial deployment, updates are automatic:

```bash
# 1. Make changes to your website files
# 2. Commit and push to GitHub
git add .
git commit -m "Update: [describe changes]"
git push

# 3. Railway automatically rebuilds and deploys!
# Changes live in 2-3 minutes
```

## 🌐 Custom Domain Setup (Optional)

To use **tomsinthelab.com**:

### In Railway Dashboard:

1. Go to **"Settings"** → **"Domains"**
2. Click **"Custom Domain"**
3. Enter: `tomsinthelab.com`
4. Railway will provide DNS records

### In Your Domain Registrar:

Add these DNS records (values provided by Railway):

```
Type: CNAME
Name: www
Value: [provided by Railway]

Type: A
Name: @
Value: [provided by Railway]
```

**DNS Propagation:** Wait 5-60 minutes for changes to take effect.

## 💰 Cost Estimate

**Railway Free Tier:**
- $5 free credit per month
- Your static site uses ~$0.50-$1.00/month
- **Result: FREE for your use case**

Resource usage:
- ~0.1 vCPU
- ~100MB RAM
- Minimal bandwidth

## ⚡ What's Included

Your deployment includes:

- ✅ **Express.js server** - Fast static file serving
- ✅ **Automatic PORT binding** - Railway compatibility
- ✅ **Error handling** - 404 pages and logging
- ✅ **HTTPS** - Automatic SSL certificate from Railway
- ✅ **Auto-deployment** - Push to GitHub = instant updates
- ✅ **Health checks** - Railway monitors uptime

## 📊 Monitoring

View logs in Railway dashboard:

1. Go to your project
2. Click **"Deployments"**
3. Click on latest deployment
4. View **"Build Logs"** and **"Deploy Logs"**

Or use Railway CLI:
```bash
railway logs
```

## 🆘 Troubleshooting

### Build Fails
- Check Railway build logs for errors
- Verify `package.json` syntax is valid
- Ensure Node.js version is compatible (18.x+)
- Check that `website/` folder exists

### Site Not Loading (502 Error)
- Verify server is listening on `process.env.PORT`
- Check that server binds to `0.0.0.0` not `localhost`
- Review Railway deploy logs for startup errors
- Ensure Express is serving from correct directory

### Static Assets Not Loading
- Verify file paths in HTML are relative
- Check that `website/` directory structure is correct
- Ensure Express static middleware path is correct
- Test locally with `npm start`

### Port Issues
- Server must use `process.env.PORT` (not hardcoded)
- Railway assigns PORT dynamically
- Check server.js line: `const PORT = process.env.PORT || 3000;`

### Need Help?
- Railway Docs: https://docs.railway.app/
- Railway Discord: https://discord.gg/railway
- Express.js Docs: https://expressjs.com/
- GitHub Issues: Create an issue in your repo

## 🔧 Configuration Details

### server.js
```javascript
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from website directory
app.use(express.static(path.join(__dirname, 'website')));

// Handle 404
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'website', 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
```

### package.json
- **Express.js**: ^4.18.2 (static file server)
- **Node.js**: 18.x or higher
- **Start script**: `node server.js`

### Dockerfile
- **Base image**: `mcr.microsoft.com/playwright` (Chromium + OS deps preinstalled)
- **Install**: `npm ci --omit=dev`
- **Start**: `node server.js`

### railway.toml
- **Builder**: DOCKERFILE
- **Start command**: `node server.js`
- **Restart policy**: ON_FAILURE with 10 retries

## 🗺️ Road Trip Map Maker Configuration

The Road Trip Map Maker (`/road-trip-map-maker.html`) works out of the box with
free OSM-derived providers. Every provider is swappable via environment
variables set in the Railway dashboard:

| Variable | Default | Purpose |
| --- | --- | --- |
| `TILE_STYLE_URL` | `https://tiles.openfreemap.org/styles/liberty` | Full MapLibre style for the Standard map |
| `TILE_JSON_URL` | `https://tiles.openfreemap.org/planet` | Vector TileJSON (OpenMapTiles schema) used by the Coloring Map style |
| `TILE_GLYPHS_URL` | `https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf` | Font glyphs for the Coloring Map style |
| `TILE_ATTRIBUTION` | OpenFreeMap / OpenStreetMap notice | Attribution HTML shown on map + prints |
| `OSRM_URL` | `https://router.project-osrm.org` | OSRM-compatible routing engine |
| `GEOCODER_URL` | `https://nominatim.openstreetmap.org` | Nominatim-compatible geocoder |
| `GEOCODER_USER_AGENT` | project contact string | Identifies the app per Nominatim policy |
| `EXPORT_TIMEOUT_MS` | `120000` | Max time for a print render |
| `CHROMIUM_EXECUTABLE_PATH` | (auto) | Override the Chromium binary if needed |

Notes:
- Tiles are **not** scraped from `tile.openstreetmap.org`; the default vector
  tile host is [OpenFreeMap](https://openfreemap.org), whose terms allow this.
- The public OSRM demo server is fine for light use; point `OSRM_URL` at a
  hosted OSRM (or self-host) if traffic grows.
- Geocoding requests are proxied server-side with a proper User-Agent and
  throttled to 1 request/second per Nominatim's usage policy.

## 📁 Project Structure

```
tomsinthelab/
├── server.js               # Express.js server + Road Trip Map Maker API
├── package.json            # Node.js dependencies
├── railway.toml            # Railway settings (Dockerfile builder)
├── Dockerfile              # Playwright/Chromium container build
├── .dockerignore           # Docker exclusions
├── .gitignore              # Git exclusions
├── lib/                    # Server modules
│   ├── config.js           # Env-configurable provider settings
│   ├── coloring-style.js   # Generated "Coloring Map" MapLibre style
│   └── exporter.js         # Playwright + pdf-lib print pipeline
└── website/                # Your website files
    ├── index.html
    ├── road-trip-map-maker.html   # Road Trip Map Maker UI
    ├── map-print.html             # Server-side print render page
    ├── portfolio-masonry.html
    ├── contact.html
    ├── css/
    ├── js/
    ├── images/
    ├── includes/
    ├── projects/
    └── docs/
```

## ✅ Deployment Checklist

- [x] Node.js configuration files created
- [x] Files committed to Git
- [x] Pushed to GitHub
- [ ] Railway connected to GitHub repo
- [ ] Deployment triggered
- [ ] Website accessible
- [ ] Custom domain configured (optional)

## 🎯 Next Steps

1. **Connect Railway to GitHub** (if not already done)
   - Visit: https://railway.com/project/8b98b501-1bc5-4893-bf1a-9cc1799ae380
   - Link to repository: https://github.com/tbattista/tomsinthelab

2. **Trigger Deployment**
   - Push changes to GitHub (already done)
   - Railway automatically detects and deploys

3. **Verify Deployment**
   - Check Railway dashboard for build status
   - Visit the provided Railway URL
   - Test all pages and functionality

4. **Optional: Add Custom Domain**
   - Configure DNS settings
   - Add domain in Railway dashboard

## 🎉 You're Ready!

Your website is configured with Node.js/Express and ready to deploy. Just connect Railway to your GitHub repository and you'll be live in minutes!

---

**Questions?** Check the Railway documentation or create an issue in your GitHub repo.