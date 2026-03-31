import React, { useState, useRef, useEffect } from 'react';
import { Send, Copy, Check, ChevronDown, Lightbulb } from 'lucide-react';
import SearchableDropdown from './SearchableDropdown';

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
  const [customCommands, setCustomCommands] = useState<Record<string, string[]>>({});
  const [showAddCommand, setShowAddCommand] = useState(false);
  const [newCommandInput, setNewCommandInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSite, setSelectedSite] = useState<string[]>([]);
  const [selectedTechnology, setSelectedTechnology] = useState<string[]>([]);
  const [guidedCommand, setGuidedCommand] = useState<{ keyword: string; params: string }>({ keyword: '', params: '' });
  const [quickCommandView, setQuickCommandView] = useState<'all' | 'custom'>('all');
  const consoleEndRef = useRef<HTMLDivElement>(null);

  // Options for selectors
  const SITE_OPTIONS = ['Site-A', 'Site-B', 'Site-C', 'Site-D'];
  const TECHNOLOGY_OPTIONS = ['2G', '3G', '4G', '5G', 'O-RAN'];

  // Load from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('commandHistory');
    const savedCustomCommands = localStorage.getItem('customCommands');

    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to load history:', e);
      }
    }

    if (savedCustomCommands) {
      try {
        setCustomCommands(JSON.parse(savedCustomCommands));
      } catch (e) {
        console.error('Failed to load custom commands:', e);
      }
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('commandHistory', JSON.stringify(history));
  }, [history]);

  // Save custom commands to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('customCommands', JSON.stringify(customCommands));
  }, [customCommands]);

  const scrollToBottom = () => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  // Reset quick command view when vendor changes
  useEffect(() => {
    setQuickCommandView('all');
  }, [selectedVendor]);

  const getCommandSyntaxValidation = (cmd: string) => {
    const trimmed = cmd.trim().toUpperCase();
    const keywords = Object.keys(COMMAND_HINTS);
    const matchedKeyword = keywords.find(k => trimmed.startsWith(k));
    return { isValid: matchedKeyword !== undefined, matchedKeyword };
  };

  const getAutocompleteSuggestions = (input: string): string[] => {
    const upperInput = input.trim().toUpperCase();
    if (!upperInput) return [];

    const allCommands = [
      ...getQuickCommands(),
      ...(VENDOR_COMMANDS[selectedVendor as keyof typeof VENDOR_COMMANDS] || [])
    ];

    const uniqueCommands = Array.from(new Set(allCommands));
    return uniqueCommands
      .filter(cmd => cmd.toUpperCase().includes(upperInput))
      .slice(0, 5);
  };

  const executeCommand = () => {
    if (!command.trim()) return;

    // Validate required selections
    if (selectedSite.length === 0 || selectedTechnology.length === 0 || !selectedVendor) {
      const missing = [];
      if (selectedSite.length === 0) missing.push('Site');
      if (selectedTechnology.length === 0) missing.push('Technology');
      if (!selectedVendor) missing.push('Vendor');

      const errorEntry: CommandHistory = {
        id: `cmd_${Date.now()}`,
        command: command.trim(),
        timestamp: new Date().toLocaleTimeString(),
        status: 'error',
        vendor: selectedVendor,
        output: `[ERROR] Please select: ${missing.join(', ')} before executing commands`
      };
      setHistory([...history, errorEntry]);
      return;
    }

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
    setShowSuggestions(false);
  };

  const copyCommand = (cmd: string, id: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const pasteCommand = (cmd: string) => {
    setCommand(cmd);
  };

  const addCustomCommand = () => {
    if (!newCommandInput.trim()) return;

    setCustomCommands(prev => ({
      ...prev,
      [selectedVendor]: [
        ...(prev[selectedVendor] || []),
        newCommandInput.trim()
      ]
    }));
    setNewCommandInput('');
    setShowAddCommand(false);
  };

  const removeCustomCommand = (index: number) => {
    setCustomCommands(prev => ({
      ...prev,
      [selectedVendor]: prev[selectedVendor]?.filter((_, i) => i !== index) || []
    }));
  };

  const getQuickCommands = () => {
    const custom = customCommands[selectedVendor] || [];
    const defaults = VENDOR_COMMANDS[selectedVendor as keyof typeof VENDOR_COMMANDS] || [];

    if (quickCommandView === 'custom') {
      return custom.slice(0, 6);
    }

    return [...custom, ...defaults].slice(0, 6);
  };

  const hasCustomCommands = (customCommands[selectedVendor]?.length || 0) > 0;

  const { isValid } = getCommandSyntaxValidation(command);

  return (
    <div className="flex flex-col h-full gap-2 p-4">
      {/* Control Panel */}
      <div className="space-y-3">
        {/* Required Selection Row */}
        <div className="grid grid-cols-3 gap-3">
          {/* Site Selection */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Site <span className="text-red-500">*</span>
            </label>
            <SearchableDropdown
              label=""
              options={SITE_OPTIONS}
              selected={selectedSite}
              onChange={(selected) => setSelectedSite(selected)}
              placeholder="Search sites..."
              multiSelect={false}
              searchable={true}
              compact={true}
            />
          </div>

          {/* Technology Selection */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Technology <span className="text-red-500">*</span>
            </label>
            <SearchableDropdown
              label=""
              options={TECHNOLOGY_OPTIONS}
              selected={selectedTechnology}
              onChange={(selected) => setSelectedTechnology(selected)}
              placeholder="Search technologies..."
              multiSelect={false}
              searchable={true}
              compact={true}
            />
          </div>

          {/* Vendor Selection */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Vendor <span className="text-red-500">*</span>
            </label>
            <SearchableDropdown
              label=""
              options={Object.keys(VENDOR_COMMANDS)}
              selected={selectedVendor ? [selectedVendor] : []}
              onChange={(selected) => setSelectedVendor(selected[0] || '')}
              placeholder="Select vendor..."
              multiSelect={false}
              searchable={true}
              compact={true}
            />
          </div>
        </div>

        {/* Mode Selection */}
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Mode</label>
            <SearchableDropdown
              label=""
              options={['Raw Mode (Native)', 'Guided Mode (Form-Based)', 'Script Mode (Multi-line)']}
              selected={mode === 'raw' ? ['Raw Mode (Native)'] : mode === 'guided' ? ['Guided Mode (Form-Based)'] : ['Script Mode (Multi-line)']}
              onChange={(selected) => {
                const modeMap: Record<string, 'raw' | 'guided' | 'script'> = {
                  'Raw Mode (Native)': 'raw',
                  'Guided Mode (Form-Based)': 'guided',
                  'Script Mode (Multi-line)': 'script'
                };
                setMode(modeMap[selected[0]] || 'raw');
              }}
              placeholder="Select mode..."
              multiSelect={false}
              searchable={true}
              compact={true}
            />
          </div>
          <button
            onClick={() => setShowAddCommand(!showAddCommand)}
            className="flex-1 text-xs bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded text-primary font-medium transition h-9 flex items-center justify-center"
          >
            + Add
          </button>
        </div>
      </div>

      {/* Quick Commands */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="block text-xs font-semibold text-muted-foreground flex items-center gap-1">
            <Lightbulb className="w-4 h-4 text-yellow-600" />
            Quick Commands ({selectedVendor})
          </label>
          {hasCustomCommands && (
            <div className="flex gap-1 bg-muted/40 border border-border rounded p-0.5">
              <button
                onClick={() => setQuickCommandView('all')}
                className={`px-2 py-0.5 text-xs rounded transition ${
                  quickCommandView === 'all'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setQuickCommandView('custom')}
                className={`px-2 py-0.5 text-xs rounded transition ${
                  quickCommandView === 'custom'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Custom
              </button>
            </div>
          )}
        </div>

        {showAddCommand && (
          <div className="mb-2 p-2 bg-muted/40 border border-border rounded flex gap-2">
            <input
              type="text"
              value={newCommandInput}
              onChange={(e) => setNewCommandInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCustomCommand();
                }
              }}
              placeholder={`Add custom ${selectedVendor} command...`}
              className="flex-1 px-2 py-1 text-xs border border-border rounded bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              autoFocus
            />
            <button
              onClick={addCustomCommand}
              disabled={!newCommandInput.trim()}
              className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition"
            >
              Save
            </button>
            <button
              onClick={() => {
                setShowAddCommand(false);
                setNewCommandInput('');
              }}
              className="px-2 py-1 text-xs bg-muted hover:bg-muted/80 border border-border rounded transition"
            >
              Cancel
            </button>
          </div>
        )}

        <div className="grid grid-cols-3 gap-1.5 mb-3">
          {getQuickCommands().map((cmd, i) => {
            const isCustom = i < (customCommands[selectedVendor]?.length || 0);
            return (
              <div
                key={i}
                className="relative group"
              >
                <button
                  onClick={() => pasteCommand(cmd)}
                  className={`w-full px-2 py-1 text-xs border rounded transition font-mono text-left ${
                    isCustom
                      ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50'
                      : 'bg-muted/60 hover:bg-muted border-border'
                  } text-foreground`}
                  title={`Paste: ${cmd}`}
                >
                  {cmd.length > 20 ? cmd.substring(0, 17) + '...' : cmd}
                </button>
                {isCustom && (
                  <button
                    onClick={() => removeCustomCommand(i)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-xs hover:bg-red-600"
                    title="Remove custom command"
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Command Input - Mode Specific */}
      <div className="space-y-1">
        {mode === 'raw' && (
          <div className="flex gap-2 items-stretch">
            <div className="flex-1">
              <div className="relative flex-1 flex flex-col">
                <textarea
                  value={command}
                  onChange={(e) => {
                    const upperValue = e.target.value.toUpperCase();
                    setCommand(upperValue);
                    setShowSuggestions(upperValue.trim().length > 0);
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      executeCommand();
                    }
                  }}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  onFocus={() => command.trim().length > 0 && setShowSuggestions(true)}
                  disabled={selectedSite.length === 0 || selectedTechnology.length === 0 || !selectedVendor}
                  placeholder={selectedSite.length === 0 || selectedTechnology.length === 0 || !selectedVendor
                    ? 'Please select Site, Technology & Vendor first'
                    : `Enter ${selectedVendor} command in UPPERCASE (e.g., LST CELL;)`}
                  className={`w-full px-3 py-2 border rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-muted/20 resize-none ${
                    selectedSite.length === 0 || selectedTechnology.length === 0 || !selectedVendor
                      ? 'border-amber-300/60 dark:border-amber-700/60 text-muted-foreground bg-amber-50/30 dark:bg-amber-950/10'
                      : command.trim() && isValid
                      ? 'border-green-500/70 bg-green-50/40 dark:bg-green-950/20 text-foreground'
                      : command.trim()
                      ? 'border-red-500/70 bg-red-50/40 dark:bg-red-950/20 text-foreground'
                      : 'border-border bg-input text-foreground'
                  }`}
                  rows={2}
                />

                {/* Autocomplete Suggestions */}
                {showSuggestions && getAutocompleteSuggestions(command).length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                    {getAutocompleteSuggestions(command).map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setCommand(suggestion);
                          setShowSuggestions(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm font-mono hover:bg-muted/70 border-b border-border last:border-b-0 text-foreground transition"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={executeCommand}
              disabled={!command.trim()}
              className="px-5 h-auto py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2 font-semibold text-sm whitespace-nowrap flex-shrink-0"
            >
              <Send className="w-4 h-4" />
              <span>Execute</span>
            </button>
          </div>
        )}

        {mode === 'guided' && (
          <div className="space-y-3 p-4 bg-muted/20 border border-border rounded-lg">
            <p className="text-xs font-semibold text-muted-foreground mb-3">Build Command Interactively</p>
            <div className="grid grid-cols-2 gap-3">
              <SearchableDropdown
                label=""
                options={Object.keys(COMMAND_HINTS)}
                selected={guidedCommand.keyword ? [guidedCommand.keyword] : []}
                onChange={(selected) => setGuidedCommand(prev => ({ ...prev, keyword: selected[0] || '' }))}
                placeholder="Select Command Keyword"
                multiSelect={false}
                searchable={true}
                compact={true}
              />
              <input
                type="text"
                value={guidedCommand.params}
                onChange={(e) => setGuidedCommand(prev => ({ ...prev, params: e.target.value.toUpperCase() }))}
                disabled={selectedSite.length === 0 || selectedTechnology.length === 0 || !selectedVendor}
                placeholder="Parameters (optional)"
                className="px-3 py-2 text-sm border border-border rounded-lg bg-input text-foreground uppercase focus:outline-none focus:ring-2 focus:ring-primary/50 transition disabled:opacity-50 disabled:bg-muted/20"
              />
            </div>
            <button
              onClick={() => {
                if (guidedCommand.keyword) {
                  const fullCommand = guidedCommand.params
                    ? `${guidedCommand.keyword} ${guidedCommand.params}`
                    : guidedCommand.keyword;
                  setCommand(fullCommand);
                  setGuidedCommand({ keyword: '', params: '' });
                  executeCommand();
                }
              }}
              disabled={!guidedCommand.keyword || selectedSite.length === 0 || selectedTechnology.length === 0 || !selectedVendor}
              className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 font-semibold text-sm"
            >
              <Send className="w-4 h-4" />
              Execute
            </button>
          </div>
        )}

        {mode === 'script' && (
          <div className="flex gap-2 items-stretch">
            <div className="flex-1">
              <textarea
                value={command}
                onChange={(e) => {
                  const upperValue = e.target.value.toUpperCase();
                  setCommand(upperValue);
                  setShowSuggestions(false);
                }}
                disabled={selectedSite.length === 0 || selectedTechnology.length === 0 || !selectedVendor}
                placeholder={selectedSite.length === 0 || selectedTechnology.length === 0 || !selectedVendor
                  ? 'Please select Site, Technology & Vendor first'
                  : 'Enter multiple commands (one per line)'}
                className={`w-full px-3 py-2 border rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-muted/20 resize-none ${
                  selectedSite.length === 0 || selectedTechnology.length === 0 || !selectedVendor
                    ? 'border-amber-300/60 dark:border-amber-700/60 text-muted-foreground bg-amber-50/30 dark:bg-amber-950/10'
                    : 'border-border bg-input text-foreground'
                }`}
                rows={4}
              />
            </div>
            <button
              onClick={() => {
                const commands = command.split('\n').filter(cmd => cmd.trim());
                commands.forEach(cmd => {
                  setCommand(cmd.trim());
                });
                if (commands.length > 0) {
                  setCommand(commands[commands.length - 1]);
                  executeCommand();
                }
              }}
              disabled={!command.trim()}
              className="px-5 h-auto py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2 font-semibold text-sm whitespace-nowrap flex-shrink-0"
            >
              <Send className="w-4 h-4" />
              <span>Execute All</span>
            </button>
          </div>
        )}

        {/* Syntax Hints */}
        {command.trim() && (
          <div className={`p-2 rounded-lg text-xs ${
            isValid
              ? 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800'
          }`}>
            <p className={isValid ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}>
              {isValid ? '✓ Valid syntax' : '✗ Invalid syntax'}
              {getCommandSyntaxValidation(command).matchedKeyword &&
                ` - ${COMMAND_HINTS[getCommandSyntaxValidation(command).matchedKeyword || '']}`}
            </p>
          </div>
        )}
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

      {/* Recent Commands */}
      {history.length > 0 && (
        <div className="mt-2">
          <p className="text-xs font-semibold text-muted-foreground mb-1">Recent Commands</p>
          <div className="space-y-1 max-h-20 overflow-y-auto">
            {history.slice(-5).reverse().map((entry) => (
              <button
                key={entry.id}
                onClick={() => copyCommand(entry.command, entry.id)}
                className="w-full text-left px-2 py-1 text-xs bg-muted/60 hover:bg-muted rounded border border-border font-mono flex items-center justify-between group text-foreground"
              >
                <span className="truncate">{entry.command}</span>
                {copiedId === entry.id ? (
                  <Check className="w-3 h-3 text-green-600 flex-shrink-0" />
                ) : (
                  <Copy className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
