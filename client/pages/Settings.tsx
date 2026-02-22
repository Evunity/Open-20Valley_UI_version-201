import React, { useState } from 'react';
import {
  Settings,
  Sliders,
  Zap,
  Database,
  Gauge,
  Bell,
  Shield,
  Cloud,
  RotateCcw,
  Palette,
  ChevronDown,
  ChevronRight,
  FileText,
  Lock
} from 'lucide-react';
import SystemConfiguration from './settings/SystemConfiguration';
import ModuleConfiguration from './settings/ModuleConfiguration';
import IntegrationSettings from './settings/IntegrationSettings';
import DataRetentionPolicies from './settings/DataRetentionPolicies';
import PerformanceLimits from './settings/PerformanceLimits';
import NotificationSettings from './settings/NotificationSettings';
import AutomationGuardrails from './settings/AutomationGuardrails';
import EnvironmentDeployment from './settings/EnvironmentDeployment';
import BackupRecovery from './settings/BackupRecovery';
import BrandingUI from './settings/BrandingUI';
import SettingsAudit from './settings/SettingsAudit';
import SettingsPermissions from './settings/SettingsPermissions';

type WorkspaceType =
  | 'system-configuration'
  | 'module-configuration'
  | 'integration-settings'
  | 'data-retention'
  | 'performance-limits'
  | 'notification-settings'
  | 'automation-guardrails'
  | 'environment-deployment'
  | 'backup-recovery'
  | 'branding-ui'
  | 'settings-audit'
  | 'settings-permissions';

interface WorkspaceConfig {
  id: WorkspaceType;
  label: string;
  icon: React.ReactNode;
  category: string;
  description: string;
}

const workspaces: WorkspaceConfig[] = [
  {
    id: 'system-configuration',
    label: 'System Configuration',
    icon: <Settings className="w-5 h-5" />,
    category: 'Core Controls',
    description: 'Platform settings, maintenance mode, kill switches'
  },
  {
    id: 'module-configuration',
    label: 'Module Configuration',
    icon: <Sliders className="w-5 h-5" />,
    category: 'Core Controls',
    description: 'Per-module behavior and feature toggles'
  },
  {
    id: 'integration-settings',
    label: 'Integration Settings',
    icon: <Zap className="w-5 h-5" />,
    category: 'Integrations',
    description: 'External systems, northbound & southbound adapters'
  },
  {
    id: 'data-retention',
    label: 'Data & Retention',
    icon: <Database className="w-5 h-5" />,
    category: 'Data Management',
    description: 'Data lifecycle, retention policies, cleanup rules'
  },
  {
    id: 'performance-limits',
    label: 'Performance & Limits',
    icon: <Gauge className="w-5 h-5" />,
    category: 'Data Management',
    description: 'Rate limits, thresholds, resource allocation'
  },
  {
    id: 'notification-settings',
    label: 'Notifications & Communication',
    icon: <Bell className="w-5 h-5" />,
    category: 'Operations',
    description: 'Alert channels, notification rules, delivery settings'
  },
  {
    id: 'automation-guardrails',
    label: 'Automation Guardrails',
    icon: <Shield className="w-5 h-5" />,
    category: 'Operations',
    description: 'Automation safety rules, approval workflows, limits'
  },
  {
    id: 'environment-deployment',
    label: 'Environment & Deployment',
    icon: <Cloud className="w-5 h-5" />,
    category: 'Operations',
    description: 'Environment-specific settings, deployment config'
  },
  {
    id: 'backup-recovery',
    label: 'Backup & Recovery',
    icon: <RotateCcw className="w-5 h-5" />,
    category: 'Data Management',
    description: 'Backup policies, recovery procedures, RTO/RPO'
  },
  {
    id: 'branding-ui',
    label: 'Branding & UI',
    icon: <Palette className="w-5 h-5" />,
    category: 'Customization',
    description: 'Platform branding, theme, UI customization'
  },
  {
    id: 'settings-audit',
    label: 'Audit & Change Control',
    icon: <FileText className="w-5 h-5" />,
    category: 'Compliance',
    description: 'Track all settings changes, approvals, and compliance audit trail'
  },
  {
    id: 'settings-permissions',
    label: 'Permissions & Access',
    icon: <Lock className="w-5 h-5" />,
    category: 'Compliance',
    description: 'Granular admin role permissions and access control'
  }
];

const categories = ['Core Controls', 'Integrations', 'Data Management', 'Operations', 'Customization', 'Compliance'];

export default function Settings() {
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceType>('system-configuration');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'Core Controls': true,
    'Integrations': false,
    'Data Management': false,
    'Operations': false,
    'Customization': false,
    'Compliance': false
  });

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const renderWorkspace = () => {
    switch (activeWorkspace) {
      case 'system-configuration':
        return <SystemConfiguration />;
      case 'module-configuration':
        return <ModuleConfiguration />;
      case 'integration-settings':
        return <IntegrationSettings />;
      case 'data-retention':
        return <DataRetentionPolicies />;
      case 'performance-limits':
        return <PerformanceLimits />;
      case 'notification-settings':
        return <NotificationSettings />;
      case 'automation-guardrails':
        return <AutomationGuardrails />;
      case 'environment-deployment':
        return <EnvironmentDeployment />;
      case 'backup-recovery':
        return <BackupRecovery />;
      case 'branding-ui':
        return <BrandingUI />;
      case 'settings-audit':
        return <SettingsAudit />;
      case 'settings-permissions':
        return <SettingsPermissions />;
      default:
        return <SystemConfiguration />;
    }
  };

  const activeConfig = workspaces.find(w => w.id === activeWorkspace);

  return (
    <div className="flex h-full bg-gray-50">
      {/* Sidebar Navigation */}
      <div className="w-72 border-r border-gray-200 bg-white overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Settings className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Settings</h1>
              <p className="text-xs text-gray-500">Platform Configuration</p>
            </div>
          </div>
        </div>

        <div className="p-4">
          {categories.map(category => (
            <div key={category} className="mb-2">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm font-semibold text-gray-700"
              >
                <span>{category}</span>
                {expandedCategories[category] ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>

              {expandedCategories[category] && (
                <div className="mt-1 space-y-1">
                  {workspaces
                    .filter(w => w.category === category)
                    .map(workspace => (
                      <button
                        key={workspace.id}
                        onClick={() => setActiveWorkspace(workspace.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeWorkspace === workspace.id
                            ? 'bg-blue-100 text-blue-700 font-semibold'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {workspace.icon}
                        <span>{workspace.label}</span>
                      </button>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          {activeConfig && (
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  {activeConfig.icon}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{activeConfig.label}</h1>
                  <p className="text-gray-500 mt-1">{activeConfig.description}</p>
                </div>
              </div>
            </div>
          )}

          {/* Workspace Content */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            {activeWorkspace ? renderWorkspace() : <SystemConfiguration />}
          </div>
        </div>
      </div>
    </div>
  );
}
