import { Library, GitBranch, Eye, Download, Share2, Trash2 } from 'lucide-react';

interface Report {
  id: string;
  title: string;
  category: string;
  owner: string;
  created: string;
  versions: number;
  downloads: number;
  status: 'published' | 'draft' | 'archived';
}

export default function ReportLibraryModule() {
  const reports: Report[] = [
    {
      id: '1',
      title: 'Transport Network KPI Summary',
      category: 'Network Operations',
      owner: 'Transport Team',
      created: '2024-01-15',
      versions: 8,
      downloads: 124,
      status: 'published'
    },
    {
      id: '2',
      title: 'RF Performance Analysis',
      category: 'Engineering',
      owner: 'RF Team',
      created: '2024-02-10',
      versions: 5,
      downloads: 89,
      status: 'published'
    },
    {
      id: '3',
      title: 'Executive Dashboard - Monthly',
      category: 'Executive',
      owner: 'BI Team',
      created: '2024-03-01',
      versions: 3,
      downloads: 45,
      status: 'published'
    },
    {
      id: '4',
      title: 'Revenue Growth Forecast',
      category: 'Finance',
      owner: 'Finance',
      created: '2024-03-10',
      versions: 2,
      downloads: 12,
      status: 'draft'
    }
  ];

  const getStatusColor = (status: Report['status']) => {
    switch (status) {
      case 'published': return 'bg-green-500/10 text-green-700';
      case 'draft': return 'bg-blue-500/10 text-blue-700';
      case 'archived': return 'bg-gray-500/10 text-gray-700';
    }
  };

  return (
    <div className="space-y-8">
      {/* Library Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border/50 p-4 bg-card/50">
          <p className="text-sm text-muted-foreground mb-1">Total Reports</p>
          <p className="text-3xl font-bold text-foreground">128</p>
          <p className="text-xs text-muted-foreground mt-2">Published & Active</p>
        </div>
        <div className="rounded-xl border border-border/50 p-4 bg-card/50">
          <p className="text-sm text-muted-foreground mb-1">Total Downloads</p>
          <p className="text-3xl font-bold text-foreground">2.4K</p>
          <p className="text-xs text-muted-foreground mt-2">Last 30 days</p>
        </div>
        <div className="rounded-xl border border-border/50 p-4 bg-card/50">
          <p className="text-sm text-muted-foreground mb-1">Version Control</p>
          <p className="text-3xl font-bold text-foreground">436</p>
          <p className="text-xs text-muted-foreground mt-2">Total versions tracked</p>
        </div>
        <div className="rounded-xl border border-border/50 p-4 bg-card/50">
          <p className="text-sm text-muted-foreground mb-1">Draft Reports</p>
          <p className="text-3xl font-bold text-foreground">12</p>
          <p className="text-xs text-muted-foreground mt-2">Waiting for approval</p>
        </div>
      </div>

      {/* Report Catalog */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <Library className="w-5 h-5 text-blue-600" />
            Report Catalog
          </h3>
          <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium">
            + New Report
          </button>
        </div>

        <div className="space-y-3">
          {reports.map(report => (
            <div
              key={report.id}
              className="rounded-xl border border-border/50 p-4 bg-card/50 hover:border-primary/30 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-foreground">{report.title}</h4>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{report.category}</span>
                    <span>•</span>
                    <span>Owner: {report.owner}</span>
                    <span>•</span>
                    <span>Created: {report.created}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border/50">
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <GitBranch className="w-3 h-3" />
                    <span>{report.versions} versions</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Download className="w-3 h-3" />
                    <span>{report.downloads} downloads</span>
                  </div>
                </div>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 rounded-lg hover:bg-muted transition-colors" title="Preview">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-muted transition-colors" title="Download">
                    <Download className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-muted transition-colors" title="Share">
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-red-500/10 text-red-600 transition-colors" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Version Control */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-purple-600" />
          Version Control & Lineage
        </h3>

        <div className="space-y-4">
          <div className="bg-muted/30 p-4 rounded-lg border border-border/30">
            <h4 className="text-sm font-semibold text-foreground mb-3">Transport Network KPI Summary - Version History</h4>
            <div className="space-y-2 font-mono text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>v8 (Current)</span>
                <span className="ml-auto">2024-03-10 - Add RF metrics and SLA tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <span>•</span>
                <span>v7</span>
                <span className="ml-auto">2024-03-01 - Refactor transport aggregation logic</span>
              </div>
              <div className="flex items-center gap-2">
                <span>•</span>
                <span>v6</span>
                <span className="ml-auto">2024-02-20 - Update data source to new Analytics module</span>
              </div>
              <div className="flex items-center gap-2">
                <span>•</span>
                <span>v5</span>
                <span className="ml-auto">2024-02-10 - Add temporal alignment for hourly buckets</span>
              </div>
            </div>
          </div>

          <div className="bg-muted/30 p-4 rounded-lg border border-border/30">
            <p className="text-sm font-semibold text-foreground mb-2">Lineage Dependencies</p>
            <code className="block text-xs text-muted-foreground whitespace-pre-wrap font-mono">
{`Transport Network KPI Summary (v8)
├── Data Sources:
│   ├── Transport KPI Dataset (certified)
│   ├── Topology Module (network cells)
│   └── Alarms Module (incident count)
├── Transformations:
│   ├── Hourly aggregation
│   ├── Multi-region rollup
│   └── SLA compliance calculation
└── Downstream Consumers:
    ├── Executive Dashboard
    └── Transport Capacity Planning`}
            </code>
          </div>
        </div>
      </div>

      {/* Sharing & Permissions */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Sharing & Access Control</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Control who can view, edit, and distribute each report:
        </p>
        <div className="space-y-3">
          <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
            <p className="text-sm font-semibold text-foreground mb-2">Executive Dashboard</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>View: Finance Team (5 users)</span>
                <span className="text-xs bg-green-500/10 text-green-700 px-2 py-1 rounded">Can Download</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Edit: BI Team (2 users)</span>
                <span className="text-xs bg-blue-500/10 text-blue-700 px-2 py-1 rounded">Can Modify</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Distribute: Marketing (automatic)</span>
                <span className="text-xs bg-purple-500/10 text-purple-700 px-2 py-1 rounded">Can Share</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
