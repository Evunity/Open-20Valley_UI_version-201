import { Link } from "react-router-dom";
import { ArrowLeft, Clock } from "lucide-react";

interface ComingSoonProps {
  title: string;
  description?: string;
}

export default function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="space-y-8 pb-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm">
        <Link to="/" className="text-primary hover:text-primary/80 transition-colors font-medium">
          Dashboard
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-muted-foreground">{title}</span>
      </div>

      {/* Coming Soon Content */}
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <Clock className="w-10 h-10 text-primary" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">{title}</h1>
          {description && (
            <p className="text-lg text-muted-foreground max-w-lg mx-auto">
              {description}
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            This feature is coming soon. We're working hard to bring you this capability.
          </p>
        </div>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>

      {/* Feature Status */}
      <div className="card-elevated rounded-xl border border-border/50 p-6 max-w-2xl mx-auto">
        <h3 className="text-sm font-semibold text-foreground mb-4">Feature Status</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <span className="text-sm text-muted-foreground">In Development</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-sm text-muted-foreground">Coming in Q1 2025</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-sm text-muted-foreground">Stay tuned for updates</span>
          </div>
        </div>
      </div>
    </div>
  );
}
