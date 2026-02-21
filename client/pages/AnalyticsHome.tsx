import { useState, useMemo } from "react";
import { TrendingUp, TrendingDown, AlertCircle, ArrowRight, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import HealthScoreCard from "@/components/HealthScoreCard";
import { generateHealthSummary } from "@/utils/healthScores";
import { cn } from "@/lib/utils";

// Mock insight data
interface Insight {
  id: string;
  text: string;
  severity: "critical" | "high" | "medium" | "low";
  timestamp: string;
  affectedDimension?: string;
  recommendedAction?: string;
}

const MOCK_INSIGHTS: Insight[] = [
  {
    id: "insight-1",
    text: "Call success rate in North region has degraded by 3.2% over the last 24 hours.",
    severity: "high",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    affectedDimension: "North",
    recommendedAction: "Investigate North region performance",
  },
  {
    id: "insight-2",
    text: "Ericsson vendor performance improved by 2.1% - all KPIs trending positively.",
    severity: "low",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    affectedDimension: "Ericsson",
    recommendedAction: "Continue monitoring positive trend",
  },
  {
    id: "insight-3",
    text: "5G network packet loss exceeded critical threshold (0.8%) in Cluster C.",
    severity: "critical",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    affectedDimension: "5G",
    recommendedAction: "Immediate investigation required",
  },
  {
    id: "insight-4",
    text: "Data Experience Score improved across all regions with new optimization deployment.",
    severity: "low",
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    affectedDimension: "Data",
    recommendedAction: "Monitor for stability",
  },
  {
    id: "insight-5",
    text: "Voice quality degradation detected in 3G cells - recommend network optimization.",
    severity: "high",
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    affectedDimension: "3G",
    recommendedAction: "Schedule optimization review",
  },
];

export default function AnalyticsHome() {
  const navigate = useNavigate();
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  // Generate health summary
  const healthSummary = useMemo(() => {
    return generateHealthSummary({
      callSuccessRate: 96.8,
      dropRate: 2.1,
      networkUptime: 99.85,
      vqi: 4.2,
      csfbSuccessRate: 98.5,
      handoverSuccessRate: 97.8,
      avgThroughput: 48.5,
      avgLatency: 45.2,
      packetLoss: 0.5,
      serviceAvailability: 99.5,
      slaCompliance: 99.2,
    });
  }, []);

  // Count improving and degrading
  const improvingCount = 8;
  const degradingCount = 3;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground">Analytics Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Real-time health scores and performance insights across your network
        </p>
      </div>

      {/* Overall Score */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Network Overall Health Score
            </h2>
            <p className="text-muted-foreground">
              Composite score based on all performance indicators
            </p>
          </div>
          <div className="text-6xl font-bold text-primary">
            {healthSummary.overallScore}
            <span className="text-2xl font-normal text-muted-foreground ml-2">/100</span>
          </div>
        </div>
      </div>

      {/* Health Score Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <HealthScoreCard
          card={healthSummary.networkPerformance}
          onClick={() => {
            setSelectedCard("network");
            navigate("/analytics-management");
          }}
        />
        <HealthScoreCard
          card={healthSummary.voiceQuality}
          onClick={() => {
            setSelectedCard("voice");
            navigate("/voice-analytics");
          }}
        />
        <HealthScoreCard
          card={healthSummary.dataExperience}
          onClick={() => {
            setSelectedCard("data");
            navigate("/data-analytics");
          }}
        />
        <HealthScoreCard
          card={healthSummary.availability}
          onClick={() => {
            setSelectedCard("availability");
            navigate("/analytics-management");
          }}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Improving vs Degrading Summary */}
        <div className="space-y-4">
          {/* Improving */}
          <div className="bg-card border border-border/50 rounded-lg overflow-hidden">
            <div className="bg-green-50 border-b border-green-100 px-6 py-4 flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-green-900">Improving Entities</h3>
            </div>
            <div className="p-6">
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-bold text-green-600">{improvingCount}</span>
                <span className="text-sm text-muted-foreground">dimensions improving</span>
              </div>
              <ul className="space-y-2 text-sm text-foreground mb-4">
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-green-600" />
                  5G Voice Quality +2.1%
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-green-600" />
                  East Region Throughput +1.8%
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-green-600" />
                  Nokia Network Uptime +0.3%
                </li>
              </ul>
              <button
                onClick={() => navigate("/analytics-management")}
                className="w-full px-3 py-2 rounded text-sm font-medium bg-green-50 text-green-700 hover:bg-green-100 transition-colors flex items-center justify-center gap-2"
              >
                View Details
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Degrading */}
          <div className="bg-card border border-border/50 rounded-lg overflow-hidden">
            <div className="bg-red-50 border-b border-red-100 px-6 py-4 flex items-center gap-3">
              <TrendingDown className="w-5 h-5 text-red-600" />
              <h3 className="font-semibold text-red-900">Degrading Entities</h3>
            </div>
            <div className="p-6">
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-bold text-red-600">{degradingCount}</span>
                <span className="text-sm text-muted-foreground">dimensions degrading</span>
              </div>
              <ul className="space-y-2 text-sm text-foreground mb-4">
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-red-600" />
                  North Region Call Success -3.2%
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-red-600" />
                  3G Latency +8.5ms
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-red-600" />
                  Cluster C Packet Loss +0.3%
                </li>
              </ul>
              <button
                onClick={() => navigate("/analytics-management")}
                className="w-full px-3 py-2 rounded text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
              >
                Investigate
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Insights Panel */}
        <div className="lg:col-span-2 bg-card border border-border/50 rounded-lg overflow-hidden flex flex-col">
          <div className="bg-amber-50 border-b border-amber-100 px-6 py-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <h3 className="font-semibold text-amber-900">Latest Insights</h3>
          </div>

          <div className="flex-1 overflow-y-auto">
            {MOCK_INSIGHTS.map((insight) => (
              <div
                key={insight.id}
                className="border-b border-border/50 p-4 hover:bg-muted/50 transition-colors cursor-pointer group"
              >
                <div className="flex items-start gap-3 mb-2">
                  <div
                    className={cn(
                      "w-3 h-3 rounded-full mt-1 flex-shrink-0",
                      insight.severity === "critical"
                        ? "bg-red-500"
                        : insight.severity === "high"
                          ? "bg-orange-500"
                          : insight.severity === "medium"
                            ? "bg-yellow-500"
                            : "bg-blue-500"
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground font-medium group-hover:text-primary transition-colors">
                      {insight.text}
                    </p>
                    {insight.affectedDimension && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Affected: <span className="font-semibold">{insight.affectedDimension}</span>
                      </p>
                    )}
                  </div>
                </div>
                <div className="ml-6 flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">
                    {new Date(insight.timestamp).toLocaleTimeString()}
                  </span>
                  {insight.recommendedAction && (
                    <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary font-semibold">
                      {insight.recommendedAction}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-border/50 px-6 py-3 bg-muted/30">
            <button
              onClick={() => navigate("/analytics-management")}
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
            >
              View All Insights
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-muted/50 border border-border/50 rounded-lg p-6">
        <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => navigate("/analytics-management")}
            className="px-4 py-3 rounded-lg border border-border hover:bg-background transition-colors text-left hover:border-primary group"
          >
            <p className="font-medium text-foreground group-hover:text-primary transition-colors">
              Analyze by KPI
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Deep dive into specific KPIs across scopes
            </p>
          </button>
          <button
            onClick={() => navigate("/analytics-management")}
            className="px-4 py-3 rounded-lg border border-border hover:bg-background transition-colors text-left hover:border-primary group"
          >
            <p className="font-medium text-foreground group-hover:text-primary transition-colors">
              Compare Regions
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Side-by-side regional performance comparison
            </p>
          </button>
          <button
            onClick={() => navigate("/analytics-management")}
            className="px-4 py-3 rounded-lg border border-border hover:bg-background transition-colors text-left hover:border-primary group"
          >
            <p className="font-medium text-foreground group-hover:text-primary transition-colors">
              Export Report
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Generate and download performance report
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
