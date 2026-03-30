import React, { useState, useMemo } from 'react';
import { Zap, Thermometer, Link2, AlertCircle, ChevronDown } from 'lucide-react';
import { TopologyObject } from '../utils/topologyData';

interface RackCard {
  id: string;
  u: number; // U level (1-42)
  device: string;
  type: 'rru' | 'bbu' | 'server' | 'switch' | 'pdu' | 'patch' | 'empty';
  health: 'healthy' | 'degraded' | 'down' | 'offline';
  alarmCount: number;
  vendor?: string;
  power?: number; // watts
  temp?: number; // celsius
  ports?: number;
  errors?: number;
  connections?: string[];
}

interface Rack {
  id: string;
  name: string;
  location: string;
  cards: RackCard[];
}

interface Site {
  id: string;
  name: string;
  country: string;
  vendor: string;
  racks: Rack[];
}

interface RackViewProps {
  topology?: TopologyObject[];
  onDeviceSelect?: (device: RackCard) => void;
}

export const RackView: React.FC<RackViewProps> = ({ topology, onDeviceSelect }) => {
  const [selectedCountry, setSelectedCountry] = useState<string>('Egypt');
  const [selectedVendor, setSelectedVendor] = useState<string>('Nokia');
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [selectedRack, setSelectedRack] = useState<string | null>(null);
  const [showPower, setShowPower] = useState(false);
  const [showPorts, setShowPorts] = useState(true);
  const [expandedRacks, setExpandedRacks] = useState<Set<string>>(new Set());

  // Mock site data
  const sites: Site[] = [
    {
      id: 'site_egypt_cairo_01',
      name: 'Cairo-Cluster-1-Site-1',
      country: 'Egypt',
      vendor: 'Nokia',
      racks: [
        {
          id: 'rack_1',
          name: 'Rack-A (RAN)',
          location: 'Row 1, Position 1',
          cards: [
            { u: 42, device: 'PDU 1', type: 'pdu', health: 'healthy', alarmCount: 0, power: 15000, connections: ['PSU-1', 'PSU-2'] },
            { u: 41, device: 'PDU 2', type: 'pdu', health: 'healthy', alarmCount: 0, power: 15000, connections: ['PSU-3', 'PSU-4'] },
            { u: 40, device: 'Patch Panel A', type: 'patch', health: 'healthy', alarmCount: 0, connections: ['48-ports'] },
            { u: 39, device: 'RRU-1-Sector-A', type: 'rru', health: 'healthy', alarmCount: 0, vendor: 'Nokia', power: 800, temp: 45, ports: 1 },
            { u: 38, device: 'RRU-1-Sector-B', type: 'rru', health: 'degraded', alarmCount: 2, vendor: 'Nokia', power: 750, temp: 52, ports: 1 },
            { u: 37, device: 'RRU-1-Sector-C', type: 'rru', health: 'healthy', alarmCount: 0, vendor: 'Nokia', power: 800, temp: 46, ports: 1 },
            { u: 36, device: 'BBU Pool 1', type: 'bbu', health: 'healthy', alarmCount: 0, vendor: 'Nokia', power: 3500, temp: 38 },
            { u: 35, device: 'BBU Pool 2', type: 'bbu', health: 'healthy', alarmCount: 0, vendor: 'Nokia', power: 3400, temp: 39 },
            { u: 34, device: 'Core Switch', type: 'switch', health: 'healthy', alarmCount: 0, ports: 48, errors: 0 },
            { u: 33, device: 'Access Switch', type: 'switch', health: 'healthy', alarmCount: 0, ports: 48, errors: 0 },
            ...Array.from({ length: 23 }, (_, i) => ({
              id: `empty_${i}`,
              u: 32 - i,
              device: 'Empty Slot',
              type: 'empty' as const,
              health: 'offline' as const,
              alarmCount: 0,
              connections: []
            }))
          ]
        },
        {
          id: 'rack_2',
          name: 'Rack-B (Transport)',
          location: 'Row 1, Position 2',
          cards: [
            { u: 42, device: 'Optical Terminal', type: 'server', health: 'healthy', alarmCount: 0, ports: 4, errors: 0, power: 500, connections: ['Fiber-1', 'Fiber-2'] },
            { u: 41, device: 'Microwave Link', type: 'server', health: 'healthy', alarmCount: 1, ports: 2, errors: 1, power: 300, connections: ['MW-1'] },
            { u: 40, device: 'Ethernet Switch', type: 'switch', health: 'degraded', alarmCount: 3, ports: 48, errors: 2, power: 400 },
            ...Array.from({ length: 37 }, (_, i) => ({
              id: `empty_transport_${i}`,
              u: 39 - i,
              device: 'Empty Slot',
              type: 'empty' as const,
              health: 'offline' as const,
              alarmCount: 0,
              connections: []
            }))
          ]
        }
      ]
    },
    {
      id: 'site_egypt_alexandria_01',
      name: 'Alexandria-Cluster-2-Site-3',
      country: 'Egypt',
      vendor: 'Ericsson',
      racks: [
        {
          id: 'rack_3',
          name: 'Rack-A (RAN)',
          location: 'Row 2, Position 1',
          cards: [
            { u: 42, device: 'PDU 1', type: 'pdu', health: 'healthy', alarmCount: 0, power: 15000 },
            { u: 41, device: 'RRU-2-Sector-A', type: 'rru', health: 'healthy', alarmCount: 0, vendor: 'Ericsson', power: 850, temp: 47 },
            ...Array.from({ length: 40 }, (_, i) => ({
              id: `empty_alex_${i}`,
              u: 40 - i,
              device: 'Empty Slot',
              type: 'empty' as const,
              health: 'offline' as const,
              alarmCount: 0,
              connections: []
            }))
          ]
        }
      ]
    },
    {
      id: 'site_saudi_riyadh_01',
      name: 'Riyadh-Cluster-5-Site-12',
      country: 'Saudi Arabia',
      vendor: 'Huawei',
      racks: [
        {
          id: 'rack_4',
          name: 'Rack-A (RAN)',
          location: 'Row 1, Position 1',
          cards: [
            { u: 42, device: 'PDU 1', type: 'pdu', health: 'healthy', alarmCount: 0, power: 15000 },
            { u: 41, device: 'RRU-3-Sector-A', type: 'rru', health: 'down', alarmCount: 5, vendor: 'Huawei', power: 800, temp: 65 },
            ...Array.from({ length: 40 }, (_, i) => ({
              id: `empty_riyadh_${i}`,
              u: 40 - i,
              device: 'Empty Slot',
              type: 'empty' as const,
              health: 'offline' as const,
              alarmCount: 0,
              connections: []
            }))
          ]
        }
      ]
    }
  ];

  // Filter sites by country and vendor
  const filteredSites = useMemo(() => {
    return sites.filter(s => s.country === selectedCountry && s.vendor === selectedVendor);
  }, [selectedCountry, selectedVendor]);

  // Get unique countries and vendors
  const countries = Array.from(new Set(sites.map(s => s.country)));
  const vendors = Array.from(new Set(
    sites.filter(s => s.country === selectedCountry).map(s => s.vendor)
  ));

  // Get selected site details
  const currentSite = selectedSite ? sites.find(s => s.id === selectedSite) : null;
  const currentRack = selectedRack && currentSite ? currentSite.racks.find(r => r.id === selectedRack) : null;

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'bg-green-100 dark:bg-green-950 border-l-4 border-l-green-600';
      case 'degraded': return 'bg-yellow-100 dark:bg-yellow-950 border-l-4 border-l-yellow-600';
      case 'down': return 'bg-red-100 dark:bg-red-950 border-l-4 border-l-red-600';
      default: return 'bg-gray-100 dark:bg-gray-800 border-l-4 border-l-gray-400';
    }
  };

  const getDeviceIcon = (type: string) => {
    const icons = {
      'rru': '📡',
      'bbu': '🔧',
      'server': '🖥️',
      'switch': '🔀',
      'pdu': '⚡',
      'patch': '🔌',
      'empty': '□'
    };
    return icons[type as keyof typeof icons] || '?';
  };

  const toggleRackExpanded = (rackId: string) => {
    const newExpanded = new Set(expandedRacks);
    if (newExpanded.has(rackId)) {
      newExpanded.delete(rackId);
    } else {
      newExpanded.add(rackId);
    }
    setExpandedRacks(newExpanded);
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4 bg-background overflow-y-auto">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold text-foreground">Physical Site & Rack Visualization</h2>
        <div className="flex gap-2">
          <label className="flex items-center gap-2 px-3 py-1.5 bg-card rounded border border-border text-xs cursor-pointer hover:bg-muted/40">
            <input
              type="checkbox"
              checked={showPower}
              onChange={(e) => setShowPower(e.target.checked)}
              className="w-3 h-3 rounded"
            />
            <span className="font-semibold">Power</span>
          </label>
          <label className="flex items-center gap-2 px-3 py-1.5 bg-card rounded border border-border text-xs cursor-pointer hover:bg-muted/40">
            <input
              type="checkbox"
              checked={showPorts}
              onChange={(e) => setShowPorts(e.target.checked)}
              className="w-3 h-3 rounded"
            />
            <span className="font-semibold">Ports & Metrics</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 flex-1 overflow-hidden">
        {/* Left Sidebar - Selection Hierarchy */}
        <div className="col-span-1 flex flex-col gap-4 overflow-y-auto">
          {/* Country Selection */}
          <div className="bg-card rounded-lg border border-border p-3">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Country</p>
            <div className="space-y-1">
              {countries.map(country => (
                <button
                  key={country}
                  onClick={() => {
                    setSelectedCountry(country);
                    setSelectedSite(null);
                    setSelectedRack(null);
                  }}
                  className={`w-full px-3 py-2 rounded text-xs font-semibold transition text-left ${
                    selectedCountry === country
                      ? 'bg-blue-600 text-white'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {country}
                </button>
              ))}
            </div>
          </div>

          {/* Vendor Selection */}
          <div className="bg-card rounded-lg border border-border p-3">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Vendor</p>
            <div className="space-y-1">
              {vendors.map(vendor => (
                <button
                  key={vendor}
                  onClick={() => {
                    setSelectedVendor(vendor);
                    setSelectedSite(null);
                    setSelectedRack(null);
                  }}
                  className={`w-full px-3 py-2 rounded text-xs font-semibold transition text-left ${
                    selectedVendor === vendor
                      ? 'bg-blue-600 text-white'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {vendor}
                </button>
              ))}
            </div>
          </div>

          {/* Site Selection */}
          <div className="bg-card rounded-lg border border-border p-3 flex-1 overflow-y-auto">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Sites</p>
            <div className="space-y-1">
              {filteredSites.map(site => (
                <button
                  key={site.id}
                  onClick={() => {
                    setSelectedSite(site.id);
                    setSelectedRack(null);
                  }}
                  className={`w-full px-3 py-2 rounded text-xs font-semibold transition text-left truncate ${
                    selectedSite === site.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                  title={site.name}
                >
                  {site.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center - Racks List */}
        {currentSite ? (
          <div className="col-span-1 flex flex-col gap-4 bg-card rounded-lg border border-border p-4 overflow-y-auto">
            <h3 className="text-sm font-bold text-foreground">Racks at {currentSite.name}</h3>
            <div className="space-y-2">
              {currentSite.racks.map(rack => (
                <div key={rack.id} className="border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => {
                      setSelectedRack(selectedRack === rack.id ? null : rack.id);
                      toggleRackExpanded(rack.id);
                    }}
                    className={`w-full px-3 py-2 flex items-center justify-between text-xs font-semibold transition ${
                      selectedRack === rack.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    <span>{rack.name}</span>
                    <ChevronDown className={`w-3 h-3 transition ${expandedRacks.has(rack.id) ? 'rotate-180' : ''}`} />
                  </button>
                  {expandedRacks.has(rack.id) && (
                    <div className="px-3 py-2 bg-background text-xs space-y-1 border-t border-border">
                      <p className="text-muted-foreground">{rack.location}</p>
                      <p className="text-muted-foreground">{rack.cards.filter(c => c.type !== 'empty').length} active cards</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="col-span-1 flex items-center justify-center bg-card rounded-lg border border-border text-muted-foreground text-xs">
            <p>Select a site</p>
          </div>
        )}

        {/* Right - Rack Details */}
        {currentRack ? (
          <div className="col-span-2 flex flex-col gap-4 overflow-hidden">
            <div className="bg-card rounded-lg border border-border p-4 flex-1 flex flex-col">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-foreground">{currentRack.name}</h3>
                <p className="text-xs text-muted-foreground">{currentRack.location}</p>
              </div>

              {/* Rack Cards Display */}
              <div className="flex-1 overflow-y-auto space-y-1">
                {currentRack.cards
                  .sort((a, b) => b.u - a.u)
                  .map((card) => (
                    <button
                      key={`${card.u}_${card.device}`}
                      onClick={() => onDeviceSelect?.(card)}
                      className={`w-full text-left p-3 rounded transition hover:shadow-md ${getHealthColor(card.health)}`}
                    >
                      <div className="flex items-center gap-3">
                        {/* U Number - Fixed Width */}
                        <div className="w-10 flex-shrink-0">
                          <span className="font-bold text-foreground text-sm">U{card.u}</span>
                        </div>

                        {/* Device Icon */}
                        <span className="text-lg flex-shrink-0">{getDeviceIcon(card.type)}</span>

                        {/* Device Name */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground text-sm truncate">{card.device}</p>
                          {card.connections && card.connections.length > 0 && (
                            <p className="text-xs text-muted-foreground truncate">
                              🔗 {card.connections.join(', ')}
                            </p>
                          )}
                        </div>

                        {/* Metrics */}
                        <div className="flex items-center gap-2 flex-shrink-0 text-xs">
                          {card.alarmCount > 0 && (
                            <span className={`px-2 py-0.5 rounded font-bold ${
                              card.health === 'down' ? 'bg-red-200 text-red-800' :
                              card.health === 'degraded' ? 'bg-yellow-200 text-yellow-800' :
                              'bg-muted text-foreground'
                            }`}>
                              {card.alarmCount} alarms
                            </span>
                          )}
                          {showPower && card.power && (
                            <span className="text-muted-foreground flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              {card.power}W
                            </span>
                          )}
                          {card.temp && (
                            <span className={`flex items-center gap-1 ${card.temp > 50 ? 'text-orange-600 font-bold' : 'text-muted-foreground'}`}>
                              <Thermometer className="w-3 h-3" />
                              {card.temp}°C
                            </span>
                          )}
                          {showPorts && card.ports && (
                            <span className="text-muted-foreground flex items-center gap-1">
                              <Link2 className="w-3 h-3" />
                              {card.ports}
                            </span>
                          )}
                          {showPorts && card.errors && card.errors > 0 && (
                            <span className="text-red-700 font-bold flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {card.errors}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
              </div>
            </div>

            {/* Legend */}
            <div className="bg-card rounded-lg border border-border p-3">
              <p className="text-xs font-semibold text-muted-foreground mb-2">Device Types</p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { icon: '📡', label: 'RRU' },
                  { icon: '🔧', label: 'BBU' },
                  { icon: '🖥️', label: 'Server' },
                  { icon: '🔀', label: 'Switch' },
                  { icon: '⚡', label: 'PDU' },
                  { icon: '🔌', label: 'Patch' }
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-1 text-muted-foreground">
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="col-span-2 flex items-center justify-center bg-card rounded-lg border border-border text-muted-foreground text-xs">
            <p>Select a rack to view details</p>
          </div>
        )}
      </div>
    </div>
  );
};
