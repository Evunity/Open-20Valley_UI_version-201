import { useState } from 'react';
import { Search } from 'lucide-react';

export default function UserProfilesAudit() {
  const [searchUser, setSearchUser] = useState('');

  const userProfiles = [
    {
      user: 'rf_engineer',
      email: 'rf_engineer@company.com',
      department: 'RF Engineering',
      role: 'Engineer',
      lastLogin: '2024-03-11 14:32 UTC',
      loginTime: '08:00 - 18:00 UTC',
      avgSessionDuration: '6-7 hours',
      dailyActions: '20-40',
      escalationFrequency: 'Never',
      dataExportFrequency: 'Weekly',
      insiderThreatScore: 34,
      insiderThreatRisk: 'moderate',
      detectedAnomalies: 1,
      lastActivity: 'Privilege escalation (14:32)',
      status: 'Active'
    },
    {
      user: 'ops_manager',
      email: 'ops_manager@company.com',
      department: 'Operations',
      role: 'Manager',
      lastLogin: '2024-03-11 13:45 UTC',
      loginTime: '07:00 - 19:00 UTC',
      avgSessionDuration: '10-12 hours',
      dailyActions: '30-50',
      escalationFrequency: 'Rare',
      dataExportFrequency: 'Daily',
      insiderThreatScore: 12,
      insiderThreatRisk: 'low',
      detectedAnomalies: 0,
      lastActivity: 'Normal operations',
      status: 'Active'
    },
    {
      user: 'transport_analyst',
      email: 'transport_analyst@company.com',
      department: 'Transportation',
      role: 'Analyst',
      lastLogin: '2024-03-10 20:15 UTC',
      loginTime: '06:00 - 22:00 UTC',
      avgSessionDuration: '8-10 hours',
      dailyActions: '40-60',
      escalationFrequency: 'Never',
      dataExportFrequency: 'Bi-weekly',
      insiderThreatScore: 45,
      insiderThreatRisk: 'elevated',
      detectedAnomalies: 1,
      lastActivity: 'Long session duration (22+ hours)',
      status: 'Idle'
    },
    {
      user: 'security_admin',
      email: 'security_admin@company.com',
      department: 'Security',
      role: 'Admin',
      lastLogin: '2024-03-11 09:20 UTC',
      loginTime: '08:00 - 17:00 UTC',
      avgSessionDuration: '7-8 hours',
      dailyActions: '15-30',
      escalationFrequency: 'Often',
      dataExportFrequency: 'Monthly',
      insiderThreatScore: 28,
      insiderThreatRisk: 'low',
      detectedAnomalies: 0,
      lastActivity: 'Security audit performed',
      status: 'Active'
    }
  ];

  const filteredUsers = searchUser 
    ? userProfiles.filter(u => u.user.toLowerCase().includes(searchUser.toLowerCase()))
    : userProfiles;

  const getRiskColor = (score) => {
    if (score > 70) return 'bg-red-500/10 border-red-500/30 text-red-700';
    if (score > 40) return 'bg-orange-500/10 border-orange-500/30 text-orange-700';
    return 'bg-green-500/10 border-green-500/30 text-green-700';
  };

  const getStatusColor = (status) => {
    return status === 'Active' ? 'bg-green-500/20 text-green-700' : 'bg-gray-500/20 text-gray-700';
  };

  return (
    <div className="space-y-2">

      {/* Search Filter */}
      <div className="rounded-xl border border-border/50 p-4 bg-card/50">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by username..."
            value={searchUser}
            onChange={(e) => setSearchUser(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        {searchUser && (
          <p className="text-xs text-muted-foreground mt-2">
            Showing results for: <span className="font-semibold text-foreground">{searchUser}</span>
          </p>
        )}
      </div>

      {/* User Profiles Grid */}
      <div className="space-y-3">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((profile, idx) => (
            <div key={idx} className="rounded-xl border border-border/50 bg-card/50 overflow-hidden">
              
              {/* Profile Header */}
              <div className="p-4 border-b border-border/30 bg-muted/20">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground text-lg">{profile.user}</h3>
                    <p className="text-xs text-muted-foreground">{profile.email}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded font-semibold ${getStatusColor(profile.status)}`}>
                    {profile.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-muted-foreground">Department</p>
                    <p className="font-medium text-foreground">{profile.department}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Role</p>
                    <p className="font-medium text-foreground">{profile.role}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Login</p>
                    <p className="font-medium text-foreground">{profile.lastLogin}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Activity</p>
                    <p className="font-medium text-foreground">{profile.lastActivity}</p>
                  </div>
                </div>
              </div>

              {/* Profile Insights */}
              <div className="p-4 space-y-4">
                
                {/* Behavioral Profile */}
                <div>
                  <h4 className="font-semibold text-foreground mb-3 text-sm">Behavioral Profile</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
                      <p className="text-muted-foreground mb-1">Login Time</p>
                      <p className="font-medium text-foreground">{profile.loginTime}</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
                      <p className="text-muted-foreground mb-1">Avg Session Duration</p>
                      <p className="font-medium text-foreground">{profile.avgSessionDuration}</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
                      <p className="text-muted-foreground mb-1">Daily Actions</p>
                      <p className="font-medium text-foreground">{profile.dailyActions}</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
                      <p className="text-muted-foreground mb-1">Data Export Frequency</p>
                      <p className="font-medium text-foreground">{profile.dataExportFrequency}</p>
                    </div>
                  </div>
                </div>

                {/* Security Insights */}
                <div>
                  <h4 className="font-semibold text-foreground mb-3 text-sm">Security Insights</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className={`p-3 rounded-lg border ${getRiskColor(profile.insiderThreatScore)}`}>
                      <p className="text-muted-foreground mb-1">Insider Threat Score</p>
                      <p className="font-bold text-lg">{profile.insiderThreatScore}</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
                      <p className="text-muted-foreground mb-1">Threat Risk Level</p>
                      <p className="font-medium text-foreground capitalize">{profile.insiderThreatRisk}</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
                      <p className="text-muted-foreground mb-1">Detected Anomalies</p>
                      <p className="font-bold text-foreground">{profile.detectedAnomalies}</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
                      <p className="text-muted-foreground mb-1">Escalation Frequency</p>
                      <p className="font-medium text-foreground">{profile.escalationFrequency}</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-border/50 bg-card/50 p-8 text-center">
            <p className="text-muted-foreground">No user profiles found</p>
          </div>
        )}
      </div>

    </div>
  );
}
