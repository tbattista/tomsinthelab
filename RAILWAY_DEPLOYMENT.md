# Railway Deployment Guide - Toms in the Lab

## 🚀 Quick Start Deployment

Your website is now ready to deploy to Railway! All configuration files have been created.

### Repository
**GitHub:** https://github.com/tbattista/tomsinthelab.git

## 📋 Files Created

✅ [`Dockerfile`](Dockerfile:1) - Docker container configuration  
✅ [`nginx.conf`](nginx.conf:1) - Nginx web server settings  
✅ [`.dockerignore`](.dockerignore:1) - Files to exclude from build  
✅ [`railway.toml`](railway.toml:1) - Railway platform configuration  

## 🎯 Deployment Steps

### Step 1: Commit and Push to GitHub

```bash
# Add all new files
git add Dockerfile nginx.conf .dockerignore railway.toml RAILWAY_DEPLOYMENT.md

# Commit the changes
git commit -m "Add Railway deployment configuration"

# Push to GitHub
git push origin main
```

### Step 2: Deploy on Railway

**Option A: Deploy from GitHub (Recommended)**

1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Choose **`tbattista/tomsinthelab`**
6. Railway will automatically:
   - Detect the Dockerfile
   - Build your container
   - Deploy your website
7. Wait 2-3 minutes for deployment

**Option B: Deploy using Railway CLI**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link to your project (first time only)
railway init

# Deploy
railway up
```

### Step 3: Get Your Website URL

After deployment completes:

1. In Railway dashboard, click on your project
2. Go to **Settings** → **Domains**
3. Click **"Generate Domain"**
4. You'll get a URL like: `tomsinthelab.up.railway.app`
5. Visit your live website! 🎉

## 🌐 Custom Domain Setup (Optional)

To use **tomsinthelab.com**:

### In Railway Dashboard:

1. Click **"Custom Domain"**
2. Enter: `tomsinthelab.com`
3. Railway will provide DNS records

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

## 🧪 Local Testing (Optional)

Test before deploying:

```bash
# Build Docker image
docker build -t tomsinthelab .

# Run locally
docker run -p 8080:80 tomsinthelab

# Visit http://localhost:8080
```

## 💰 Cost Estimate

**Railway Free Tier:**
- $5 free credit per month
- Your static site uses ~$0.50-$1.00/month
- **Result: FREE for your use case**

## ⚡ What's Included

Your deployment includes:

- ✅ **Nginx web server** - Fast, efficient static file serving
- ✅ **Gzip compression** - Faster page loads
- ✅ **Browser caching** - 1-year cache for static assets
- ✅ **Security headers** - XSS protection, frame options, etc.
- ✅ **HTTPS** - Automatic SSL certificate from Railway
- ✅ **Auto-deployment** - Push to GitHub = instant updates

## 📊 Monitoring

View logs in Railway dashboard:

1. Go to your project
2. Click **"Deployments"**
3. Click on latest deployment
4. View **"Build Logs"** and **"Deploy Logs"**

## 🆘 Troubleshooting

### Build Fails
- Check Railway build logs for errors
- Verify all files are committed to GitHub
- Ensure `website/` folder exists with your HTML files

### Site Not Loading
- Check deployment status in Railway dashboard
- Verify the generated domain URL
- Check browser console for errors

### 404 Errors
- Ensure file paths in HTML are relative (not absolute)
- Check that all files are in the `website/` folder
- Verify nginx.conf is correct

### Need Help?
- Railway Docs: https://docs.railway.app/
- Railway Discord: https://discord.gg/railway
- GitHub Issues: Create an issue in your repo

## 📁 Project Structure

```
tomsinthelab/
├── Dockerfile              # Docker configuration
├── nginx.conf              # Nginx server config
├── .dockerignore          # Build exclusions
├── railway.toml           # Railway settings
├── RAILWAY_DEPLOYMENT.md  # This file
└── website/               # Your website files
    ├── index.html
    ├── portfolio-masonry.html
    ├── contact.html
    ├── style.css
    ├── css/
    ├── js/
    ├── images/
    ├── includes/
    ├── projects/
    └── docs/
```

## ✅ Deployment Checklist

- [x] Configuration files created
- [ ] Files committed to Git
- [ ] Pushed to GitHub
- [ ] Railway project created
- [ ] Deployment successful
- [ ] Website accessible
- [ ] Custom domain configured (optional)

## 🎉 You're Ready!

Your website is configured and ready to deploy. Just follow the steps above and you'll be live in minutes!

---

**Questions?** Check the Railway documentation or create an issue in your GitHub repo.