import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, LayoutDashboard, Settings, Moon, Sun, Gauge, Bell, Zap, Lock, Map, Terminal, BarChart3, Shield, ChevronDown, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { DEFAULT_REPORTS_SECTION, REPORTS_SECTIONS } from "@/constants/reportsSections";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const getResponsiveSidebarWidth = (viewportWidth: number) => (viewportWidth >= 1536 ? 320 : 280);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [reportsExpanded, setReportsExpanded] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(() =>
    typeof window !== "undefined" ? getResponsiveSidebarWidth(window.innerWidth) : 280
  );
  const [isDragging, setIsDragging] = useState(false);
  const location = useLocation();
  const analyticsNormalDensityRoutes = new Set(["/analytics-management", "/analytics-home"]);
  const isCompactDensity = !analyticsNormalDensityRoutes.has(location.pathname);

  const COLLAPSED_WIDTH = 76; // Width when collapsed
  const MIN_WIDTH = 220; // Minimum width before collapse when dragging
  const MAX_WIDTH = 420; // Maximum width
  const COLLAPSE_SNAP_THRESHOLD = 180;

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const viewportWidth = window.innerWidth;
      setIsMobile(viewportWidth < 768);

      if (viewportWidth < 768) {
        setSidebarOpen(false);
        return;
      }

      setSidebarWidth(getResponsiveSidebarWidth(viewportWidth));
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

  // Global density mode: compact for all routes except Analytics Management module routes.
  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    document.body.classList.toggle("density-compact", isCompactDensity);

    return () => {
      document.body.classList.remove("density-compact");
    };
  }, [isCompactDensity]);

  // Handle sidebar dragging
  const dragStartXRef = useRef(0);
  const dragStartWidthRef = useRef(0);
  const dragStartedCollapsedRef = useRef(false);
  const contentScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || isMobile) return;

      const deltaX = e.clientX - dragStartXRef.current;
      const baseWidth = dragStartedCollapsedRef.current ? COLLAPSED_WIDTH : dragStartWidthRef.current;
      const requestedWidth = baseWidth + deltaX;
      const collapseThreshold = dragStartedCollapsedRef.current
        ? COLLAPSED_WIDTH
        : COLLAPSE_SNAP_THRESHOLD;

      if (requestedWidth <= collapseThreshold) {
        setSidebarOpen(false);
        return;
      }

      const newWidth = Math.max(MIN_WIDTH, Math.min(requestedWidth, MAX_WIDTH));

      setSidebarWidth(newWidth);
      setSidebarOpen(true);
    };

    const handleMouseUp = () => {
      dragStartedCollapsedRef.current = false;
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

  // Reset main content scroll on route navigation (internal scroll container, not window)
  useEffect(() => {
    if (!contentScrollRef.current) return;
    contentScrollRef.current.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname, location.search, location.hash]);

  const handleDragStart = (e: React.MouseEvent) => {
    dragStartXRef.current = e.clientX;
    dragStartedCollapsedRef.current = !sidebarOpen;
    dragStartWidthRef.current = sidebarOpen ? sidebarWidth : COLLAPSED_WIDTH;
    setIsDragging(true);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    if (location.pathname.startsWith("/reports-module")) {
      setReportsExpanded(true);
    }
  }, [location.pathname]);

  const mainNavItems = [
    {
      path: "/",
      label: "Dashboard",
      icon: LayoutDashboard,
      matchPaths: ["/", "/voice-analytics", "/data-analytics", "/network-alarms", "/network-status", "/reports", "/ai-actions"],
    },
    {
      path: "/analytics-management",
      label: "Analytics Management",
      icon: Gauge,
      matchPaths: ["/analytics-management", "/analytics-home"],
    },
    { path: "/alarm-management", label: "Alarm Management", icon: Bell, matchPaths: ["/alarm-management"] },
    { path: "/automation-management", label: "Automation & AI", icon: Zap, matchPaths: ["/automation-management"] },
    { path: "/topology-management", label: "Topology & Network", icon: Map, matchPaths: ["/topology-management", "/network"] },
    { path: "/command-center", label: "Command Center", icon: Terminal, matchPaths: ["/command-center"] },
    { path: "/activity-audit", label: "Activity & Audit", icon: Shield, matchPaths: ["/activity-audit", "/activity-log"] },
    { path: DEFAULT_REPORTS_SECTION.path, label: "Reports", icon: BarChart3, matchPaths: ["/reports-module"] },
    { path: "/access-control", label: "Access Control", icon: Lock, matchPaths: ["/access-control"] },
    { path: "/settings-2", label: "Settings", icon: Settings, matchPaths: ["/settings-2", "/settings"] },
  ];

  const dashboardDrilldownRoutes = new Set([
    "/voice-analytics",
    "/data-analytics",
    "/network-alarms",
    "/network-status",
    "/reports",
    "/ai-actions",
  ]);

  // Keep dashboard drill-down routes in Dashboard context only.
  const resolvedPath = dashboardDrilldownRoutes.has(location.pathname) ? "/" : location.pathname;

  const isActive = (matchPaths: string[]) =>
    matchPaths.some((path) => (path === "/" ? resolvedPath === "/" : resolvedPath.startsWith(path)));

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
        <div className={cn(sidebarOpen ? "space-y-1" : "space-y-0.5")}>
          {mainNavItems.map(({ path, label, icon: Icon, matchPaths }) => {
            const moduleIsActive = isActive(matchPaths);
            const isReportsModule = label === "Reports";

            return (
              <div key={path} className="space-y-0.5">
                {isReportsModule && sidebarOpen ? (
                  <button
                    onClick={() => setReportsExpanded((prev) => !prev)}
                    className={cn(
                      "mx-1 flex w-[calc(100%-0.5rem)] items-center gap-2 rounded-lg px-2 py-2 text-xs transition-all duration-200",
                      moduleIsActive
                        ? "bg-primary/20 border-l-2 border-primary text-primary font-medium"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                    )}
                  >
                    <div className="flex h-4 w-4 items-center justify-center">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="flex-1 truncate text-left">{label}</span>
                    {reportsExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                  </button>
                ) : (
                  <Link
                    to={path}
                    onClick={() => {
                      if (isMobile) setMobileMenuOpen(false);
                    }}
                    className={cn(
                      "rounded-lg transition-all duration-200 whitespace-nowrap cursor-pointer text-xs",
                      sidebarOpen
                        ? "mx-1 flex items-center gap-2 px-2 py-2"
                        : "mx-2 flex h-9 items-center justify-center px-0",
                      moduleIsActive
                        ? cn(
                            "text-primary font-medium",
                            sidebarOpen ? "bg-primary/20 border-l-2 border-primary" : "bg-primary/15 ring-1 ring-primary/30",
                          )
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                    )}
                    title={!sidebarOpen ? label : undefined}
                  >
                    <div className={cn("flex items-center justify-center", sidebarOpen ? "w-4 h-4" : "w-[14px] h-[14px]")}>
                      <Icon className={cn("transition-all", sidebarOpen ? "w-4 h-4" : "w-[14px] h-[14px]")} />
                    </div>
                    {sidebarOpen && <span className="text-xs truncate">{label}</span>}
                  </Link>
                )}

                {isReportsModule && sidebarOpen && reportsExpanded && (
                  <div className="ml-7 mr-2 space-y-0.5 border-l border-sidebar-border pl-2">
                    {REPORTS_SECTIONS.map((section) => {
                      const sectionActive = location.pathname === section.path;
                      return (
                        <Link
                          key={section.id}
                          to={section.path}
                          onClick={() => {
                            if (isMobile) setMobileMenuOpen(false);
                          }}
                          className={cn(
                            "block rounded-md px-2 py-1.5 text-[11px] transition-colors",
                            sectionActive
                              ? "bg-primary/15 text-primary font-medium"
                              : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                          )}
                        >
                          {section.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Bottom Actions */}
      <div className="p-2 border-t border-sidebar-border space-y-1 flex-shrink-0">
        <button
          onClick={toggleDarkMode}
          className={cn(
            "w-full flex items-center px-2 py-2 rounded-lg transition-colors text-xs",
            "text-sidebar-foreground hover:bg-sidebar-accent/50",
            sidebarOpen ? "justify-start gap-2" : "justify-center h-9 px-0"
          )}
          title="Toggle dark mode"
        >
          <div className="flex-shrink-0 flex items-center justify-center w-4 h-4">
            {darkMode ? <Sun className={cn(sidebarOpen ? "w-4 h-4" : "w-[14px] h-[14px]")} /> : <Moon className={cn(sidebarOpen ? "w-4 h-4" : "w-[14px] h-[14px]")} />}
          </div>
          {sidebarOpen && <span className="text-xs">{darkMode ? "Light" : "Dark"}</span>}
        </button>

        {!isMobile && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={cn(
              "w-full flex items-center px-2 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors text-xs",
              sidebarOpen ? "justify-start gap-2" : "justify-center h-9 px-0"
            )}
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            <div className="flex-shrink-0 flex items-center justify-center w-4 h-4">
              {sidebarOpen ? (
                <ChevronsLeft className={cn(sidebarOpen ? "w-4 h-4" : "w-[14px] h-[14px]")} />
              ) : (
                <ChevronsRight className={cn(sidebarOpen ? "w-4 h-4" : "w-[14px] h-[14px]")} />
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
        <div
          onMouseDown={handleDragStart}
          className={cn(
            "hidden md:flex md:items-center md:justify-center absolute top-0 h-full cursor-col-resize transition-all z-40",
            sidebarOpen
              ? "right-0 w-3 translate-x-1/2 bg-transparent"
              : "right-0 w-3 translate-x-1/2 bg-transparent"
          )}
          title="Drag left/right to resize sidebar"
        >
          <div className="flex flex-col gap-1.5 rounded-full px-1 py-2 hover:bg-primary/10">
            <div className="w-1 h-3 bg-primary/25 rounded-full group-hover:bg-primary/60 transition-colors"></div>
            <div className="w-1 h-3 bg-primary/25 rounded-full group-hover:bg-primary/60 transition-colors"></div>
            <div className="w-1 h-3 bg-primary/25 rounded-full group-hover:bg-primary/60 transition-colors"></div>
          </div>
        </div>
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
      <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {isMobile && (
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="fixed top-2 left-2 z-30 p-1.5 bg-card border border-border shadow-sm rounded-lg hover:bg-muted transition-colors md:hidden"
            aria-label="Toggle mobile menu"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        {/* Content Area */}
        <div
          ref={contentScrollRef}
          className={cn(
            "app-content-theme flex-1 overflow-auto w-full max-w-none",
            isCompactDensity && "density-compact-scope"
          )}
        >
          <div className="w-full max-w-none p-1.5 md:p-2">{children}</div>
        </div>
      </main>
    </div>
  );
}
