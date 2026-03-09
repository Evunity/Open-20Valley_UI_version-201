import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, LayoutDashboard, Settings, Moon, Sun, Gauge, Bell, Zap, Lock, AlertTriangle, Map, Terminal, BarChart3, Shield, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [emergencyKillActive, setEmergencyKillActive] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(256); // 64 * 4 = 256px (w-64)
  const [isDragging, setIsDragging] = useState(false);
  const location = useLocation();

  const COLLAPSED_WIDTH = 72; // Width when collapsed
  const MIN_WIDTH = 150; // Minimum width before collapse when dragging
  const MAX_WIDTH = 400; // Maximum width
  const COLLAPSE_SNAP_THRESHOLD = 132;

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

  // Apply dark mode class to document
  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }

    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Handle sidebar dragging
  const dragStartXRef = useRef(0);
  const dragStartWidthRef = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || isMobile) return;

      const deltaX = e.clientX - dragStartXRef.current;
      const requestedWidth = dragStartWidthRef.current + deltaX;

      if (requestedWidth <= COLLAPSE_SNAP_THRESHOLD) {
        setSidebarOpen(false);
        return;
      }

      const newWidth = Math.max(MIN_WIDTH, Math.min(requestedWidth, MAX_WIDTH));

      setSidebarWidth(newWidth);
      // Always keep sidebar open while dragging at expanded width
      setSidebarOpen(true);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "default";
      document.body.style.userSelect = "auto";
    };
  }, [isDragging, isMobile]);

  const handleDragStart = (e: React.MouseEvent) => {
    dragStartXRef.current = e.clientX;
    dragStartWidthRef.current = sidebarWidth;
    setIsDragging(true);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const mainNavItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/analytics-management", label: "Analytics Management", icon: Gauge },
    { path: "/alarm-management", label: "Alarm Management", icon: Bell },
    { path: "/automation-management", label: "Automation & AI", icon: Zap },
    { path: "/topology-management", label: "Topology & Network", icon: Map },
    { path: "/command-center", label: "Command Center", icon: Terminal },
    { path: "/activity-audit", label: "Activity & Audit", icon: Shield },
    { path: "/reports-module", label: "Reports", icon: BarChart3 },
    { path: "/access-control", label: "Access Control", icon: Lock },
    { path: "/settings-2", label: "Settings", icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  const SidebarContent = () => (
    <>
      {/* Logo & Header */}
      <div className="p-2 border-b border-sidebar-border flex items-center justify-between gap-1.5 flex-shrink-0">
        {sidebarOpen && (
          <Link to="/" className="flex items-center gap-2 flex-1 min-w-0">
            <svg
              className="w-9 h-9 flex-shrink-0 text-primary"
              viewBox="0 0 100 100"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                opacity="0.8"
              />
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
              <span className="font-bold text-xs text-foreground">Open Valley</span>
              <span className="text-xs text-muted-foreground leading-tight">Network Ops</span>
            </div>
          </Link>
        )}
        {!sidebarOpen && (
          <Link to="/" className="flex items-center justify-center flex-1" title="Open Valley">
            <svg
              className="w-9 h-9 flex-shrink-0 text-primary"
              viewBox="0 0 100 100"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                opacity="0.8"
              />
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
            className="p-1 hover:bg-sidebar-accent rounded-md transition-colors flex-shrink-0"
            aria-label="Close menu"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-0">
        <div className="space-y-1">
          {mainNavItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              onClick={() => {
                if (isMobile) setMobileMenuOpen(false);
              }}
              className={cn(
                "mx-1 rounded-lg transition-all duration-200 whitespace-nowrap cursor-pointer text-xs",
                sidebarOpen
                  ? "flex items-center gap-2 px-2 py-2"
                  : "flex h-10 items-center justify-center px-0",
                isActive(path)
                  ? cn(
                      "bg-primary/20 text-primary font-medium",
                      sidebarOpen && "border-l-2 border-primary"
                    )
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
              title={!sidebarOpen ? label : undefined}
            >
              <div className={cn("flex items-center justify-center", sidebarOpen ? "w-4 h-4" : "w-5 h-5")}>
                <Icon className="w-4 h-4" />
              </div>
              {sidebarOpen && <span className="text-xs truncate">{label}</span>}
            </Link>
          ))}
        </div>
      </nav>

      {/* Bottom Actions */}
      <div className="p-2 border-t border-sidebar-border space-y-1 flex-shrink-0">
        <button
          onClick={toggleDarkMode}
          className={cn(
            "w-full flex items-center px-2 py-2 rounded-lg transition-colors text-xs",
            "text-sidebar-foreground hover:bg-sidebar-accent/50",
            sidebarOpen ? "justify-start gap-2" : "justify-center h-10 px-0"
          )}
          title="Toggle dark mode"
        >
          <div className="flex-shrink-0 flex items-center justify-center w-4 h-4">
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </div>
          {sidebarOpen && <span className="text-xs">{darkMode ? "Light" : "Dark"}</span>}
        </button>

        {!isMobile && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={cn(
              "w-full flex items-center px-2 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors text-xs",
              sidebarOpen ? "justify-start gap-2" : "justify-center h-10 px-0"
            )}
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            <div className="flex-shrink-0 flex items-center justify-center w-4 h-4">
              {sidebarOpen ? (
                <ChevronsLeft className="w-4 h-4" />
              ) : (
                <ChevronsRight className="w-4 h-4" />
              )}
            </div>
            {sidebarOpen && <span className="text-xs">Collapse</span>}
          </button>
        )}
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-col relative group">
        <aside
          className={cn(
            "flex flex-col bg-sidebar border-r border-sidebar-border flex-shrink-0 transition-all duration-200 overflow-hidden",
            "relative h-screen"
          )}
          style={{ width: sidebarOpen ? `${sidebarWidth}px` : `${COLLAPSED_WIDTH}px` }}
        >
          <SidebarContent />
        </aside>

        {/* Draggable Handle */}
        {sidebarOpen && (
          <div
            onMouseDown={handleDragStart}
            className="hidden md:flex md:items-center md:justify-center absolute right-0 top-0 h-full w-2 bg-transparent hover:bg-primary/30 cursor-col-resize transition-all z-40 group-hover:bg-primary/40"
            title="Drag left/right to resize sidebar"
          >
            <div className="flex flex-col gap-1.5">
              <div className="w-1 h-3 bg-primary/40 rounded-full group-hover:bg-primary/70 transition-colors"></div>
              <div className="w-1 h-3 bg-primary/40 rounded-full group-hover:bg-primary/70 transition-colors"></div>
              <div className="w-1 h-3 bg-primary/40 rounded-full group-hover:bg-primary/70 transition-colors"></div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Overlay & Drawer */}
      {isMobile && mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
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
        <header className="h-10 border-b border-border bg-card flex items-center px-2 shadow-sm">
          <div className="flex items-center justify-between w-full gap-3">
            {isMobile && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 hover:bg-muted rounded-lg transition-colors flex-shrink-0"
                aria-label="Toggle mobile menu"
              >
                <Menu className="w-4 h-4" />
              </button>
            )}
            <Link
              to="/"
              className="flex items-center gap-2 group hover:opacity-80 transition-opacity flex-1 min-w-0 cursor-pointer"
              title="Back to Dashboard"
            >
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2Fc13b4e0240ec42a0981c688ed8e4138d%2F764a7575ec7b41acab908367454597f1?format=webp&width=800"
                alt="Open Valley"
                className="h-8 md:h-10"
              />
            </Link>
            <div className="text-xs text-muted-foreground whitespace-nowrap">
              {new Date().toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </div>

            {/* Emergency Kill Switch */}
            <button
              onClick={() => {
                setEmergencyKillActive(!emergencyKillActive);
                if (!emergencyKillActive) {
                  alert('🚨 EMERGENCY KILL SWITCH ACTIVATED\n\nAll automations have been paused.\nManual intervention required to resume.');
                }
              }}
              className={cn(
                "px-2.5 py-1.5 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-all flex-shrink-0",
                emergencyKillActive
                  ? "bg-red-600 text-white hover:bg-red-700 animate-pulse"
                  : "bg-red-100 text-red-700 hover:bg-red-200"
              )}
              title="Emergency Kill Switch - Stops all automations immediately (Auditor Required)"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {emergencyKillActive ? "🚨 KILL" : "Kill"}
              </span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-1.5 md:p-2">{children}</div>
        </div>
      </main>
    </div>
  );
}
