import React, { useState, useRef, useEffect } from 'react';
import { Send, Copy, Check, ChevronDown, Lightbulb } from 'lucide-react';

interface ConsoleProps {
  selectedTarget: any;
  onTargetChange: (target: any) => void;
}

interface CommandHistory {
  id: string;
  command: string;
  timestamp: string;
  status: 'success' | 'error' | 'pending';
  output: string;
  vendor: string;
}

const VENDOR_COMMANDS = {
  'Huawei': [
    'LST POWER;',
    'LST CELL;',
    'LST TRANSPORT;',
    'GET CELLPOWER;',
    'SET TXPOWER:40;',
    'LST ALARMDATA;'
  ],
  'Nokia': [
    'show running-config',
    'show interfaces',
    'show alarms',
    'configure',
    'set cell parameters',
    'exit'
  ],
  'Ericsson': [
    'go sw',
    'list alarms',
    'get transport data',
    'set feature enable',
    'get statistics',
    'return'
  ],
  'ZTE': [
    'show system',
    'show transport',
    'set parameter',
    'show resource',
    'list alarms',
    'exit'
  ]
};

const COMMAND_HINTS: Record<string, string> = {
  'LST': 'List/View command - Read-only',
  'GET': 'Get parameter value',
  'SET': 'Set parameter value',
  'MODIFY': 'Modify configuration',
  'DELETE': 'Remove configuration',
  'CREATE': 'Create new object'
};

export const CommandConsole: React.FC<ConsoleProps> = ({ selectedTarget, onTargetChange }) => {
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState<CommandHistory[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<string>('Huawei');
  const [mode, setMode] = useState<'raw' | 'guided' | 'script'>('raw');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  const getCommandSyntaxValidation = (cmd: string) => {
    const trimmed = cmd.trim().toUpperCase();
    const keywords = Object.keys(COMMAND_HINTS);
    const matchedKeyword = keywords.find(k => trimmed.startsWith(k));
    return { isValid: matchedKeyword !== undefined, matchedKeyword };
  };

  const executeCommand = () => {
    if (!command.trim()) return;

    const { isValid, matchedKeyword } = getCommandSyntaxValidation(command);
    
    const newEntry: CommandHistory = {
      id: `cmd_${Date.now()}`,
      command: command.trim(),
      timestamp: new Date().toLocaleTimeString(),
      status: isValid ? 'success' : 'error',
      vendor: selectedVendor,
      output: isValid
        ? `[${selectedVendor}] Command executed successfully.\nReturning results...`
        : `[ERROR] Invalid ${selectedVendor} syntax. Expected: ${matchedKeyword || 'valid command'}`
    };

    setHistory([...history, newEntry]);
    setCommand('');
  };

  const copyCommand = (cmd: string, id: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const pasteCommand = (cmd: string) => {
    setCommand(cmd);
  };

  const { isValid } = getCommandSyntaxValidation(command);

  return (
    <div className="flex flex-col h-full gap-4 p-4">
      {/* Control Panel */}
      <div className="grid grid-cols-3 gap-4">
        {/* Vendor Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Vendor</label>
          <select
            value={selectedVendor}
            onChange={(e) => setSelectedVendor(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            {Object.keys(VENDOR_COMMANDS).map(vendor => (
              <option key={vendor} value={vendor}>{vendor}</option>
            ))}
          </select>
        </div>

        {/* Mode Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Mode</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="raw">Raw Mode (Native)</option>
            <option value="guided">Guided Mode (Form-Based)</option>
            <option value="script">Script Mode (Multi-line)</option>
          </select>
        </div>

        {/* Context */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Target Context</label>
          <input
            type="text"
            placeholder="Global → Country → Region → Site"
            value={selectedTarget.site ? `${selectedTarget.site}` : 'Global'}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
          />
        </div>
      </div>

      {/* Quick Commands */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
          <Lightbulb className="w-4 h-4 text-yellow-600" />
          Quick Commands ({selectedVendor})
        </label>
        <div className="grid grid-cols-3 gap-2">
          {VENDOR_COMMANDS[selectedVendor as keyof typeof VENDOR_COMMANDS]?.slice(0, 6).map((cmd, i) => (
            <button
              key={i}
              onClick={() => pasteCommand(cmd)}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded transition font-mono text-left"
              title={`Paste: ${cmd}`}
            >
              {cmd.length > 20 ? cmd.substring(0, 17) + '...' : cmd}
            </button>
          ))}
        </div>
      </div>

      {/* Console Display */}
      <div className="flex-1 bg-gray-900 border border-gray-800 rounded-lg overflow-y-auto font-mono text-xs p-4">
        <div className="text-green-400">
          <p>$ OpenValley Command Console - {selectedVendor}</p>
          <p>$ Type commands below. Press Enter to execute.</p>
          <p>$ All commands are audited and logged.</p>
          <p></p>

          {history.map((entry) => (
            <div key={entry.id} className="mb-3">
              <p className="text-blue-400">{entry.timestamp} $ {entry.command}</p>
              <pre className={`text-xs whitespace-pre-wrap ${
                entry.status === 'success' ? 'text-green-300' :
                entry.status === 'error' ? 'text-red-300' :
                'text-yellow-300'
              }`}>
                {entry.output}
              </pre>
            </div>
          ))}
        </div>
        <div ref={consoleEndRef} />
      </div>

      {/* Command Input */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="flex-1">
            <textarea
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  executeCommand();
                }
              }}
              placeholder={`Enter ${selectedVendor} command (e.g., LST CELL;)`}
              className={`w-full px-3 py-2 border-2 rounded-lg font-mono text-sm focus:outline-none transition ${
                command.trim() && isValid
                  ? 'border-green-500 bg-green-50'
                  : command.trim()
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300'
              }`}
              rows={3}
            />
          </div>
          <button
            onClick={executeCommand}
            disabled={!command.trim()}
            className="px-4 h-fit py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2 font-semibold"
          >
            <Send className="w-4 h-4" />
            Execute
          </button>
        </div>

        {/* Syntax Hints */}
        {command.trim() && (
          <div className={`p-2 rounded-lg text-xs ${
            isValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <p className={isValid ? 'text-green-800' : 'text-red-800'}>
              {isValid ? '✓ Valid syntax' : '✗ Invalid syntax'} 
              {getCommandSyntaxValidation(command).matchedKeyword && 
                ` - ${COMMAND_HINTS[getCommandSyntaxValidation(command).matchedKeyword || '']}`}
            </p>
          </div>
        )}
      </div>

      {/* Recent Commands */}
      {history.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold text-gray-700 mb-2">Recent Commands</p>
          <div className="space-y-1 max-h-20 overflow-y-auto">
            {history.slice(-5).reverse().map((entry) => (
              <button
                key={entry.id}
                onClick={() => copyCommand(entry.command, entry.id)}
                className="w-full text-left px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 font-mono flex items-center justify-between group"
              >
                <span className="truncate">{entry.command}</span>
                {copiedId === entry.id ? (
                  <Check className="w-3 h-3 text-green-600 flex-shrink-0" />
                ) : (
                  <Copy className="w-3 h-3 text-gray-600 opacity-0 group-hover:opacity-100 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
