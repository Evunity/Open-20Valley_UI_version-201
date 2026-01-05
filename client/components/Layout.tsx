import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  LayoutDashboard,
  Settings,
  Moon,
  Sun,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const mainNavItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  const SidebarContent = () => (
    <>
      {/* Logo & Header */}
      <div className="p-4 border-b border-sidebar-border flex items-center justify-between gap-2 flex-shrink-0">
        {sidebarOpen && (
          <Link to="/" className="flex items-center gap-3 flex-1 min-w-0">
            <svg
              className="w-10 h-10 flex-shrink-0 text-primary"
              viewBox="0 0 100 100"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.8" />
              <path
                d="M 50 10 A 40 40 0 0 1 70 15"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M 75 20 A 35 35 0 0 1 85 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-sm text-foreground">Open Valley</span>
              <span className="text-xs text-muted-foreground">Network Ops</span>
            </div>
          </Link>
        )}
        {!sidebarOpen && (
          <Link to="/" className="flex items-center justify-center flex-1" title="Open Valley">
            <svg
              className="w-10 h-10 flex-shrink-0 text-primary"
              viewBox="0 0 100 100"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.8" />
              <path
                d="M 50 10 A 40 40 0 0 1 70 15"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M 75 20 A 35 35 0 0 1 85 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </Link>
        )}
        {isMobile && (
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1.5 hover:bg-sidebar-accent rounded-md transition-colors flex-shrink-0"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-0">
        <div className="space-y-1">
          {mainNavItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              onClick={() => {
                if (isMobile) setMobileMenuOpen(false);
              }}
              className={cn(
                "mx-2 flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 whitespace-nowrap",
                isActive(path)
                  ? "bg-primary/20 text-primary font-medium border-l-2 border-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
              title={!sidebarOpen ? label : undefined}
            >
              <div className="flex-shrink-0 flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
              {sidebarOpen && (
                <span className="text-sm truncate">{label}</span>
              )}
            </Link>
          ))}
        </div>
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-sidebar-border space-y-2 flex-shrink-0">
        <button
          onClick={toggleDarkMode}
          className={cn(
            "w-full flex items-center justify-center md:justify-start gap-3 px-3 py-2.5 rounded-lg transition-colors",
            "text-sidebar-foreground hover:bg-sidebar-accent/50"
          )}
          title="Toggle dark mode"
        >
          <div className="flex-shrink-0">
            {darkMode ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </div>
          {sidebarOpen && (
            <span className="text-sm">{darkMode ? "Light" : "Dark"}</span>
          )}
        </button>

        {!isMobile && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors",
              sidebarOpen ? "justify-start" : "justify-center"
            )}
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            <div className="flex-shrink-0">
              <svg className={cn("w-5 h-5 transition-transform", sidebarOpen ? "rotate-90" : "-rotate-90")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            {sidebarOpen && <span className="text-sm">Collapse</span>}
          </button>
        )}
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex md:flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 flex-shrink-0",
          sidebarOpen ? "md:w-64" : "md:w-20"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Overlay & Drawer */}
      {isMobile && mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {isMobile && (
        <aside
          className={cn(
            "fixed left-0 top-0 h-full w-64 bg-sidebar border-r border-sidebar-border z-50 flex flex-col transition-transform duration-300 md:hidden",
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <SidebarContent />
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card flex items-center px-4 md:px-6 shadow-sm">
          <div className="flex items-center justify-between w-full gap-4">
            {isMobile && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 hover:bg-muted rounded-lg transition-colors flex-shrink-0"
                aria-label="Toggle mobile menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <Link to="/" className="flex items-center gap-2 group hover:opacity-80 transition-opacity flex-1 min-w-0">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2Fc13b4e0240ec42a0981c688ed8e4138d%2F764a7575ec7b41acab908367454597f1?format=webp&width=800"
                alt="Open Valley"
                className="h-10 md:h-12"
              />
            </Link>
            <div className="text-xs md:text-sm text-muted-foreground whitespace-nowrap">
              {new Date().toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 md:p-6">{children}</div>
        </div>
      </main>
    </div>
  );
}
