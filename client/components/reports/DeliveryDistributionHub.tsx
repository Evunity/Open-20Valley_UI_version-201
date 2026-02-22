import { Send, Mail, MessageSquare, Eye, FileDown, CheckCircle, AlertCircle } from 'lucide-react';

interface Delivery {
  reportName: string;
  recipients: string;
  channel: 'email' | 'sms' | 'dashboard' | 'api';
  frequency: string;
  complianceStatus: 'compliant' | 'delayed' | 'failed';
  nextDelivery: string;
}

export default function DeliveryDistributionHub() {
  const deliveries: Delivery[] = [
    {
      reportName: 'Daily Transport KPI',
      recipients: 'Transport Team (8 users)',
      channel: 'email',
      frequency: 'Daily 6:30 AM',
      complianceStatus: 'compliant',
      nextDelivery: '2024-03-12 06:30 AM'
    },
    {
      reportName: 'Executive Dashboard',
      recipients: 'C-Level (5 executives)',
      channel: 'dashboard',
      frequency: 'Real-time auto-refresh',
      complianceStatus: 'compliant',
      nextDelivery: 'Continuous'
    },
    {
      reportName: 'Monthly Revenue',
      recipients: 'Finance Team (12 users) + CFO',
      channel: 'email',
      frequency: 'First day of month',
      complianceStatus: 'delayed',
      nextDelivery: '2024-04-01'
    },
    {
      reportName: 'Automation ROI',
      recipients: 'Operations (6 users)',
      channel: 'api',
      frequency: 'On completion',
      complianceStatus: 'compliant',
      nextDelivery: 'On next execution'
    }
  ];

  const getStatusIcon = (status: Delivery['complianceStatus']) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'delayed':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const getChannelIcon = (channel: Delivery['channel']) => {
    switch (channel) {
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'sms':
        return <MessageSquare className="w-4 h-4" />;
      case 'dashboard':
        return <Eye className="w-4 h-4" />;
      case 'api':
        return <FileDown className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Delivery Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border/50 p-4 bg-card/50">
          <p className="text-sm text-muted-foreground mb-1">Total Deliveries</p>
          <p className="text-3xl font-bold text-foreground">2.4K</p>
          <p className="text-xs text-muted-foreground mt-2">Last 30 days</p>
        </div>
        <div className="rounded-xl border border-border/50 p-4 bg-card/50">
          <p className="text-sm text-muted-foreground mb-1">On-Time Delivery</p>
          <p className="text-3xl font-bold text-green-600">99.2%</p>
          <p className="text-xs text-muted-foreground mt-2">SLA Compliant</p>
        </div>
        <div className="rounded-xl border border-border/50 p-4 bg-card/50">
          <p className="text-sm text-muted-foreground mb-1">Failed Deliveries</p>
          <p className="text-3xl font-bold text-foreground">2</p>
          <p className="text-xs text-muted-foreground mt-2">0.08% failure rate</p>
        </div>
        <div className="rounded-xl border border-border/50 p-4 bg-card/50">
          <p className="text-sm text-muted-foreground mb-1">Avg Delivery Time</p>
          <p className="text-3xl font-bold text-foreground">2.3s</p>
          <p className="text-xs text-muted-foreground mt-2">Report generation to delivery</p>
        </div>
      </div>

      {/* Active Deliveries */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <Send className="w-5 h-5 text-blue-600" />
            Active Distribution Channels
          </h3>
          <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium">
            + New Distribution
          </button>
        </div>

        <div className="space-y-3">
          {deliveries.map((delivery, idx) => (
            <div key={idx} className="rounded-xl border border-border/50 p-4 bg-card/50 hover:border-primary/30 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-foreground">{delivery.reportName}</h4>
                    <div className="flex items-center gap-1">
                      {getChannelIcon(delivery.channel)}
                      <span className="text-xs px-2 py-1 bg-muted rounded text-muted-foreground capitalize">
                        {delivery.channel}
                      </span>
                    </div>
                    {getStatusIcon(delivery.complianceStatus)}
                  </div>
                  <p className="text-sm text-muted-foreground">{delivery.recipients}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-border/50 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Frequency</p>
                  <p className="font-medium text-foreground">{delivery.frequency}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Next Delivery</p>
                  <p className="font-medium text-foreground">{delivery.nextDelivery}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery Channels */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Available Delivery Channels</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              channel: 'Email Distribution',
              icon: '📧',
              description: 'Send reports to email with customizable templates',
              features: ['Scheduled delivery', 'HTML/PDF format', 'Attachment compression', 'Whitelist compliance']
            },
            {
              channel: 'Dashboard Embedding',
              icon: '📊',
              description: 'Embed reports directly in user dashboards',
              features: ['Real-time refresh', 'Interactive visualizations', 'Drill-down capability', 'Role-based access']
            },
            {
              channel: 'SMS Alerts',
              icon: '📲',
              description: 'Send critical alerts via SMS to mobile devices',
              features: ['Threshold-based triggers', 'Executive summaries', '2-way messaging', 'Opt-in management']
            },
            {
              channel: 'API Integration',
              icon: '🔌',
              description: 'Deliver reports via REST API for system integration',
              features: ['JSON/XML formats', 'Webhook callbacks', 'Batch delivery', 'Rate limiting']
            }
          ].map((ch, idx) => (
            <div key={idx} className="p-4 bg-muted/30 rounded-lg border border-border/30">
              <div className="flex items-start gap-3 mb-3">
                <span className="text-2xl">{ch.icon}</span>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{ch.channel}</p>
                  <p className="text-xs text-muted-foreground">{ch.description}</p>
                </div>
              </div>
              <ul className="space-y-1 text-xs text-muted-foreground">
                {ch.features.map((feat, fidx) => (
                  <li key={fidx}>• {feat}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance Tracking */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Compliance & Audit Trail</h3>

        <div className="space-y-4">
          <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
            <p className="text-sm font-semibold text-foreground mb-3">SLA Compliance: Transport KPI Report</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Target: Delivered by 07:00 AM UTC+2</span>
                <span className="font-medium text-green-600">✓ Compliant</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Avg Delivery Time: 6:45 AM (15 min early)</span>
                <span className="font-medium text-green-600">✓ Ahead of Schedule</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Delivery Success Rate: 99.8% (1/500 failed)</span>
                <span className="font-medium text-green-600">✓ Within tolerance</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
            <p className="text-sm font-semibold text-foreground mb-3">Recent Delivery Events</p>
            <div className="space-y-2 font-mono text-xs text-muted-foreground">
              <div>2024-03-11 06:45 AM - ✓ Daily Transport KPI delivered to 8 recipients (email)</div>
              <div>2024-03-11 06:45 AM - ✓ Executive Dashboard updated (dashboard refresh)</div>
              <div>2024-03-11 02:15 PM - ✓ Automation ROI report sent via API webhook</div>
              <div>2024-03-10 06:46 AM - ✗ Failed to deliver to 1 invalid email (retry scheduled)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recipient Management */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Recipient Management</h3>

        <div className="space-y-3">
          <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
            <p className="text-sm font-semibold text-foreground mb-2">Transport Team (8 users)</p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• manager@company.com (primary)</p>
              <p>• team@company.com (group email)</p>
              <p>• 6 individual users subscribed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
