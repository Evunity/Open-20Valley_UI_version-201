import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, AlertCircle, CheckCircle } from 'lucide-react';
import { generateMockExecutionWaves, ExecutionWave } from '../utils/automationData';

interface ExecutionOrchestratorProps {
  onExecute?: () => void;
  onPause?: () => void;
  onRollback?: () => void;
}

export const ExecutionOrchestrator: React.FC<ExecutionOrchestratorProps> = ({
  onExecute,
  onPause,
  onRollback
}) => {
  const [waves, setWaves] = useState<ExecutionWave[]>(generateMockExecutionWaves());
  const [isRunning, setIsRunning] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeWave, setActiveWave] = useState(1);

  // Simulate execution progress
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setCurrentTime(t => {
        const newTime = t + 1;
        if (newTime > 120) {
          setIsRunning(false);
          return t;
        }

        // Update waves based on time
        setWaves(prev =>
          prev.map((wave, idx) => {
            if (idx === 0) {
              return { ...wave, status: 'completed', progress: 100 };
            } else if (idx === 1) {
              const progress = Math.min(100, (newTime - 20) / 1.2);
              if (progress >= 100) {
                return { ...wave, status: 'completed', progress: 100 };
              }
              return { ...wave, status: 'running', progress };
            }
            return wave;
          })
        );

        return newTime;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isRunning]);

  const handlePauseResume = () => {
    setIsRunning(!isRunning);
    if (!isRunning) {
      onExecute?.();
    } else {
      onPause?.();
    }
  };

  const getPipelineStageIcon = (stage: string) => {
    const icons = {
      queued: '⏳',
      running: '▶️',
      validating: '✓',
      completed: '✅',
      failed: '❌',
      locked: '🔒'
    };
    return icons[stage as keyof typeof icons] || '❓';
  };

  const getWaveStatusColor = (status: ExecutionWave['status']) => {
    const colors = {
      queued: 'bg-gray-100 text-gray-800 border-gray-300',
      running: 'bg-blue-100 text-blue-800 border-blue-300',
      completed: 'bg-green-100 text-green-800 border-green-300',
      failed: 'bg-red-100 text-red-800 border-red-300',
      locked: 'bg-amber-100 text-amber-800 border-amber-300'
    };
    return colors[status];
  };

  const pipelineStages = ['Queued', 'Running', 'Validating', 'Completed'];

  return (
    <div className="flex flex-col h-full gap-4 p-4 bg-gray-50 overflow-y-auto">
      {/* Control Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Execution Pipeline</h2>
          <p className="text-sm text-gray-600 mt-1">
            Current: <strong>Wave {activeWave}</strong> • Time: {currentTime}s
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePauseResume}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${
              isRunning
                ? 'bg-amber-600 text-white hover:bg-amber-700'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4" /> Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4" /> Resume
              </>
            )}
          </button>
          <button
            onClick={() => {
              onRollback?.();
              setWaves(generateMockExecutionWaves());
              setCurrentTime(0);
              setIsRunning(false);
            }}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Rollback
          </button>
        </div>
      </div>

      {/* Pipeline Stages */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <p className="text-xs font-semibold text-gray-700 mb-3">Execution Pipeline Stages</p>
        <div className="flex gap-2">
          {pipelineStages.map((stage, idx) => (
            <div key={stage} className="flex-1">
              <div
                className={`px-3 py-2 rounded-lg text-xs font-semibold text-center border-2 transition ${
                  currentTime > idx * 30
                    ? 'bg-green-100 text-green-800 border-green-300'
                    : currentTime > (idx - 1) * 30
                    ? 'bg-blue-100 text-blue-800 border-blue-300 animate-pulse'
                    : 'bg-gray-100 text-gray-600 border-gray-300'
                }`}
              >
                {getPipelineStageIcon(stage.toLowerCase())} {stage}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progressive Rollout Waves */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
        <p className="text-xs font-semibold text-gray-700">Progressive Rollout</p>

        {waves.map((wave, idx) => (
          <div key={wave.id} className="space-y-2">
            {/* Wave Header */}
            <div
              className={`p-3 rounded-lg border-2 ${getWaveStatusColor(wave.status)} cursor-pointer transition hover:shadow-md`}
              onClick={() => setActiveWave(wave.wave)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getPipelineStageIcon(wave.status)}</span>
                  <div>
                    <p className="text-sm font-bold">Wave {wave.wave}</p>
                    <p className="text-xs opacity-75">{wave.nodeCount} nodes</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold">{wave.progress}%</p>
                  <p className="text-xs opacity-75">{wave.status}</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    wave.status === 'completed'
                      ? 'bg-green-500'
                      : wave.status === 'running'
                      ? 'bg-blue-500'
                      : wave.status === 'failed'
                      ? 'bg-red-500'
                      : 'bg-gray-400'
                  }`}
                  style={{ width: `${wave.progress}%` }}
                />
              </div>
            </div>

            {/* Wave Details */}
            {activeWave === wave.wave && wave.status !== 'locked' && (
              <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-gray-600 font-semibold">Nodes Affected</p>
                    <p className="text-lg font-bold text-gray-900">{wave.nodeCount}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-semibold">Status</p>
                    <p className="text-lg font-bold text-gray-900 capitalize">{wave.status}</p>
                  </div>
                </div>

                {wave.status === 'running' && (
                  <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                    <p className="text-blue-900">
                      {Math.round(wave.progress)}% complete • Estimated time remaining: ~
                      {Math.round((100 - wave.progress) / 2)}s
                    </p>
                  </div>
                )}

                {wave.status === 'completed' && (
                  <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                    <p className="text-green-900">✓ All {wave.nodeCount} nodes updated successfully</p>
                  </div>
                )}
              </div>
            )}

            {wave.status === 'locked' && (
              <div className="bg-amber-50 rounded-lg p-3 border border-amber-200 text-xs text-amber-900">
                🔒 Wave {wave.wave} is locked pending validation of Wave {wave.wave - 1}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Execution Log */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 flex-1 flex flex-col">
        <p className="text-xs font-semibold text-gray-700 mb-3">Execution Log</p>
        <div className="flex-1 overflow-y-auto space-y-2 min-h-0 text-xs">
          <div className="p-2 bg-green-50 rounded border-l-4 border-l-green-500 text-green-800">
            ✓ Wave 1 execution completed (5 nodes)
          </div>
          <div className="p-2 bg-blue-50 rounded border-l-4 border-l-blue-500 text-blue-800 animate-pulse">
            ▶ Wave 2 executing... (13/20 nodes complete)
          </div>
          <div className="p-2 bg-gray-50 rounded border-l-4 border-l-gray-400 text-gray-800">
            ⏳ Wave 3 queued (pending validation)
          </div>
          <div className="p-2 bg-amber-50 rounded border-l-4 border-l-amber-500 text-amber-800">
            ⚠ Safe rollback available until Wave 3 completes
          </div>
        </div>
      </div>
    </div>
  );
};
