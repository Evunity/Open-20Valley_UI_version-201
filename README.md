# Open Valley

## 1) Overview
Open Valley is an enterprise network operations platform designed for modern telecom and network operations teams. It provides unified capabilities for:

- Monitoring
- Automation
- Topology management
- Alarm operations
- Command execution
- Reporting
- Access control
- Operational intelligence

## 2) Core Modules
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

## 3) Technology Stack
Based on the current `package.json`, Open Valley is built with:

- React
- TypeScript
- Vite
- Tailwind CSS
- Node.js
- npm
- React Router DOM
- TanStack React Query
- Radix UI
- Recharts

## 4) Prerequisites
- Node.js 20+
- npm
- Git

## 5) Local Development
```bash
npm install
npm run dev
```

Default URL: `http://localhost:5173`

## 6) Production Build
```bash
npm run build
```

Build output is generated in `dist/`.

## 7) Preview Build
```bash
npm run preview
```

## 8) Deploy to Vercel
1. Push this repository to GitHub.
2. Import the repository in Vercel.
3. Set **Framework Preset** to `Vite`.
4. Set **Install Command** to:
   ```bash
   npm install --include=dev
   ```
5. Set **Build Command** to:
   ```bash
   npm run build
   ```
6. Set **Output Directory** to:
   ```text
   dist
   ```
7. Deploy.

## 9) Deploy to Netlify
1. Connect the repository to Netlify.
2. Set **Build command** to:
   ```bash
   npm run build
   ```
3. Set **Publish directory** to:
   ```text
   dist
   ```
4. Deploy.

## 10) Deploy to DigitalOcean
1. Create a new App in DigitalOcean App Platform.
2. Connect the repository.
3. Set **Build Command** to:
   ```bash
   npm run build
   ```
4. Set **Output Directory** to:
   ```text
   dist
   ```
5. Deploy.

## 11) Project Structure
- `client/` — Frontend source code
- `client/components/` — Reusable UI and feature components
- `client/pages/` — Route-level page modules
- `public/` — Static assets served at runtime
- Root configuration files — Build, TypeScript, and deployment configuration (`vite.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `netlify.toml`, etc.)

## 12) Available Scripts
Scripts are defined in `package.json`:

- `npm run dev` — Start Vite development server
- `npm run build` — Create production build
- `npm run preview` — Preview production build locally

## 13) Production Notes
- Always create a production build before deployment.
- Keep environment variables secure in the deployment platform.
- Validate key modules and critical routes after deployment.
