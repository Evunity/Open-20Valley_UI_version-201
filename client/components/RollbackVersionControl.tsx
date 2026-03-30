import React, { useState } from 'react';
import { RotateCcw, Save, CheckCircle, AlertCircle, Clock, User } from 'lucide-react';

interface RollbackVersionControlProps {
  selectedTarget: any;
  onTargetChange: (target: any) => void;
}

interface ChangeSnapshot {
  id: string;
  timestamp: string;
  user: string;
  scriptUsed: string;
  objectIds: string[];
  previousValues: Record<string, string>;
  status: 'active' | 'rolled_back';
  rollbackableItems: number;
}

const MOCK_SNAPSHOTS: ChangeSnapshot[] = [
  {
    id: 'snap_001',
    timestamp: '2024-12-02 14:32:15',
    user: 'Engineer.A',
    scriptUsed: 'Reset Cell Parameters',
    objectIds: ['Cairo-Site-1', 'Cairo-Site-2', 'Giza-Site-1'],
    previousValues: {
      'Cairo-Site-1': 'TX Power: 43 dBm',
      'Cairo-Site-2': 'TX Power: 43 dBm',
      'Giza-Site-1': 'TX Power: 43 dBm'
    },
    status: 'active',
    rollbackableItems: 3
  },
  {
    id: 'snap_002',
    timestamp: '2024-12-02 13:45:22',
    user: 'Engineer.B',
    scriptUsed: 'DL Bandwidth Update',
    objectIds: ['Alexandria-Site-1', 'Alexandria-Site-2'],
    previousValues: {
      'Alexandria-Site-1': 'DL Bandwidth: 20 MHz',
      'Alexandria-Site-2': 'DL Bandwidth: 20 MHz'
    },
    status: 'active',
    rollbackableItems: 2
  },
  {
    id: 'snap_003',
    timestamp: '2024-12-02 12:10:45',
    user: 'System',
    scriptUsed: 'Auto Maintenance Script',
    objectIds: ['Dubai-Cluster-1', 'Dubai-Cluster-2', 'Abu-Dhabi-Site-1'],
    previousValues: {
      'Dubai-Cluster-1': 'Parameters restored to baseline',
      'Dubai-Cluster-2': 'Parameters restored to baseline',
      'Abu-Dhabi-Site-1': 'Parameters restored to baseline'
    },
    status: 'rolled_back',
    rollbackableItems: 0
  }
];

export const RollbackVersionControl: React.FC<RollbackVersionControlProps> = () => {
  const [snapshots, setSnapshots] = useState<ChangeSnapshot[]>(MOCK_SNAPSHOTS);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<'full' | 'partial' | 'selective'>('full');
  const [selectedObjects, setSelectedObjects] = useState<Set<string>>(new Set());
  const [selectedParameters, setSelectedParameters] = useState<Set<string>>(new Set());

  const PARAMETER_OPTIONS = ['TX Power', 'DL Bandwidth', 'Cell Barring', 'IP Address', 'VLAN ID'];

  const toggleObject = (objectId: string) => {
    const newSelected = new Set(selectedObjects);
    if (newSelected.has(objectId)) {
      newSelected.delete(objectId);
    } else {
      newSelected.add(objectId);
    }
    setSelectedObjects(newSelected);
  };

  const toggleParameter = (param: string) => {
    const newSelected = new Set(selectedParameters);
    if (newSelected.has(param)) {
      newSelected.delete(param);
    } else {
      newSelected.add(param);
    }
    setSelectedParameters(newSelected);
  };

  const executeRollback = (snapshotId: string, mode: string) => {
    if (mode === 'Partial' && selectedObjects.size === 0) {
      alert('Please select at least one object to rollback');
      return;
    }
    if (mode === 'Selective' && selectedParameters.size === 0) {
      alert('Please select at least one parameter to rollback');
      return;
    }
    setSnapshots(snapshots.map(s =>
      s.id === snapshotId ? { ...s, status: 'rolled_back' } : s
    ));
    alert(`Rollback executed for snapshot ${snapshotId} in ${mode} mode`);
  };

  return (
    <div className="flex flex-col h-full gap-4 p-4">
      {/* Rollback Strategy Selection */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Rollback Strategy</h3>
        <div className="grid grid-cols-3 gap-3">
          {['full', 'partial', 'selective'].map(mode => (
            <button
              key={mode}
              onClick={() => setSelectedMode(mode as any)}
              className={`p-3 rounded-lg border-2 transition ${
                selectedMode === mode
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className="font-semibold text-gray-900 text-sm capitalize">{mode} Rollback</p>
              <p className="text-xs text-gray-600 mt-1">
                {mode === 'full' && 'Restore all objects to previous state'}
                {mode === 'partial' && 'Rollback specific objects'}
                {mode === 'selective' && 'Choose individual parameters'}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Change Snapshots */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {snapshots.map((snapshot) => (
          <div
            key={snapshot.id}
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            <button
              onClick={() => setExpandedId(expandedId === snapshot.id ? null : snapshot.id)}
              className="w-full p-4 bg-white hover:bg-gray-50 transition flex items-start gap-3 text-left"
            >
              {snapshot.status === 'active' ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <RotateCcw className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-gray-900 truncate">{snapshot.scriptUsed}</p>
                  <span className={`text-xs px-2 py-0.5 rounded font-semibold whitespace-nowrap ${
                    snapshot.status === 'active' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {snapshot.status}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-600 flex-wrap">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {snapshot.timestamp}
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {snapshot.user}
                  </div>
                  <div>{snapshot.objectIds.length} objects</div>
                  <div>{snapshot.rollbackableItems} rollbackable</div>
                </div>
              </div>
            </button>

            {/* Expanded Details */}
            {expandedId === snapshot.id && (
              <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-3">
                {/* Previous Values */}
                <div>
                  <p className="font-semibold text-gray-900 text-sm mb-2">Previous Values</p>
                  <div className="space-y-1">
                    {Object.entries(snapshot.previousValues).map(([obj, val]) => (
                      <div key={obj} className="p-2 bg-white rounded border border-gray-200 text-sm">
                        <p className="font-mono text-gray-900">{obj}</p>
                        <p className="text-xs text-gray-600">{val}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Partial Rollback - Object Selection */}
                {selectedMode === 'partial' && (
                  <div>
                    <p className="font-semibold text-gray-900 text-sm mb-2">Select Objects to Rollback</p>
                    <div className="space-y-2 bg-white p-3 rounded border border-gray-200">
                      {snapshot.objectIds.map(obj => (
                        <label key={obj} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition">
                          <input
                            type="checkbox"
                            checked={selectedObjects.has(obj)}
                            onChange={() => toggleObject(obj)}
                            className="w-4 h-4 rounded border-gray-300"
                          />
                          <span className="text-sm text-gray-700">{obj}</span>
                        </label>
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 mt-2">{selectedObjects.size} of {snapshot.objectIds.length} selected</p>
                  </div>
                )}

                {/* Selective Rollback - Parameter Selection */}
                {selectedMode === 'selective' && (
                  <div>
                    <p className="font-semibold text-gray-900 text-sm mb-2">Select Parameters to Rollback</p>
                    <div className="grid grid-cols-2 gap-2 bg-white p-3 rounded border border-gray-200">
                      {PARAMETER_OPTIONS.map(param => (
                        <label key={param} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition">
                          <input
                            type="checkbox"
                            checked={selectedParameters.has(param)}
                            onChange={() => toggleParameter(param)}
                            className="w-4 h-4 rounded border-gray-300"
                          />
                          <span className="text-sm text-gray-700">{param}</span>
                        </label>
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 mt-2">{selectedParameters.size} of {PARAMETER_OPTIONS.length} selected</p>
                  </div>
                )}

                {/* Rollback Actions */}
                {snapshot.status === 'active' && (
                  <div className="flex gap-2">
                    {selectedMode === 'full' && (
                      <button
                        onClick={() => executeRollback(snapshot.id, 'Full')}
                        className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold flex items-center justify-center gap-2 transition"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Full Rollback
                      </button>
                    )}

                    {selectedMode === 'partial' && (
                      <button
                        onClick={() => executeRollback(snapshot.id, 'Partial')}
                        disabled={selectedObjects.size === 0}
                        className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold text-sm transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        Rollback {selectedObjects.size} Object{selectedObjects.size !== 1 ? 's' : ''}
                      </button>
                    )}

                    {selectedMode === 'selective' && (
                      <button
                        onClick={() => executeRollback(snapshot.id, 'Selective')}
                        disabled={selectedParameters.size === 0}
                        className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold text-sm transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        Rollback {selectedParameters.size} Parameter{selectedParameters.size !== 1 ? 's' : ''}
                      </button>
                    )}
                  </div>
                )}

                {snapshot.status === 'rolled_back' && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold">Already rolled back</p>
                      <p className="text-xs mt-0.5">Check audit log for rollback timestamp</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Audit Notice */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold">All rollbacks are audited</p>
            <p className="text-xs mt-0.5">Each rollback creates a new audit record with timestamp, user, and mode</p>
          </div>
        </div>
      </div>
    </div>
  );
};
