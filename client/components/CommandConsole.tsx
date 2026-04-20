import React, { useState, useRef, useEffect } from 'react';
import { Send, Copy, Check, ChevronDown, Lightbulb, Zap, CheckCircle, AlertCircle, Clock, Pause, Play, RotateCcw, Pencil, Trash2 } from 'lucide-react';
import SearchableDropdown from './SearchableDropdown';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

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

type QuickCommandScope = 'global' | 'vendor' | 'technology' | 'vendor_technology';

interface QuickCommand {
  id: string;
  label: string;
  commandText: string;
  scope: QuickCommandScope;
  vendor: string | null;
  technology: string | null;
  description: string | null;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
}

interface QuickCommandFormState {
  label: string;
  commandText: string;
  scope: QuickCommandScope;
  vendor: string;
  technology: string;
  description: string;
}

const QUICK_COMMANDS_STORAGE_KEY = 'commandConsole.quickCommands.v2';
const QUICK_COMMANDS_USER_ID = 'current-user';
const VENDORS = ['Huawei', 'Nokia', 'Ericsson', 'ZTE'];
const SITE_OPTIONS = ['Site-A', 'Site-B', 'Site-C', 'Site-D'];
const TECHNOLOGY_OPTIONS = ['2G', '3G', '4G', '5G', 'O-RAN'];

const DEFAULT_QUICK_COMMANDS: QuickCommand[] = [
  { id: 'seed-huawei-list-cells', label: 'List Cells', commandText: 'LST CELL;', scope: 'vendor', vendor: 'Huawei', technology: null, description: 'List Huawei cells', createdByUserId: QUICK_COMMANDS_USER_ID, createdAt: '2026-04-20T00:00:00.000Z', updatedAt: '2026-04-20T00:00:00.000Z' },
  { id: 'seed-huawei-alarm-data', label: 'Alarm Data', commandText: 'LST ALARMDATA;', scope: 'vendor', vendor: 'Huawei', technology: null, description: 'Fetch Huawei alarm data', createdByUserId: QUICK_COMMANDS_USER_ID, createdAt: '2026-04-20T00:00:00.000Z', updatedAt: '2026-04-20T00:00:00.000Z' },
  { id: 'seed-nokia-show-intf', label: 'Show Interfaces', commandText: 'show interfaces', scope: 'vendor', vendor: 'Nokia', technology: null, description: 'Check interface status', createdByUserId: QUICK_COMMANDS_USER_ID, createdAt: '2026-04-20T00:00:00.000Z', updatedAt: '2026-04-20T00:00:00.000Z' },
  { id: 'seed-ericsson-list-alarms', label: 'List Alarms', commandText: 'list alarms', scope: 'vendor', vendor: 'Ericsson', technology: null, description: 'List active alarms', createdByUserId: QUICK_COMMANDS_USER_ID, createdAt: '2026-04-20T00:00:00.000Z', updatedAt: '2026-04-20T00:00:00.000Z' },
  { id: 'seed-zte-show-system', label: 'Show System', commandText: 'show system', scope: 'vendor', vendor: 'ZTE', technology: null, description: 'Show system status', createdByUserId: QUICK_COMMANDS_USER_ID, createdAt: '2026-04-20T00:00:00.000Z', updatedAt: '2026-04-20T00:00:00.000Z' },
  { id: 'seed-global-health-check', label: 'Health Check', commandText: 'GET HEALTH;', scope: 'global', vendor: null, technology: null, description: 'Global network health check', createdByUserId: QUICK_COMMANDS_USER_ID, createdAt: '2026-04-20T00:00:00.000Z', updatedAt: '2026-04-20T00:00:00.000Z' },
];

const EMPTY_QUICK_COMMAND_FORM: QuickCommandFormState = {
  label: '',
  commandText: '',
  scope: 'global',
  vendor: '',
  technology: '',
  description: '',
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
  const [quickCommands, setQuickCommands] = useState<QuickCommand[]>([]);
  const [quickCommandDialogOpen, setQuickCommandDialogOpen] = useState(false);
  const [editingQuickCommandId, setEditingQuickCommandId] = useState<string | null>(null);
  const [quickCommandForm, setQuickCommandForm] = useState<QuickCommandFormState>(EMPTY_QUICK_COMMAND_FORM);
  const [quickCommandFormError, setQuickCommandFormError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSite, setSelectedSite] = useState<string[]>([]);
  const [selectedTechnology, setSelectedTechnology] = useState<string[]>([]);
  const [guidedCommand, setGuidedCommand] = useState<{ keyword: string; params: string }>({ keyword: '', params: '' });
  const [inlineSuggestion, setInlineSuggestion] = useState<string>('');
  const [showInlineSuggestion, setShowInlineSuggestion] = useState(false);
  const consoleEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('commandHistory');
    const savedQuickCommands = localStorage.getItem(QUICK_COMMANDS_STORAGE_KEY);

    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to load history:', e);
      }
    }

    if (savedQuickCommands) {
      try {
        const parsed = JSON.parse(savedQuickCommands) as QuickCommand[];
        setQuickCommands(Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_QUICK_COMMANDS);
      } catch (e) {
        console.error('Failed to load quick commands:', e);
        setQuickCommands(DEFAULT_QUICK_COMMANDS);
      }
    } else {
      try {
        const legacySaved = JSON.parse(localStorage.getItem('savedCommandsList') || '[]') as string[];
        const migratedLegacyCommands: QuickCommand[] = legacySaved.map((cmd, index) => ({
          id: `migrated-${index}-${cmd}`,
          label: `Migrated ${index + 1}`,
          commandText: cmd,
          scope: 'global',
          vendor: null,
          technology: null,
          description: 'Migrated from previous saved commands.',
          createdByUserId: QUICK_COMMANDS_USER_ID,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
        setQuickCommands([...DEFAULT_QUICK_COMMANDS, ...migratedLegacyCommands]);
      } catch (e) {
        console.error('Failed to migrate quick commands:', e);
        setQuickCommands(DEFAULT_QUICK_COMMANDS);
      }
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('commandHistory', JSON.stringify(history));
  }, [history]);

  // Persist quick commands in user preference storage
  useEffect(() => {
    localStorage.setItem(QUICK_COMMANDS_STORAGE_KEY, JSON.stringify(quickCommands));
  }, [quickCommands]);

  const scrollToBottom = () => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  const currentTechnology = selectedTechnology[0] || '';
  const visibleQuickCommands = quickCommands
    .filter((quickCommand) => {
      if (quickCommand.scope === 'global') return true;
      if (quickCommand.scope === 'vendor') return quickCommand.vendor === selectedVendor;
      if (quickCommand.scope === 'technology') return quickCommand.technology === currentTechnology;
      if (quickCommand.scope === 'vendor_technology') {
        return quickCommand.vendor === selectedVendor && quickCommand.technology === currentTechnology;
      }
      return false;
    })
    .sort((a, b) => a.label.localeCompare(b.label));

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
      ...visibleQuickCommands.map((quickCommand) => quickCommand.commandText),
      ...Object.keys(COMMAND_HINTS)
    ];

    const uniqueCommands = Array.from(new Set(allCommands));

    // First, try exact prefix matches (highest priority)
    const prefixMatches = uniqueCommands.filter(cmd => cmd.toUpperCase().startsWith(upperInput));

    // Then, try includes matches for better autocomplete
    const includesMatches = uniqueCommands.filter(cmd =>
      cmd.toUpperCase().includes(upperInput) && !prefixMatches.includes(cmd)
    );

    return [...prefixMatches, ...includesMatches].slice(0, 8);
  };

  const getInlineSuggestion = (input: string): string => {
    const upperInput = input.trim().toUpperCase();
    if (!upperInput) return '';

    const suggestions = getAutocompleteSuggestions(input);
    if (suggestions.length > 0) {
      // Return the first suggestion as inline completion
      return suggestions[0];
    }
    return '';
  };

  const acceptInlineSuggestion = () => {
    if (inlineSuggestion) {
      setCommand(inlineSuggestion);
      setInlineSuggestion('');
      setShowInlineSuggestion(false);
    }
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

  const openQuickCommandDialogForCreate = () => {
    setEditingQuickCommandId(null);
    setQuickCommandForm({
      ...EMPTY_QUICK_COMMAND_FORM,
      vendor: selectedVendor,
      technology: currentTechnology,
    });
    setQuickCommandFormError(null);
    setQuickCommandDialogOpen(true);
  };

  const openQuickCommandDialogForEdit = (quickCommand: QuickCommand) => {
    setEditingQuickCommandId(quickCommand.id);
    setQuickCommandForm({
      label: quickCommand.label,
      commandText: quickCommand.commandText,
      scope: quickCommand.scope,
      vendor: quickCommand.vendor ?? '',
      technology: quickCommand.technology ?? '',
      description: quickCommand.description ?? '',
    });
    setQuickCommandFormError(null);
    setQuickCommandDialogOpen(true);
  };

  const validateQuickCommandForm = (): string | null => {
    if (!quickCommandForm.label.trim()) return 'Shortcut name is required.';
    if (!quickCommandForm.commandText.trim()) return 'Command text is required.';
    if ((quickCommandForm.scope === 'vendor' || quickCommandForm.scope === 'vendor_technology') && !quickCommandForm.vendor) {
      return 'Vendor is required for this scope.';
    }
    if ((quickCommandForm.scope === 'technology' || quickCommandForm.scope === 'vendor_technology') && !quickCommandForm.technology) {
      return 'Technology is required for this scope.';
    }
    return null;
  };

  const saveQuickCommand = () => {
    const validationError = validateQuickCommandForm();
    if (validationError) {
      setQuickCommandFormError(validationError);
      return;
    }

    const nowIso = new Date().toISOString();
    const normalizedVendor = quickCommandForm.scope === 'vendor' || quickCommandForm.scope === 'vendor_technology' ? quickCommandForm.vendor : null;
    const normalizedTechnology = quickCommandForm.scope === 'technology' || quickCommandForm.scope === 'vendor_technology' ? quickCommandForm.technology : null;

    if (editingQuickCommandId) {
      setQuickCommands((prev) => prev.map((quickCommand) => (
        quickCommand.id === editingQuickCommandId
          ? {
              ...quickCommand,
              label: quickCommandForm.label.trim(),
              commandText: quickCommandForm.commandText.trim(),
              scope: quickCommandForm.scope,
              vendor: normalizedVendor,
              technology: normalizedTechnology,
              description: quickCommandForm.description.trim() || null,
              updatedAt: nowIso,
            }
          : quickCommand
      )));
    } else {
      const newQuickCommand: QuickCommand = {
        id: `quick-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        label: quickCommandForm.label.trim(),
        commandText: quickCommandForm.commandText.trim(),
        scope: quickCommandForm.scope,
        vendor: normalizedVendor,
        technology: normalizedTechnology,
        description: quickCommandForm.description.trim() || null,
        createdByUserId: QUICK_COMMANDS_USER_ID,
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      setQuickCommands((prev) => [newQuickCommand, ...prev]);
    }

    setQuickCommandDialogOpen(false);
    setQuickCommandForm(EMPTY_QUICK_COMMAND_FORM);
    setQuickCommandFormError(null);
  };

  const removeQuickCommand = (quickCommandId: string) => {
    if (!window.confirm('Remove this quick command shortcut?')) return;
    setQuickCommands((prev) => prev.filter((quickCommand) => quickCommand.id !== quickCommandId));
  };

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
              dropdownId="console-site-dropdown"
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
              dropdownId="console-technology-dropdown"
            />
          </div>

          {/* Vendor Selection */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Vendor <span className="text-red-500">*</span>
            </label>
            <SearchableDropdown
              label=""
              options={VENDORS}
              selected={selectedVendor ? [selectedVendor] : []}
              onChange={(selected) => setSelectedVendor(selected[0] || '')}
              placeholder="Select vendor..."
              multiSelect={false}
              searchable={true}
              compact={true}
              dropdownId="console-vendor-dropdown"
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
              dropdownId="console-mode-dropdown"
            />
          </div>
          <button
            onClick={openQuickCommandDialogForCreate}
            className="flex-1 text-xs bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded text-primary font-medium transition h-9 flex items-center justify-center"
          >
            + Add Quick Command
          </button>
        </div>
      </div>

      {/* Quick Commands */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="block text-xs font-semibold text-muted-foreground flex items-center gap-1">
            <Lightbulb className="w-4 h-4 text-yellow-600" />
            Quick Commands (User Managed)
          </label>
          <p className="text-[11px] text-muted-foreground">
            Context: {selectedVendor || 'Any'} / {currentTechnology || 'Any Technology'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-1.5 mb-3">
          {visibleQuickCommands.map((quickCommand) => {
            return (
              <div
                key={quickCommand.id}
                className="relative group rounded border border-border bg-muted/30 p-2"
              >
                <button
                  onClick={() => pasteCommand(quickCommand.commandText)}
                  className="w-full px-2 py-1 text-xs border rounded transition font-mono text-left bg-background hover:bg-muted border-border text-foreground"
                  title={`Paste: ${quickCommand.commandText}`}
                >
                  {quickCommand.label}
                </button>
                <p className="mt-1 text-[11px] text-muted-foreground truncate">{quickCommand.commandText}</p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
                    {quickCommand.scope.replace('_', ' + ')}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => openQuickCommandDialogForEdit(quickCommand)}
                      className="rounded border border-border p-1 hover:bg-muted"
                      title="Edit quick command"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => removeQuickCommand(quickCommand.id)}
                      className="rounded border border-border p-1 hover:bg-muted text-red-600"
                      title="Delete quick command"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {visibleQuickCommands.length === 0 && (
          <div className="mb-3 rounded border border-dashed border-border bg-muted/20 p-3 text-xs text-muted-foreground">
            No quick commands match this context. Click <strong>+ Add Quick Command</strong> to create one.
          </div>
        )}
      </div>

      <Dialog open={quickCommandDialogOpen} onOpenChange={setQuickCommandDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingQuickCommandId ? 'Edit Quick Command' : 'Add Quick Command'}</DialogTitle>
            <DialogDescription>
              Manage user shortcuts with Global, Vendor, Technology, or Vendor + Technology scope.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Shortcut Name</label>
              <Input
                value={quickCommandForm.label}
                onChange={(event) => setQuickCommandForm((prev) => ({ ...prev, label: event.target.value }))}
                placeholder="e.g. LTE Health Check"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Command Text</label>
              <Textarea
                value={quickCommandForm.commandText}
                onChange={(event) => setQuickCommandForm((prev) => ({ ...prev, commandText: event.target.value }))}
                placeholder="Enter command text"
                className="min-h-[84px]"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Scope</label>
              <select
                value={quickCommandForm.scope}
                onChange={(event) => setQuickCommandForm((prev) => ({ ...prev, scope: event.target.value as QuickCommandScope }))}
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="global">Global</option>
                <option value="vendor">Vendor-specific</option>
                <option value="technology">Technology-specific</option>
                <option value="vendor_technology">Vendor + Technology</option>
              </select>
            </div>
            {(quickCommandForm.scope === 'vendor' || quickCommandForm.scope === 'vendor_technology') && (
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Vendor</label>
                <select
                  value={quickCommandForm.vendor}
                  onChange={(event) => setQuickCommandForm((prev) => ({ ...prev, vendor: event.target.value }))}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select vendor</option>
                  {VENDORS.map((vendor) => <option key={vendor} value={vendor}>{vendor}</option>)}
                </select>
              </div>
            )}
            {(quickCommandForm.scope === 'technology' || quickCommandForm.scope === 'vendor_technology') && (
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Technology</label>
                <select
                  value={quickCommandForm.technology}
                  onChange={(event) => setQuickCommandForm((prev) => ({ ...prev, technology: event.target.value }))}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select technology</option>
                  {TECHNOLOGY_OPTIONS.map((technology) => <option key={technology} value={technology}>{technology}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Description (Optional)</label>
              <Input
                value={quickCommandForm.description}
                onChange={(event) => setQuickCommandForm((prev) => ({ ...prev, description: event.target.value }))}
                placeholder="Optional shortcut description"
              />
            </div>
            {quickCommandFormError && <p className="text-xs font-medium text-red-600">{quickCommandFormError}</p>}
          </div>
          <DialogFooter>
            <button
              onClick={() => setQuickCommandDialogOpen(false)}
              className="rounded border border-border px-3 py-2 text-sm hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={saveQuickCommand}
              className="rounded bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              {editingQuickCommandId ? 'Save Changes' : 'Add Quick Command'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Command Input - Mode Specific */}
      <div className="space-y-1">
        {mode === 'raw' && (
          <div className="flex gap-2 items-stretch">
            <div className="flex-1">
              <div className="relative flex-1 flex flex-col">
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={command}
                    onChange={(e) => {
                      const upperValue = e.target.value.toUpperCase();
                      setCommand(upperValue);

                      // Get inline suggestion
                      const suggestion = getInlineSuggestion(upperValue);
                      setInlineSuggestion(suggestion);
                      setShowInlineSuggestion(suggestion.length > 0);

                      // Show dropdown suggestions
                      setShowSuggestions(upperValue.trim().length > 0);
                    }}
                    onKeyDown={(e) => {
                      // Tab: Accept inline suggestion or autocomplete
                      if (e.key === 'Tab') {
                        e.preventDefault();
                        if (inlineSuggestion) {
                          acceptInlineSuggestion();
                        } else {
                          const suggestions = getAutocompleteSuggestions(command);
                          if (suggestions.length > 0) {
                            setCommand(suggestions[0]);
                            setShowSuggestions(false);
                          }
                        }
                      }
                      // Escape: Dismiss suggestions
                      if (e.key === 'Escape') {
                        setShowInlineSuggestion(false);
                        setShowSuggestions(false);
                        setInlineSuggestion('');
                      }
                      // Ctrl+Space or Cmd+Space: Show dropdown suggestions
                      if ((e.ctrlKey || e.metaKey) && e.code === 'Space') {
                        e.preventDefault();
                        setShowSuggestions(true);
                      }
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        executeCommand();
                      }
                    }}
                    onBlur={() => {
                      setTimeout(() => setShowSuggestions(false), 200);
                      setShowInlineSuggestion(false);
                    }}
                    onFocus={() => {
                      if (command.trim().length > 0) {
                        setShowSuggestions(true);
                        const suggestion = getInlineSuggestion(command);
                        if (suggestion) {
                          setInlineSuggestion(suggestion);
                          setShowInlineSuggestion(true);
                        }
                      }
                    }}
                    disabled={selectedSite.length === 0 || selectedTechnology.length === 0 || !selectedVendor}
                    placeholder={selectedSite.length === 0 || selectedTechnology.length === 0 || !selectedVendor
                      ? 'Please select Site, Technology & Vendor first'
                      : `Enter ${selectedVendor} command (e.g., GET...) - Press Tab for autocomplete`}
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

                  {/* Inline Suggestion Overlay */}
                  {showInlineSuggestion && inlineSuggestion && (
                    <div className="absolute top-0 left-0 px-3 py-2 font-mono text-sm uppercase tracking-wide pointer-events-none h-full flex items-start pt-2">
                      <span className="text-transparent">{command}</span>
                      <span className="text-gray-500 dark:text-gray-600 opacity-60 font-mono text-sm">
                        {inlineSuggestion.substring(command.length)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Autocomplete Suggestions */}
                {showSuggestions && getAutocompleteSuggestions(command).length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-blue-500/50 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                    <div className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/30 border-b border-blue-200 dark:border-blue-800">
                      <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                        💡 Autocomplete Suggestions (Press Tab to select, Click to insert)
                      </p>
                    </div>
                    {getAutocompleteSuggestions(command).map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setCommand(suggestion);
                          setShowSuggestions(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm font-mono border-b border-border last:border-b-0 text-foreground transition ${
                          index === 0
                            ? 'bg-blue-100 dark:bg-blue-950/50 hover:bg-blue-200 dark:hover:bg-blue-900/50'
                            : 'hover:bg-muted/70'
                        }`}
                        title={`${index === 0 ? 'Press Tab or click' : 'Click'} to insert: ${suggestion}`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{suggestion}</span>
                          {index === 0 && (
                            <span className="text-xs text-blue-600 dark:text-blue-400 font-bold ml-2">⇥ TAB</span>
                          )}
                        </div>
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
                dropdownId="guided-command-keyword-dropdown"
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

      {/* Console Display with Execution Monitoring */}
      <div className="flex-1 flex flex-col gap-2 overflow-hidden">
        {/* Terminal Output */}
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

        {/* Execution Monitor Summary */}
        {history.length > 0 && (
          <div className="bg-card border border-border rounded-lg p-3">
            <div className="grid grid-cols-5 gap-2 text-xs">
              <div className="bg-muted/40 p-2 rounded">
                <p className="text-muted-foreground text-[11px]">Total Executions</p>
                <p className="text-lg font-bold text-foreground">{history.length}</p>
              </div>
              <div className="bg-green-50 dark:bg-green-950/30 p-2 rounded">
                <p className="text-green-700 dark:text-green-300 text-[11px] font-semibold">Success Rate</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  {history.length > 0
                    ? ((history.filter(e => e.status === 'success').length / history.length) * 100).toFixed(0)
                    : 0}%
                </p>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-950/30 p-2 rounded">
                <p className="text-yellow-700 dark:text-yellow-300 text-[11px] font-semibold">Successful</p>
                <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                  {history.filter(e => e.status === 'success').length}
                </p>
              </div>
              <div className="bg-red-50 dark:bg-red-950/30 p-2 rounded">
                <p className="text-red-700 dark:text-red-300 text-[11px] font-semibold">Failed</p>
                <p className="text-lg font-bold text-red-600 dark:text-red-400">
                  {history.filter(e => e.status === 'error').length}
                </p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950/30 p-2 rounded">
                <p className="text-blue-700 dark:text-blue-300 text-[11px] font-semibold">Pending</p>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {history.filter(e => e.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
        )}
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
