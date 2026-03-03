import { useState } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, BarChart3, AlertTriangle, Globe, FileText, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface Section {
  title: string;
  icon: React.ReactNode;
  path?: string;
  description: string;
  isExternal?: boolean;
}

export default function AnalyticsSections() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);

  const sections: Section[] = [
    {
      title: "Voice Analytics",
      icon: <BarChart3 className="w-5 h-5" />,
      path: "/voice-analytics",
      description: "Call quality and performance metrics",
    },
    {
      title: "Data Analytics",
      icon: <BarChart3 className="w-5 h-5" />,
      path: "/data-analytics",
      description: "Session analytics and bandwidth metrics",
    },
    {
      title: "Network Alarms",
      icon: <AlertTriangle className="w-5 h-5" />,
      path: "/network-alarms",
      description: "Network instability and operational risk awareness",
    },
    {
      title: "Network Status",
      icon: <Globe className="w-5 h-5" />,
      path: "/network-status",
      description: "Structural and availability-focused network overview",
    },
    {
      title: "Reports",
      icon: <FileText className="w-5 h-5" />,
      path: "/reports",
      description: "Generate and download reports",
    },
    {
      title: "AI Engine Actions",
      icon: <Zap className="w-5 h-5" />,
      path: "/ai-actions",
      description: "View AI automation activities",
    },
  ];

  return (
    <div className="card-elevated rounded border border-border/50 shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-muted/50 transition-colors duration-200"
      >
        <div className="flex items-center gap-1.5">
          <h3 className="text-sm font-bold text-foreground">Analytics</h3>
          <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
            {sections.length}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "w-3 h-3 text-muted-foreground transition-transform duration-300",
            isOpen ? "rotate-180" : ""
          )}
        />
      </button>

      {/* Content */}
      {isOpen && (
        <div className="border-t border-border/50 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
          {sections.map((section) => (
            <button
              key={section.path}
              onClick={() => navigate(section.path)}
              className={cn(
                "flex flex-col items-start gap-1 p-1.5 hover:bg-primary/5 transition-all duration-200 text-left group border-border/30",
                "border-b border-r"
              )}
            >
              <div className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded bg-primary/10 group-hover:bg-primary/20 transition-colors">
                {React.cloneElement(section.icon as React.ReactElement, { className: "w-3 h-3" })}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-xs group-hover:text-primary transition-colors leading-tight">
                  {section.title}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">
                  {section.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
