# Vercel Deployment Guide - OVscale Dashboard

This guide provides step-by-step instructions for deploying the OVscale Dashboard to Vercel.

## 📋 Prerequisites

- Git repository pushed to GitHub, GitLab, or Bitbucket
- Vercel account (free tier is sufficient)
- Node.js 20.x installed locally (for testing)

## 🎯 Project Configuration

This project is configured as a **static frontend-only application** with the following setup:

- **Framework**: React + Vite
- **Node Version**: 20.x
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Routing**: Client-side (React Router)

## 🚀 Deployment Methods

### Method 1: Vercel Dashboard (Recommended)

#### Step 1: Import Project

1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Click **"Add New..."** → **"Project"**
3. Select your Git provider (GitHub/GitLab/Bitbucket)
4. Import the `Open-20Valley_UI_version-201` repository

#### Step 2: Configure Project

Vercel will auto-detect the Vite framework. Verify these settings:

```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
Node Version: 20.x
```

#### Step 3: Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for the build to complete
3. Your app will be live at: `https://your-project.vercel.app`

### Method 2: Vercel CLI

#### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

#### Step 2: Login to Vercel

```bash
vercel login
```

#### Step 3: Deploy

```bash
# For production deployment
vercel --prod

# For preview deployment
vercel
```

#### Step 4: Follow Prompts

```
? Set up and deploy "~/Open-20Valley_UI_version-201"? [Y/n] y
? Which scope do you want to deploy to? [Your account]
? Link to existing project? [y/N] n
? What's your project's name? ovscale-dashboard
? In which directory is your code located? ./
? Want to override the settings? [y/N] n
```

## 🔧 Configuration Files

### `vercel.json`

The project includes a `vercel.json` file with:

- **Framework detection**: Vite
- **SPA routing**: All routes redirect to `index.html`
- **Security headers**: XSS protection, frame options, content type
- **Cache optimization**: Static assets cached for 1 year

### `.vercelignore`

Excludes unnecessary files from deployment:
- Server code (`server/` directory)
- Development documentation
- Test files
- Environment files

## 🌐 Custom Domain Setup

### Step 1: Add Domain

1. Go to your project in Vercel Dashboard
2. Click **Settings** → **Domains**
3. Click **"Add"**
4. Enter your domain name

### Step 2: Configure DNS

Add these DNS records at your domain provider:

**For root domain (example.com):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For subdomain (www.example.com):**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### Step 3: Verify

- Wait 24-48 hours for DNS propagation
- Vercel will automatically provision SSL certificate

## 🔐 Environment Variables (Optional)

If you plan to add backend integration later:

1. Go to **Settings** → **Environment Variables**
2. Add variables:
   ```
   VITE_API_URL=https://api.yourbackend.com
   VITE_ENABLE_DEMO_MODE=false
   ```
3. Redeploy for changes to take effect

## 📊 Performance Optimization

### Automatic Optimizations by Vercel

✅ Brotli/Gzip compression
✅ HTTP/2 support
✅ Global CDN distribution
✅ Automatic SSL/TLS
✅ Smart caching
✅ DDoS protection

### Build Optimizations

The project includes:
- **Code splitting**: Recharts and Radix UI in separate chunks
- **Terser minification**: Smaller bundle sizes
- **Tree shaking**: Removes unused code
- **Asset optimization**: Images and fonts optimized

## 🧪 Testing Deployment

### Local Preview

```bash
# Build production version
npm run build

# Preview build
npm run preview
```

Visit `http://localhost:4173` to test the production build locally.

### Vercel Preview Deployments

Every pull request automatically creates a preview deployment:

- **URL**: `https://your-project-git-branch.vercel.app`
- **Duration**: Available until merged/closed
- **Use case**: Test changes before production

## 🔄 Continuous Deployment

Vercel automatically deploys when you push to Git:

- **Main/Master branch** → Production deployment
- **Other branches** → Preview deployments
- **Pull requests** → Preview deployments with URL in PR comments

### Disable Auto-Deploy (Optional)

1. Go to **Settings** → **Git**
2. Under **Production Branch**, uncheck auto-deploy
3. Deploy manually when needed

## 📈 Monitoring & Analytics

### Vercel Analytics

Enable free analytics:

1. Go to **Analytics** tab
2. Click **"Enable Web Analytics"**
3. Metrics tracked:
   - Page views
   - Unique visitors
   - Core Web Vitals (LCP, FID, CLS)
   - Performance scores

### Logs

View deployment logs:

1. Go to **Deployments** tab
2. Click any deployment
3. View **Build Logs** and **Function Logs**

## 🐛 Troubleshooting

### Build Fails with "vite: not found"

**Solution**: Ensure `vite` is in `devDependencies` in `package.json`

```bash
npm install --save-dev vite
```

### 404 Errors on Page Refresh

**Solution**: Verify `vercel.json` has the correct rewrite rule:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Blank Page After Deployment

**Solutions**:
1. Check browser console for errors
2. Verify build completed successfully in Vercel logs
3. Check that `index.html` exists in `dist/` after build
4. Ensure all imports use relative paths

### Slow Initial Load

**Solutions**:
1. Enable Vercel Analytics to identify bottlenecks
2. Check bundle size: `npm run build` shows chunk sizes
3. Consider lazy loading heavy components
4. Optimize images with WebP format

### Node Version Mismatch

**Solution**: The project requires Node 20.x. Update in `package.json`:

```json
{
  "engines": {
    "node": "20.x"
  }
}
```

## 🔐 Security Best Practices

### Headers

The `vercel.json` includes security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

### HTTPS

- Vercel automatically redirects HTTP → HTTPS
- Free SSL/TLS certificates via Let's Encrypt
- Automatic certificate renewal

### Secrets

- Never commit `.env` files
- Use Vercel Environment Variables for secrets
- Use `VITE_` prefix for client-exposed variables

## 🔄 Backend Integration (Future)

When you're ready to add backend:

### Option 1: External API

Update API calls in components:

```typescript
const API_URL = import.meta.env.VITE_API_URL || "https://api.yourbackend.com";

const fetchData = async () => {
  const response = await fetch(`${API_URL}/endpoint`);
  const data = await response.json();
  return data;
};
```

Add environment variable in Vercel:
```
VITE_API_URL=https://api.yourbackend.com
```

### Option 2: Vercel Serverless Functions

Convert server code to Vercel Functions:

1. Create `api/` directory in project root
2. Add serverless functions:

```typescript
// api/demo.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({ message: "Hello from Vercel" });
}
```

3. Update `vercel.json`:

```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "/api/:path*" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

## 📞 Support

### Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Documentation](https://vitejs.dev)
- [React Router Docs](https://reactrouter.com)

### Common Commands

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Preview build
npm run preview

# Deploy to Vercel
vercel --prod

# Check Vercel CLI version
vercel --version
```

## ✅ Deployment Checklist

Before deploying to production:

- [ ] All dependencies installed: `npm install`
- [ ] Build succeeds locally: `npm run build`
- [ ] No TypeScript errors: Check build output
- [ ] Test preview build: `npm run preview`
- [ ] All routes work correctly
- [ ] Images and assets load properly
- [ ] Dark/light mode works
- [ ] Mobile responsive design verified
- [ ] Git repository pushed to remote
- [ ] `vercel.json` configuration present
- [ ] `.vercelignore` excludes server code
- [ ] Environment variables configured (if needed)

## 🎉 Success!

Once deployed, your OVscale Dashboard will be:

✅ Live on a global CDN
✅ Automatically HTTPS-secured
✅ Continuously deployed from Git
✅ Performance-optimized
✅ Ready for backend integration

**Your deployment URL**: Check Vercel dashboard for the live URL

---

**Need help?** Open an issue or contact the development team.
