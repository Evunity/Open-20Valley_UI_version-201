import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Bell, Zap, Map, Terminal, Shield, BarChart3, Lock, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface Page {
  title: string;
  icon: React.ReactNode;
  path: string;
  description: string;
}

export default function MainPages() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);

  const pages: Page[] = [
    {
      title: "Alarm Management",
      icon: <Bell className="w-5 h-5" />,
      path: "/alarm-management",
      description: "Monitor and manage network alarms",
    },
    {
      title: "Automation & AI",
      icon: <Zap className="w-5 h-5" />,
      path: "/automation-management",
      description: "AI-powered automation and actions",
    },
    {
      title: "Topology & Network",
      icon: <Map className="w-5 h-5" />,
      path: "/topology-management",
      description: "Network topology and structure",
    },
    {
      title: "Command Center",
      icon: <Terminal className="w-5 h-5" />,
      path: "/command-center",
      description: "Central command and control",
    },
    {
      title: "Activity & Audit",
      icon: <Shield className="w-5 h-5" />,
      path: "/activity-audit",
      description: "Activity logs and audit trail",
    },
    {
      title: "Reports",
      icon: <BarChart3 className="w-5 h-5" />,
      path: "/reports-module",
      description: "Generate and view reports",
    },
    {
      title: "Access Control",
      icon: <Lock className="w-5 h-5" />,
      path: "/access-control",
      description: "User roles and permissions",
    },
    {
      title: "Settings",
      icon: <Settings className="w-5 h-5" />,
      path: "/settings-2",
      description: "System configuration",
    },
  ];

  return (
    <div className="card-elevated rounded-lg border border-border/50 shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-muted/50 transition-colors duration-200"
      >
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold text-foreground">Management Pages</h3>
          <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
            {pages.length}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-muted-foreground transition-transform duration-300",
            isOpen ? "rotate-180" : ""
          )}
        />
      </button>

      {/* Content */}
      {isOpen && (
        <div className="border-t border-border/50 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0">
          {pages.map((page) => (
            <button
              key={page.path}
              onClick={() => navigate(page.path)}
              className="flex flex-col items-start gap-1.5 p-2 hover:bg-primary/5 transition-all duration-200 text-left group border-border/30 border-b border-r"
            >
              <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded bg-primary/10 group-hover:bg-primary/20 transition-colors">
                {page.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-xs group-hover:text-primary transition-colors leading-tight">
                  {page.title}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                  {page.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
