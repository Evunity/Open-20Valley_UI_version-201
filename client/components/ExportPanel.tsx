import React, { useState } from 'react';
import { Download, FileJson, Image, FileText, Copy, Check } from 'lucide-react';
import { TopologyObject } from '../utils/topologyData';

type ExportFormat = 'png' | 'pdf' | 'json';
type ExportType = 'map' | 'dependency' | 'impact' | 'rack' | 'path';

interface ExportConfig {
  format: ExportFormat;
  type: ExportType;
  includeMetadata: boolean;
  includeTimestamp: boolean;
  includeFilters: boolean;
}

interface ExportPanelProps {
  topology: TopologyObject[];
  currentView: string;
  filters?: Record<string, any>;
  onExport?: (config: ExportConfig) => void;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({
  topology,
  currentView,
  filters = {},
  onExport
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('png');
  const [selectedType, setSelectedType] = useState<ExportType>('map');
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [includeTimestamp, setIncludeTimestamp] = useState(true);
  const [includeFilters, setIncludeFilters] = useState(true);
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
    { id: 'png', label: 'PNG Image', icon: <Image className="w-4 h-4" />, color: 'bg-blue-100 text-blue-700' },
    { id: 'pdf', label: 'PDF Report', icon: <FileText className="w-4 h-4" />, color: 'bg-red-100 text-red-700' },
    { id: 'json', label: 'JSON Data', icon: <FileJson className="w-4 h-4" />, color: 'bg-green-100 text-green-700' }
  ];

  const generateMetadata = () => {
    return {
      timestamp: new Date().toISOString(),
      view: currentView,
      objectCount: topology.length,
      filters: includeFilters ? filters : undefined,
      user: 'operator@network.local',
      tenant: 'MENA Region',
      version: '1.0'
    };
  };

  const generateJSONExport = () => {
    const data = {
      metadata: includeMetadata ? generateMetadata() : undefined,
      exportType: selectedType,
      exportTime: includeTimestamp ? new Date().toISOString() : undefined,
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

  const handleExport = async () => {
    setIsExporting(true);

    const config: ExportConfig = {
      format: selectedFormat,
      type: selectedType,
      includeMetadata,
      includeTimestamp,
      includeFilters
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
    } else if (selectedFormat === 'pdf') {
      // Simulate PDF export
      const content = generatePDFContent();
      const blob = new Blob([content], { type: 'application/pdf' });
      downloadFile(blob, `topology-${selectedType}-${Date.now()}.pdf`);
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

  const generatePDFContent = () => {
    const metadata = generateMetadata();
    return `
%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R>>endobj
4 0 obj<</Length 200>>stream
BT
/F1 24 Tf 50 750 Td
(Topology Export Report) Tj
0 -40 Td
/F1 12 Tf
(Exported: ${metadata.timestamp}) Tj
0 -20 Td
(View: ${metadata.view}) Tj
0 -20 Td
(Objects: ${metadata.objectCount}) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000194 00000 n
trailer<</Size 5/Root 1 0 R>>
startxref
446
%%EOF
`;
  };

  const copyExportJSON = () => {
    const jsonData = generateJSONExport();
    navigator.clipboard.writeText(jsonData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full flex flex-col gap-4 bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-2">
        <Download className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-900">Export & Reporting</h3>
      </div>

      {/* Export Type Selection */}
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-gray-700">Export Type</p>
        <div className="grid grid-cols-2 gap-2">
          {EXPORT_TYPES.map(type => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`p-2 rounded-lg border-2 text-left transition ${
                selectedType === type.id
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className="text-sm font-semibold text-gray-900">{type.label}</p>
              <p className="text-xs text-gray-600">{type.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Format Selection */}
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-gray-700">Format</p>
        <div className="grid grid-cols-3 gap-2">
          {FORMATS.map(format => (
            <button
              key={format.id}
              onClick={() => setSelectedFormat(format.id)}
              className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 transition ${
                selectedFormat === format.id
                  ? `border-current ${format.color}`
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              {format.icon}
              <span className="text-xs font-semibold">{format.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-lg">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={includeMetadata}
            onChange={(e) => setIncludeMetadata(e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <span className="text-sm text-gray-700">Include metadata (user, tenant, version)</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={includeTimestamp}
            onChange={(e) => setIncludeTimestamp(e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <span className="text-sm text-gray-700">Include timestamp</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={includeFilters}
            onChange={(e) => setIncludeFilters(e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <span className="text-sm text-gray-700">Include active filters</span>
        </label>
      </div>

      {/* Metadata Preview */}
      {includeMetadata && (
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs font-semibold text-blue-900 mb-2">Metadata Preview</p>
          <div className="space-y-1 text-xs text-blue-800 font-mono">
            <p>Time: {new Date().toISOString()}</p>
            <p>View: {currentView}</p>
            <p>Objects: {topology.length}</p>
            <p>User: operator@network.local</p>
            <p>Tenant: MENA Region</p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
        >
          {isExporting ? 'Exporting...' : `Export as ${selectedFormat.toUpperCase()}`}
        </button>
        {selectedFormat === 'json' && (
          <button
            onClick={copyExportJSON}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition flex items-center gap-2"
            title="Copy JSON to clipboard"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Info */}
      <p className="text-xs text-gray-600 text-center">
        Exports include full context: topology data, KPIs, alarms, and vendor information
      </p>
    </div>
  );
};
