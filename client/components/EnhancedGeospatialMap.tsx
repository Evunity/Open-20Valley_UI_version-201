import React, { useState, useMemo } from 'react';
import { ZoomIn, ZoomOut, MapPin, Navigation, Radio, AlertCircle, CheckCircle2, Zap } from 'lucide-react';
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
  const [mapCenter] = useState({ lat: 25, lng: 40 });
  const [hoveredObject, setHoveredObject] = useState<string | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);

  const geoObjects = useMemo(() => {
    return topology.filter(obj => obj.geoCoordinates && obj.type !== 'country');
  }, [topology]);

  const transformCoordinates = (lat: number, lng: number) => {
    const canvas = { width: 1400, height: 700, padding: 60 };
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

  const getHealthGlow = (state: string): string => {
    const colors = {
      healthy: '#dcfce7',
      degraded: '#fef3c7',
      down: '#fee2e2',
      unknown: '#f3f4f6'
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

  const healthyCount = geoObjects.filter(o => o.healthState === 'healthy').length;
  const degradedCount = geoObjects.filter(o => o.healthState === 'degraded').length;
  const downCount = geoObjects.filter(o => o.healthState === 'down').length;

  const zoomIn = () => setZoomLevel(Math.min(zoomLevel + 0.2, 3));
  const zoomOut = () => setZoomLevel(Math.max(zoomLevel - 0.2, 0.5));

  const SVG_WIDTH = 1400;
  const SVG_HEIGHT = 700;

  return (
    <div className="w-full flex flex-col gap-4 bg-card rounded-lg border border-border p-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg text-foreground">Geospatial Network Map - MENA Region</h3>
          <p className="text-xs text-muted-foreground mt-1">Real-time geographic visualization with health status</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-lg border border-border">
            <span className="text-xs text-muted-foreground font-semibold">Zoom:</span>
            <span className="text-sm font-bold text-foreground">{(zoomLevel * 100).toFixed(0)}%</span>
          </div>
          <button
            onClick={zoomOut}
            className="p-2 bg-muted text-muted-foreground rounded-lg hover:bg-primary/20 hover:text-primary transition"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={zoomIn}
            className="p-2 bg-muted text-muted-foreground rounded-lg hover:bg-primary/20 hover:text-primary transition"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-border" />
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              showHeatmap
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
            title="Toggle heatmap view"
          >
            🔥 Heatmap
          </button>
        </div>
      </div>

      {/* Map Canvas - Professional Geographic Visualization */}
      <div className="overflow-auto bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-900 dark:to-slate-800 rounded-lg border border-border shadow-lg">
        <svg
          width={SVG_WIDTH * zoomLevel}
          height={SVG_HEIGHT * zoomLevel}
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="block"
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="seaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#e0f2fe', stopOpacity: 0.8 }} />
              <stop offset="100%" style={{ stopColor: '#bae6fd', stopOpacity: 0.6 }} />
            </linearGradient>

            <linearGradient id="landGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#f5f5f4', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#e7e5e4', stopOpacity: 1 }} />
            </linearGradient>

            <radialGradient id="healthyGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" style={{ stopColor: '#10b981', stopOpacity: 0.4 }} />
              <stop offset="100%" style={{ stopColor: '#10b981', stopOpacity: 0 }} />
            </radialGradient>

            <radialGradient id="degradedGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" style={{ stopColor: '#f59e0b', stopOpacity: 0.4 }} />
              <stop offset="100%" style={{ stopColor: '#f59e0b', stopOpacity: 0 }} />
            </radialGradient>

            <radialGradient id="downGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" style={{ stopColor: '#ef4444', stopOpacity: 0.4 }} />
              <stop offset="100%" style={{ stopColor: '#ef4444', stopOpacity: 0 }} />
            </radialGradient>

            {/* Filters */}
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.3" />
            </filter>

            <filter id="glow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background */}
          <rect width={SVG_WIDTH} height={SVG_HEIGHT} fill="url(#seaGradient)" />

          {/* Country Regions with proper geographic representation */}
          <g>
            {/* Egypt - Nile Valley */}
            <g filter="url(#shadow)">
              <path
                d="M 200 120 L 260 100 L 270 180 L 280 320 L 200 330 Z"
                fill="url(#landGradient)"
                stroke="#cbd5e1"
                strokeWidth="2"
                opacity="0.85"
              />
              <text x="220" y="210" fontSize="18" fontWeight="bold" fill="#1f2937" opacity="0.7">Egypt</text>
            </g>

            {/* Saudi Arabia - Large territory */}
            <g filter="url(#shadow)">
              <path
                d="M 260 100 L 400 90 L 450 200 L 480 280 L 280 330 L 270 180 Z"
                fill="url(#landGradient)"
                stroke="#cbd5e1"
                strokeWidth="2"
                opacity="0.85"
              />
              <text x="310" y="190" fontSize="18" fontWeight="bold" fill="#1f2937" opacity="0.7">Saudi Arabia</text>
            </g>

            {/* UAE - Gulf coast */}
            <g filter="url(#shadow)">
              <path
                d="M 450 200 L 520 180 L 540 260 L 480 280 Z"
                fill="url(#landGradient)"
                stroke="#cbd5e1"
                strokeWidth="2"
                opacity="0.85"
              />
              <text x="470" y="235" fontSize="14" fontWeight="bold" fill="#1f2937" opacity="0.7">UAE</text>
            </g>
          </g>

          {/* Grid lines for reference */}
          <g stroke="#e2e8f0" strokeWidth="1" opacity="0.3" strokeDasharray="5,5">
            {[25, 30, 35, 40, 45, 50, 55].map(lng => (
              <line
                key={`lng-${lng}`}
                x1={transformCoordinates(20, lng).x}
                y1={transformCoordinates(20, lng).y}
                x2={transformCoordinates(33, lng).x}
                y2={transformCoordinates(33, lng).y}
              />
            ))}
            {[20, 22, 24, 26, 28, 30, 32].map(lat => (
              <line
                key={`lat-${lat}`}
                x1={transformCoordinates(lat, 24).x}
                y1={transformCoordinates(lat, 24).y}
                x2={transformCoordinates(lat, 57).x}
                y2={transformCoordinates(lat, 57).y}
              />
            ))}
          </g>

          {/* Network objects with enhanced visualization */}
          {geoObjects.map(obj => {
            if (!obj.geoCoordinates) return null;
            
            const pos = transformCoordinates(obj.geoCoordinates.latitude, obj.geoCoordinates.longitude);
            const isSelected = selectedObject?.id === obj.id;
            const isHovered = hoveredObject === obj.id;
            const alarmCount = getAlarmCount(obj);
            const healthColor = getHealthColor(obj.healthState);
            const glowId = `${obj.healthState}Glow`;
            const radius = isSelected ? 14 : isHovered ? 12 : 8;

            return (
              <g
                key={obj.id}
                onClick={() => onObjectSelect?.(obj)}
                onMouseEnter={() => setHoveredObject(obj.id)}
                onMouseLeave={() => setHoveredObject(null)}
                style={{ cursor: 'pointer' }}
                filter={isSelected || isHovered ? 'url(#glow)' : undefined}
              >
                {/* Glow effect background */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={radius + 8}
                  fill={`url(#${glowId})`}
                  opacity={isSelected || isHovered ? 1 : 0.6}
                />

                {/* Main marker */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={radius}
                  fill={healthColor}
                  stroke="white"
                  strokeWidth={isSelected ? 3 : isHovered ? 2 : 1}
                  filter={isSelected ? 'url(#shadow)' : undefined}
                  opacity={0.95}
                />

                {/* Vendor ring */}
                {layers.vendorOverlay && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={radius + 4}
                    fill="none"
                    stroke={getVendorColor(obj.vendor)}
                    strokeWidth="2"
                    opacity={isSelected || isHovered ? 0.9 : 0.4}
                  />
                )}

                {/* Alarm badge */}
                {layers.alarms && alarmCount > 0 && (
                  <g>
                    <circle
                      cx={pos.x + radius + 6}
                      cy={pos.y - radius - 4}
                      r="5"
                      fill="#ef4444"
                      stroke="white"
                      strokeWidth="2"
                    />
                    <text
                      x={pos.x + radius + 6}
                      y={pos.y - radius - 1}
                      fontSize="8"
                      fontWeight="bold"
                      fill="white"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {alarmCount > 9 ? '9+' : alarmCount}
                    </text>
                  </g>
                )}

                {/* Tooltip */}
                <title>{`${obj.name} • ${obj.healthState.toUpperCase()}\n${obj.type} • ${obj.vendor || 'Unknown'}\nAlarms: ${alarmCount}`}</title>
              </g>
            );
          })}

          {/* Scale and compass */}
          <g opacity="0.6">
            {/* Scale bar */}
            <line x1="80" y1="630" x2="180" y2="630" stroke="#1f2937" strokeWidth="2" />
            <line x1="80" y1="620" x2="80" y2="640" stroke="#1f2937" strokeWidth="2" />
            <line x1="180" y1="620" x2="180" y2="640" stroke="#1f2937" strokeWidth="2" />
            <text x="130" y="660" fontSize="11" fill="#1f2937" textAnchor="middle">~500 km</text>

            {/* Compass */}
            <circle cx="1300" cy="80" r="25" fill="white" stroke="#1f2937" strokeWidth="1" opacity="0.9" />
            <text x="1300" y="65" fontSize="12" fontWeight="bold" fill="#1f2937" textAnchor="middle">N</text>
            <line x1="1300" y1="55" x2="1300" y2="45" stroke="#1f2937" strokeWidth="2" />
          </g>

          {/* Legend */}
          <g>
            <rect x="60" y="60" width="180" height="120" fill="white" stroke="#cbd5e1" strokeWidth="1" opacity="0.95" rx="6" />
            
            {/* Health status */}
            <circle cx="80" cy="82" r="4" fill="#10b981" />
            <text x="95" y="86" fontSize="11" fill="#1f2937" fontWeight="500">Healthy</text>

            <circle cx="80" cy="104" r="4" fill="#f59e0b" />
            <text x="95" y="108" fontSize="11" fill="#1f2937" fontWeight="500">Degraded</text>

            <circle cx="80" cy="126" r="4" fill="#ef4444" />
            <text x="95" y="130" fontSize="11" fill="#1f2937" fontWeight="500">Down</text>

            {/* Vendors */}
            <rect x="80" y="145" width="4" height="4" fill="#3b82f6" />
            <text x="95" y="148" fontSize="10" fill="#666">Nokia</text>

            <rect x="140" y="145" width="4" height="4" fill="#ef4444" />
            <text x="155" y="148" fontSize="10" fill="#666">Huawei</text>
          </g>
        </svg>
      </div>

      {/* Metrics and Information Panels */}
      <div className="grid grid-cols-4 gap-3">
        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-2">
            <Radio className="w-4 h-4 text-blue-600" />
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">Total Sites</p>
          </div>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{geoObjects.length}</p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Monitored locations</p>
        </div>

        <div className="p-4 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <p className="text-xs font-semibold text-green-700 dark:text-green-300">Healthy</p>
          </div>
          <p className="text-2xl font-bold text-green-900 dark:text-green-100">{healthyCount}</p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">({healthyCount > 0 ? ((healthyCount / geoObjects.length) * 100).toFixed(0) : 0}% operational)</p>
        </div>

        <div className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100/50 dark:from-yellow-950/30 dark:to-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-yellow-600" />
            <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-300">Degraded</p>
          </div>
          <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{degradedCount}</p>
          <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">Require attention</p>
        </div>

        <div className="p-4 bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/30 dark:to-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-red-600" />
            <p className="text-xs font-semibold text-red-700 dark:text-red-300">Down</p>
          </div>
          <p className="text-2xl font-bold text-red-900 dark:text-red-100">{downCount}</p>
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">Offline/Critical</p>
        </div>
      </div>

      {/* Selected Object Details Panel */}
      {selectedObject && (
        <div className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg backdrop-blur-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-lg">{selectedObject.name}</h4>
                  <p className="text-sm text-muted-foreground">{selectedObject.type} • {selectedObject.vendor || 'Unknown'}</p>
                </div>
              </div>

              {selectedObject.geoCoordinates && (
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold mb-1">Latitude</p>
                    <p className="font-mono text-foreground">{selectedObject.geoCoordinates.latitude.toFixed(4)}°N</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold mb-1">Longitude</p>
                    <p className="font-mono text-foreground">{selectedObject.geoCoordinates.longitude.toFixed(4)}°E</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold mb-1">Elevation</p>
                    <p className="font-mono text-foreground">{selectedObject.geoCoordinates.elevation ?? 'N/A'}m</p>
                  </div>
                </div>
              )}
            </div>

            <div className="text-right">
              <span className={`inline-block text-sm font-bold px-4 py-2 rounded-lg mb-2 ${
                selectedObject.healthState === 'healthy'
                  ? 'bg-green-100 dark:bg-green-950/50 text-green-800 dark:text-green-200'
                  : selectedObject.healthState === 'degraded'
                  ? 'bg-yellow-100 dark:bg-yellow-950/50 text-yellow-800 dark:text-yellow-200'
                  : 'bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-200'
              }`}>
                {selectedObject.healthState.toUpperCase()}
              </span>
              <p className="text-xs text-muted-foreground">{getAlarmCount(selectedObject)} Active Alarms</p>
            </div>
          </div>
        </div>
      )}

      {/* Info footer */}
      <div className="flex items-center justify-center gap-2 p-3 bg-muted/40 rounded-lg border border-border/50 text-xs text-muted-foreground">
        <Navigation className="w-4 h-4" />
        <span>Click on map markers to view details • Use zoom controls to adjust view • Hover to preview information</span>
      </div>
    </div>
  );
};
