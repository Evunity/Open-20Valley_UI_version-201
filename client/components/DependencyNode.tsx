import React from 'react';
import { Handle, Position } from 'reactflow';
import { cn } from '@/lib/utils';
import { TopologyObject } from '../utils/topologyData';

interface DependencyNodeProps {
  data: {
    label: string;
    type: string;
    health: string;
    topology?: TopologyObject;
    isSelected?: boolean;
  };
  isConnecting?: boolean;
  selected?: boolean;
}

export default function DependencyNode({
  data,
  isConnecting,
  selected,
}: DependencyNodeProps) {
  // Health state color mapping
  const healthColors: Record<string, { bg: string; border: string; text: string }> = {
    healthy: {
      bg: 'bg-emerald-50 dark:bg-emerald-950',
      border: 'border-emerald-300 dark:border-emerald-700',
      text: 'text-emerald-700 dark:text-emerald-300',
    },
    degraded: {
      bg: 'bg-amber-50 dark:bg-amber-950',
      border: 'border-amber-300 dark:border-amber-700',
      text: 'text-amber-700 dark:text-amber-300',
    },
    down: {
      bg: 'bg-red-50 dark:bg-red-950',
      border: 'border-red-300 dark:border-red-700',
      text: 'text-red-700 dark:text-red-300',
    },
    unknown: {
      bg: 'bg-gray-50 dark:bg-gray-900',
      border: 'border-gray-300 dark:border-gray-700',
      text: 'text-gray-700 dark:text-gray-300',
    },
  };

  const healthState = data.health || 'unknown';
  const colors = healthColors[healthState] || healthColors.unknown;

  // Status dot color
  const statusDotColor =
    healthState === 'healthy'
      ? 'bg-emerald-500'
      : healthState === 'degraded'
      ? 'bg-amber-500'
      : healthState === 'down'
      ? 'bg-red-500'
      : 'bg-gray-500';

  return (
    <>
      <Handle type="target" position={Position.Top} />
      
      <div
        className={cn(
          'px-3 py-2 rounded-lg border-2 shadow-md transition-all duration-200',
          'hover:shadow-lg hover:scale-105 cursor-pointer',
          colors.bg,
          colors.border,
          selected && 'ring-2 ring-blue-500 shadow-lg scale-105',
          isConnecting && 'opacity-50'
        )}
      >
        {/* Header with Status */}
        <div className="flex items-center gap-2 mb-1">
          {/* Status Indicator */}
          <div className={cn('w-2 h-2 rounded-full', statusDotColor)} />
          
          {/* Node Label */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-foreground truncate">
              {data.label}
            </p>
          </div>
        </div>

        {/* Node Type Badge */}
        <div className="flex items-center gap-1">
          <span className={cn(
            'text-[10px] font-semibold px-1.5 py-0.5 rounded',
            'bg-white/50 dark:bg-gray-800/50',
            colors.text
          )}>
            {data.type}
          </span>
        </div>

        {/* Health Status Text */}
        <p className={cn(
          'text-[10px] mt-1',
          colors.text,
          'font-medium capitalize'
        )}>
          {healthState}
        </p>
      </div>

      <Handle type="source" position={Position.Bottom} />
    </>
  );
}
