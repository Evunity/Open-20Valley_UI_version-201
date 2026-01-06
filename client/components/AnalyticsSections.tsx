import { useState } from "react";
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
      path: "/detail/voice",
      description: "Call quality and performance metrics",
    },
    {
      title: "Data Services",
      icon: <BarChart3 className="w-5 h-5" />,
      path: "/detail/data",
      description: "Session analytics and bandwidth metrics",
    },
    {
      title: "Network Alarms",
      icon: <AlertTriangle className="w-5 h-5" />,
      path: "/detail/alarms",
      description: "Active incidents and resolution tracking",
    },
    {
      title: "Network Status",
      icon: <Globe className="w-5 h-5" />,
      path: "/network",
      description: "Network topology and cluster health",
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
      path: "#ai-actions",
      description: "View AI automation activities",
      isExternal: true,
    },
  ];

  return (
    <div className="card-elevated rounded-xl border border-border/50 shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 md:p-5 hover:bg-muted/50 transition-colors duration-200"
      >
        <div className="flex items-center gap-3">
          <h3 className="text-lg md:text-xl font-bold text-foreground">Analytics Sections</h3>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
            {sections.length}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "w-5 h-5 text-muted-foreground transition-transform duration-300",
            isOpen ? "rotate-180" : ""
          )}
        />
      </button>

      {/* Content */}
      {isOpen && (
        <div className="border-t border-border/50 grid grid-cols-1 md:grid-cols-2 gap-0">
          {sections.map((section, index) => (
            <button
              key={section.path}
              onClick={() => navigate(section.path)}
              className={cn(
                "flex items-start gap-3 p-4 hover:bg-primary/5 transition-all duration-200 text-left group border-b border-border/30",
                index % 2 === 1 && "md:border-l md:border-b md:border-border/30"
              )}
            >
              <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                {section.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm md:text-base group-hover:text-primary transition-colors">
                  {section.title}
                </p>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">
                  {section.description}
                </p>
              </div>
              <div className="flex-shrink-0 text-muted-foreground group-hover:text-primary transition-colors">
                →
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
