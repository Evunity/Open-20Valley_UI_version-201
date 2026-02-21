import React, { useState } from 'react';
import { Zap, CheckCircle, AlertCircle, Clock, Pause, Play, X, RotateCcw } from 'lucide-react';

interface ExecutionMonitorProps {
  selectedTarget: any;
  onTargetChange: (target: any) => void;
}

interface Execution {
  id: string;
  command: string;
  status: 'queued' | 'running' | 'success' | 'error' | 'paused' | 'cancelled';
  timestamp: string;
  duration: string;
  affectedObjects: number;
  vendor: string;
  successCount: number;
  failureCount: number;
  progress: number;
  errorMessage?: string;
  retryCount: number;
}

const MOCK_EXECUTIONS: Execution[] = [
  { id: '1', command: 'LST CELL;', status: 'success', timestamp: '14:32:15', duration: '2.3s', affectedObjects: 45, vendor: 'Huawei', successCount: 45, failureCount: 0, progress: 100, retryCount: 0 },
  { id: '2', command: 'SET TXPOWER:42;', status: 'running', timestamp: '14:31:50', duration: '0.8s', affectedObjects: 12, vendor: 'Huawei', successCount: 8, failureCount: 0, progress: 67, retryCount: 0 },
  { id: '3', command: 'show interfaces', status: 'success', timestamp: '14:30:22', duration: '1.1s', affectedObjects: 8, vendor: 'Nokia', successCount: 8, failureCount: 0, progress: 100, retryCount: 0 },
  { id: '4', command: 'Bulk TX Power Update', status: 'error', timestamp: '14:28:45', duration: '3.5s', affectedObjects: 20, vendor: 'Huawei', successCount: 18, failureCount: 2, progress: 90, errorMessage: '2 cells rejected due to parameter conflict', retryCount: 1 }
];

export const ExecutionMonitor: React.FC<ExecutionMonitorProps> = () => {
  const [executions, setExecutions] = useState<Execution[]>(MOCK_EXECUTIONS);
  const [filter, setFilter] = useState<'all' | 'running' | 'success' | 'error' | 'queued'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = executions.filter(e => filter === 'all' || e.status === filter);

  const pauseExecution = (id: string) => {
    setExecutions(executions.map(e => e.id === id ? { ...e, status: 'paused' } : e));
  };

  const resumeExecution = (id: string) => {
    setExecutions(executions.map(e => e.id === id ? { ...e, status: 'running' } : e));
  };

  const cancelExecution = (id: string) => {
    setExecutions(executions.map(e => e.id === id ? { ...e, status: 'cancelled' } : e));
  };

  const retryExecution = (id: string) => {
    setExecutions(executions.map(e => e.id === id ? { ...e, status: 'running', retryCount: e.retryCount + 1 } : e));
  };

  return (
    <div className="flex flex-col h-full gap-4 p-4">
      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'running', 'success', 'error', 'queued'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Active Executions */}
      <div className="space-y-3 flex-1 overflow-y-auto">
        {filtered.map((exec) => (
          <div key={exec.id} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setExpandedId(expandedId === exec.id ? null : exec.id)}
              className="w-full p-4 bg-white hover:bg-gray-50 transition flex items-start gap-3 text-left"
            >
              {exec.status === 'running' && <Zap className="w-5 h-5 text-yellow-600 animate-pulse flex-shrink-0 mt-0.5" />}
              {exec.status === 'success' && <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />}
              {exec.status === 'error' && <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />}
              {exec.status === 'paused' && <Pause className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />}
              {exec.status === 'queued' && <Clock className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />}

              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-gray-900 font-mono text-sm">{exec.command}</p>
                  <span className={`text-xs px-2 py-1 rounded font-semibold ${
                    exec.status === 'success' ? 'bg-green-100 text-green-800' :
                    exec.status === 'running' ? 'bg-yellow-100 text-yellow-800' :
                    exec.status === 'error' ? 'bg-red-100 text-red-800' :
                    exec.status === 'paused' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {exec.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {exec.timestamp}
                  </div>
                  <div>Duration: {exec.duration}</div>
                  <div>Affected: {exec.affectedObjects} objects</div>
                  <div className="text-gray-500">{exec.vendor}</div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        exec.status === 'success' ? 'bg-green-600' :
                        exec.status === 'error' ? 'bg-red-600' :
                        exec.status === 'running' ? 'bg-blue-600' :
                        'bg-gray-400'
                      }`}
                      style={{ width: `${exec.progress}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-600">
                    Progress: {exec.progress}% ({exec.successCount} success, {exec.failureCount} failed)
                  </div>
                </div>
              </div>
            </button>

            {/* Expanded Details & Controls */}
            {expandedId === exec.id && (
              <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-3">
                {/* Error Message */}
                {exec.errorMessage && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-xs font-semibold text-red-900 mb-1">Error</p>
                    <p className="text-sm text-red-800">{exec.errorMessage}</p>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white p-2 rounded border border-gray-200">
                    <p className="text-xs text-gray-600">Success</p>
                    <p className="text-lg font-bold text-green-600">{exec.successCount}</p>
                  </div>
                  <div className="bg-white p-2 rounded border border-gray-200">
                    <p className="text-xs text-gray-600">Failed</p>
                    <p className="text-lg font-bold text-red-600">{exec.failureCount}</p>
                  </div>
                  <div className="bg-white p-2 rounded border border-gray-200">
                    <p className="text-xs text-gray-600">Retries</p>
                    <p className="text-lg font-bold text-orange-600">{exec.retryCount}</p>
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex gap-2">
                  {exec.status === 'running' && (
                    <>
                      <button
                        onClick={() => pauseExecution(exec.id)}
                        className="flex-1 px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 font-semibold text-sm flex items-center justify-center gap-2 transition"
                      >
                        <Pause className="w-4 h-4" />
                        Pause
                      </button>
                      <button
                        onClick={() => cancelExecution(exec.id)}
                        className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-semibold text-sm flex items-center justify-center gap-2 transition"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </>
                  )}

                  {exec.status === 'paused' && (
                    <button
                      onClick={() => resumeExecution(exec.id)}
                      className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-semibold text-sm flex items-center justify-center gap-2 transition"
                    >
                      <Play className="w-4 h-4" />
                      Resume
                    </button>
                  )}

                  {exec.status === 'error' && (
                    <button
                      onClick={() => retryExecution(exec.id)}
                      className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-semibold text-sm flex items-center justify-center gap-2 transition"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Retry Failed
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-3 p-3 bg-gray-50 rounded-lg">
        <div>
          <p className="text-xs text-gray-600">Total Executions</p>
          <p className="text-2xl font-bold text-gray-900">{executions.length}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600">Success Rate</p>
          <p className="text-2xl font-bold text-green-600">
            {executions.length > 0
              ? ((executions.filter(e => e.status === 'success').length / executions.length) * 100).toFixed(0)
              : 0}%
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600">Running</p>
          <p className="text-2xl font-bold text-yellow-600">{executions.filter(e => e.status === 'running').length}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600">Failed</p>
          <p className="text-2xl font-bold text-red-600">{executions.filter(e => e.status === 'error').length}</p>
        </div>
      </div>
    </div>
  );
};
