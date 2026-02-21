import React, { useState } from 'react';
import { Plus, Zap } from 'lucide-react';
import { TRIGGER_LIBRARY, TriggerCategory } from '../utils/automationData';

const CATEGORIES = [
  {
    id: 'network',
    name: 'Network',
    description: 'Network-level triggers',
    color: 'bg-blue-50 border-blue-200'
  },
  {
    id: 'performance',
    name: 'Performance',
    description: 'Performance threshold triggers',
    color: 'bg-purple-50 border-purple-200'
  },
  {
    id: 'predictive',
    name: 'Predictive',
    description: 'AI-powered forecasting triggers',
    color: 'bg-indigo-50 border-indigo-200'
  },
  {
    id: 'behavioral',
    name: 'Behavioral',
    description: 'Behavioral anomaly triggers',
    color: 'bg-amber-50 border-amber-200'
  },
  {
    id: 'external',
    name: 'External',
    description: 'External system triggers',
    color: 'bg-pink-50 border-pink-200'
  }
];

interface TriggerEngineProps {
  onTriggerSelect?: (triggerId: string) => void;
  selectedTriggers?: Set<string>;
}

export const TriggerEngine: React.FC<TriggerEngineProps> = ({
  onTriggerSelect,
  selectedTriggers = new Set()
}) => {
  const [expandedCategory, setExpandedCategory] = useState<TriggerCategory | null>('network');

  const getTriggersByCategory = (category: TriggerCategory) => {
    return TRIGGER_LIBRARY.filter(t => t.category === category);
  };

  return (
    <div className="flex flex-col h-full gap-4 p-4 bg-gray-50 overflow-y-auto">
      <div className="flex items-center gap-2 mb-2">
        <Zap className="w-5 h-5 text-amber-500" />
        <h2 className="text-lg font-bold text-gray-900">Trigger Engine</h2>
      </div>

      <div className="grid gap-3">
        {CATEGORIES.map(category => {
          const triggers = getTriggersByCategory(category.id as TriggerCategory);
          const isExpanded = expandedCategory === category.id;

          return (
            <div
              key={category.id}
              className={`rounded-lg border-2 ${category.color} overflow-hidden`}
            >
              {/* Category Header */}
              <button
                onClick={() =>
                  setExpandedCategory(isExpanded ? null : (category.id as TriggerCategory))
                }
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/50 transition text-left"
              >
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{category.name}</h3>
                  <p className="text-xs text-gray-600 mt-0.5">{category.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-700 bg-white/70 px-2 py-1 rounded">
                    {triggers.length}
                  </span>
                  <span className={`text-gray-600 transition ${isExpanded ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </div>
              </button>

              {/* Triggers List */}
              {isExpanded && (
                <div className="border-t border-current/10 px-4 py-3 bg-white/40 space-y-2">
                  {triggers.map(trigger => (
                    <button
                      key={trigger.id}
                      onClick={() => onTriggerSelect?.(trigger.id)}
                      className={`w-full px-3 py-2 rounded-lg border-2 transition text-left ${
                        selectedTriggers.has(trigger.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-lg mt-0.5">{trigger.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900">{trigger.name}</p>
                          <p className="text-xs text-gray-600 mt-0.5">{trigger.description}</p>
                        </div>
                        {selectedTriggers.has(trigger.id) && (
                          <span className="text-blue-600 font-bold mt-0.5">✓</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-auto p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-900">
          <strong>💡 Tip:</strong> Select multiple triggers to create complex automation rules. 
          Predictive triggers use AI to forecast failures before they occur.
        </p>
      </div>
    </div>
  );
};
