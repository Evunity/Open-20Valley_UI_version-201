import { ArrowUp, ArrowDown, TrendingFlat } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HealthScoreCard as HealthScoreCardType } from "@/utils/healthScores";
import { getStatusColor, getTrendColor } from "@/utils/healthScores";

interface HealthScoreCardProps {
  card: HealthScoreCardType;
  onClick?: () => void;
}

export default function HealthScoreCard({ card, onClick }: HealthScoreCardProps) {
  const scorePercentage = (card.score / 100) * 100;
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scorePercentage / 100) * circumference;

  const getTrendArrow = () => {
    if (card.trend === "improving") {
      return <ArrowUp className="w-4 h-4" />;
    }
    if (card.trend === "degrading") {
      return <ArrowDown className="w-4 h-4" />;
    }
    return <TrendingFlat className="w-4 h-4" />;
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "card-elevated rounded-xl border border-border/50 p-6 space-y-4",
        onClick && "cursor-pointer hover:shadow-lg transition-shadow"
      )}
      title={card.tooltip}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-bold text-foreground">{card.label}</h3>
        <div className={cn("px-2 py-1 rounded-full text-xs font-semibold", getStatusColor(card.status))}>
          {card.status.charAt(0).toUpperCase() + card.status.slice(1)}
        </div>
      </div>

      {/* Score Circle and Trend */}
      <div className="flex items-center justify-between">
        {/* Circular Progress */}
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth="4"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={
                card.status === "healthy"
                  ? "#22c55e"
                  : card.status === "acceptable"
                    ? "#3b82f6"
                    : card.status === "degraded"
                      ? "#f59e0b"
                      : "#ef4444"
              }
              strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 0.5s ease" }}
            />
          </svg>
          {/* Score text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-foreground">{card.score}</span>
          </div>
        </div>

        {/* Trend Information */}
        <div className="flex-1 ml-4 space-y-2">
          <div className="flex items-center gap-2">
            <span className={cn("flex items-center gap-1", getTrendColor(card.trend))}>
              {getTrendArrow()}
              <span className="text-sm font-semibold">
                {Math.abs(card.trendValue).toFixed(1)}%
              </span>
            </span>
            <span className="text-xs text-muted-foreground">
              vs previous period
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{card.description}</p>
        </div>
      </div>

      {/* Info */}
      <div className="text-xs text-muted-foreground pt-2 border-t border-border/50">
        Hover for details
      </div>
    </div>
  );
}
