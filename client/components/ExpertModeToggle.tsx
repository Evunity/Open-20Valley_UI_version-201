import React from 'react';
import { AlertCircle, Eye, EyeOff, Code } from 'lucide-react';

interface ExpertModeToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export const ExpertModeToggle: React.FC<ExpertModeToggleProps> = ({ enabled, onToggle }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Code className="w-5 h-5 text-purple-600" />
          <div>
            <h3 className="font-bold text-gray-900">Expert Mode</h3>
            <p className="text-xs text-gray-600">
              {enabled ? 'Vendor fields visible' : 'Vendor fields hidden'}
            </p>
          </div>
        </div>
        <button
          onClick={() => onToggle(!enabled)}
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
            enabled ? 'bg-purple-600' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
              enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Expert mode info */}
      <div className={`p-3 rounded-lg border transition ${
        enabled
          ? 'bg-purple-50 border-purple-200'
          : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex gap-2">
          <AlertCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
            enabled ? 'text-purple-700' : 'text-gray-700'
          }`} />
          <div className={`text-xs space-y-1 ${
            enabled ? 'text-purple-800' : 'text-gray-700'
          }`}>
            {enabled ? (
              <>
                <p className="font-semibold">Expert mode enabled</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Vendor alarm codes visible</li>
                  <li>Raw vendor data displayed</li>
                  <li>Vendor-specific columns added</li>
                  <li>System field highlighting enabled</li>
                </ul>
              </>
            ) : (
              <>
                <p className="font-semibold">Expert mode disabled</p>
                <p>Vendor-specific fields are normalized and hidden. Click the toggle to enable expert mode for detailed vendor information.</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Visibility info */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="p-2 bg-gray-50 rounded border border-gray-200">
          <div className="font-semibold text-gray-900 mb-1 flex items-center gap-1">
            {enabled ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            Vendor Fields
          </div>
          <p className="text-gray-600">
            {enabled ? 'Visible' : 'Hidden'}
          </p>
        </div>
        <div className="p-2 bg-gray-50 rounded border border-gray-200">
          <div className="font-semibold text-gray-900 mb-1">Raw Data</div>
          <p className="text-gray-600">
            {enabled ? 'Exposed' : 'Abstracted'}
          </p>
        </div>
      </div>
    </div>
  );
};

// Display vendor fields in expert mode
export const VendorFieldsDisplay: React.FC<{
  vendorData: Record<string, any>;
  sourceSystem: string;
}> = ({ vendorData, sourceSystem }) => {
  if (!vendorData || Object.keys(vendorData).length === 0) {
    return (
      <div className="p-3 bg-gray-50 rounded border border-gray-200">
        <p className="text-xs text-gray-600">No vendor-specific data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold text-gray-700 mb-2">
        {sourceSystem} — Vendor Fields
      </div>
      <div className="grid grid-cols-1 gap-2 p-3 bg-purple-50 rounded border border-purple-200">
        {Object.entries(vendorData).map(([key, value]) => (
          <div key={key} className="grid grid-cols-3 gap-2 text-xs">
            <div className="font-mono text-purple-700 font-semibold">{key}</div>
            <div className="col-span-2 text-gray-700 break-words font-mono">
              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
