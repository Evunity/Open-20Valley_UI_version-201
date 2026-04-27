# Deployment Guide

## Build
```bash
npm install
npm run build
```

Build artifacts are generated in `dist/`.

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

After deployment, validate routing, static asset loading, and critical module navigation.
