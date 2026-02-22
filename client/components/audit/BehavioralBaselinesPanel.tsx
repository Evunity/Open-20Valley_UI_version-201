import { Brain, TrendingUp, AlertTriangle, CheckCircle, Clock, MapPin } from 'lucide-react';
import { useState } from 'react';

interface BaselineProfile {
  userId: string;
  username: string;
  role: string;
  learningDays: number;
  lastUpdated: string;
  deviations: number;
  riskScore: number;
  status: 'learning' | 'established' | 'anomalous';
}

interface BaselineMetric {
  name: string;
  normal: string;
  observed: string;
  deviation: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export default function BehavioralBaselinesPanel() {
  const [selectedUser, setSelectedUser] = useState<string>('rf_engineer');
  const [learningMode, setLearningMode] = useState(false);

  const userProfiles: BaselineProfile[] = [
    {
      userId: 'USR-2847',
      username: 'rf_engineer',
      role: 'RF Engineer',
      learningDays: 47,
      lastUpdated: '2024-03-11 08:30:00',
      deviations: 2,
      riskScore: 34,
      status: 'established'
    },
    {
      userId: 'USR-1923',
      username: 'john_operator',
      role: 'NOC Operator',
      learningDays: 120,
      lastUpdated: '2024-03-10 22:15:00',
      deviations: 0,
      riskScore: 12,
      status: 'established'
    },
    {
      userId: 'USR-5421',
      username: 'network_admin',
      role: 'Network Admin',
      learningDays: 8,
      lastUpdated: '2024-03-11 14:32:00',
      deviations: 5,
      riskScore: 67,
      status: 'learning'
    },
    {
      userId: 'USR-7834',
      username: 'incident_resp',
      role: 'Incident Responder',
      learningDays: 15,
      lastUpdated: '2024-03-11 13:45:00',
      deviations: 12,
      riskScore: 78,
      status: 'anomalous'
    }
  ];

  const baselineMetrics: Record<string, BaselineMetric[]> = {
    'rf_engineer': [
      {
        name: 'Login Time of Day',
        normal: '08:00 - 17:00 (Cairo TZ)',
        observed: '14:32 (Cairo TZ)',
        deviation: false,
        severity: 'low'
      },
      {
        name: 'Typical Login Location',
        normal: 'Cairo, Egypt (IP 192.168.1.0/24)',
        observed: 'Cairo, Egypt (IP 192.168.1.105)',
        deviation: false,
        severity: 'low'
      },
      {
        name: 'Privilege Escalation Frequency',
        normal: '0 - 1 times per week',
        observed: '1 escalation today',
        deviation: false,
        severity: 'medium'
      },
      {
        name: 'Configuration Change Rate',
        normal: 'Avg 2-3 changes per day',
        observed: '7 changes in 1 hour',
        deviation: true,
        severity: 'high'
      },
      {
        name: 'Policy Modifications',
        normal: 'Never (not in role)',
        observed: 'Policy modified at 14:32',
        deviation: true,
        severity: 'critical'
      },
      {
        name: 'Active Sessions',
        normal: 'Single session (0-1)',
        observed: '1 session (normal)',
        deviation: false,
        severity: 'low'
      },
      {
        name: 'Failed Authentication Attempts',
        normal: '0 - 1 per month',
        observed: '0 today',
        deviation: false,
        severity: 'low'
      },
      {
        name: 'Data Export Volume',
        normal: '10-50 MB per month',
        observed: '0 MB today',
        deviation: false,
        severity: 'low'
      }
    ],
    'john_operator': [
      {
        name: 'Login Time of Day',
        normal: '08:00 - 18:00 (Cairo TZ)',
        observed: '15:45 (Cairo TZ)',
        deviation: false,
        severity: 'low'
      },
      {
        name: 'Typical Login Location',
        normal: 'Cairo NOC, Egypt (IP 10.20.30.0/24)',
        observed: 'Cairo NOC, Egypt (IP 10.20.30.75)',
        deviation: false,
        severity: 'low'
      },
      {
        name: 'Configuration Change Rate',
        normal: 'Avg 0-1 changes per week',
        observed: '0 changes today',
        deviation: false,
        severity: 'low'
      },
      {
        name: 'Alert Response Time',
        normal: 'Avg 2-5 minutes',
        observed: '3 minutes',
        deviation: false,
        severity: 'low'
      },
      {
        name: 'Privilege Escalation Frequency',
        normal: 'Never',
        observed: 'No escalation today',
        deviation: false,
        severity: 'low'
      },
      {
        name: 'Command Execution',
        normal: 'Routine monitoring commands',
        observed: 'Routine commands only',
        deviation: false,
        severity: 'low'
      }
    ],
    'network_admin': [
      {
        name: 'Login Time of Day',
        normal: 'Establishing baseline...',
        observed: '14:15 (Cairo TZ)',
        deviation: false,
        severity: 'low'
      },
      {
        name: 'Typical Login Location',
        normal: 'Learning (8 days)',
        observed: 'Cairo, Egypt (IP 192.168.1.200)',
        deviation: false,
        severity: 'low'
      },
      {
        name: 'Configuration Changes',
        normal: 'Pending baseline (8 days)',
        observed: '34,126 changes today',
        deviation: true,
        severity: 'critical'
      },
      {
        name: 'Policy Modifications',
        normal: 'Still learning...',
        observed: '3 major policy changes',
        deviation: true,
        severity: 'high'
      },
      {
        name: 'Privilege Usage',
        normal: 'Establishing...',
        observed: 'Extensive admin access',
        deviation: true,
        severity: 'high'
      }
    ],
    'incident_resp': [
      {
        name: 'Login Time of Day',
        normal: 'Variable (on-call role)',
        observed: '14:32 (unusual time)',
        deviation: true,
        severity: 'medium'
      },
      {
        name: 'Data Access Patterns',
        normal: 'Selective investigation files',
        observed: 'Broad access across systems',
        deviation: true,
        severity: 'high'
      },
      {
        name: 'Command Execution',
        normal: 'Forensic tools only',
        observed: 'Executing system admin commands',
        deviation: true,
        severity: 'critical'
      },
      {
        name: 'Alert Escalations',
        normal: 'Only during incidents',
        observed: '12 escalations in 1 hour',
        deviation: true,
        severity: 'high'
      }
    ]
  };

  const currentUser = userProfiles.find((u) => u.username === selectedUser)!;
  const metrics = baselineMetrics[selectedUser] || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'established':
        return 'bg-green-500/10 border-green-500/30 text-green-700';
      case 'learning':
        return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-700';
      case 'anomalous':
        return 'bg-red-500/10 border-red-500/30 text-red-700';
      default:
        return 'bg-muted/30 border-border/30 text-muted-foreground';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'established':
        return 'bg-green-600 text-white';
      case 'learning':
        return 'bg-yellow-600 text-white';
      case 'anomalous':
        return 'bg-red-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/10 border-red-500/30 text-red-700';
      case 'high':
        return 'bg-orange-500/10 border-orange-500/30 text-orange-700';
      case 'medium':
        return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-700';
      case 'low':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-700';
      default:
        return 'bg-muted/30 border-border/30 text-muted-foreground';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-600 text-white';
      case 'high':
        return 'bg-orange-600 text-white';
      case 'medium':
        return 'bg-yellow-600 text-white';
      case 'low':
        return 'bg-blue-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  return (
    <div className="space-y-8">
      {/* Description */}
      <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-6">
        <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
          <Brain className="w-5 h-5 text-cyan-600" />
          Behavioral Baselines
        </h3>
        <p className="text-sm text-muted-foreground">
          Learn normal behavior patterns for each user. Flag deviations quietly but powerfully. Detect insider threats and compromised accounts by comparing current activity against established baselines.
        </p>
      </div>

      {/* User Selection */}
      <div className="space-y-3">
        <h3 className="font-bold text-foreground">User Behavioral Profiles</h3>

        <div className="space-y-2">
          {userProfiles.map((profile) => (
            <div
              key={profile.username}
              onClick={() => setSelectedUser(profile.username)}
              className={`cursor-pointer rounded-lg border p-4 transition-colors ${selectedUser === profile.username ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-border'}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-foreground">{profile.username}</h4>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${getStatusBadge(profile.status)}`}>
                      {profile.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{profile.role} • ID: {profile.userId}</p>
                  <div className="flex flex-wrap gap-4 text-xs">
                    <span className="text-muted-foreground">
                      Learning: <span className="font-semibold text-foreground">{profile.learningDays} days</span>
                    </span>
                    <span className="text-muted-foreground">
                      Deviations: <span className="font-semibold text-foreground">{profile.deviations}</span>
                    </span>
                    <span className="text-muted-foreground">
                      Risk Score: <span className={`font-semibold ${profile.riskScore > 60 ? 'text-orange-700' : 'text-foreground'}`}>{profile.riskScore}/100</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Profile Details */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-foreground text-lg">{currentUser.username}</h3>
            <p className="text-sm text-muted-foreground">{currentUser.role}</p>
          </div>
          <div className={`px-4 py-2 rounded-lg border ${getStatusColor(currentUser.status)}`}>
            <p className={`text-sm font-bold ${currentUser.status === 'established' ? 'text-green-700' : currentUser.status === 'learning' ? 'text-yellow-700' : 'text-red-700'}`}>
              {currentUser.status === 'established' && '✓ Baseline Established'}
              {currentUser.status === 'learning' && '⏳ Learning Phase'}
              {currentUser.status === 'anomalous' && '⚠ Anomalous Behavior'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
          <div className="rounded-lg border border-border/50 p-3 bg-card">
            <p className="text-xs text-muted-foreground mb-1">Learning Days</p>
            <p className="text-xl font-bold text-foreground">{currentUser.learningDays}</p>
          </div>
          <div className="rounded-lg border border-border/50 p-3 bg-card">
            <p className="text-xs text-muted-foreground mb-1">Deviations Detected</p>
            <p className={`text-xl font-bold ${currentUser.deviations > 5 ? 'text-orange-700' : 'text-foreground'}`}>
              {currentUser.deviations}
            </p>
          </div>
          <div className={`rounded-lg p-3 ${currentUser.riskScore > 60 ? 'bg-red-500/10 border border-red-500/30' : 'bg-green-500/10 border border-green-500/30'}`}>
            <p className={`text-xs ${currentUser.riskScore > 60 ? 'text-red-700' : 'text-green-700'} mb-1`}>Risk Score</p>
            <p className={`text-xl font-bold ${currentUser.riskScore > 60 ? 'text-red-700' : 'text-green-700'}`}>
              {currentUser.riskScore}/100
            </p>
          </div>
          <div className="rounded-lg border border-border/50 p-3 bg-card">
            <p className="text-xs text-muted-foreground mb-1">Last Updated</p>
            <p className="text-xs font-mono text-foreground">{currentUser.lastUpdated}</p>
          </div>
        </div>
      </div>

      {/* Baseline Metrics */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Baseline Metrics & Deviations
        </h3>

        <div className="space-y-3">
          {metrics.map((metric, idx) => (
            <div
              key={idx}
              className={`rounded-lg border p-4 transition-colors ${getSeverityColor(metric.severity)}`}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-foreground">{metric.name}</h4>
                    {metric.deviation && (
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${getSeverityBadge(metric.severity)}`}>
                        DEVIATION
                      </span>
                    )}
                  </div>
                </div>
                {metric.deviation ? (
                  <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs font-medium opacity-70 mb-1">Normal Behavior</p>
                  <p className="font-mono text-foreground">{metric.normal}</p>
                </div>
                <div>
                  <p className="text-xs font-medium opacity-70 mb-1">Currently Observed</p>
                  <p className="font-mono text-foreground">{metric.observed}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Learning Phase Explanation */}
      {currentUser.status === 'learning' && (
        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-6">
          <h3 className="font-bold text-yellow-700 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Learning Phase in Progress
          </h3>
          <p className="text-sm text-yellow-600 mb-3">
            The system is collecting behavior samples to establish a baseline. Deviations are tracked but not yet classified as anomalies until sufficient data is collected.
          </p>
          <div className="w-full bg-yellow-200/30 rounded-full h-2 mb-2">
            <div className="bg-yellow-600 h-2 rounded-full" style={{ width: `${(currentUser.learningDays / 30) * 100}%` }} />
          </div>
          <p className="text-xs text-yellow-700">
            {currentUser.learningDays} days of learning data collected. Baseline will be fully established after 30 days.
          </p>
        </div>
      )}

      {/* Geographic Anomaly Example */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Geographic Baseline Example
        </h3>

        <p className="text-sm text-muted-foreground mb-4">
          Behavioral baselines can detect subtle anomalies that traditional rules miss. For example:
        </p>

        <div className="space-y-3">
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <p className="text-sm font-semibold text-green-700 mb-1">✓ Normal</p>
            <p className="text-sm text-green-600">
              <span className="font-semibold">Admin typically logs in from Cairo.</span> Login detected from Cairo today. (Matches baseline)
            </p>
          </div>

          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-sm font-semibold text-red-700 mb-1">⚠ Anomaly Detected</p>
            <p className="text-sm text-red-600">
              <span className="font-semibold">Admin typically logs in from Cairo.</span> Login detected from Tokyo IP (IP geo-location shift detected). Quiet but powerful detection.
            </p>
          </div>
        </div>
      </div>

      {/* Behavioral Indicators */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Behavioral Indicators Under Analysis</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
            <p className="text-sm font-semibold text-foreground mb-1">Temporal Patterns</p>
            <p className="text-xs text-muted-foreground">Work hours, peak activity times, dormant periods</p>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
            <p className="text-sm font-semibold text-foreground mb-1">Geographic Profiles</p>
            <p className="text-xs text-muted-foreground">Login locations, IP address patterns, travel profiles</p>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
            <p className="text-sm font-semibold text-foreground mb-1">Command Patterns</p>
            <p className="text-xs text-muted-foreground">Typical commands, privilege escalations, automation triggers</p>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
            <p className="text-sm font-semibold text-foreground mb-1">Data Access Behaviors</p>
            <p className="text-xs text-muted-foreground">File access patterns, export volumes, query types</p>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
            <p className="text-sm font-semibold text-foreground mb-1">Peer Comparisons</p>
            <p className="text-xs text-muted-foreground">Behaviors compared to role-mates and department</p>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
            <p className="text-sm font-semibold text-foreground mb-1">Session Characteristics</p>
            <p className="text-xs text-muted-foreground">Session duration, concurrent sessions, activity velocity</p>
          </div>
        </div>
      </div>
    </div>
  );
}
