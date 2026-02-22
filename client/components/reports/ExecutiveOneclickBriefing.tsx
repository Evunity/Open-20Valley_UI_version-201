import { Zap, Plus, Copy, Download, Share2 } from 'lucide-react';

export default function ExecutiveOneclickBriefing() {
  const briefingTemplates = [
    {
      name: 'Network Health Summary',
      description: 'Real-time system status for C-level decision making',
      generationTime: '3 seconds',
      sections: 5,
      icon: '🏥'
    },
    {
      name: 'Financial Impact Report',
      description: 'Revenue, costs, and ROI analysis with trending',
      generationTime: '4 seconds',
      sections: 4,
      icon: '💰'
    },
    {
      name: 'Incident & Recovery',
      description: 'Critical events, resolution, and lessons learned',
      generationTime: '2 seconds',
      sections: 4,
      icon: '🚨'
    },
    {
      name: 'Vendor Performance',
      description: 'Equipment and partner scorecard',
      generationTime: '5 seconds',
      sections: 6,
      icon: '⭐'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-8">
        <h3 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Zap className="w-6 h-6 text-purple-600" />
          Executive One-Click Briefing
        </h3>
        <p className="text-muted-foreground">
          Generate board-ready summaries in seconds. Customizable with any combination of reports and datasets.
        </p>
      </div>

      {/* Quick Generate */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Generate Briefing Now</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {briefingTemplates.map((template, idx) => (
            <button
              key={idx}
              className="group p-6 rounded-xl border border-border/50 hover:border-purple-500/50 hover:bg-muted/50 transition-all text-left"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{template.icon}</span>
                <Zap className="w-4 h-4 text-yellow-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h4 className="font-bold text-foreground mb-1">{template.name}</h4>
              <p className="text-xs text-muted-foreground mb-3">{template.description}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{template.generationTime} to generate</span>
                <span>•</span>
                <span>{template.sections} sections</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Briefing Builder */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Custom Briefing Composer
        </h3>

        <p className="text-sm text-muted-foreground mb-4">
          Select any combination of reports to create a custom executive briefing:
        </p>

        <div className="space-y-4">
          {/* Report Selection */}
          <div>
            <label className="text-sm font-semibold text-foreground block mb-2">Select Reports</label>
            <div className="space-y-2">
              {[
                { name: 'Daily Transport KPI', selected: true },
                { name: 'Executive Dashboard', selected: true },
                { name: 'Automation ROI', selected: false },
                { name: 'SLA Compliance', selected: false },
                { name: 'Vendor Performance', selected: false },
                { name: 'Revenue Impact', selected: false }
              ].map((report, idx) => (
                <label key={idx} className="flex items-center gap-3 p-2 cursor-pointer hover:bg-muted/30 rounded transition-colors">
                  <input type="checkbox" defaultChecked={report.selected} />
                  <span className="text-sm text-foreground">{report.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Layout */}
          <div>
            <label className="text-sm font-semibold text-foreground block mb-2">Layout Style</label>
            <select className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm">
              <option>Concise (1-2 pages, exec summary)</option>
              <option>Standard (2-3 pages, key metrics + narrative)</option>
              <option>Detailed (3-5 pages, full analysis)</option>
              <option>Deep Dive (5+ pages, with appendix)</option>
            </select>
          </div>

          {/* Format */}
          <div>
            <label className="text-sm font-semibold text-foreground block mb-2">Output Format</label>
            <select className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm">
              <option>PDF (Print-optimized)</option>
              <option>HTML (Interactive)</option>
              <option>Markdown (For import)</option>
            </select>
          </div>
        </div>

        <button className="w-full mt-6 px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-bold flex items-center justify-center gap-2">
          <Zap className="w-5 h-5" />
          Generate Custom Briefing (Estimated: 3 seconds)
        </button>
      </div>

      {/* Recent Briefings */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Recent Briefings Generated</h3>

        <div className="space-y-3">
          {[
            { name: 'Morning Executive Briefing', created: '2 hours ago', reports: 3, pages: 2 },
            { name: 'Board Preparation - Network Status', created: '1 day ago', reports: 5, pages: 4 },
            { name: 'Vendor Review Summary', created: '2 days ago', reports: 2, pages: 3 },
            { name: 'Incident Post-Mortem Brief', created: '3 days ago', reports: 4, pages: 2 }
          ].map((briefing, idx) => (
            <div key={idx} className="p-4 bg-muted/30 rounded-lg border border-border/30 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">{briefing.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Created {briefing.created} • {briefing.reports} reports • {briefing.pages} pages
                </p>
              </div>
              <div className="flex gap-2">
                <button className="p-2 rounded-lg hover:bg-muted transition-colors" title="Copy">
                  <Copy className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg hover:bg-muted transition-colors" title="Download">
                  <Download className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg hover:bg-muted transition-colors" title="Share">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Briefing Features */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">What's Included in Every Briefing</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { icon: '📊', title: 'Executive Summary', desc: 'One-paragraph situation assessment' },
            { icon: '🎯', title: 'Key Metrics', desc: 'Top 5 KPIs with traffic lights' },
            { icon: '⚠️', title: 'Critical Alerts', desc: 'Threshold violations and incidents' },
            { icon: '📈', title: 'Trending', desc: '7-day and 30-day directional change' },
            { icon: '💡', title: 'Recommendations', desc: 'AI-generated next steps' },
            { icon: '📋', title: 'Source Attribution', desc: 'Data lineage and freshness timestamps' }
          ].map((feature, idx) => (
            <div key={idx} className="p-4 bg-muted/30 rounded-lg border border-border/30">
              <p className="text-xl mb-2">{feature.icon}</p>
              <p className="text-sm font-semibold text-foreground mb-1">{feature.title}</p>
              <p className="text-xs text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Distribution Settings */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Automatic Briefing Distribution</h3>

        <p className="text-sm text-muted-foreground mb-4">
          Schedule recurring briefings to be sent to executives automatically:
        </p>

        <div className="space-y-4">
          <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
            <div className="flex items-center gap-3 mb-2">
              <input type="checkbox" defaultChecked />
              <p className="text-sm font-semibold text-foreground">Morning Executive Briefing</p>
            </div>
            <p className="text-xs text-muted-foreground ml-6">Every weekday at 7:00 AM → C-Level (5 recipients)</p>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
            <div className="flex items-center gap-3 mb-2">
              <input type="checkbox" />
              <p className="text-sm font-semibold text-foreground">Weekly Board Summary</p>
            </div>
            <p className="text-xs text-muted-foreground ml-6">Every Friday at 5:00 PM → Board Members (8 recipients)</p>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
            <div className="flex items-center gap-3 mb-2">
              <input type="checkbox" />
              <p className="text-sm font-semibold text-foreground">On-Demand Incident Brief</p>
            </div>
            <p className="text-xs text-muted-foreground ml-6">Triggered when incident severity ≥ P1 → VP Operations</p>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Generation Performance</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-muted/30 rounded-lg border border-border/30 text-center">
            <p className="text-2xl font-bold text-foreground">2.8s</p>
            <p className="text-xs text-muted-foreground mt-1">Avg Generation Time</p>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg border border-border/30 text-center">
            <p className="text-2xl font-bold text-foreground">247</p>
            <p className="text-xs text-muted-foreground mt-1">Briefings Generated</p>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg border border-border/30 text-center">
            <p className="text-2xl font-bold text-foreground">99.8%</p>
            <p className="text-xs text-muted-foreground mt-1">Success Rate</p>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg border border-border/30 text-center">
            <p className="text-2xl font-bold text-foreground">4.2/5</p>
            <p className="text-xs text-muted-foreground mt-1">Avg Executive Rating</p>
          </div>
        </div>
      </div>
    </div>
  );
}
