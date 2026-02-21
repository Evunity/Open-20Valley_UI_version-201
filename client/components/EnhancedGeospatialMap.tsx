import React, { useState, useMemo } from 'react';
import { ZoomIn, ZoomOut, MapPin, Navigation } from 'lucide-react';
import { TopologyObject } from '../utils/topologyData';
import { LayerSettings } from './LayerControlPanel';

interface EnhancedGeospatialMapProps {
  topology: TopologyObject[];
  layers: LayerSettings;
  selectedObject?: TopologyObject | null;
  onObjectSelect?: (object: TopologyObject) => void;
  showPredictiveRisks?: boolean;
}

interface MapRegion {
  name: string;
  center: { lat: number; lng: number };
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  color: string;
}

const REGION_BOUNDS: Record<string, MapRegion> = {
  'Egypt': {
    name: 'Egypt',
    center: { lat: 26.8206, lng: 30.8025 },
    bounds: { north: 31.5, south: 22, east: 35, west: 25 }
  },
  'Saudi Arabia': {
    name: 'Saudi Arabia',
    center: { lat: 23.8859, lng: 45.0792 },
    bounds: { north: 32.1, south: 16, east: 55, west: 34 }
  },
  'UAE': {
    name: 'UAE',
    center: { lat: 23.4241, lng: 53.8478 },
    bounds: { north: 26.1, south: 22.5, east: 56.4, west: 51 }
  }
};

export const EnhancedGeospatialMap: React.FC<EnhancedGeospatialMapProps> = ({
  topology,
  layers,
  selectedObject,
  onObjectSelect,
  showPredictiveRisks = false
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [mapCenter, setMapCenter] = useState({ lat: 25, lng: 40 });
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  // Extract geo-referenced objects
  const geoObjects = useMemo(() => {
    return topology.filter(obj => obj.geoCoordinates && obj.type !== 'country');
  }, [topology]);

  // Transform coordinates to map canvas
  const transformCoordinates = (lat: number, lng: number) => {
    const canvas = { width: 1200, height: 600, padding: 40 };
    const bounds = { north: 33, south: 20, east: 57, west: 24 };
    
    const mapWidth = canvas.width - canvas.padding * 2;
    const mapHeight = canvas.height - canvas.padding * 2;
    
    const x = canvas.padding + ((lng - bounds.west) / (bounds.east - bounds.west)) * mapWidth;
    const y = canvas.padding + ((bounds.north - lat) / (bounds.north - bounds.south)) * mapHeight;
    
    return { x, y };
  };

  const getHealthColor = (state: string): string => {
    const colors = {
      healthy: '#10b981',
      degraded: '#f59e0b',
      down: '#ef4444',
      unknown: '#9ca3af'
    };
    return colors[state as keyof typeof colors] || colors.unknown;
  };

  const getVendorColor = (vendor?: string): string => {
    const colors = {
      'Nokia': '#3b82f6',
      'Ericsson': '#1f2937',
      'Huawei': '#ef4444',
      'ZTE': '#f97316',
      'Unknown': '#9ca3af'
    };
    return colors[vendor || 'Unknown'];
  };

  const getAlarmCount = (obj: TopologyObject): number => {
    return obj.alarmSummary.critical + obj.alarmSummary.major;
  };

  const zoomIn = () => setZoomLevel(Math.min(zoomLevel + 0.2, 3));
  const zoomOut = () => setZoomLevel(Math.max(zoomLevel - 0.2, 0.5));

  const SVG_WIDTH = 1200;
  const SVG_HEIGHT = 600;

  return (
    <div className="w-full flex flex-col gap-4 bg-white rounded-lg border border-gray-200 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Geospatial Network Map - MENA Region</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600">Zoom: {(zoomLevel * 100).toFixed(0)}%</span>
          <button
            onClick={zoomOut}
            className="p-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={zoomIn}
            className="p-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Map Canvas */}
      <div className="overflow-x-auto bg-gray-50 rounded-lg border border-gray-200">
        <svg
          width={SVG_WIDTH * zoomLevel}
          height={SVG_HEIGHT * zoomLevel}
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="bg-gradient-to-br from-blue-50 to-blue-100"
        >
          {/* Country boundaries */}
          <defs>
            <pattern id="water" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="2" fill="#0ea5e9" opacity="0.1" />
            </pattern>
            <filter id="shadow">
              <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Background pattern */}
          <rect width={SVG_WIDTH} height={SVG_HEIGHT} fill="url(#water)" />

          {/* Country regions - Simplified representation */}
          <g opacity="0.3">
            {/* Egypt approximation */}
            <rect x="180" y="80" width="120" height="240" fill="#fecaca" stroke="#dc2626" strokeWidth="2" />
            {/* Saudi Arabia approximation */}
            <rect x="280" y="100" width="200" height="220" fill="#fca5a5" stroke="#dc2626" strokeWidth="2" />
            {/* UAE approximation */}
            <rect x="480" y="200" width="100" height="120" fill="#fed7aa" stroke="#f97316" strokeWidth="2" />
          </g>

          {/* Country labels */}
          <text x="240" y="200" fontSize="14" fontWeight="bold" fill="#1f2937" opacity="0.6">
            Egypt
          </text>
          <text x="330" y="210" fontSize="14" fontWeight="bold" fill="#1f2937" opacity="0.6">
            Saudi Arabia
          </text>
          <text x="510" y="260" fontSize="14" fontWeight="bold" fill="#1f2937" opacity="0.6">
            UAE
          </text>

          {/* Network objects as dots */}
          {geoObjects.map(obj => {
            if (!obj.geoCoordinates) return null;
            
            const pos = transformCoordinates(obj.geoCoordinates.latitude, obj.geoCoordinates.longitude);
            const isSelected = selectedObject?.id === obj.id;
            const alarmCount = getAlarmCount(obj);
            const healthColor = getHealthColor(obj.healthState);
            
            return (
              <g
                key={obj.id}
                onClick={() => onObjectSelect?.(obj)}
                style={{ cursor: 'pointer' }}
                filter={isSelected ? 'url(#shadow)' : undefined}
              >
                {/* Main circle */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isSelected ? 10 : 6}
                  fill={healthColor}
                  stroke={isSelected ? '#1f2937' : 'white'}
                  strokeWidth={isSelected ? 2 : 1}
                  opacity={layers.vendorOverlay ? 0.8 : 0.9}
                />

                {/* Vendor ring */}
                {layers.vendorOverlay && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isSelected ? 12 : 8}
                    fill="none"
                    stroke={getVendorColor(obj.vendor)}
                    strokeWidth="2"
                    opacity="0.6"
                  />
                )}

                {/* Alarm indicator */}
                {layers.alarms && alarmCount > 0 && (
                  <circle
                    cx={pos.x + 8}
                    cy={pos.y - 8}
                    r="4"
                    fill="#ef4444"
                    stroke="white"
                    strokeWidth="1"
                  />
                )}

                {/* Tooltip on hover */}
                <title>{`${obj.name} (${obj.type}) - ${obj.healthState} - ${alarmCount} alarms`}</title>
              </g>
            );
          })}

          {/* Scale indicator */}
          <g opacity="0.5">
            <line x1="50" y1="550" x2="150" y2="550" stroke="#666" strokeWidth="2" />
            <line x1="50" y1="540" x2="50" y2="560" stroke="#666" strokeWidth="2" />
            <line x1="150" y1="540" x2="150" y2="560" stroke="#666" strokeWidth="2" />
            <text x="90" y="575" fontSize="12" fill="#666">~400 km</text>
          </g>

          {/* Legend */}
          <g>
            {/* Health legend */}
            <rect x="30" y="30" width="15" height="15" fill="#10b981" />
            <text x="50" y="42" fontSize="11" fill="#1f2937">Healthy</text>

            <rect x="130" y="30" width="15" height="15" fill="#f59e0b" />
            <text x="150" y="42" fontSize="11" fill="#1f2937">Degraded</text>

            <rect x="230" y="30" width="15" height="15" fill="#ef4444" />
            <text x="250" y="42" fontSize="11" fill="#1f2937">Down</text>
          </g>
        </svg>
      </div>

      {/* Info Panel */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-600 font-semibold">Network Objects</p>
          <p className="text-lg font-bold text-blue-900">{geoObjects.length}</p>
          <p className="text-xs text-blue-700">sites with geo-coordinates</p>
        </div>

        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
          <p className="text-xs text-green-600 font-semibold">Healthy</p>
          <p className="text-lg font-bold text-green-900">
            {geoObjects.filter(o => o.healthState === 'healthy').length}
          </p>
          <p className="text-xs text-green-700">({((geoObjects.filter(o => o.healthState === 'healthy').length / geoObjects.length) * 100).toFixed(0)}%)</p>
        </div>

        <div className="p-3 bg-red-50 rounded-lg border border-red-200">
          <p className="text-xs text-red-600 font-semibold">Issues</p>
          <p className="text-lg font-bold text-red-900">
            {geoObjects.filter(o => o.healthState !== 'healthy').length}
          </p>
          <p className="text-xs text-red-700">need attention</p>
        </div>
      </div>

      {/* Selected Object Details */}
      {selectedObject && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-blue-600" />
                <p className="font-semibold text-gray-900">{selectedObject.name}</p>
              </div>
              <div className="space-y-1 text-xs text-gray-700">
                {selectedObject.geoCoordinates && (
                  <p className="font-mono">
                    Coordinates: {selectedObject.geoCoordinates.latitude.toFixed(4)}, {selectedObject.geoCoordinates.longitude.toFixed(4)}
                  </p>
                )}
                <p>Type: <strong>{selectedObject.type}</strong></p>
                {selectedObject.vendor && <p>Vendor: <strong>{selectedObject.vendor}</strong></p>}
              </div>
            </div>
            <div className="text-right">
              <p className={`text-sm font-bold px-2 py-1 rounded ${
                selectedObject.healthState === 'healthy'
                  ? 'bg-green-200 text-green-800'
                  : selectedObject.healthState === 'degraded'
                  ? 'bg-yellow-200 text-yellow-800'
                  : 'bg-red-200 text-red-800'
              }`}>
                {selectedObject.healthState}
              </p>
              <p className="text-xs text-gray-600 mt-1">{getAlarmCount(selectedObject)} alarms</p>
            </div>
          </div>
        </div>
      )}

      {/* Map Controls Info */}
      <div className="text-xs text-gray-600 flex items-center gap-2 justify-center p-2 bg-gray-50 rounded">
        <Navigation className="w-4 h-4" />
        <span>Click on sites to view details • Use zoom controls to adjust view</span>
      </div>
    </div>
  );
};
