import React, { useState } from 'react';
import { Zap, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface ExecutionMonitorProps {
  selectedTarget: any;
  onTargetChange: (target: any) => void;
}

interface Execution {
  id: string;
  command: string;
  status: 'running' | 'success' | 'error';
  timestamp: string;
  duration: string;
  affectedObjects: number;
  vendor: string;
}

const MOCK_EXECUTIONS: Execution[] = [
  { id: '1', command: 'LST CELL;', status: 'success', timestamp: '14:32:15', duration: '2.3s', affectedObjects: 45, vendor: 'Huawei' },
  { id: '2', command: 'SET TXPOWER:42;', status: 'running', timestamp: '14:31:50', duration: '0.8s', affectedObjects: 1, vendor: 'Huawei' },
  { id: '3', command: 'show interfaces', status: 'success', timestamp: '14:30:22', duration: '1.1s', affectedObjects: 8, vendor: 'Nokia' },
];

export const ExecutionMonitor: React.FC<ExecutionMonitorProps> = () => {
  const [executions] = useState<Execution[]>(MOCK_EXECUTIONS);
  const [filter, setFilter] = useState<'all' | 'running' | 'success' | 'error'>('all');

  const filtered = executions.filter(e => filter === 'all' || e.status === filter);

  return (
    <div className="flex flex-col h-full gap-4 p-4">
      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'running', 'success', 'error'] as const).map(f => (
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
          <div key={exec.id} className="border border-gray-200 rounded-lg p-4 bg-white">
            <div className="flex items-start gap-3">
              {exec.status === 'running' && <Zap className="w-5 h-5 text-yellow-600 animate-pulse flex-shrink-0" />}
              {exec.status === 'success' && <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />}
              {exec.status === 'error' && <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />}

              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-gray-900 font-mono text-sm">{exec.command}</p>
                  <span className={`text-xs px-2 py-1 rounded font-semibold ${
                    exec.status === 'success' ? 'bg-green-100 text-green-800' :
                    exec.status === 'running' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {exec.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {exec.timestamp}
                  </div>
                  <div>Duration: {exec.duration}</div>
                  <div>Affected: {exec.affectedObjects} objects</div>
                  <div className="text-gray-500">{exec.vendor}</div>
                </div>

                {exec.status === 'running' && (
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-blue-600 h-1.5 rounded-full animate-pulse" style={{ width: '65%' }}></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 p-3 bg-gray-50 rounded-lg">
        <div>
          <p className="text-xs text-gray-600">Total Executions</p>
          <p className="text-2xl font-bold text-gray-900">{executions.length}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600">Success Rate</p>
          <p className="text-2xl font-bold text-green-600">95.2%</p>
        </div>
        <div>
          <p className="text-xs text-gray-600">Avg Duration</p>
          <p className="text-2xl font-bold text-gray-900">1.4s</p>
        </div>
      </div>
    </div>
  );
};
