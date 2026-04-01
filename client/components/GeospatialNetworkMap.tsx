import React, { useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { ZoomIn, ZoomOut, Radio, CheckCircle2, AlertCircle, Zap } from 'lucide-react';
import { TopologyObject } from '../utils/topologyData';
import { LayerSettings } from './LayerControlPanel';
import 'leaflet/dist/leaflet.css';

interface GeospatialNetworkMapProps {
  topology: TopologyObject[];
  layers: LayerSettings;
  selectedObject?: TopologyObject | null;
  onObjectSelect?: (object: TopologyObject) => void;
  showPredictiveRisks?: boolean;
}

// Custom marker icons for different health states
const createHealthIcon = (healthState: string, vendor?: string) => {
  const healthColor = {
    healthy: '#10b981',
    degraded: '#f59e0b',
    down: '#ef4444',
    unknown: '#9ca3af'
  }[healthState] || '#9ca3af';

  const vendorColor = {
    'Nokia': '#3b82f6',
    'Ericsson': '#1f2937',
    'Huawei': '#ef4444',
    'ZTE': '#f97316',
    'Unknown': '#9ca3af'
  }[vendor || 'Unknown'];

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        position: relative;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          position: absolute;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background-color: ${healthColor};
          border: 2px solid white;
          box-shadow: 0 0 8px rgba(0,0,0,0.2);
        "></div>
        <div style="
          position: absolute;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 2px solid ${vendorColor};
          opacity: 0.6;
        "></div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });
};

const MapController: React.FC<{ onZoom?: (level: number) => void }> = ({ onZoom }) => {
  const map = useMap();
  const [zoomLevel, setZoomLevel] = useState(map.getZoom());

  const handleZoomIn = useCallback(() => {
    map.zoomIn();
    const newZoom = map.getZoom();
    setZoomLevel(newZoom);
    onZoom?.(newZoom);
  }, [map, onZoom]);

  const handleZoomOut = useCallback(() => {
    map.zoomOut();
    const newZoom = map.getZoom();
    setZoomLevel(newZoom);
    onZoom?.(newZoom);
  }, [map, onZoom]);

  return (
    <div
      className="absolute top-5 right-5 z-[1000] flex gap-2 rounded-lg border border-border bg-card/95 p-2 shadow-lg backdrop-blur-sm"
    >
      <button
        onClick={handleZoomIn}
        className="p-2 hover:bg-muted rounded transition-colors"
        title="Zoom in"
      >
        <ZoomIn className="w-4 h-4 text-foreground" />
      </button>
      <button
        onClick={handleZoomOut}
        className="p-2 hover:bg-muted rounded transition-colors"
        title="Zoom out"
      >
        <ZoomOut className="w-4 h-4 text-foreground" />
      </button>
      <div className="w-px bg-border" />
      <span className="text-xs font-semibold text-foreground flex items-center px-2">
        Zoom: {zoomLevel}
      </span>
    </div>
  );
};

export const GeospatialNetworkMap: React.FC<GeospatialNetworkMapProps> = ({
  topology,
  layers,
  selectedObject,
  onObjectSelect,
  showPredictiveRisks = false
}) => {
  const [zoomLevel, setZoomLevel] = useState(6);

  // Filter objects with valid geo coordinates - only show important types to reduce clutter
  const geoObjects = topology.filter(obj =>
    obj.geoCoordinates &&
    obj.type !== 'country' &&
    (obj.type === 'site' || obj.type === 'cluster' || obj.type === 'region')
  );

  // Calculate statistics
  const healthyCount = geoObjects.filter(o => o.healthState === 'healthy').length;
  const degradedCount = geoObjects.filter(o => o.healthState === 'degraded').length;
  const downCount = geoObjects.filter(o => o.healthState === 'down').length;
  const totalAlarms = geoObjects.reduce((sum, obj) => sum + obj.alarmSummary.critical + obj.alarmSummary.major, 0);

  // Center map on MENA region
  const mapCenter: [number, number] = [25.5, 40];
  const mapZoom = 6;

  return (
    <div className="w-full flex flex-col gap-4 bg-card rounded-lg border border-border p-6">
      {/* Header */}
      <div>
        <h3 className="font-bold text-lg text-foreground">Geospatial Network Map - MENA Region</h3>
        <p className="text-xs text-muted-foreground mt-1">Real-time geographic visualization powered by OpenStreetMap</p>
      </div>

      {/* Map Container */}
      <div
        className="relative rounded-lg border border-border overflow-hidden shadow-lg"
        style={{ height: '600px' }}
      >
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ width: '100%', height: '100%' }}
          className="rounded-lg"
        >
          {/* OpenStreetMap tile layer */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            maxZoom={19}
          />

          {/* Network markers */}
          {geoObjects.map(obj => {
            if (!obj.geoCoordinates) return null;

            const position: [number, number] = [
              obj.geoCoordinates.latitude,
              obj.geoCoordinates.longitude
            ];

            const alarmCount = obj.alarmSummary.critical + obj.alarmSummary.major;

            return (
              <Marker
                key={obj.id}
                position={position}
                icon={createHealthIcon(obj.healthState, layers.vendorOverlay ? obj.vendor : undefined)}
                eventHandlers={{
                  click: () => onObjectSelect?.(obj)
                }}
              >
                <Popup>
                  <div className="min-w-[280px] text-foreground">
                    <h4 className="font-bold text-sm mb-2">{obj.name}</h4>
                    <div className="space-y-1 text-xs">
                      <p><span className="font-semibold">Type:</span> {obj.type}</p>
                      <p><span className="font-semibold">Vendor:</span> {obj.vendor || 'Unknown'}</p>
                      <p><span className="font-semibold">Latitude:</span> {obj.geoCoordinates.latitude.toFixed(4)}°N</p>
                      <p><span className="font-semibold">Longitude:</span> {obj.geoCoordinates.longitude.toFixed(4)}°E</p>
                      <p>
                        <span className="font-semibold">Status:</span>{' '}
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          obj.healthState === 'healthy'
                            ? 'surface-success border'
                            : obj.healthState === 'degraded'
                            ? 'surface-warning border'
                            : 'bg-destructive/20 text-destructive-foreground border border-destructive/35'
                        }`}>
                          {obj.healthState.toUpperCase()}
                        </span>
                      </p>
                      {alarmCount > 0 && (
                        <p><span className="font-semibold">Alarms:</span> {alarmCount}</p>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Map controls */}
          <MapController onZoom={setZoomLevel} />
        </MapContainer>
      </div>

      {/* Metrics Dashboard */}
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
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">({geoObjects.length > 0 ? ((healthyCount / geoObjects.length) * 100).toFixed(0) : 0}% operational)</p>
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

      {/* Selected Object Details */}
      {selectedObject && (
        <div className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h4 className="font-bold text-foreground text-lg">{selectedObject.name}</h4>
              <p className="text-sm text-muted-foreground mb-3">{selectedObject.type} • {selectedObject.vendor || 'Unknown'}</p>

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
                  ? 'surface-success border'
                  : selectedObject.healthState === 'degraded'
                  ? 'surface-warning border'
                  : 'bg-destructive/20 text-destructive-foreground border border-destructive/35'
              }`}>
                {selectedObject.healthState.toUpperCase()}
              </span>
              <p className="text-xs text-muted-foreground">{selectedObject.alarmSummary.critical + selectedObject.alarmSummary.major} Active Alarms</p>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="p-3 bg-muted/40 rounded-lg border border-border/50 text-xs text-muted-foreground">
        <p className="font-semibold mb-2">Legend:</p>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span>Healthy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
            <span>Degraded</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span>Down</span>
          </div>
        </div>
      </div>
    </div>
  );
};
