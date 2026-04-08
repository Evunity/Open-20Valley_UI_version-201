import React, { useState, useRef } from 'react';
import { RotateCcw, Eye, Download, X, ChevronDown } from 'lucide-react';
import SearchableDropdown from './SearchableDropdown';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';

interface RollbackAuditCombinedProps {
  selectedTarget: any;
  onTargetChange: (target: any) => void;
}

interface ChangeSnapshot {
  id: string;
  timestamp: string;
  user: string;
  scriptUsed: string;
  objectConfigs: Array<{
    objectId: string;
    parameters: Array<{
      parameter: string;
      currentValue: string;
      previousValue: string;
    }>;
  }>;
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
    objectConfigs: [
      {
        objectId: 'Cairo-Site-1',
        parameters: [
          { parameter: 'TX Power', currentValue: '40 dBm', previousValue: '43 dBm' },
          { parameter: 'DL Bandwidth', currentValue: '25 MHz', previousValue: '20 MHz' },
          { parameter: 'VLAN ID', currentValue: '110', previousValue: '100' }
        ]
      },
      {
        objectId: 'Cairo-Site-2',
        parameters: [
          { parameter: 'IP Address', currentValue: '192.168.1.210', previousValue: '192.168.1.101' },
          { parameter: 'VLAN ID', currentValue: '111', previousValue: '101' },
          { parameter: 'DL Bandwidth', currentValue: '25 MHz', previousValue: '20 MHz' }
        ]
      },
      {
        objectId: 'Cairo-Site-3',
        parameters: [
          { parameter: 'Cell Barring', currentValue: 'True', previousValue: 'False' },
          { parameter: 'VLAN ID', currentValue: '112', previousValue: '102' }
        ]
      }
    ],
    status: 'active',
    rollbackableItems: 3
  },
  {
    id: 'snap_002',
    timestamp: '2024-12-02 13:45:22',
    user: 'Engineer.B',
    scriptUsed: 'DL Bandwidth Optimization',
    objectConfigs: [
      {
        objectId: 'Alexandria-Site-1',
        parameters: [
          { parameter: 'DL Bandwidth', currentValue: '25 MHz', previousValue: '20 MHz' },
          { parameter: 'TX Power', currentValue: '38 dBm', previousValue: '40 dBm' }
        ]
      },
      {
        objectId: 'Alexandria-Site-2',
        parameters: [
          { parameter: 'DL Bandwidth', currentValue: '25 MHz', previousValue: '20 MHz' },
          { parameter: 'IP Address', currentValue: '192.168.2.151', previousValue: '192.168.2.101' }
        ]
      },
      {
        objectId: 'Suez-Site-1',
        parameters: [
          { parameter: 'VLAN ID', currentValue: '208', previousValue: '202' },
          { parameter: 'Cell Barring', currentValue: 'True', previousValue: 'False' }
        ]
      }
    ],
    status: 'active',
    rollbackableItems: 3
  },
  {
    id: 'snap_003',
    timestamp: '2024-12-02 12:10:45',
    user: 'Engineer.C',
    scriptUsed: 'TX Power Adjustment for Peak Hours',
    objectConfigs: [
      {
        objectId: 'Dubai-Site-1',
        parameters: [
          { parameter: 'TX Power', currentValue: '40 dBm', previousValue: '43 dBm' },
          { parameter: 'VLAN ID', currentValue: '309', previousValue: '300' }
        ]
      },
      {
        objectId: 'Dubai-Site-2',
        parameters: [
          { parameter: 'TX Power', currentValue: '40 dBm', previousValue: '43 dBm' },
          { parameter: 'IP Address', currentValue: '192.168.3.199', previousValue: '192.168.3.101' }
        ]
      }
    ],
    status: 'active',
    rollbackableItems: 2
  },
  {
    id: 'snap_004',
    timestamp: '2024-12-02 11:20:30',
    user: 'System',
    scriptUsed: 'Auto Emergency Recovery',
    objectConfigs: [],
    status: 'rolled_back',
    rollbackableItems: 0
  },
  {
    id: 'snap_005',
    timestamp: '2024-12-02 10:15:45',
    user: 'Engineer.D',
    scriptUsed: 'Multi-Parameter Cell Configuration',
    objectConfigs: [
      {
        objectId: 'Dammam-Site-1',
        parameters: [
          { parameter: 'VLAN ID', currentValue: '550', previousValue: '500' },
          { parameter: 'IP Address', currentValue: '192.168.5.150', previousValue: '192.168.5.100' }
        ]
      },
      {
        objectId: 'Khobar-Site-1',
        parameters: [
          { parameter: 'DL Bandwidth', currentValue: '20 MHz', previousValue: '15 MHz' },
          { parameter: 'Cell Barring', currentValue: 'False', previousValue: 'True' }
        ]
      }
    ],
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
  const selectionBadgeClassName =
    'inline-flex min-h-6 items-center justify-center whitespace-nowrap rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground';

  const [snapshots, setSnapshots] = useState<ChangeSnapshot[]>(MOCK_SNAPSHOTS);
  const [selectedMode, setSelectedMode] = useState<'full' | 'targeted'>('targeted');
  const [selectedSnapshots, setSelectedSnapshots] = useState<Set<string>>(new Set());
  const [selectedObjects, setSelectedObjects] = useState<Set<string>>(new Set());
  const [selectedParameters, setSelectedParameters] = useState<Set<string>>(new Set());

  // Audit state
  const [entries, setEntries] = useState<AuditEntry[]>(MOCK_AUDIT);
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);
  const [detailedViewId, setDetailedViewId] = useState<string | null>(null);
  const [selectedSite, setSelectedSite] = useState<string[]>([]);
  const [selectedTechnology, setSelectedTechnology] = useState<string[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<string[]>([]);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  const handleModeChange = (mode: 'full' | 'targeted') => {
    setSelectedMode(mode);
    setSelectedObjects(new Set());
    setSelectedParameters(new Set());
  };

  const toggleSnapshot = (snapshotId: string) => {
    const updated = new Set(selectedSnapshots);
    if (updated.has(snapshotId)) {
      updated.delete(snapshotId);
    } else {
      updated.add(snapshotId);
    }
    setSelectedSnapshots(updated);
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

  const activeSelectedSnapshots = snapshots.filter(
    (snapshot) => selectedSnapshots.has(snapshot.id) && snapshot.status === 'active'
  );
  const availableObjects = Array.from(
    new Set(activeSelectedSnapshots.flatMap((snapshot) => snapshot.objectConfigs.map((objectConfig) => objectConfig.objectId)))
  );
  const availableParameters = Array.from(
    new Set(
      activeSelectedSnapshots.flatMap((snapshot) =>
        snapshot.objectConfigs.flatMap((objectConfig) => objectConfig.parameters.map((parameter) => parameter.parameter))
      )
    )
  );

  const comparisonRows = activeSelectedSnapshots.flatMap((snapshot) =>
    snapshot.objectConfigs.flatMap((objectConfig) =>
      objectConfig.parameters
        .filter((parameter) => selectedMode === 'full' || selectedParameters.has(parameter.parameter))
        .filter(() => selectedMode === 'full' || selectedObjects.has(objectConfig.objectId))
        .map((parameter) => ({
          snapshotId: snapshot.id,
          object: objectConfig.objectId,
          parameter: parameter.parameter,
          currentValue: parameter.currentValue,
          previousValue: parameter.previousValue
        }))
    )
  );

  const isTargetedSelectionValid =
    selectedSnapshots.size > 0 && selectedObjects.size > 0 && selectedParameters.size > 0;
  const isFullSelectionValid = selectedSnapshots.size > 0;
  const canExecuteRollback = selectedMode === 'full' ? isFullSelectionValid : isTargetedSelectionValid;

  const executeRollback = () => {
    if (selectedSnapshots.size === 0) {
      alert('Please select at least one snapshot');
      return;
    }
    if (selectedMode === 'targeted' && selectedObjects.size === 0) {
      alert('Please select at least one object to rollback');
      return;
    }
    if (selectedMode === 'targeted' && selectedParameters.size === 0) {
      alert('Please select at least one parameter to rollback');
      return;
    }
    setSnapshots(snapshots.map((snapshot) => (selectedSnapshots.has(snapshot.id) ? { ...snapshot, status: 'rolled_back' } : snapshot)));
    setSelectedObjects(new Set());
    setSelectedParameters(new Set());
    setSelectedSnapshots(new Set());
    if (selectedMode === 'targeted') {
      alert(`Targeted rollback executed for ${selectedObjects.size} object(s) and ${selectedParameters.size} parameter(s).`);
      return;
    }
    alert('Full rollback executed for selected snapshot(s).');
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

  const exportToCSV = () => {
    if (filteredEntries.length === 0) {
      alert('No audit entries to export');
      return;
    }

    const csvData = filteredEntries.map(entry => ({
      'Timestamp': entry.timestamp,
      'User': entry.user,
      'Action': entry.action,
      'Object': entry.object,
      'Site': entry.site,
      'Technology': entry.technology,
      'Vendor': entry.vendor,
      'Status': entry.status,
      'Change Details': entry.changeDetails,
      'Reversible': entry.reversible ? 'Yes' : 'No'
    }));

    const headers = Object.keys(csvData[0]);
    const rows = csvData.map(obj => headers.map(header => {
      const value = obj[header as keyof typeof obj];
      const stringValue = String(value);
      return stringValue.includes(',') ? `"${stringValue.replace(/"/g, '""')}"` : stringValue;
    }));

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const link = document.createElement('a');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `audit_log_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  const exportToExcel = () => {
    if (filteredEntries.length === 0) {
      alert('No audit entries to export');
      return;
    }

    const excelData = filteredEntries.map(entry => ({
      'Timestamp': entry.timestamp,
      'User': entry.user,
      'Action': entry.action,
      'Object': entry.object,
      'Site': entry.site,
      'Technology': entry.technology,
      'Vendor': entry.vendor,
      'Status': entry.status,
      'Change Details': entry.changeDetails,
      'Reversible': entry.reversible ? 'Yes' : 'No'
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Audit Log');

    // Style header row
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_col(C) + '1';
      if (!worksheet[address]) continue;
      worksheet[address].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '4F46E5' } },
        alignment: { horizontal: 'center' }
      };
    }

    // Set column widths
    const colWidths = Array(10).fill({ wch: 18 });
    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, `audit_log_${new Date().toISOString().split('T')[0]}.xlsx`);
    setShowExportMenu(false);
  };

  React.useEffect(() => {
    if (!showExportMenu) return;

    const handlePointerDownOutside = (event: MouseEvent) => {
      if (!exportMenuRef.current?.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDownOutside);
    return () => document.removeEventListener('mousedown', handlePointerDownOutside);
  }, [showExportMenu]);

  return (
    <div className="flex flex-col h-full gap-6 p-6">
      {/* ROLLBACK SECTION */}
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="mb-2">
          <h2 className="text-2xl font-bold text-foreground">Rollback Management</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Execute safe production rollback with full or targeted scope and explicit Current vs Previous parameter comparison.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <h3 className="font-semibold text-foreground">1) Rollback Mode</h3>
            <div className="space-y-2">
              {[
                { mode: 'targeted' as const, label: 'Targeted Rollback', description: 'Rollback selected objects and selected parameters only.' },
                { mode: 'full' as const, label: 'Full Rollback', description: 'Rollback every changed object and parameter in selected snapshot(s).' }
              ].map((option) => (
                <button
                  key={option.mode}
                  onClick={() => handleModeChange(option.mode)}
                  className={cn(
                    'w-full text-left p-4 rounded-xl border transition-all duration-200',
                    selectedMode === option.mode
                      ? 'border-primary/90 bg-primary/15 shadow-[0_0_0_1px_hsl(var(--primary)/0.35)]'
                      : 'border-border bg-card hover:border-primary/40 hover:bg-muted/20'
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-sm text-foreground">{option.label}</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{option.description}</p>
                    </div>
                    {selectedMode === option.mode && (
                      <span className={selectionBadgeClassName}>
                        SELECTED
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <h3 className="font-semibold text-foreground">2) Select Snapshot(s)</h3>
            <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
              {snapshots.map((snapshot) => (
                <label
                  key={snapshot.id}
                  className={cn(
                    'block border rounded-xl p-4 cursor-pointer transition-all duration-200',
                    selectedSnapshots.has(snapshot.id)
                      ? 'border-primary/90 bg-primary/15 shadow-[0_0_0_1px_hsl(var(--primary)/0.35)]'
                      : 'border-border bg-card hover:border-primary/40 hover:bg-muted/20',
                    snapshot.status === 'rolled_back' && 'opacity-60'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedSnapshots.has(snapshot.id)}
                      disabled={snapshot.status !== 'active'}
                      onChange={() => toggleSnapshot(snapshot.id)}
                      className="mt-1 h-4 w-4"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-foreground truncate">{snapshot.scriptUsed}</p>
                        {selectedSnapshots.has(snapshot.id) && (
                          <span className={selectionBadgeClassName}>
                            SELECTED
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{snapshot.id} • {snapshot.timestamp}</p>
                      <p className="text-xs text-muted-foreground mt-2">{snapshot.rollbackableItems} rollbackable objects</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-4 space-y-4">
            <h3 className="font-semibold text-foreground">3) Scope Selection</h3>
            <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
              <p className="text-xs font-semibold text-foreground">Guidance</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Choose one or more objects and one or more parameters. Example: rollback <span className="font-medium text-foreground">VLAN ID</span> only for <span className="font-medium text-foreground">Cairo-Site-2</span>.
              </p>
            </div>

            <div className="rounded-lg border border-border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Objects</p>
                <span className="text-xs font-semibold text-foreground">{selectedObjects.size} selected</span>
              </div>
              <div className="max-h-28 overflow-y-auto space-y-2 pr-1">
                {availableObjects.map((obj) => {
                  const checked = selectedObjects.has(obj);
                  return (
                    <label
                      key={obj}
                      className={cn(
                        'flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm cursor-pointer transition',
                        checked ? 'border-primary/70 bg-primary/10 text-foreground' : 'border-border/70 hover:border-primary/40 hover:bg-muted/40',
                        selectedMode === 'full' && 'opacity-60 cursor-not-allowed'
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleObject(obj)}
                        disabled={selectedMode === 'full'}
                        className="h-4 w-4"
                      />
                      <span className="font-medium">{obj}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="rounded-lg border border-border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Parameters</p>
                <span className="text-xs font-semibold text-foreground">{selectedParameters.size} selected</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {(availableParameters.length ? availableParameters : PARAMETER_OPTIONS).map((param) => {
                  const checked = selectedParameters.has(param);
                  return (
                    <label
                      key={param}
                      className={cn(
                        'flex items-center gap-3 rounded-lg border px-3 py-2.5 text-xs cursor-pointer transition',
                        checked ? 'border-primary/70 bg-primary/10 text-foreground' : 'border-border/70 hover:border-primary/40 hover:bg-muted/40',
                        selectedMode === 'full' && 'opacity-60 cursor-not-allowed'
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleParameter(param)}
                        disabled={selectedMode === 'full'}
                        className="h-4 w-4"
                      />
                      <span className="font-medium">{param}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Current Selection Summary</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-md border border-border/80 bg-card px-2.5 py-2">
                  <p className="text-muted-foreground">Objects</p>
                  <p className="font-semibold text-foreground mt-0.5">{selectedObjects.size}</p>
                </div>
                <div className="rounded-md border border-border/80 bg-card px-2.5 py-2">
                  <p className="text-muted-foreground">Parameters</p>
                  <p className="font-semibold text-foreground mt-0.5">{selectedParameters.size}</p>
                </div>
                <div className="rounded-md border border-border/80 bg-card px-2.5 py-2 col-span-2">
                  <p className="text-muted-foreground">Rollback scope count</p>
                  <p className="font-semibold text-foreground mt-0.5">{comparisonRows.length} parameter changes in preview</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">4) Configuration Comparison & Rollback Preview</h3>
            <span className="text-xs font-semibold text-muted-foreground">
              Previewing {comparisonRows.length} parameter change{comparisonRows.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="overflow-auto border border-border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="text-left px-3 py-2">Snapshot</th>
                  <th className="text-left px-3 py-2">Object</th>
                  <th className="text-left px-3 py-2">Parameter</th>
                  <th className="text-left px-3 py-2">Current value</th>
                  <th className="text-left px-3 py-2">Previous value</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.length > 0 ? comparisonRows.map((row, index) => (
                  <tr key={`${row.snapshotId}-${row.object}-${row.parameter}-${index}`} className="border-t border-border">
                    <td className="px-3 py-2 font-mono text-xs">{row.snapshotId}</td>
                    <td className="px-3 py-2">{row.object}</td>
                    <td className="px-3 py-2">{row.parameter}</td>
                    <td className="px-3 py-2 text-red-600 dark:text-red-400">{row.currentValue}</td>
                    <td className="px-3 py-2 text-green-700 dark:text-green-400">{row.previousValue}</td>
                  </tr>
                )) : (
                  <tr>
                    <td className="px-3 py-6 text-center text-muted-foreground" colSpan={5}>
                      Select snapshot(s) and scope to preview rollback changes.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              Execution applies only to the selected snapshot(s), selected objects, and selected parameters.
            </p>
            <button
              onClick={executeRollback}
              disabled={!canExecuteRollback}
              className="px-4 py-2.5 bg-orange-600 dark:bg-orange-700 text-white rounded-lg hover:bg-orange-700 dark:hover:bg-orange-600 font-semibold flex items-center justify-center gap-2 transition disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
            >
              <RotateCcw className="w-4 h-4" />
              Execute {selectedMode === 'full' ? 'Full' : 'Targeted'} Rollback
            </button>
          </div>
        </div>
      </div>

      {/* AUDIT SECTION */}
      <div className="border-t border-border pt-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Audit Log</h2>
              <p className="text-sm text-muted-foreground mt-2">Complete audit trail of all changes with filtering and rollback capabilities</p>
            </div>
            {/* Export Menu */}
            <div ref={exportMenuRef} className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="px-3 py-1.5 bg-green-600/10 hover:bg-green-600/20 border border-green-600/30 rounded-lg text-green-700 dark:text-green-400 font-semibold text-xs transition flex items-center gap-1 whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" />
                Export
                <ChevronDown className={cn("w-3 h-3 transition-transform", showExportMenu && "rotate-180")} />
              </button>

              {/* Export Menu Dropdown */}
              {showExportMenu && (
                <div className="absolute top-full right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden min-w-[140px]">
                  <button
                    onClick={exportToCSV}
                    className="w-full px-3 py-2 text-left text-xs font-medium text-foreground hover:bg-muted transition-colors border-b border-border/50"
                  >
                    Export CSV
                  </button>
                  <button
                    onClick={exportToExcel}
                    className="w-full px-3 py-2 text-left text-xs font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    Export Excel
                  </button>
                </div>
              )}
            </div>
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
        </div>
      </div>
    </div>
  );
};
