import React, { useState } from 'react';
import { RotateCcw, Save, CheckCircle, AlertCircle, Clock, User, Eye, Download, X } from 'lucide-react';
import SearchableDropdown from './SearchableDropdown';

interface RollbackAuditCombinedProps {
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

interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  object: string;
  site: string;
  technology: string;
  vendor: string;
  status: 'completed' | 'failed' | 'rolled-back';
  changeDetails: string;
  reversible: boolean;
}

const MOCK_SNAPSHOTS: ChangeSnapshot[] = [
  {
    id: 'snap_001',
    timestamp: '2024-12-02 14:32:15',
    user: 'Engineer.A',
    scriptUsed: 'Network Configuration Reset',
    objectIds: ['Cairo-Site-1', 'Cairo-Site-2', 'Cairo-Site-3', 'Giza-Site-1'],
    previousValues: {
      'Cairo-Site-1': 'TX Power: 43 dBm, DL Bandwidth: 20 MHz, Cell Barring: False, IP Address: 192.168.1.100, VLAN ID: 100',
      'Cairo-Site-2': 'TX Power: 40 dBm, DL Bandwidth: 20 MHz, Cell Barring: False, IP Address: 192.168.1.101, VLAN ID: 101',
      'Cairo-Site-3': 'TX Power: 43 dBm, DL Bandwidth: 15 MHz, Cell Barring: False, IP Address: 192.168.1.102, VLAN ID: 102',
      'Giza-Site-1': 'TX Power: 43 dBm, DL Bandwidth: 20 MHz, Cell Barring: True, IP Address: 192.168.1.103, VLAN ID: 103'
    },
    status: 'active',
    rollbackableItems: 4
  },
  {
    id: 'snap_002',
    timestamp: '2024-12-02 13:45:22',
    user: 'Engineer.B',
    scriptUsed: 'DL Bandwidth Optimization',
    objectIds: ['Alexandria-Site-1', 'Alexandria-Site-2', 'Suez-Site-1'],
    previousValues: {
      'Alexandria-Site-1': 'TX Power: 40 dBm, DL Bandwidth: 20 MHz, Cell Barring: False, IP Address: 192.168.2.100, VLAN ID: 200',
      'Alexandria-Site-2': 'TX Power: 40 dBm, DL Bandwidth: 20 MHz, Cell Barring: False, IP Address: 192.168.2.101, VLAN ID: 201',
      'Suez-Site-1': 'TX Power: 43 dBm, DL Bandwidth: 20 MHz, Cell Barring: False, IP Address: 192.168.2.102, VLAN ID: 202'
    },
    status: 'active',
    rollbackableItems: 3
  },
  {
    id: 'snap_003',
    timestamp: '2024-12-02 12:10:45',
    user: 'Engineer.C',
    scriptUsed: 'TX Power Adjustment for Peak Hours',
    objectIds: ['Dubai-Site-1', 'Dubai-Site-2', 'Abu-Dhabi-Site-1', 'Sharjah-Site-1', 'Ajman-Site-1'],
    previousValues: {
      'Dubai-Site-1': 'TX Power: 43 dBm → 40 dBm, DL Bandwidth: 20 MHz, Cell Barring: False, IP Address: 192.168.3.100, VLAN ID: 300',
      'Dubai-Site-2': 'TX Power: 43 dBm → 40 dBm, DL Bandwidth: 20 MHz, Cell Barring: False, IP Address: 192.168.3.101, VLAN ID: 301',
      'Abu-Dhabi-Site-1': 'TX Power: 43 dBm → 38 dBm, DL Bandwidth: 20 MHz, Cell Barring: False, IP Address: 192.168.3.102, VLAN ID: 302',
      'Sharjah-Site-1': 'TX Power: 40 dBm → 38 dBm, DL Bandwidth: 15 MHz, Cell Barring: True, IP Address: 192.168.3.103, VLAN ID: 303',
      'Ajman-Site-1': 'TX Power: 43 dBm → 40 dBm, DL Bandwidth: 20 MHz, Cell Barring: False, IP Address: 192.168.3.104, VLAN ID: 304'
    },
    status: 'active',
    rollbackableItems: 5
  },
  {
    id: 'snap_004',
    timestamp: '2024-12-02 11:20:30',
    user: 'System',
    scriptUsed: 'Auto Emergency Recovery',
    objectIds: ['Riyadh-Site-1', 'Riyadh-Site-2', 'Jeddah-Site-1'],
    previousValues: {
      'Riyadh-Site-1': 'TX Power: 43 dBm, DL Bandwidth: 20 MHz, Cell Barring: False, IP Address: 192.168.4.100, VLAN ID: 400',
      'Riyadh-Site-2': 'TX Power: 43 dBm, DL Bandwidth: 20 MHz, Cell Barring: False, IP Address: 192.168.4.101, VLAN ID: 401',
      'Jeddah-Site-1': 'TX Power: 40 dBm, DL Bandwidth: 20 MHz, Cell Barring: False, IP Address: 192.168.4.102, VLAN ID: 402'
    },
    status: 'rolled_back',
    rollbackableItems: 0
  },
  {
    id: 'snap_005',
    timestamp: '2024-12-02 10:15:45',
    user: 'Engineer.D',
    scriptUsed: 'Multi-Parameter Cell Configuration',
    objectIds: ['Dammam-Site-1', 'Khobar-Site-1'],
    previousValues: {
      'Dammam-Site-1': 'TX Power: 43 dBm, DL Bandwidth: 20 MHz, Cell Barring: False, IP Address: 192.168.5.100, VLAN ID: 500',
      'Khobar-Site-1': 'TX Power: 40 dBm, DL Bandwidth: 15 MHz, Cell Barring: True, IP Address: 192.168.5.101, VLAN ID: 501'
    },
    status: 'active',
    rollbackableItems: 2
  }
];

const MOCK_AUDIT: AuditEntry[] = [
  {
    id: '1',
    timestamp: '2024-12-02 14:32',
    user: 'Engineer.A',
    action: 'Modified TX Power',
    object: 'Cairo-Site-1',
    site: 'Cairo-Site-1',
    technology: '4G',
    vendor: 'Huawei',
    status: 'completed',
    changeDetails: 'TX Power: 43 → 40 dBm',
    reversible: true
  },
  {
    id: '2',
    timestamp: '2024-12-02 13:45',
    user: 'Engineer.B',
    action: 'Bulk Config Update',
    object: 'Cairo-Site-2',
    site: 'Cairo-Site-2',
    technology: '5G',
    vendor: 'Ericsson',
    status: 'completed',
    changeDetails: '12 sites updated',
    reversible: true
  },
  {
    id: '3',
    timestamp: '2024-12-02 12:10',
    user: 'System',
    action: 'Automation Execution',
    object: 'Giza-Site-1',
    site: 'Giza-Site-1',
    technology: '4G',
    vendor: 'Nokia',
    status: 'rolled-back',
    changeDetails: 'Failed validation check',
    reversible: false
  },
  {
    id: '4',
    timestamp: '2024-12-02 11:20',
    user: 'Engineer.A',
    action: 'DL Bandwidth Update',
    object: 'Alexandria-Site-1',
    site: 'Alexandria-Site-1',
    technology: '3G',
    vendor: 'ZTE',
    status: 'completed',
    changeDetails: 'DL Bandwidth: 20 → 25 MHz',
    reversible: true
  },
  {
    id: '5',
    timestamp: '2024-12-02 10:15',
    user: 'Engineer.B',
    action: 'Cell Barring Enable',
    object: 'Suez-Site-1',
    site: 'Suez-Site-1',
    technology: '2G',
    vendor: 'Huawei',
    status: 'failed',
    changeDetails: 'Cell already barred',
    reversible: false
  }
];

const SITE_OPTIONS = ['Cairo-Site-1', 'Cairo-Site-2', 'Cairo-Site-3', 'Giza-Site-1', 'Giza-Site-2', 'Alexandria-Site-1', 'Suez-Site-1'];
const TECHNOLOGY_OPTIONS = ['2G', '3G', '4G', '5G', 'O-RAN'];
const VENDOR_OPTIONS = ['Huawei', 'Ericsson', 'Nokia', 'ZTE'];
const PARAMETER_OPTIONS = ['TX Power', 'DL Bandwidth', 'Cell Barring', 'IP Address', 'VLAN ID'];

export const RollbackAuditCombined: React.FC<RollbackAuditCombinedProps> = () => {
  const [snapshots, setSnapshots] = useState<ChangeSnapshot[]>(MOCK_SNAPSHOTS);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<'full' | 'partial' | 'selective'>('full');
  const [selectedObjects, setSelectedObjects] = useState<Set<string>>(new Set());
  const [selectedParameters, setSelectedParameters] = useState<Set<string>>(new Set());

  // Audit state
  const [entries, setEntries] = useState<AuditEntry[]>(MOCK_AUDIT);
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);
  const [detailedViewId, setDetailedViewId] = useState<string | null>(null);
  const [selectedSite, setSelectedSite] = useState<string[]>([]);
  const [selectedTechnology, setSelectedTechnology] = useState<string[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<string[]>([]);

  const handleModeChange = (mode: 'full' | 'partial' | 'selective') => {
    setSelectedMode(mode);
    setSelectedObjects(new Set());
    setSelectedParameters(new Set());
  };

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
    setSelectedObjects(new Set());
    setSelectedParameters(new Set());
    alert(`Rollback executed for snapshot ${snapshotId} in ${mode} mode`);
  };

  const filteredEntries = entries.filter(entry => {
    const siteMatch = !selectedSite.length || entry.site === selectedSite[0];
    const techMatch = !selectedTechnology.length || entry.technology === selectedTechnology[0];
    const vendorMatch = !selectedVendor.length || entry.vendor === selectedVendor[0];
    return siteMatch && techMatch && vendorMatch;
  });

  const handleViewFullDetails = (entryId: string) => {
    setDetailedViewId(detailedViewId === entryId ? null : entryId);
  };

  const handleAuditRollback = (entryId: string) => {
    const entry = entries.find(e => e.id === entryId);
    if (!entry) return;

    if (window.confirm(`Are you sure you want to rollback "${entry.action}"?`)) {
      setEntries(entries.map(e =>
        e.id === entryId ? { ...e, status: 'rolled-back' as const, reversible: false } : e
      ));
      setSelectedEntry(null);
      alert(`Rollback completed successfully for "${entry.action}"`);
    }
  };

  return (
    <div className="flex flex-col h-full gap-6 p-6">
      {/* ROLLBACK SECTION */}
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="mb-2">
          <h2 className="text-2xl font-bold text-foreground">Rollback Management</h2>
          <p className="text-sm text-muted-foreground mt-2">Restore configurations using Full, Partial, or Selective rollback strategies</p>
        </div>

        {/* Rollback Strategy Selection */}
        <div className="bg-card border border-border rounded-lg p-4 mb-2">
          <h3 className="font-semibold text-foreground mb-4">Select Rollback Strategy</h3>
          <div className="grid grid-cols-3 gap-3">
            {['full', 'partial', 'selective'].map(mode => (
              <button
                key={mode}
                onClick={() => handleModeChange(mode as any)}
                className={`p-4 rounded-lg border-2 transition ${
                  selectedMode === mode
                    ? 'border-primary bg-primary/10 text-foreground'
                    : 'border-border bg-card text-muted-foreground hover:border-primary/40'
                }`}
              >
                <p className="font-semibold text-sm capitalize">{mode} Rollback</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {mode === 'full' && 'Restore all objects to previous state'}
                  {mode === 'partial' && 'Rollback specific objects'}
                  {mode === 'selective' && 'Choose individual parameters'}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Change Snapshots */}
        <div className="flex-1">
          <h3 className="font-semibold text-foreground text-sm mb-3">Available Snapshots ({snapshots.length})</h3>
          <div className="grid grid-cols-2 gap-3 auto-rows-max max-h-96 overflow-y-auto">
            {snapshots.map((snapshot) => (
            <div
              key={snapshot.id}
              className="border border-border rounded-lg overflow-hidden bg-card hover:border-border/80 transition"
            >
              <button
                onClick={() => setExpandedId(expandedId === snapshot.id ? null : snapshot.id)}
                className="w-full p-4 hover:bg-muted/30 transition flex items-start gap-3 text-left"
              >
                {snapshot.status === 'active' ? (
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <RotateCcw className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-foreground truncate">{snapshot.scriptUsed}</p>
                    <span className={`text-xs px-2 py-0.5 rounded font-semibold whitespace-nowrap ${
                      snapshot.status === 'active'
                        ? 'bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-300'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {snapshot.status === 'active' ? '● Active' : '○ Rolled back'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {snapshot.timestamp}
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {snapshot.user}
                    </div>
                    <div className="text-foreground font-medium">{snapshot.objectIds.length} objects</div>
                  </div>
                </div>
              </button>

              {/* Expanded Details */}
              {expandedId === snapshot.id && (
                <div className="p-4 bg-muted/30 border-t border-border space-y-4">
                  {/* Previous Values */}
                  <div>
                    <p className="font-semibold text-foreground text-sm mb-3">Previous Configuration</p>
                    <div className="space-y-2">
                      {Object.entries(snapshot.previousValues).map(([obj, val]) => (
                        <div key={obj} className="p-3 bg-card rounded border border-border text-sm">
                          <p className="font-semibold text-foreground">{obj}</p>
                          <p className="text-xs text-muted-foreground mt-1 font-mono">{val}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Partial Rollback - Object Selection */}
                  {selectedMode === 'partial' && (
                    <div>
                      <p className="font-semibold text-foreground text-sm mb-3">Select Objects to Rollback</p>
                      <div className="space-y-2 bg-card p-3 rounded border border-border">
                        {snapshot.objectIds.map(obj => (
                          <label key={obj} className="flex items-center gap-2 cursor-pointer hover:bg-muted/30 p-2 rounded transition">
                            <input
                              type="checkbox"
                              checked={selectedObjects.has(obj)}
                              onChange={() => toggleObject(obj)}
                              className="w-4 h-4 rounded border-border"
                            />
                            <span className="text-sm text-foreground">{obj}</span>
                          </label>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 font-semibold">{selectedObjects.size} of {snapshot.objectIds.length} selected</p>
                    </div>
                  )}

                  {/* Selective Rollback - Parameter Selection */}
                  {selectedMode === 'selective' && (
                    <div>
                      <p className="font-semibold text-foreground text-sm mb-3">Select Parameters to Rollback</p>
                      <div className="grid grid-cols-2 gap-2 bg-card p-3 rounded border border-border">
                        {PARAMETER_OPTIONS.map(param => (
                          <label key={param} className="flex items-center gap-2 cursor-pointer hover:bg-muted/30 p-2 rounded transition">
                            <input
                              type="checkbox"
                              checked={selectedParameters.has(param)}
                              onChange={() => toggleParameter(param)}
                              className="w-4 h-4 rounded border-border"
                            />
                            <span className="text-sm text-foreground">{param}</span>
                          </label>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 font-semibold">{selectedParameters.size} of {PARAMETER_OPTIONS.length} selected</p>
                    </div>
                  )}

                  {/* Rollback Actions */}
                  {snapshot.status === 'active' && (
                    <div className="flex gap-2 pt-2">
                      {selectedMode === 'full' && (
                        <button
                          onClick={() => executeRollback(snapshot.id, 'Full')}
                          className="flex-1 px-4 py-2.5 bg-orange-600 dark:bg-orange-700 text-white rounded-lg hover:bg-orange-700 dark:hover:bg-orange-600 font-semibold flex items-center justify-center gap-2 transition"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Full Rollback
                        </button>
                      )}

                      {selectedMode === 'partial' && (
                        <button
                          onClick={() => executeRollback(snapshot.id, 'Partial')}
                          disabled={selectedObjects.size === 0}
                          className="flex-1 px-4 py-2.5 bg-orange-600 dark:bg-orange-700 text-white rounded-lg hover:bg-orange-700 dark:hover:bg-orange-600 font-semibold text-sm transition disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
                        >
                          Rollback {selectedObjects.size} Object{selectedObjects.size !== 1 ? 's' : ''}
                        </button>
                      )}

                      {selectedMode === 'selective' && (
                        <button
                          onClick={() => executeRollback(snapshot.id, 'Selective')}
                          disabled={selectedParameters.size === 0}
                          className="flex-1 px-4 py-2.5 bg-orange-600 dark:bg-orange-700 text-white rounded-lg hover:bg-orange-700 dark:hover:bg-orange-600 font-semibold text-sm transition disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
                        >
                          Rollback {selectedParameters.size} Parameter{selectedParameters.size !== 1 ? 's' : ''}
                        </button>
                      )}
                    </div>
                  )}

                  {snapshot.status === 'rolled_back' && (
                    <div className="space-y-3">
                      <div className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-green-800 dark:text-green-300">
                          <p className="font-semibold">Rollback Completed</p>
                          <p className="text-xs mt-0.5">All changes have been reverted. See audit log for details.</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSnapshots(snapshots.map(s =>
                            s.id === snapshot.id ? { ...s, status: 'active' } : s
                          ));
                          setSelectedObjects(new Set());
                          setSelectedParameters(new Set());
                        }}
                        className="w-full px-4 py-2.5 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 font-semibold flex items-center justify-center gap-2 transition"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Perform Another Rollback
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          </div>
        </div>
      </div>

      {/* AUDIT SECTION */}
      <div className="border-t border-border pt-6">
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Audit Log</h2>
            <p className="text-sm text-muted-foreground mt-2">Complete audit trail of all changes with filtering and rollback capabilities</p>
          </div>

          {/* Audit Filters */}
          <div className="grid grid-cols-3 gap-2">
            {/* Site Filter */}
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <SearchableDropdown
                  label="Site"
                  options={SITE_OPTIONS}
                  selected={selectedSite}
                  onChange={setSelectedSite}
                  placeholder="All Sites"
                  multiSelect={false}
                  searchable={true}
                  compact={true}
                />
              </div>
              {selectedSite.length > 0 && (
                <button
                  onClick={() => setSelectedSite([])}
                  className="px-2.5 py-1.5 h-9 bg-red-100 dark:bg-red-950 hover:bg-red-200 dark:hover:bg-red-900 text-red-700 dark:text-red-400 rounded-md transition flex-shrink-0"
                  title="Clear site filter"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Technology Filter */}
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <SearchableDropdown
                  label="Technology"
                  options={TECHNOLOGY_OPTIONS}
                  selected={selectedTechnology}
                  onChange={setSelectedTechnology}
                  placeholder="All Technologies"
                  multiSelect={false}
                  searchable={true}
                  compact={true}
                />
              </div>
              {selectedTechnology.length > 0 && (
                <button
                  onClick={() => setSelectedTechnology([])}
                  className="px-2.5 py-1.5 h-9 bg-red-100 dark:bg-red-950 hover:bg-red-200 dark:hover:bg-red-900 text-red-700 dark:text-red-400 rounded-md transition flex-shrink-0"
                  title="Clear technology filter"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Vendor Filter */}
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <SearchableDropdown
                  label="Vendor"
                  options={VENDOR_OPTIONS}
                  selected={selectedVendor}
                  onChange={setSelectedVendor}
                  placeholder="All Vendors"
                  multiSelect={false}
                  searchable={true}
                  compact={true}
                />
              </div>
              {selectedVendor.length > 0 && (
                <button
                  onClick={() => setSelectedVendor([])}
                  className="px-2.5 py-1.5 h-9 bg-red-100 dark:bg-red-950 hover:bg-red-200 dark:hover:bg-red-900 text-red-700 dark:text-red-400 rounded-md transition flex-shrink-0"
                  title="Clear vendor filter"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Audit Log */}
          <div className="flex-1 overflow-y-auto space-y-2 min-h-64">
            {filteredEntries.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>No audit entries found matching your filters</p>
              </div>
            ) : (
              filteredEntries.map((entry) => (
              <div
                key={entry.id}
                onClick={() => setSelectedEntry(selectedEntry === entry.id ? null : entry.id)}
                className="border border-border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{entry.action}</p>
                    <p className="text-sm text-muted-foreground">{entry.object}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded font-semibold ${
                    entry.status === 'completed' ? 'bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-300' :
                    entry.status === 'failed' ? 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300' :
                    'bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-300'
                  }`}>
                    {entry.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div>{entry.timestamp} • {entry.user}</div>
                  {entry.reversible && (
                    <div className="flex items-center gap-1 text-blue-600">
                      <RotateCcw className="w-3 h-3" />
                      Reversible
                    </div>
                  )}
                </div>

                {selectedEntry === entry.id && (
                  <div className="mt-3 pt-3 border-t border-border space-y-3">
                    <div className="p-3 bg-muted rounded">
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Change Details</p>
                      <p className="text-sm font-mono text-foreground">{entry.changeDetails}</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewFullDetails(entry.id);
                        }}
                        className="flex-1 px-3 py-2 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900 font-semibold text-sm flex items-center justify-center gap-2 transition"
                      >
                        <Eye className="w-4 h-4" />
                        View Full Details
                      </button>
                      {entry.reversible && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAuditRollback(entry.id);
                          }}
                          className="flex-1 px-3 py-2 bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-900 font-semibold text-sm flex items-center justify-center gap-2 transition"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Rollback
                        </button>
                      )}
                    </div>

                    {/* Full Details View */}
                    {detailedViewId === entry.id && (
                      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1">Action</p>
                            <p className="text-sm font-mono text-foreground">{entry.action}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1">Object</p>
                            <p className="text-sm font-mono text-foreground">{entry.object}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1">Site</p>
                            <p className="text-sm font-mono text-foreground">{entry.site}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1">Technology</p>
                            <p className="text-sm font-mono text-foreground">{entry.technology}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1">Vendor</p>
                            <p className="text-sm font-mono text-foreground">{entry.vendor}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1">User</p>
                            <p className="text-sm font-mono text-foreground">{entry.user}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1">Timestamp</p>
                            <p className="text-sm font-mono text-foreground">{entry.timestamp}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1">Status</p>
                            <p className="text-sm font-mono text-foreground capitalize">{entry.status}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-1">Change Details</p>
                          <p className="text-sm font-mono text-foreground bg-background p-2 rounded">{entry.changeDetails}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
            )}
          </div>

          {/* Export */}
          <button className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 font-semibold flex items-center justify-center gap-2 transition">
            <Download className="w-4 h-4" />
            Export Audit Log
          </button>
        </div>
      </div>
    </div>
  );
};
