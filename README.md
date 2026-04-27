# Open Valley

## Overview
Open Valley is an enterprise network operations platform for monitoring, automation, topology management, alarm operations, command execution, reporting, access control, and operational intelligence.

## Core Modules
- Dashboard
- Analytics Management
- Alarm Management
- Automation & Workflow
- Topology & Network
- Command Center
- Activity & Audit
- Reports
- Access Control
- Settings

## Technology Stack
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
- Node.js 20+
- npm
- Git

## Local Development
```bash
npm install
npm run dev
```

Default local URL: `http://localhost:5173`

## Production Build
```bash
npm run build
```

## Preview Build
```bash
npm run preview
```

## Deploy to Vercel
1. Push the repository to GitHub.
2. Import the project in Vercel.
3. Set framework to `Vite`.
4. Set install command to `npm install --include=dev`.
5. Set build command to `npm run build`.
6. Set output directory to `dist`.
7. Deploy.

## Deploy to Netlify
1. Connect the repository.
2. Set build command to `npm run build`.
3. Set publish directory to `dist`.
4. Deploy.

## Deploy to DigitalOcean
1. Create a new App.
2. Connect the repository.
3. Set build command to `npm run build`.
4. Set output directory to `dist`.
5. Deploy.

## Project Structure
- `client/` application source
- `client/components/` reusable UI components
- `client/pages/` route modules
- `public/` static assets
- configuration files (`vite.config.ts`, `tailwind.config.ts`, `tsconfig*.json`)

## Available Scripts
- `npm run dev`
- `npm run build`
- `npm run preview`

## Production Notes
- Always build before deployment.
- Keep environment variables secure.
- Test key modules after deployment.
