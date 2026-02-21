import React, { useState } from 'react';
import { Shield, Play, AlertCircle, CheckCircle, Zap } from 'lucide-react';

interface SandboxModeProps {
  selectedTarget: any;
  onTargetChange: (target: any) => void;
}

interface TestResult {
  id: string;
  command: string;
  expectedBehavior: string;
  actualBehavior: string;
  passed: boolean;
  duration: string;
}

const MOCK_TESTS: TestResult[] = [
  {
    id: '1',
    command: 'SET TXPOWER:42;',
    expectedBehavior: 'TX Power should be 42 dBm',
    actualBehavior: 'TX Power confirmed as 42 dBm ✓',
    passed: true,
    duration: '0.8s'
  },
  {
    id: '2',
    command: 'LST CELL;',
    expectedBehavior: 'Should return 45 cell objects',
    actualBehavior: 'Returned 45 cell objects ✓',
    passed: true,
    duration: '1.2s'
  }
];

export const SandboxMode: React.FC<SandboxModeProps> = () => {
  const [sandboxCommand, setSandboxCommand] = useState('');
  const [testResults, setTestResults] = useState<TestResult[]>(MOCK_TESTS);
  const [isRunning, setIsRunning] = useState(false);

  const runTest = async () => {
    setIsRunning(true);
    // Simulate test execution
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRunning(false);
  };

  return (
    <div className="flex flex-col h-full gap-4 p-4">
      {/* Safety Notice */}
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
        <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-green-900">Safe Testing Environment</p>
          <p className="text-sm text-green-800">Commands are executed in a sandbox with no impact to production</p>
        </div>
      </div>

      {/* Test Command Input */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900">Create Test Case</h3>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Command to Test</label>
          <textarea
            value={sandboxCommand}
            onChange={(e) => setSandboxCommand(e.target.value)}
            placeholder="Enter command to test in sandbox..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Expected Behavior</label>
          <textarea
            placeholder="What should happen when this command executes?"
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={runTest}
          disabled={!sandboxCommand.trim() || isRunning}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2 transition"
        >
          <Play className="w-4 h-4" />
          {isRunning ? 'Running Test...' : 'Run Test'}
        </button>
      </div>

      {/* Test Results */}
      <div className="space-y-3 flex-1 overflow-y-auto">
        <h3 className="font-semibold text-gray-900">Test Results</h3>

        {testResults.map((result) => (
          <div key={result.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start gap-3 mb-2">
              {result.passed ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              )}

              <div className="flex-1">
                <p className="font-semibold text-gray-900 font-mono text-sm">{result.command}</p>
                <p className={`text-sm ${result.passed ? 'text-green-800' : 'text-red-800'}`}>
                  {result.passed ? '✓ Test Passed' : '✗ Test Failed'} • {result.duration}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-1">Expected</p>
                <p className="text-gray-600">{result.expectedBehavior}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-1">Actual</p>
                <p className="text-gray-600">{result.actualBehavior}</p>
              </div>
            </div>

            <button className="mt-3 w-full px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 font-semibold text-sm transition">
              <Zap className="w-3 h-3 inline mr-1" />
              Run in Production
            </button>
          </div>
        ))}
      </div>

      {/* Guidelines */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
        <p><strong>Best Practices:</strong></p>
        <ul className="list-disc list-inside mt-1 space-y-0.5">
          <li>Always test in sandbox before production</li>
          <li>Define expected behavior clearly</li>
          <li>Verify all affected objects</li>
          <li>Test edge cases and error conditions</li>
        </ul>
      </div>
    </div>
  );
};
