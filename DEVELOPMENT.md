# Development Guide

This document describes how to set up your development environment and contribute to OVscale Dashboard.

## Getting Started

### Prerequisites
- Node.js 18+ ([Download](https://nodejs.org))
- npm, yarn, or pnpm
- Git
- A code editor (VS Code recommended)

### Initial Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ovscale-dashboard.git
cd ovscale-dashboard
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Start development server:
```bash
npm run dev
```

4. Open browser and navigate to `http://localhost:8080`

## Project Structure

```
client/
├── components/          # Reusable React components
│   ├── ui/             # Shadcn/UI components
│   ├── DashboardWidget.tsx
│   └── Layout.tsx
├── pages/              # Page-level components
│   ├── Dashboard.tsx   # Main dashboard view
│   ├── DetailPage.tsx  # Drill-down analytics
│   ├── Settings.tsx    # Dashboard customization
│   └── NotFound.tsx    # 404 page
├── hooks/              # Custom React hooks
│   └── useLocalStorage.ts
├── styles/             # CSS and Tailwind
│   └── global.css
├── App.tsx            # Root app component
└── main.tsx           # Entry point
```

## Development Workflow

### Running Development Server

```bash
npm run dev
```

The server supports:
- Hot Module Replacement (HMR)
- TypeScript checking
- CSS hot reload
- Automatic browser refresh

### Code Quality

#### Type Checking
```bash
npm run typecheck
```

#### Formatting
```bash
npm run format
```

#### Build Verification
```bash
npm run build
```

## Key Technologies

### React 18
- Functional components with hooks
- Context API for state management
- React Router for navigation

### TypeScript
- Strict type checking enabled
- Path aliases configured
- Global types in `types/`

### Tailwind CSS
- Utility-first styling
- CSS variables for theming
- Dark mode support

### Recharts
- Interactive data visualization
- Multiple chart types (Bar, Line, Pie)
- Responsive containers

## Component Guidelines

### Creating a New Component

1. Create file in appropriate directory:
```typescript
// client/components/MyComponent.tsx
import { FC } from 'react';

interface MyComponentProps {
  title: string;
  // ... other props
}

export const MyComponent: FC<MyComponentProps> = ({ title }) => {
  return <div>{title}</div>;
};

export default MyComponent;
```

2. Use in parent component:
```typescript
import MyComponent from '@/components/MyComponent';

function ParentComponent() {
  return <MyComponent title="Hello" />;
}
```

### Component Best Practices

- Use TypeScript interfaces for props
- Add JSDoc comments for complex components
- Keep components focused and single-responsibility
- Extract reusable logic into custom hooks
- Use `cn()` utility for conditional classes

```typescript
import { cn } from '@/lib/utils';

function Component({ isActive }: { isActive: boolean }) {
  return (
    <div className={cn(
      'p-4 rounded-lg',
      isActive && 'bg-primary text-white'
    )}>
      Content
    </div>
  );
}
```

## State Management

### LocalStorage for Persistence

Use the `useLocalStorage` hook:
```typescript
import { useLocalStorage } from '@/hooks/useLocalStorage';

function Component() {
  const [value, setValue] = useLocalStorage('key', 'default');
  
  return (
    <button onClick={() => setValue('new-value')}>
      Current: {value}
    </button>
  );
}
```

### React Query (TanStack Query)

For data fetching:
```typescript
import { useQuery } from '@tanstack/react-query';

function DataComponent() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['data'],
    queryFn: async () => {
      const response = await fetch('/api/data');
      return response.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>{JSON.stringify(data)}</div>;
}
```

## Styling

### Tailwind CSS Classes

```typescript
<div className="
  p-4                           // Padding
  rounded-lg                    // Border radius
  bg-primary                    // Background color
  text-foreground              // Text color
  hover:shadow-lg              // Hover state
  transition-all               // Animation
  dark:bg-slate-900            // Dark mode
">
  Styled content
</div>
```

### CSS Variables

Edit `client/global.css` to customize theme:
```css
:root {
  --primary: 280 100% 50%;
  --status-healthy: 120 100% 40%;
  --status-critical: 0 100% 50%;
  /* ... more colors ... */
}
```

## Routing

### Adding a New Route

Edit `client/App.tsx`:
```typescript
<Routes>
  <Route path="/" element={<Layout><Dashboard /></Layout>} />
  <Route path="/settings" element={<Layout><Settings /></Layout>} />
  <Route path="/new-page" element={<Layout><NewPage /></Layout>} />
  {/* ... */}
</Routes>
```

### Navigation

Use React Router hooks:
```typescript
import { useNavigate } from 'react-router-dom';

function Component() {
  const navigate = useNavigate();
  
  return (
    <button onClick={() => navigate('/settings')}>
      Go to Settings
    </button>
  );
}
```

## Data Visualization

### Adding Charts

```typescript
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

function ChartComponent() {
  const data = [
    { name: 'Jan', value: 100 },
    { name: 'Feb', value: 200 },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="value" stroke="#7c3aed" />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

## Testing

### Running Tests
```bash
npm run test
```

### Writing Tests

Create test files next to components:
```typescript
// MyComponent.test.ts
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders title', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

## Debugging

### Browser DevTools
- Inspect React components with React DevTools
- View component props and state
- Track component re-renders

### Console Logging
```typescript
// Use console for debugging
console.log('Value:', value);
console.warn('Warning message');
console.error('Error message');
```

### VS Code Debugging

Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:8080",
      "webRoot": "${workspaceFolder}/client"
    }
  ]
}
```

## Building for Production

```bash
npm run build
```

This creates:
- Optimized JavaScript bundles
- Minified CSS
- Source maps (optional)
- Assets in `dist/` folder

Verify build:
```bash
npm run preview
```

## Git Workflow

### Commit Message Format
```
[feature|fix|docs|style|test] Brief description

Optional longer description explaining the change
and why it was made.
```

### Example Commits
```
git commit -m "feature: Add chart type switcher to detail pages"
git commit -m "fix: Resolve AI action navigation bug"
git commit -m "docs: Update deployment guide"
```

## Performance Optimization

### Code Splitting
- Use React.lazy() for route-based splitting
- Vite automatically handles dynamic imports

### Image Optimization
- Use WebP format when possible
- Optimize SVG files
- Lazy load images below the fold

### Bundle Analysis
```bash
npm run build
# Check dist/ folder size
```

## Troubleshooting

### HMR Not Working
1. Check firewall settings
2. Ensure port 8080 is available
3. Try `npm run dev -- --host`

### Module Not Found Errors
1. Verify import path is correct
2. Check file extension (.tsx, .ts, .css)
3. Ensure alias is configured in tsconfig.json

### TypeScript Errors
```bash
npm run typecheck
```

### Build Fails
1. Run `npm install` to update dependencies
2. Delete `node_modules` and `.vite` cache
3. Check for circular dependencies

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Vite Documentation](https://vitejs.dev)
- [React Router Guide](https://reactrouter.com)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Recharts API](https://recharts.org/api)

## Getting Help

- Check existing GitHub issues
- Create a new issue with detailed description
- Include error messages and steps to reproduce
- Mention your environment (Node version, OS, etc.)

---

**Happy coding! 🚀**
