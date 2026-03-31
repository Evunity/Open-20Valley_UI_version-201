import React, { useState } from 'react';
import { RotateCcw, Eye, Download, X } from 'lucide-react';
import SearchableDropdown from './SearchableDropdown';

interface AuditRollbackCenterProps {
  selectedTarget: any;
  onTargetChange: (target: any) => void;
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

const SITE_OPTIONS = ['Cairo-Site-1', 'Cairo-Site-2', 'Cairo-Site-3', 'Giza-Site-1', 'Giza-Site-2', 'Alexandria-Site-1', 'Suez-Site-1'];
const TECHNOLOGY_OPTIONS = ['2G', '3G', '4G', '5G', 'O-RAN'];
const VENDOR_OPTIONS = ['Huawei', 'Ericsson', 'Nokia', 'ZTE'];

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

export const AuditRollbackCenter: React.FC<AuditRollbackCenterProps> = () => {
  const [entries, setEntries] = useState<AuditEntry[]>(MOCK_AUDIT);
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);
  const [detailedViewId, setDetailedViewId] = useState<string | null>(null);
  const [selectedSite, setSelectedSite] = useState<string[]>([]);
  const [selectedTechnology, setSelectedTechnology] = useState<string[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<string[]>([]);

  const filteredEntries = entries.filter(entry => {
    const siteMatch = !selectedSite.length || entry.site === selectedSite[0];
    const techMatch = !selectedTechnology.length || entry.technology === selectedTechnology[0];
    const vendorMatch = !selectedVendor.length || entry.vendor === selectedVendor[0];
    return siteMatch && techMatch && vendorMatch;
  });

  const handleViewFullDetails = (entryId: string) => {
    setDetailedViewId(detailedViewId === entryId ? null : entryId);
  };

  const handleRollback = (entryId: string) => {
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
    <div className="flex flex-col h-full gap-4 p-4">
      {/* Filters */}
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
      <div className="flex-1 overflow-y-auto space-y-2 min-h-96">
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
                        handleRollback(entry.id);
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
  );
};
