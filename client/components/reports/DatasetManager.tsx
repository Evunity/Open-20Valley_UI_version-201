import { Database, Shield, Clock, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Dataset {
  id: string;
  name: string;
  sourceModules: string[];
  aggregationLogic: string;
  timeAlignment: string;
  tenantScope: string;
  owner: string;
  certificationStatus: 'certified' | 'pending' | 'expired';
  refreshSLA: string;
  lastRefresh: string;
  recordCount: number;
}

export default function DatasetManager() {
  const datasets: Dataset[] = [
    {
      id: '1',
      name: 'Transport KPI Dataset',
      sourceModules: ['Topology', 'Alarms', 'Analytics'],
      aggregationLogic: 'SUM(throughput) by hour',
      timeAlignment: 'Hourly buckets',
      tenantScope: 'All regions',
      owner: 'Transport Team',
      certificationStatus: 'certified',
      refreshSLA: '15 minutes',
      lastRefresh: '2 min ago',
      recordCount: 145230
    },
    {
      id: '2',
      name: 'RF Parameters Snapshot',
      sourceModules: ['Command Center', 'Analytics'],
      aggregationLogic: 'LAST_VALUE(parameter) by cell_id',
      timeAlignment: 'Real-time',
      tenantScope: 'Region: Cairo, Alexandria',
      owner: 'RF Engineering',
      certificationStatus: 'certified',
      refreshSLA: '5 minutes',
      lastRefresh: '1 min ago',
      recordCount: 892456
    },
    {
      id: '3',
      name: 'Revenue Report Dataset',
      sourceModules: ['Billing', 'Analytics'],
      aggregationLogic: 'SUM(revenue) by product_line, month',
      timeAlignment: 'Monthly',
      tenantScope: 'Enterprise-wide',
      owner: 'Finance',
      certificationStatus: 'pending',
      refreshSLA: '1 hour',
      lastRefresh: '45 min ago',
      recordCount: 23451
    },
    {
      id: '4',
      name: 'Compliance Events Log',
      sourceModules: ['Audit', 'Command Center', 'Automation'],
      aggregationLogic: 'APPEND_ONLY (immutable)',
      timeAlignment: 'Real-time events',
      tenantScope: 'All tenants',
      owner: 'Compliance Officer',
      certificationStatus: 'certified',
      refreshSLA: 'Streaming',
      lastRefresh: 'Streaming',
      recordCount: 1245829
    }
  ];

  const getCertificationBadge = (status: Dataset['certificationStatus']) => {
    switch (status) {
      case 'certified':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-700">
          <CheckCircle className="w-3 h-3" /> Certified
        </span>;
      case 'pending':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-500/10 text-yellow-700">
          <AlertCircle className="w-3 h-3" /> Pending
        </span>;
      case 'expired':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-700">
          <AlertCircle className="w-3 h-3" /> Expired
        </span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Architectural Principle */}
      <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6">
        <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
          <Shield className="w-5 h-5 text-red-600" />
          Prevent Schema Chaos at All Costs
        </h3>
        <p className="text-sm text-muted-foreground">
          Conflicting numbers destroy executive trust faster than outages. All reports must be built on governed datasets—never raw tables.
        </p>
      </div>

      {/* Dataset Inventory */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-foreground">Dataset Inventory</h3>
          <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium">
            + Create Dataset
          </button>
        </div>

        <div className="space-y-4">
          {datasets.map(dataset => (
            <div
              key={dataset.id}
              className="rounded-xl border border-border/50 p-6 bg-card/50 hover:border-primary/30 transition-all cursor-pointer group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <Database className="w-5 h-5 text-blue-600" />
                    <h4 className="font-bold text-foreground">{dataset.name}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">ID: {dataset.id}</p>
                </div>
                {getCertificationBadge(dataset.certificationStatus)}
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {/* Source Modules */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Source Modules</p>
                  <div className="flex flex-wrap gap-1">
                    {dataset.sourceModules.map((module, idx) => (
                      <span key={idx} className="inline-block px-2 py-1 bg-muted rounded text-xs text-foreground">
                        {module}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Aggregation Logic */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Aggregation Logic</p>
                  <p className="text-sm text-foreground font-mono bg-muted/50 px-2 py-1 rounded">
                    {dataset.aggregationLogic}
                  </p>
                </div>

                {/* Time Alignment */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Time Alignment</p>
                  <p className="text-sm text-foreground">{dataset.timeAlignment}</p>
                </div>

                {/* Tenant Scope */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Tenant Scope</p>
                  <p className="text-sm text-foreground">{dataset.tenantScope}</p>
                </div>

                {/* Owner */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Owner</p>
                  <div className="flex items-center gap-2">
                    <Users className="w-3 h-3 text-muted-foreground" />
                    <p className="text-sm text-foreground">{dataset.owner}</p>
                  </div>
                </div>

                {/* Refresh SLA */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Refresh SLA</p>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-blue-600" />
                    <p className="text-sm text-foreground">{dataset.refreshSLA}</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <div className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{dataset.recordCount.toLocaleString()}</span> records
                  <span className="mx-2">•</span>
                  Last refresh: {dataset.lastRefresh}
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="px-3 py-1 rounded text-xs bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                    View Schema
                  </button>
                  <button className="px-3 py-1 rounded text-xs bg-muted hover:bg-muted/70 transition-colors">
                    Lineage
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data Lineage Section */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Dataset Lineage & Dependencies</h3>
        <div className="bg-muted/30 p-4 rounded-lg border border-border/30 font-mono text-xs text-muted-foreground whitespace-pre-wrap">
{`Transport KPI Dataset
├── Source: Topology Module (cell definitions)
├── Source: Alarms Module (alarm_count aggregation)
├── Source: Analytics Module (computed metrics)
└── Downstream: Transport Dashboard, SLA Reports

RF Parameters Snapshot
├── Source: Command Center (parameter values)
├── Source: Analytics Module (validation rules)
└── Downstream: RF Optimization Reports, Compliance Audits

Revenue Report Dataset
├── Source: Billing System
├── Source: Product Master (external)
└── Downstream: Executive Dashboard, Financial Statements`}
        </div>
      </div>

      {/* Data Quality Rules */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Quality Assurance Rules</h3>
        <div className="space-y-3">
          <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
            <p className="text-sm font-semibold text-foreground mb-2">Completeness Check</p>
            <p className="text-xs text-muted-foreground">All datasets must have &lt;1% null values in key columns</p>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
            <p className="text-sm font-semibold text-foreground mb-2">Freshness SLA Enforcement</p>
            <p className="text-xs text-muted-foreground">Alert if any dataset exceeds its refresh SLA window</p>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
            <p className="text-sm font-semibold text-foreground mb-2">Cardinality Drift Detection</p>
            <p className="text-xs text-muted-foreground">Detect unexpected changes in unique value counts (+/- 10%)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
