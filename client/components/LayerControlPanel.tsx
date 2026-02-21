import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export interface LayerSettings {
  alarms: boolean;
  kpi: boolean;
  traffic: boolean;
  automation: boolean;
  aiPredictions: boolean;
  vendorOverlay: boolean;
  transportOnly: boolean;
  ranOnly: boolean;
}

interface LayerControlPanelProps {
  layers: LayerSettings;
  onLayerChange: (layers: LayerSettings) => void;
}

const LAYER_DESCRIPTIONS: Record<keyof LayerSettings, string> = {
  alarms: 'Show active alarms and incidents',
  kpi: 'Display KPI metrics and health status',
  traffic: 'Visualize traffic flow and utilization',
  automation: 'Show automation boundaries and rules',
  aiPredictions: 'Display AI-predicted risks and anomalies',
  vendorOverlay: 'Color-code by equipment vendor',
  transportOnly: 'Filter to transport layer only',
  ranOnly: 'Filter to RAN (Radio Access Network) only'
};

const LAYER_GROUPS = {
  visibility: ['alarms', 'kpi', 'traffic', 'automation', 'aiPredictions', 'vendorOverlay'],
  filters: ['transportOnly', 'ranOnly']
};

export const LayerControlPanel: React.FC<LayerControlPanelProps> = ({ layers, onLayerChange }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleLayer = (layer: keyof LayerSettings) => {
    onLayerChange({
      ...layers,
      [layer]: !layers[layer]
    });
  };

  const enableAllVisibility = () => {
    onLayerChange({
      ...layers,
      alarms: true,
      kpi: true,
      traffic: true,
      automation: true,
      aiPredictions: true,
      vendorOverlay: true
    });
  };

  const disableAllVisibility = () => {
    onLayerChange({
      ...layers,
      alarms: false,
      kpi: false,
      traffic: false,
      automation: false,
      aiPredictions: false,
      vendorOverlay: false
    });
  };

  const getLayerLabel = (key: string): string => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900 text-sm">Layer Control</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 hover:bg-gray-100 rounded transition"
          aria-label="Toggle layer control"
        >
          {isExpanded ? '−' : '+'}
        </button>
      </div>

      {isExpanded && (
        <div className="flex-1 overflow-y-auto">
          {/* Visibility Layers */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Visibility Layers</p>
              <div className="flex gap-1">
                <button
                  onClick={enableAllVisibility}
                  className="px-2 py-0.5 text-xs text-blue-600 hover:bg-blue-50 rounded transition"
                  title="Enable all visibility layers"
                >
                  All
                </button>
                <button
                  onClick={disableAllVisibility}
                  className="px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-100 rounded transition"
                  title="Disable all visibility layers"
                >
                  None
                </button>
              </div>
            </div>
            <div className="space-y-2">
              {(LAYER_GROUPS.visibility as (keyof LayerSettings)[]).map(layer => (
                <button
                  key={layer}
                  onClick={() => toggleLayer(layer)}
                  className="w-full text-left flex items-center gap-3 p-2 rounded hover:bg-gray-50 transition group"
                  title={LAYER_DESCRIPTIONS[layer]}
                >
                  {layers[layer] ? (
                    <Eye className="w-4 h-4 text-blue-600" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{getLayerLabel(layer)}</p>
                    <p className="text-xs text-gray-500">{LAYER_DESCRIPTIONS[layer]}</p>
                  </div>
                  <div className={`w-5 h-5 rounded border-2 transition ${
                    layers[layer]
                      ? 'bg-blue-600 border-blue-600'
                      : 'border-gray-300 group-hover:border-gray-400'
                  }`} />
                </button>
              ))}
            </div>
          </div>

          {/* Filter Layers */}
          <div className="p-4">
            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">Filters</p>
            <div className="space-y-2">
              {(LAYER_GROUPS.filters as (keyof LayerSettings)[]).map(layer => (
                <button
                  key={layer}
                  onClick={() => toggleLayer(layer)}
                  className="w-full text-left flex items-center gap-3 p-2 rounded hover:bg-gray-50 transition group"
                  title={LAYER_DESCRIPTIONS[layer]}
                >
                  {layers[layer] ? (
                    <Eye className="w-4 h-4 text-blue-600" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{getLayerLabel(layer)}</p>
                    <p className="text-xs text-gray-500">{LAYER_DESCRIPTIONS[layer]}</p>
                  </div>
                  <div className={`w-5 h-5 rounded border-2 transition ${
                    layers[layer]
                      ? 'bg-blue-600 border-blue-600'
                      : 'border-gray-300 group-hover:border-gray-400'
                  }`} />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="px-4 pb-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
            <p>
              {Object.values(layers).filter(Boolean).length} of {Object.values(layers).length} layers active
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
