import { useState } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, BarChart3, AlertTriangle, Globe, FileText, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { DASHBOARD_LAYOUT, DASHBOARD_TYPOGRAPHY } from "@/pages/dashboard-layout";

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
    <section className={cn("layout-card !p-3 overflow-hidden", DASHBOARD_LAYOUT.sectionContentGapClass)}>
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-1 py-2 hover:bg-muted/50 transition-colors duration-200"
      >
        <div className={cn("flex items-start justify-between flex-1 pr-2", DASHBOARD_LAYOUT.sectionHeaderGapClass)}>
          <div className={DASHBOARD_LAYOUT.sectionHeaderGapClass}>
            <h3 className={DASHBOARD_TYPOGRAPHY.sectionTitleClass}>Analytics</h3>
            <p className={DASHBOARD_TYPOGRAPHY.metaClass}>Operational analytics shortcuts</p>
          </div>
          <span className={cn("px-2 py-1 rounded-full bg-primary/10 text-primary", DASHBOARD_TYPOGRAPHY.metaClass)}>
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
        <div className={cn("border-t border-border/50 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 pt-3", DASHBOARD_LAYOUT.gridGapClass)}>
          {sections.map((section) => (
            <button
              key={section.path}
              onClick={() => navigate(section.path)}
              className={cn(
                DASHBOARD_LAYOUT.analyticsTileHeightClass,
                DASHBOARD_LAYOUT.cardPaddingClass,
                "flex flex-col items-start gap-2 rounded-lg hover:bg-primary/5 transition-all duration-200 text-left group border border-border/40 overflow-hidden"
              )}
            >
              <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
                {React.cloneElement(section.icon as React.ReactElement, { className: "w-4 h-4" })}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn(DASHBOARD_TYPOGRAPHY.cardTitleClass, "group-hover:text-primary transition-colors line-clamp-1")}>
                  {section.title}
                </p>
                <p className={cn(DASHBOARD_TYPOGRAPHY.metaClass, "mt-1 line-clamp-1")}>
                  {section.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
