# Open Valley Vercel Deployment

## Steps
1. Push the repository to GitHub.
2. Import the repository in Vercel.
3. Set framework preset to `Vite`.
4. Set install command:
   ```bash
   npm install --include=dev
   ```
5. Set build command:
   ```bash
   npm run build
   ```
6. Set output directory:
   ```text
   dist
   ```
7. Configure environment variables if required.
8. Deploy.

## Validation
- Confirm app loads after deployment.
- Confirm route refresh behavior works.
- Confirm static assets and core modules load correctly.
