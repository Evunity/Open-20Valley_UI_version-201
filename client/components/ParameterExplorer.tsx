import React, { useMemo, useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import SearchableDropdown from './SearchableDropdown';

interface ParameterExplorerProps {
  selectedTarget: any;
  onTargetChange: (target: any) => void;
}

type ParameterCategory = 'RF' | 'Transport' | 'IP' | 'Power' | 'System';
type ParameterTechnology = '2G' | '3G' | '4G' | '5G' | 'ORAN';
type ParameterVendor = 'Huawei' | 'Nokia' | 'Ericsson' | 'ZTE';

interface OutputColumn {
  id: string;
  parameterId: string;
  name: string;
  dataType: string;
  unit: string;
  description: string;
}

interface Parameter {
  id: string;
  name: string;
  description: string;
  vendor: ParameterVendor;
  technology: ParameterTechnology;
  category: ParameterCategory;
  command: string;
  outputColumns: OutputColumn[];
}

const MOCK_PARAMETERS: Parameter[] = [
  {
    id: 'param-hw-tx-power',
    name: 'TX Power',
    description: 'Defines per-cell transmission power policy used by the RAN scheduler and radio resource control procedures for balancing coverage and interference.',
    category: 'RF',
    command: 'LST TXPOWER: CELLID=<CELL_ID>;',
    technology: '4G',
    vendor: 'Huawei',
    outputColumns: [
      { id: 'out-1', parameterId: 'param-hw-tx-power', name: 'CELL_ID', dataType: 'Integer', unit: '-', description: 'Unique cell identifier.' },
      { id: 'out-2', parameterId: 'param-hw-tx-power', name: 'TX_POWER', dataType: 'Float', unit: 'dBm', description: 'Configured transmission power level.' },
      { id: 'out-3', parameterId: 'param-hw-tx-power', name: 'POWER_PROFILE', dataType: 'String', unit: '-', description: 'Assigned power profile or template name.' },
    ],
  },
  {
    id: 'param-nk-cell-barring',
    name: 'Cell Barring Policy',
    description: 'Controls access barring behavior to prevent user equipment from camping during maintenance, load shedding, or incident isolation.',
    category: 'RF',
    command: 'show cell barring-policy',
    technology: '5G',
    vendor: 'Nokia',
    outputColumns: [
      { id: 'out-4', parameterId: 'param-nk-cell-barring', name: 'NRCELL_ID', dataType: 'String', unit: '-', description: 'NR cell managed object identifier.' },
      { id: 'out-5', parameterId: 'param-nk-cell-barring', name: 'BARRING_STATE', dataType: 'Boolean', unit: '-', description: 'True when access barring is enabled.' },
      { id: 'out-6', parameterId: 'param-nk-cell-barring', name: 'BARRING_REASON', dataType: 'String', unit: '-', description: 'Operator reason code associated with barring policy.' },
    ],
  },
  {
    id: 'param-er-transport-qos',
    name: 'Transport QoS Profile',
    description: 'Defines QoS class mapping and scheduling behavior for transport bearer handling between RAN and core-facing interfaces.',
    category: 'Transport',
    command: 'get transport qos-profile',
    technology: '4G',
    vendor: 'Ericsson',
    outputColumns: [
      { id: 'out-7', parameterId: 'param-er-transport-qos', name: 'PROFILE_ID', dataType: 'String', unit: '-', description: 'QoS profile unique identifier.' },
      { id: 'out-8', parameterId: 'param-er-transport-qos', name: 'QCI', dataType: 'Integer', unit: '-', description: 'Mapped QoS Class Identifier.' },
      { id: 'out-9', parameterId: 'param-er-transport-qos', name: 'MAX_BITRATE', dataType: 'Float', unit: 'Mbps', description: 'Maximum transport bitrate threshold.' },
    ],
  },
  {
    id: 'param-zte-ip-route-policy',
    name: 'IP Route Policy',
    description: 'Defines static route distribution and preference weighting for management and service plane destination reachability.',
    category: 'IP',
    command: 'show ip route-policy',
    technology: '5G',
    vendor: 'ZTE',
    outputColumns: [
      { id: 'out-10', parameterId: 'param-zte-ip-route-policy', name: 'POLICY_NAME', dataType: 'String', unit: '-', description: 'Configured route policy name.' },
      { id: 'out-11', parameterId: 'param-zte-ip-route-policy', name: 'DESTINATION_PREFIX', dataType: 'String', unit: '-', description: 'Destination prefix covered by policy.' },
      { id: 'out-12', parameterId: 'param-zte-ip-route-policy', name: 'PREFERENCE', dataType: 'Integer', unit: '-', description: 'Route preference priority value.' },
    ],
  },
];

export const ParameterExplorer: React.FC<ParameterExplorerProps> = ({ selectedTarget }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
  const [selectedTechnology, setSelectedTechnology] = useState<string[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<string[]>([]);
  const [expandedParamId, setExpandedParamId] = useState<string | null>(null);
  const [parameterDescriptions, setParameterDescriptions] = useState<Record<string, string>>(
    Object.fromEntries(MOCK_PARAMETERS.map((parameter) => [parameter.id, parameter.description])),
  );

  const categories = ['RF', 'Transport', 'IP', 'Power', 'System'];
  const technologies = ['2G', '3G', '4G', '5G', 'ORAN'];
  const vendors = ['Huawei', 'Nokia', 'Ericsson', 'ZTE'];

  const canEditDescription = Boolean((selectedTarget as { canEditParameters?: boolean } | undefined)?.canEditParameters ?? true);

  const filteredParams = useMemo(() => {
    return MOCK_PARAMETERS.filter((parameter) => {
      const effectiveDescription = parameterDescriptions[parameter.id] ?? parameter.description;
      const matchesSearch =
        parameter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        effectiveDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        parameter.command.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory.length || parameter.category === selectedCategory[0];
      const matchesTechnology = !selectedTechnology.length || parameter.technology === selectedTechnology[0];
      const matchesVendor = !selectedVendor.length || parameter.vendor === selectedVendor[0];
      return matchesSearch && matchesCategory && matchesTechnology && matchesVendor;
    });
  }, [parameterDescriptions, searchQuery, selectedCategory, selectedTechnology, selectedVendor]);

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <input
            type="text"
            placeholder="Search parameter schema by name, description, or command..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <SearchableDropdown label="All Categories" options={categories} selected={selectedCategory} onChange={setSelectedCategory} placeholder="All Categories" multiSelect={false} searchable compact />
          <SearchableDropdown label="All Technologies" options={technologies} selected={selectedTechnology} onChange={setSelectedTechnology} placeholder="All Technologies" multiSelect={false} searchable compact />
          <SearchableDropdown label="All Vendors" options={vendors} selected={selectedVendor} onChange={setSelectedVendor} placeholder="All Vendors" multiSelect={false} searchable compact />
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto">
        {filteredParams.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-gray-500">
            <p className="text-sm">No parameters found matching your criteria</p>
          </div>
        ) : (
          filteredParams.map((parameter) => {
            const effectiveDescription = parameterDescriptions[parameter.id] ?? parameter.description;
            const isExpanded = expandedParamId === parameter.id;

            return (
              <div key={parameter.id} className="overflow-hidden rounded-lg border border-gray-200">
                <button
                  onClick={() => setExpandedParamId(isExpanded ? null : parameter.id)}
                  className="flex w-full items-center justify-between bg-white p-3 text-left transition hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{parameter.name}</p>
                      <span className="rounded bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-800">{parameter.category}</span>
                      <span className="rounded bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">{parameter.vendor}</span>
                      <span className="rounded bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800">{parameter.technology}</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{effectiveDescription}</p>
                  </div>
                  <ChevronDown className={`h-5 w-5 text-gray-400 transition ${isExpanded ? 'rotate-180' : ''}`} />
                </button>

                {isExpanded && (
                  <div className="space-y-4 border-t border-gray-200 bg-gray-50 p-4">
                    <section className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Section 1 — Parameter Information</h4>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="mb-1 text-xs font-semibold text-muted-foreground">Name</p>
                          <p className="rounded border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground">{parameter.name}</p>
                        </div>
                        <div>
                          <p className="mb-1 text-xs font-semibold text-muted-foreground">Category</p>
                          <p className="rounded border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground">{parameter.category}</p>
                        </div>
                        <div>
                          <p className="mb-1 text-xs font-semibold text-muted-foreground">Vendor</p>
                          <p className="rounded border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground">{parameter.vendor}</p>
                        </div>
                        <div>
                          <p className="mb-1 text-xs font-semibold text-muted-foreground">Technology</p>
                          <p className="rounded border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground">{parameter.technology}</p>
                        </div>
                      </div>

                      <div>
                        <p className="mb-1 text-xs font-semibold text-muted-foreground">Command</p>
                        <p className="rounded border border-border bg-card px-3 py-2 font-mono text-sm text-foreground">{parameter.command}</p>
                      </div>

                      <div>
                        <p className="mb-1 text-xs font-semibold text-muted-foreground">Description</p>
                        {canEditDescription ? (
                          <textarea
                            value={effectiveDescription}
                            onChange={(event) => setParameterDescriptions((prev) => ({ ...prev, [parameter.id]: event.target.value }))}
                            className="min-h-[90px] w-full rounded border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                          />
                        ) : (
                          <p className="rounded border border-border bg-card px-3 py-2 text-sm text-foreground">{effectiveDescription}</p>
                        )}
                      </div>
                    </section>

                    <section className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Section 2 — Output Columns</h4>

                      <div className="overflow-x-auto rounded border border-border bg-card">
                        <table className="min-w-full text-left text-sm">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="px-3 py-2 font-semibold text-muted-foreground">Column Name</th>
                              <th className="px-3 py-2 font-semibold text-muted-foreground">Data Type</th>
                              <th className="px-3 py-2 font-semibold text-muted-foreground">Unit</th>
                              <th className="px-3 py-2 font-semibold text-muted-foreground">Description</th>
                            </tr>
                          </thead>
                          <tbody>
                            {parameter.outputColumns.map((column) => (
                              <tr key={column.id} className="border-t border-border">
                                <td className="px-3 py-2 font-mono text-foreground">{column.name}</td>
                                <td className="px-3 py-2 text-foreground">{column.dataType}</td>
                                <td className="px-3 py-2 text-foreground">{column.unit}</td>
                                <td className="px-3 py-2 text-muted-foreground">{column.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </section>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="rounded-lg border p-3 surface-info">
        <p className="text-sm text-current">
          Showing <strong>{filteredParams.length}</strong> of <strong>{MOCK_PARAMETERS.length}</strong> parameter definitions
        </p>
      </div>
    </div>
  );
};
