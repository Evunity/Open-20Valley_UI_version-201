# Open Valley

## Overview
Open Valley is an enterprise OSS / Network Operations platform for monitoring, automation, topology management, alarm operations, command execution, reporting, access control, and operational intelligence.

## Features
- Dashboard
- Analytics Management
- Alarm Management
- Automation & AI
- Topology & Network
- Command Center
- Activity & Audit
- Reports
- Access Control
- Settings

## Tech Stack
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Radix UI
- Recharts
- Node.js
- npm

## Prerequisites
- Node.js 20.x
- npm 10+
- Git

## Local Development
```bash
npm install
npm run dev
```

Default local URL:
- http://localhost:5173

## Production Build
```bash
npm run build
```

## Preview Production Build
```bash
npm run preview
```

## Environment Variables
Create a `.env` file in the project root if you need environment-specific values.

No mandatory environment variables are required for local frontend-only development.

## Deploy to Vercel
1. Push the repository to GitHub.
2. Import the project in Vercel.
3. Set **Framework Preset** to `Vite`.
4. Set **Install Command** to `npm install --include=dev`.
5. Set **Build Command** to `npm run build`.
6. Set **Output Directory** to `dist`.
7. Add environment variables in Vercel if needed.
8. Deploy.

## Deploy to Netlify
1. Connect your GitHub repository in Netlify.
2. Set **Build Command** to `npm run build`.
3. Set **Publish Directory** to `dist`.
4. Add environment variables if needed.
5. Deploy.

## Deploy to DigitalOcean App Platform
1. Create a new App in DigitalOcean App Platform.
2. Connect your GitHub repository.
3. Choose **Static Site** or a **Node build/deploy flow** based on your deployment architecture.
4. Set **Build Command** to `npm run build`.
5. Set **Output Directory** to `dist`.
6. Add environment variables as required.
7. Deploy.

## Project Structure
- `client/` - React application source.
- `client/components/` - Shared and feature UI components.
- `client/pages/` - Page-level modules.
- `public/` - Static assets.
- `vite.config.ts`, `tailwind.config.ts`, `tsconfig*.json` - Core project configuration.

## Available Scripts
Scripts from `package.json`:
- `npm run dev`
- `npm run build`
- `npm run preview`

## Production Notes
- Run `npm run build` before every deployment.
- Keep environment variables secure and managed per environment.
- Verify client-side routes and refresh behavior on your hosting platform.
- Test major modules after deployment (dashboard, analytics, alarms, automation, topology, reporting, access control).
