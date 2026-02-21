import React, { useState } from 'react';
import { Terminal, Code, Settings2, Zap, FileText, Eye, RotateCcw, Package, AlertTriangle } from 'lucide-react';
import { CommandConsole } from '../components/CommandConsole';
import { ParameterExplorer } from '../components/ParameterExplorer';
import { ModifyChangeEngine } from '../components/ModifyChangeEngine';
import { BulkEditor } from '../components/BulkEditor';
import { ScriptLibrary } from '../components/ScriptLibrary';
import { ExecutionMonitor } from '../components/ExecutionMonitor';
import { AuditRollbackCenter } from '../components/AuditRollbackCenter';
import { SandboxMode } from '../components/SandboxMode';

type ModuleView = 'console' | 'parameters' | 'modify' | 'bulk' | 'scripts' | 'monitor' | 'audit' | 'sandbox';

interface ModuleConfig {
  id: ModuleView;
  label: string;
  icon: React.FC<any>;
  description: string;
  riskLevel: 'read-only' | 'safe' | 'dangerous';
}

const MODULES: ModuleConfig[] = [
  {
    id: 'console',
    label: 'Command Console',
    icon: Terminal,
    description: 'MML/CLI-like interface for vendor-native commands',
    riskLevel: 'dangerous'
  },
  {
    id: 'parameters',
    label: 'Parameter Explorer',
    icon: Eye,
    description: 'Browse, search, and view network parameters',
    riskLevel: 'read-only'
  },
  {
    id: 'modify',
    label: 'Modify & Change',
    icon: Settings2,
    description: 'Modify parameters with full validation pipeline',
    riskLevel: 'dangerous'
  },
  {
    id: 'bulk',
    label: 'Bulk Editor',
    icon: Code,
    description: 'Execute bulk configuration changes',
    riskLevel: 'dangerous'
  },
  {
    id: 'scripts',
    label: 'Script Library',
    icon: FileText,
    description: 'Create and reuse scripts',
    riskLevel: 'dangerous'
  },
  {
    id: 'monitor',
    label: 'Execution Monitor',
    icon: Zap,
    description: 'Real-time monitoring of command execution',
    riskLevel: 'read-only'
  },
  {
    id: 'audit',
    label: 'Audit & Rollback',
    icon: RotateCcw,
    description: 'View audit logs and perform rollbacks',
    riskLevel: 'dangerous'
  },
  {
    id: 'sandbox',
    label: 'Sandbox Mode',
    icon: Package,
    description: 'Test commands and scripts safely',
    riskLevel: 'safe'
  }
];

export const CommandCenter: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ModuleView>('console');
  const [selectedTarget, setSelectedTarget] = useState<{
    country?: string;
    region?: string;
    site?: string;
    node?: string;
  }>({});

  const activeModuleConfig = MODULES.find(m => m.id === activeModule)!;

  const getRiskColor = (level: string) => {
    const colors = {
      'read-only': 'bg-blue-100 text-blue-800 border-blue-300',
      'safe': 'bg-green-100 text-green-800 border-green-300',
      'dangerous': 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[level as keyof typeof colors] || colors['safe'];
  };

  const renderModule = () => {
    const props = { selectedTarget, onTargetChange: setSelectedTarget };

    switch (activeModule) {
      case 'console':
        return <CommandConsole {...props} />;
      case 'parameters':
        return <ParameterExplorer {...props} />;
      case 'modify':
        return <ModifyChangeEngine {...props} />;
      case 'bulk':
        return <BulkEditor {...props} />;
      case 'scripts':
        return <ScriptLibrary {...props} />;
      case 'monitor':
        return <ExecutionMonitor {...props} />;
      case 'audit':
        return <AuditRollbackCenter {...props} />;
      case 'sandbox':
        return <SandboxMode {...props} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full gap-4 bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Command Center</h1>
            <p className="text-sm text-gray-600 mt-1">OSS-Level Network Control & Parameter Governance</p>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span className="text-sm font-semibold text-amber-700">Permission-Gated • Fully Audited • Transactional</span>
          </div>
        </div>

        {/* Target Selection Context */}
        {(selectedTarget.country || selectedTarget.region || selectedTarget.site || selectedTarget.node) && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs font-semibold text-blue-900 mb-1">Target Context</p>
            <p className="text-sm text-blue-800 font-mono">
              {selectedTarget.country && `${selectedTarget.country}`}
              {selectedTarget.region && ` → ${selectedTarget.region}`}
              {selectedTarget.site && ` → ${selectedTarget.site}`}
              {selectedTarget.node && ` → ${selectedTarget.node}`}
            </p>
          </div>
        )}
      </div>

      {/* Module Selector */}
      <div className="bg-white border-b border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {MODULES.map(module => {
            const Icon = module.icon;
            return (
              <button
                key={module.id}
                onClick={() => setActiveModule(module.id)}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition ${
                  activeModule === module.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
                title={module.description}
              >
                <Icon className={`w-4 h-4 ${activeModule === module.id ? 'text-blue-600' : 'text-gray-600'}`} />
                <span className="text-xs font-semibold text-center text-gray-900">{module.label}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded border ${getRiskColor(module.riskLevel)}`}>
                  {module.riskLevel}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Module */}
      <div className="flex-1 bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col">
        {/* Module Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {React.createElement(activeModuleConfig.icon, { className: 'w-5 h-5 text-blue-600' })}
            <div>
              <h2 className="text-lg font-bold text-gray-900">{activeModuleConfig.label}</h2>
              <p className="text-sm text-gray-600">{activeModuleConfig.description}</p>
            </div>
          </div>
        </div>

        {/* Module Content */}
        <div className="flex-1 overflow-y-auto">
          {renderModule()}
        </div>
      </div>

      {/* Safety Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
        <p className="text-xs text-amber-800">
          <strong>⚠️ Important:</strong> All commands are vendor-native and fully audited. Changes are transactional with rollback capability. 
          Never execute commands on production without testing in Sandbox Mode first.
        </p>
      </div>
    </div>
  );
};
