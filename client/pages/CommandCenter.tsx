import React, { useState } from 'react';
import { Terminal, Code, Zap, FileText, Eye, RotateCcw, Package, AlertTriangle, GitCompare, Clock } from 'lucide-react';
import { CommandConsole } from '../components/CommandConsole';
import { ParameterExplorer } from '../components/ParameterExplorer';
import { BulkEditor } from '../components/BulkEditor';
import { ScriptLibrary } from '../components/ScriptLibrary';
import { ExecutionMonitor } from '../components/ExecutionMonitor';
import { AuditRollbackCenter } from '../components/AuditRollbackCenter';
import { SandboxMode } from '../components/SandboxMode';
import { RollbackVersionControl } from '../components/RollbackVersionControl';
import { DiffView } from '../components/DiffView';

type ModuleView = 'console' | 'parameters' | 'bulk' | 'scripts' | 'monitor' | 'audit' | 'sandbox' | 'rollback' | 'diff';

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
    id: 'bulk',
    label: 'Bulk Editor',
    icon: Code,
    description: 'Execute bulk configuration changes with diff preview',
    riskLevel: 'dangerous'
  },
  {
    id: 'scripts',
    label: 'Script Library',
    icon: FileText,
    description: 'Create, store, and execute reusable scripts',
    riskLevel: 'dangerous'
  },
  {
    id: 'monitor',
    label: 'Execution Monitor',
    icon: Zap,
    description: 'Real-time monitoring with pause/resume/retry controls',
    riskLevel: 'read-only'
  },
  {
    id: 'sandbox',
    label: 'Sandbox Mode',
    icon: Package,
    description: 'Test commands and scripts safely',
    riskLevel: 'safe'
  },
  {
    id: 'diff',
    label: 'Diff View',
    icon: GitCompare,
    description: 'Compare configurations between sites or time periods',
    riskLevel: 'read-only'
  },
  {
    id: 'rollback',
    label: 'Rollback & Version',
    icon: RotateCcw,
    description: 'Version control and rollback with full/partial/selective modes',
    riskLevel: 'dangerous'
  },
  {
    id: 'audit',
    label: 'Audit & Rollback',
    icon: AlertTriangle,
    description: 'Complete audit trail with exportable logs',
    riskLevel: 'read-only'
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


  const renderModule = () => {
    const props = { selectedTarget, onTargetChange: setSelectedTarget };

    switch (activeModule) {
      case 'console':
        return <CommandConsole {...props} />;
      case 'parameters':
        return <ParameterExplorer {...props} />;
      case 'bulk':
        return <BulkEditor {...props} />;
      case 'scripts':
        return <ScriptLibrary {...props} />;
      case 'monitor':
        return <ExecutionMonitor {...props} />;
      case 'sandbox':
        return <SandboxMode {...props} />;
      case 'diff':
        return <DiffView {...props} />;
      case 'rollback':
        return <RollbackVersionControl {...props} />;
      case 'audit':
        return <AuditRollbackCenter {...props} />;
      default:
        return null;
    }
  };

  return (
    <div className="command-center-theme flex flex-col h-full gap-4 bg-background">
      {/* Target Selection Context */}
      {(selectedTarget.country || selectedTarget.region || selectedTarget.site || selectedTarget.node) && (
        <div className="bg-card border-b border-border rounded-lg p-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-1">Target Context</p>
            <p className="text-sm text-blue-800 dark:text-blue-300 font-mono">
              {selectedTarget.country && `${selectedTarget.country}`}
              {selectedTarget.region && ` → ${selectedTarget.region}`}
              {selectedTarget.site && ` → ${selectedTarget.site}`}
              {selectedTarget.node && ` → ${selectedTarget.node}`}
            </p>
          </div>
        </div>
      )}

      {/* Module Selector */}
      <div className="bg-card border-b border-border rounded-lg p-4">
        <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-9 gap-2">
          {MODULES.map(module => {
            const Icon = module.icon;
            return (
              <button
                key={module.id}
                onClick={() => setActiveModule(module.id)}
                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg border-2 transition h-24 ${
                  activeModule === module.id
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950'
                    : 'border-border hover:border-primary/40 bg-card'
                }`}
                title={module.description}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${activeModule === module.id ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'}`} />
                <span className="text-xs font-semibold text-center text-foreground line-clamp-2">{module.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Module */}
      <div className="flex-1 bg-card rounded-lg border border-border overflow-hidden flex flex-col">
        {/* Module Content */}
        <div className="flex-1 overflow-y-auto">
          {renderModule()}
        </div>
      </div>
    </div>
  );
};
