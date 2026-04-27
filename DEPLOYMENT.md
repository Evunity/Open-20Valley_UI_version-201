# Open Valley Deployment Guide

## Build Once, Deploy Anywhere
Use the same build process across providers:

```bash
npm install
npm run build
```

Output is generated in `dist/`.

## Vercel
- Framework: `Vite`
- Install command: `npm install --include=dev`
- Build command: `npm run build`
- Output directory: `dist`

## Netlify
- Build command: `npm run build`
- Publish directory: `dist`

## DigitalOcean App Platform
- Build command: `npm run build`
- Output directory: `dist`

## Post-Deployment Validation
- Confirm application loads successfully.
- Verify major routes render without errors.
- Verify static assets load correctly.
- Validate core modules (Dashboard, Analytics, Alarms, Automation, Topology, Reports, Access Control, Settings).
