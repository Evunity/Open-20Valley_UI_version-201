import { Layout, Copy, Eye } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  icon: string;
  sections: string[];
  use_case: string;
  preview_blocks: number;
}

export default function LayoutIntelligence() {
  const templates: Template[] = [
    {
      id: '1',
      name: 'Executive Brief',
      description: 'C-level ready summary with strategic insights and recommendations',
      icon: '📊',
      sections: ['Executive Summary', 'Key Metrics', 'Critical Alerts', 'Strategic Recommendations', 'Next Steps'],
      use_case: 'Board presentations, investor updates',
      preview_blocks: 5
    },
    {
      id: '2',
      name: 'Regulatory Pack',
      description: 'Compliance-focused report with audit trails and evidence',
      icon: '📋',
      sections: ['Compliance Status', 'Audit Trail', 'Evidence Records', 'Risk Assessment', 'Remediation Plan'],
      use_case: 'Regulatory submissions, audits',
      preview_blocks: 5
    },
    {
      id: '3',
      name: 'NOC Daily',
      description: 'Operational summary for network control center teams',
      icon: '🎯',
      sections: ['Overnight Summary', 'Active Incidents', 'Threshold Violations', 'Automated Actions', 'Today\'s Forecast'],
      use_case: 'Daily handoff reports, shift briefings',
      preview_blocks: 5
    },
    {
      id: '4',
      name: 'Vendor Scorecard',
      description: 'Equipment vendor performance assessment',
      icon: '⭐',
      sections: ['Overall Score', 'Reliability Metrics', 'Failure Analysis', 'Compliance Status', 'Recommendations'],
      use_case: 'Vendor evaluation, SLA reviews',
      preview_blocks: 5
    },
    {
      id: '5',
      name: 'SLA Deck',
      description: 'Service level agreement compliance tracking',
      icon: '✓',
      sections: ['SLA Summary', 'Compliance Status', 'Breaches', 'Remediation', 'Trending'],
      use_case: 'Customer reporting, internal reviews',
      preview_blocks: 5
    },
    {
      id: '6',
      name: 'Board Summary',
      description: 'Strategic business impact and ROI analysis',
      icon: '💼',
      sections: ['Business Impact', 'Financial Metrics', 'Strategic Outcomes', 'Risk Mitigation', 'Investment ROI'],
      use_case: 'Board meetings, executive dashboards',
      preview_blocks: 5
    }
  ];

  return (
    <div className="space-y-8">
      {/* Templates Overview */}
      <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-6">
        <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
          <Layout className="w-5 h-5 text-blue-600" />
          Pre-Built Report Templates
        </h3>
        <p className="text-sm text-muted-foreground">
          Standardized layouts reduce design chaos and ensure consistent executive messaging across the organization.
        </p>
      </div>

      {/* Template Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map(template => (
          <div
            key={template.id}
            className="rounded-xl border border-border/50 p-6 bg-card/50 hover:border-primary/30 transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <span className="text-3xl">{template.icon}</span>
                <div>
                  <h4 className="font-bold text-foreground">{template.name}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                </div>
              </div>
            </div>

            {/* Sections */}
            <div className="mb-4 p-3 bg-muted/30 rounded-lg border border-border/30">
              <p className="text-xs font-semibold text-muted-foreground mb-2">Includes:</p>
              <div className="flex flex-wrap gap-1">
                {template.sections.map((section, idx) => (
                  <span key={idx} className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                    {section}
                  </span>
                ))}
              </div>
            </div>

            {/* Use Case */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-muted-foreground mb-1">Best For:</p>
              <p className="text-sm text-foreground">{template.use_case}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="flex-1 px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm flex items-center justify-center gap-2">
                <Copy className="w-4 h-4" />
                Use Template
              </button>
              <button className="px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors">
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Template Customization */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Customize Template Sections</h3>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-semibold text-foreground block mb-2">
              Selected Template: Executive Brief
            </label>
            <div className="space-y-2">
              {[
                { name: 'Executive Summary', required: true, checked: true },
                { name: 'Key Metrics', required: true, checked: true },
                { name: 'Critical Alerts', required: false, checked: true },
                { name: 'Market Analysis', required: false, checked: false },
                { name: 'Recommendations', required: false, checked: true },
                { name: 'Appendix', required: false, checked: false }
              ].map((section, idx) => (
                <label key={idx} className="flex items-center gap-3 p-2 cursor-pointer hover:bg-muted/30 rounded transition-colors">
                  <input type="checkbox" defaultChecked={section.checked} disabled={section.required} />
                  <span className={section.required ? 'text-foreground font-medium' : 'text-foreground'}>
                    {section.name}
                  </span>
                  {section.required && <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded">Required</span>}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Template Best Practices */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Template Best Practices</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
            <p className="text-sm font-semibold text-foreground mb-2">✓ Executive Brief</p>
            <p className="text-xs text-muted-foreground">1-page maximum, visual-heavy, action items above the fold</p>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
            <p className="text-sm font-semibold text-foreground mb-2">✓ Regulatory Pack</p>
            <p className="text-xs text-muted-foreground">Include source lineage, certification marks, legal disclaimers</p>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
            <p className="text-sm font-semibold text-foreground mb-2">✓ NOC Daily</p>
            <p className="text-xs text-muted-foreground">24-hour perspective, alert focus, shift-to-shift handoff format</p>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
            <p className="text-sm font-semibold text-foreground mb-2">✓ SLA Deck</p>
            <p className="text-xs text-muted-foreground">Month-over-month trending, breach root cause analysis</p>
          </div>
        </div>
      </div>

      {/* Branding & Styling */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Template Branding</h3>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-foreground block mb-2">Logo Placement</label>
            <select className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm">
              <option>Top Left (Standard)</option>
              <option>Top Right</option>
              <option>Header Bar</option>
              <option>Watermark (Light)</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground block mb-2">Color Scheme</label>
            <select className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm">
              <option>Corporate Blue (Default)</option>
              <option>Dark Professional</option>
              <option>Minimalist</option>
              <option>Custom Brand Colors</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground block mb-2">Footer</label>
            <input
              type="text"
              placeholder="Confidential - Internal Use Only"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
