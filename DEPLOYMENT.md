# Deployment Guide

This is a client-side only React application that can be deployed to any static hosting provider.

## Prerequisites

- Node.js 18+ installed
- Git account on GitHub
- Account on one of the hosting providers (Netlify, Vercel, or GitHub Pages)

## Build Process

```bash
npm install
npm run build
```

This creates an optimized production build in the `dist/` folder.

## Deployment Options

### 1. Netlify (Recommended for Ease)

**Via Web UI:**

1. Push your code to GitHub
2. Go to [Netlify](https://app.netlify.com)
3. Click "New site from Git"
4. Select your repository
5. Build command: `npm run build`
6. Publish directory: `dist`
7. Click "Deploy"

**Via CLI:**

```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

**Environment Variables:** None required

---

### 2. Vercel (Automatic Detection)

**Via Web UI:**

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com/new)
3. Import your repository
4. Vercel auto-detects Vite
5. Click "Deploy"

**Via CLI:**

```bash
npm install -g vercel
vercel --prod
```

**Environment Variables:** None required

---

### 3. GitHub Pages (Free Hosting)

**Step 1: Update Vite Config**

Edit `vite.config.ts`:

```typescript
export default defineConfig({
  base: "/your-repo-name/", // Change to your repository name
  // ... rest of config
});
```

**Step 2: Add Deploy Scripts**

Install gh-pages:

```bash
npm install --save-dev gh-pages
```

Update `package.json`:

```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

**Step 3: Deploy**

```bash
npm run deploy
```

**Step 4: Enable GitHub Pages**

- Go to your repository settings
- Scroll to "Pages"
- Select "Deploy from a branch"
- Choose `gh-pages` branch
- Save

Your site will be available at: `https://your-username.github.io/your-repo-name/`

---

### 4. Traditional Web Server (Apache, Nginx)

1. Build the project:

```bash
npm run build
```

2. Upload the `dist/` folder contents to your web server

3. **Important:** Configure server for SPA routing

**For Nginx:**

```nginx
server {
  listen 80;
  server_name example.com;

  root /var/www/dist;

  location / {
    try_files $uri /index.html;
  }
}
```

**For Apache:**
Create `.htaccess` in the `dist/` folder:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

---

### 5. AWS S3 + CloudFront

1. Build the project:

```bash
npm run build
```

2. Create S3 bucket with static website hosting enabled

3. Upload `dist/` contents:

```bash
aws s3 sync dist/ s3://your-bucket-name --delete
```

4. Create CloudFront distribution pointing to your S3 bucket

5. Configure CloudFront to serve `index.html` for 404 errors

---

## Production Checklist

- [ ] Environment variables removed (none needed for this app)
- [ ] Build completes without errors: `npm run build`
- [ ] No console warnings or errors
- [ ] Routing works correctly (test all pages)
- [ ] Mobile responsive design verified
- [ ] Charts render correctly
- [ ] localStorage functionality works
- [ ] Dark/light mode toggle works
- [ ] Analytics detail pages load correctly

## Performance Tips

1. **Enable compression** on your hosting provider
2. **Enable caching** for static assets
3. **Use a CDN** for faster global delivery
4. **Monitor Core Web Vitals** in production

## Domain Configuration

### Pointing a Custom Domain

**For Netlify:**

1. Go to Site Settings → Domain Management
2. Add your domain
3. Follow DNS instructions

**For Vercel:**

1. Go to Settings → Domains
2. Add your domain
3. Follow DNS configuration

**For GitHub Pages:**

1. Go to Settings → Pages
2. Add custom domain in "Custom domain" field
3. Update DNS records to point to GitHub Pages

## Troubleshooting

### Blank Page on Load

- Check browser console for errors
- Verify `index.html` is being served
- Check that routing is configured correctly

### 404 Errors on Navigation

- Ensure server redirects `404` to `index.html`
- For SPA routing to work, all routes must serve `index.html`

### Charts Not Displaying

- Verify Recharts library is included in build
- Check browser console for errors
- Verify data is available

### Dark Mode Not Working

- Check localStorage access in browser
- Verify Tailwind dark mode class on `<html>`
- Clear browser cache and reload

## Monitoring

Set up monitoring for your deployed app:

- **Netlify Analytics** - Built-in performance monitoring
- **Vercel Analytics** - Web vitals tracking
- **Google Analytics** - Add to track user behavior
- **Sentry** - Error tracking (optional)

## Rollback

To rollback to a previous version:

**Netlify:** Deploy previews and rollback via web UI
**Vercel:** Rollback via web UI under deployments
**GitHub Pages:** Push a previous commit and redeploy

---

## Next Steps

1. Test thoroughly in production
2. Set up monitoring/analytics
3. Configure custom domain (optional)
4. Set up automated deployments from GitHub
5. Monitor error logs and performance metrics

For questions or issues, check the main [README.md](./README.md)
