# OVscale Dashboard

AI-Powered Zero-Touch Network Operations Dashboard built with React 18, TypeScript, and Vite.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

```bash
npm install
# or
pnpm install
# or
yarn install
```

### Development

Start the local development server:

```bash
npm run dev
# or
pnpm run dev
```

The app will be available at `http://localhost:8080`

### Production Build

Create an optimized production build:

```bash
npm run build
# or
pnpm run build
```

The output will be in the `dist/` folder.

### Preview Build

Preview the production build locally:

```bash
npm run preview
# or
pnpm run preview
```

## 📁 Project Structure

```
.
├── client/                    # Client-side React application
│   ├── components/           # Reusable React components
│   ├── pages/               # Page components
│   ├── hooks/               # Custom React hooks
│   ├── styles/              # CSS/Tailwind styles
│   ├── App.tsx              # Main app component
│   └── main.tsx             # Entry point
├── public/                   # Static assets
├── shared/                   # Shared types and utilities
├── index.html               # HTML template
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
├── tailwind.config.ts       # Tailwind CSS configuration
├── postcss.config.js        # PostCSS configuration
└── package.json             # Dependencies and scripts
```

## 🛠 Technology Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Radix UI** - UI components
- **React Query** - Data fetching
- **Framer Motion** - Animations

## 🌐 Deployment

This is a client-side only application. It can be deployed to any static hosting service.

### Netlify

1. Push to GitHub
2. Connect your repository to [Netlify](https://netlify.com)
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Deploy!

**One-click deploy:**
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/YOUR_USERNAME/ovscale-dashboard)

### Vercel

1. Push to GitHub
2. Go to [Vercel](https://vercel.com/new)
3. Import your repository
4. Vercel automatically detects Vite and configures the build
5. Deploy!

**CLI deployment:**
```bash
npm i -g vercel
vercel
```

### GitHub Pages

1. Add to `vite.config.ts`:
```typescript
export default defineConfig({
  base: '/ovscale-dashboard/',  // Replace with your repo name
  // ... rest of config
});
```

2. Install deployment tools:
```bash
npm install --save-dev gh-pages
```

3. Update `package.json`:
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

4. Deploy:
```bash
npm run deploy
```

## 📊 Features

- **Executive Dashboard** - Real-time network operations overview
- **Interactive Charts** - Multiple visualization types (Bar, Line, Pie)
- **AI Action Details** - Automated operation reports with timeline
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Dark/Light Mode** - Theme switching support
- **Persistent Settings** - LocalStorage for user preferences
- **Drag & Drop** - Reorder dashboard widgets
- **Analytics** - Detailed drill-down pages for each section

## 🎨 Customization

### Theme Colors

Edit `client/global.css` to customize the purple color scheme:

```css
:root {
  --primary: 280 100% 50%;  /* Adjust hue, saturation, lightness */
  --primary-foreground: 0 0% 100%;
  /* ... other colors ... */
}
```

### Dashboard Widgets

Edit `client/pages/Dashboard.tsx` to add, remove, or reorder widgets.

## 🔍 Code Quality

Run TypeScript type checking:

```bash
npm run typecheck
```

Format code:

```bash
npm run format
```

## 📝 Environment Variables

This application does NOT require any environment variables. It runs entirely on the client side.

## 🚢 Building for Production

The production build is optimized for:
- Code splitting
- Tree shaking
- Minification
- Source maps (optional)

```bash
npm run build
# Output: dist/ folder ready for deployment
```

## 📚 Documentation

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [React Router Documentation](https://reactrouter.com)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Recharts Documentation](https://recharts.org)

## 📄 License

This project is private and proprietary.

## 🤝 Support

For issues and questions, please create an issue on GitHub.

---

**Built with ❤️ by the OVscale Team**
