import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, ChevronRight } from 'lucide-react';

interface ModifyChangeEngineProps {
  selectedTarget: any;
  onTargetChange: (target: any) => void;
}

export const ModifyChangeEngine: React.FC<ModifyChangeEngineProps> = () => {
  const [step, setStep] = useState<'select' | 'validate' | 'preview' | 'execute'>('select');

  return (
    <div className="flex flex-col h-full gap-4 p-4">
      {/* Validation Pipeline */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Modification Pipeline</h3>
        <div className="space-y-3">
          {[
            { step: 1, label: 'Select Parameter', description: 'Choose object and parameter' },
            { step: 2, label: 'Validate Change', description: 'Syntax & range validation' },
            { step: 3, label: 'Conflict Check', description: 'Check for dependencies' },
            { step: 4, label: 'Impact Preview', description: 'Preview affected nodes' },
            { step: 5, label: 'Risk Scoring', description: 'Calculate risk level' },
            { step: 6, label: 'Execute', description: 'Apply change with audit' }
          ].map((s) => (
            <div key={s.step} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                step >= s.label.toLowerCase().replace(' ', '') ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {s.step}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{s.label}</p>
                <p className="text-xs text-gray-600">{s.description}</p>
              </div>
              <ChevronRight className="ml-auto w-4 h-4 text-gray-400" />
            </div>
          ))}
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3 mb-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-900">Safety First</p>
            <p className="text-sm text-amber-800">All modifications are validated before execution</p>
          </div>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between p-2 bg-white rounded">
            <span className="text-gray-700">Syntax Validation</span>
            <CheckCircle className="w-4 h-4 text-green-600" />
          </div>
          <div className="flex items-center justify-between p-2 bg-white rounded">
            <span className="text-gray-700">Range Validation</span>
            <CheckCircle className="w-4 h-4 text-green-600" />
          </div>
          <div className="flex items-center justify-between p-2 bg-white rounded">
            <span className="text-gray-700">Dependency Impact</span>
            <CheckCircle className="w-4 h-4 text-green-600" />
          </div>
          <div className="flex items-center justify-between p-2 bg-white rounded">
            <span className="text-gray-700">Conflict Detection</span>
            <CheckCircle className="w-4 h-4 text-green-600" />
          </div>
        </div>
      </div>

      {/* Modify Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Modify Parameter</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Parameter</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>TX Power</option>
              <option>Cell Barring</option>
              <option>DL Bandwidth</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Current Value</label>
              <input type="text" value="40" readOnly className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">New Value</label>
              <input type="text" placeholder="42" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Change Reason</label>
            <textarea placeholder="Why is this change needed?" rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition">
            Validate Change
          </button>
        </div>
      </div>
    </div>
  );
};
