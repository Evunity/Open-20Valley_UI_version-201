import React, { useState } from 'react';
import { Download, FileJson, Image, Copy, Check, Globe } from 'lucide-react';
import { TopologyObject } from '../utils/topologyData';

type ExportFormat = 'png' | 'json' | 'kmz';
type ExportType = 'map' | 'dependency' | 'impact' | 'rack' | 'path';

interface ExportConfig {
  format: ExportFormat;
  type: ExportType;
  includeMetadata: boolean;
  includeTimestamp: boolean;
  includeActiveFilters: boolean;
}

interface ExportPanelProps {
  topology: TopologyObject[];
  currentView: string;
  filters?: Record<string, any>;
  onExport?: (config: ExportConfig) => void;
}

interface ExportOptionRowProps {
  id: string;
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}

const ExportOptionRow: React.FC<ExportOptionRowProps> = ({ id, checked, label, onChange }) => (
  <label
    htmlFor={id}
    className="flex min-h-9 items-start gap-2.5 rounded-md px-2 py-1.5 cursor-pointer hover:bg-muted/50 transition"
  >
    <span className="inline-flex w-4 h-4 min-w-4 min-h-4 items-center justify-center mt-0.5">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 min-w-4 min-h-4 m-0 p-0 rounded border-border align-middle"
      />
    </span>
    <span className="text-xs text-foreground leading-5 m-0 pt-0.5">{label}</span>
  </label>
);

export const ExportPanel: React.FC<ExportPanelProps> = ({
  topology,
  currentView,
  filters = {},
  onExport
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('png');
  const [selectedType, setSelectedType] = useState<ExportType>('map');
  const [exportOptions, setExportOptions] = useState({
    includeMetadata: true,
    includeTimestamp: true,
    includeActiveFilters: true
  });
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  const EXPORT_TYPES: { id: ExportType; label: string; description: string }[] = [
    { id: 'map', label: 'Map Snapshot', description: 'Export current geospatial view' },
    { id: 'dependency', label: 'Dependency Graph', description: 'Export service dependencies' },
    { id: 'impact', label: 'Impact Graph', description: 'Export blast radius analysis' },
    { id: 'rack', label: 'Rack View', description: 'Export physical layout' },
    { id: 'path', label: 'Path Trace', description: 'Export transport path analysis' }
  ];

  const FORMATS: { id: ExportFormat; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'png', label: 'PNG Image', icon: <Image className="w-4 h-4" />, color: 'surface-info border' },
    { id: 'json', label: 'JSON Data', icon: <FileJson className="w-4 h-4" />, color: 'surface-success border' },
    { id: 'kmz', label: 'KMZ (GIS)', icon: <Globe className="w-4 h-4" />, color: 'surface-warning border' }
  ];

  const generateMetadata = () => {
    return {
      timestamp: exportOptions.includeTimestamp ? new Date().toISOString() : undefined,
      view: currentView,
      objectCount: topology.length,
      activeFilters: exportOptions.includeActiveFilters ? filters : undefined,
      user: 'operator@network.local',
      tenant: 'MENA Region',
      version: '1.0'
    };
  };

  const generateJSONExport = () => {
    const data = {
      metadata: exportOptions.includeMetadata ? generateMetadata() : undefined,
      activeFilters: exportOptions.includeActiveFilters ? filters : undefined,
      exportType: selectedType,
      exportTime: exportOptions.includeTimestamp ? new Date().toISOString() : undefined,
      data: topology.map(obj => ({
        id: obj.id,
        name: obj.name,
        type: obj.type,
        vendor: obj.vendor,
        healthState: obj.healthState,
        alarmSummary: obj.alarmSummary,
        kpiSummary: obj.kpiSummary,
        geoCoordinates: obj.geoCoordinates
      }))
    };
    return JSON.stringify(data, null, 2);
  };

  const generateKMLContent = () => {
    const placemarks = topology
      .filter((obj) => obj.geoCoordinates)
      .map((obj) => {
        const lon = obj.geoCoordinates?.longitude ?? 0;
        const lat = obj.geoCoordinates?.latitude ?? 0;
        const alarmCount = obj.alarmSummary.critical + obj.alarmSummary.major;
        return `
          <Placemark>
            <name>${obj.name}</name>
            <description>Type: ${obj.type}, Vendor: ${obj.vendor || 'Unknown'}, Health: ${obj.healthState}, Alarms: ${alarmCount}</description>
            <Point><coordinates>${lon},${lat},0</coordinates></Point>
          </Placemark>
        `;
      })
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
      <kml xmlns="http://www.opengis.net/kml/2.2">
        <Document>
          <name>Topology ${selectedType} Export</name>
          ${exportOptions.includeMetadata ? `<description>User: operator@network.local | Tenant: MENA Region</description>` : ''}
          ${placemarks}
        </Document>
      </kml>`;
  };

  const handleExport = async () => {
    setIsExporting(true);

    const config: ExportConfig = {
      format: selectedFormat,
      type: selectedType,
      includeMetadata: exportOptions.includeMetadata,
      includeTimestamp: exportOptions.includeTimestamp,
      includeActiveFilters: exportOptions.includeActiveFilters
    };

    // Simulate export generation
    await new Promise(resolve => setTimeout(resolve, 800));

    if (selectedFormat === 'json') {
      const jsonData = generateJSONExport();
      const blob = new Blob([jsonData], { type: 'application/json' });
      downloadFile(blob, `topology-${selectedType}-${Date.now()}.json`);
    } else if (selectedFormat === 'png') {
      // Simulate PNG export
      const canvas = document.createElement('canvas');
      canvas.width = 1920;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = 'bold 32px Arial';
        ctx.fillStyle = '#000000';
        ctx.fillText(`Topology ${selectedType.toUpperCase()} Export`, 50, 100);
      }
      canvas.toBlob(blob => {
        if (blob) {
          downloadFile(blob, `topology-${selectedType}-${Date.now()}.png`);
        }
      });
    } else if (selectedFormat === 'kmz') {
      const kmlData = generateKMLContent();
      const blob = new Blob([kmlData], { type: 'application/vnd.google-earth.kmz' });
      downloadFile(blob, `topology-${selectedType}-${Date.now()}.kmz`);
    }

    onExport?.(config);
    setIsExporting(false);
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const copyExportJSON = () => {
    const jsonData = generateJSONExport();
    navigator.clipboard.writeText(jsonData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full flex flex-col gap-4 bg-card rounded-lg border border-border p-4 text-card-foreground">
      <div className="flex items-center gap-2">
        <Download className="w-5 h-5 text-[hsl(var(--info))]" />
        <h3 className="font-semibold text-foreground">Export & Reporting</h3>
      </div>

      {/* Export Type Selection */}
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-muted-foreground">Export Type</p>
        <div className="grid grid-cols-2 gap-2">
          {EXPORT_TYPES.map(type => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`p-2 rounded-lg border-2 text-left transition ${
                selectedType === type.id
                  ? 'border-primary bg-primary/15 text-foreground'
                  : 'border-border hover:border-primary/40 bg-card'
              }`}
            >
              <p className="text-sm font-semibold text-foreground">{type.label}</p>
              <p className="text-xs text-muted-foreground">{type.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Format Selection */}
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-muted-foreground">Format</p>
        <div className="grid grid-cols-3 gap-2">
          {FORMATS.map(format => (
            <button
              key={format.id}
              onClick={() => setSelectedFormat(format.id)}
              className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 transition ${
                selectedFormat === format.id
                  ? `border-current ${format.color}`
                  : 'border-border hover:border-primary/40 text-foreground bg-card'
              }`}
            >
              {format.icon}
              <span className="text-xs font-semibold">{format.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-2 p-3 bg-muted/45 rounded-lg border border-border/60">
        <ExportOptionRow
          id="export-option-metadata"
          checked={exportOptions.includeMetadata}
          label="Include metadata (user, tenant, version)"
          onChange={(checked) => setExportOptions((prev) => ({ ...prev, includeMetadata: checked }))}
        />
        <ExportOptionRow
          id="export-option-timestamp"
          checked={exportOptions.includeTimestamp}
          label="Include timestamp"
          onChange={(checked) => setExportOptions((prev) => ({ ...prev, includeTimestamp: checked }))}
        />
        <ExportOptionRow
          id="export-option-filters"
          checked={exportOptions.includeActiveFilters}
          label="Include active filters"
          onChange={(checked) => setExportOptions((prev) => ({ ...prev, includeActiveFilters: checked }))}
        />
      </div>

      {/* Metadata Preview */}
      {exportOptions.includeMetadata && (
        <div className="p-3 surface-info rounded-lg border">
          <p className="text-xs font-semibold text-current mb-2">Metadata Preview</p>
          <div className="space-y-1 text-xs text-current/90 font-mono">
            {exportOptions.includeTimestamp && <p>Time: {new Date().toISOString()}</p>}
            <p>View: {currentView}</p>
            <p>Objects: {topology.length}</p>
            <p>User: operator@network.local</p>
            <p>Tenant: MENA Region</p>
            {exportOptions.includeActiveFilters && <p>Filters: {Object.keys(filters).length}</p>}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition disabled:opacity-50"
        >
          {isExporting ? 'Exporting...' : `Export as ${selectedFormat.toUpperCase()}`}
        </button>
        {selectedFormat === 'json' && (
          <button
            onClick={copyExportJSON}
            className="px-4 py-2 bg-muted text-foreground rounded-lg font-semibold hover:bg-muted/80 transition flex items-center gap-2 border border-border"
            title="Copy JSON to clipboard"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Info */}
      <p className="text-xs text-muted-foreground text-center">
        Exports include full context: topology data, KPIs, alarms, and vendor information
      </p>
    </div>
  );
};
