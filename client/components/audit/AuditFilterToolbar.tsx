import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AuditFilterToolbarProps {
  row1: ReactNode[];
  row2?: ReactNode[];
  className?: string;
  row1ClassName?: string;
  row2ClassName?: string;
}

export default function AuditFilterToolbar({
  row1,
  row2 = [],
  className,
  row1ClassName,
  row2ClassName,
}: AuditFilterToolbarProps) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-4 space-y-3 w-full max-w-none", className)}>
      <div
        className={cn(
          "grid grid-cols-1 gap-2 w-full lg:grid-cols-[minmax(320px,2fr)_repeat(4,minmax(170px,1fr))]",
          row1ClassName
        )}
      >
        {row1.map((item, index) => (
          <div key={`row1-${index}`} className="min-w-0">
            {item}
          </div>
        ))}
      </div>

      {row2.length > 0 && (
        <div
          className={cn(
            "grid grid-cols-1 gap-2 w-full md:grid-cols-[minmax(180px,1fr)_minmax(180px,1fr)_auto]",
            row2ClassName
          )}
        >
          {row2.map((item, index) => (
            <div key={`row2-${index}`} className="min-w-0">
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
