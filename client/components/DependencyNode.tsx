import React from 'react';
import { Handle, Position } from 'reactflow';
import { cn } from '@/lib/utils';

interface DependencyNodeProps {
  data: {
    label: string;
    type: string;
    health: string;
    alerts: number;
    childCount: number;
    isHovered?: boolean;
    isDimmed?: boolean;
    isRelated?: boolean;
  };
  selected?: boolean;
}

export default function DependencyNode({ data, selected }: DependencyNodeProps) {
  const healthStyles: Record<string, { dot: string; badge: string; card: string }> = {
    healthy: {
      dot: 'bg-emerald-500',
      badge: 'text-emerald-700 bg-emerald-500/10 dark:text-emerald-300',
      card: 'border-emerald-500/30',
    },
    degraded: {
      dot: 'bg-amber-500',
      badge: 'text-amber-700 bg-amber-500/10 dark:text-amber-300',
      card: 'border-amber-500/40',
    },
    down: {
      dot: 'bg-red-500',
      badge: 'text-red-700 bg-red-500/10 dark:text-red-300',
      card: 'border-red-500/40',
    },
    unknown: {
      dot: 'bg-slate-500',
      badge: 'text-slate-700 bg-slate-500/10 dark:text-slate-300',
      card: 'border-border',
    },
  };

  const style = healthStyles[data.health] || healthStyles.unknown;

  return (
    <>
      <Handle type="target" position={Position.Left} className="!h-2 !w-2 !bg-primary/40" />
      <div
        className={cn(
          'w-[220px] rounded-lg border bg-card px-3 py-2.5 shadow-sm transition-all duration-150',
          style.card,
          selected && 'ring-2 ring-primary/60 shadow-md',
          data.isHovered && 'shadow-lg scale-[1.02]',
          data.isDimmed && 'opacity-20',
          data.isRelated && 'ring-1 ring-primary/40',
        )}
      >
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className={cn('h-2 w-2 rounded-full', style.dot)} />
            <p className="truncate text-xs font-semibold text-foreground">{data.label}</p>
          </div>
          <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-medium capitalize', style.badge)}>{data.health}</span>
        </div>

        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span className="truncate capitalize">{data.type}</span>
          <span>alerts {data.alerts} • child {data.childCount}</span>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="!h-2 !w-2 !bg-primary/40" />
    </>
  );
}
