import React, { useState } from 'react';
import { AlertCircle, Zap, Link2 } from 'lucide-react';

interface RackUnit {
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
}

interface Cabinet {
  id: string;
  name: string;
  location: string;
  units: RackUnit[];
}

interface RackViewProps {
  onDeviceSelect?: (device: RackUnit) => void;
}

export const RackView: React.FC<RackViewProps> = ({ onDeviceSelect }) => {
  const [selectedRack, setSelectedRack] = useState(0);
  const [showPower, setShowPower] = useState(false);
  const [showPorts, setShowPorts] = useState(true);

  // Mock rack data
  const cabinets: Cabinet[] = [
    {
      id: 'cab_1',
      name: 'Cabinet A - RAN',
      location: 'Site Cairo-01',
      units: [
        { u: 42, device: 'PDU', type: 'pdu', health: 'healthy', alarmCount: 0, power: 15000 },
        { u: 41, device: 'PDU', type: 'pdu', health: 'healthy', alarmCount: 0, power: 15000 },
        { u: 40, device: 'Patch Panel', type: 'patch', health: 'healthy', alarmCount: 0 },
        { u: 39, device: 'RRU 1 - Sector A', type: 'rru', health: 'healthy', alarmCount: 0, vendor: 'Nokia', power: 800, temp: 45 },
        { u: 38, device: 'RRU 1 - Sector B', type: 'rru', health: 'degraded', alarmCount: 2, vendor: 'Nokia', power: 750, temp: 52 },
        { u: 37, device: 'RRU 1 - Sector C', type: 'rru', health: 'healthy', alarmCount: 0, vendor: 'Nokia', power: 800, temp: 46 },
        { u: 36, device: 'BBU Pool', type: 'bbu', health: 'healthy', alarmCount: 0, vendor: 'Nokia', power: 3500, temp: 38 },
        { u: 35, device: 'BBU Pool', type: 'bbu', health: 'healthy', alarmCount: 0, vendor: 'Nokia', power: 3400, temp: 39 },
        { u: 34, device: 'Switch - Core', type: 'switch', health: 'healthy', alarmCount: 0, ports: 48, errors: 0 },
        { u: 33, device: 'Switch - Access', type: 'switch', health: 'healthy', alarmCount: 0, ports: 48, errors: 0 },
        { u: 32, device: 'Router', type: 'server', health: 'down', alarmCount: 5, ports: 8 },
        ...Array.from({ length: 21 }, (_, i) => ({
          u: 31 - i,
          device: 'Empty',
          type: 'empty' as const,
          health: 'offline' as const,
          alarmCount: 0
        }))
      ]
    },
    {
      id: 'cab_2',
      name: 'Cabinet B - Transport',
      location: 'Site Cairo-01',
      units: [
        { u: 42, device: 'Optical Terminal', type: 'server', health: 'healthy', alarmCount: 0, ports: 4, errors: 0 },
        { u: 41, device: 'Microwave Link', type: 'server', health: 'healthy', alarmCount: 1, ports: 2, errors: 1 },
        { u: 40, device: 'Ethernet Switch', type: 'switch', health: 'degraded', alarmCount: 3, ports: 48, errors: 2 },
        ...Array.from({ length: 37 }, (_, i) => ({
          u: 39 - i,
          device: 'Empty',
          type: 'empty' as const,
          health: 'offline' as const,
          alarmCount: 0
        }))
      ]
    }
  ];

  const cabinet = cabinets[selectedRack];

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'bg-green-100 border-l-4 border-l-green-600';
      case 'degraded': return 'bg-yellow-100 border-l-4 border-l-yellow-600';
      case 'down': return 'bg-red-100 border-l-4 border-l-red-600';
      default: return 'bg-gray-100 border-l-4 border-l-gray-400';
    }
  };

  const getHealthTextColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-800';
      case 'degraded': return 'text-yellow-800';
      case 'down': return 'text-red-800';
      default: return 'text-gray-600';
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

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4 bg-gray-50 overflow-y-auto">
      <h2 className="text-lg font-bold text-gray-900">Physical Site & Rack Visualization</h2>

      {/* Cabinet Selector */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <p className="text-xs font-semibold text-gray-700 mb-2">Select Cabinet</p>
        <div className="flex gap-2">
          {cabinets.map((cab, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedRack(idx)}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
                selectedRack === idx
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <label className="flex items-center gap-2 px-3 py-1.5 bg-white rounded border border-gray-200 text-xs cursor-pointer hover:bg-gray-50">
          <input
            type="checkbox"
            checked={showPower}
            onChange={(e) => setShowPower(e.target.checked)}
            className="w-3 h-3 rounded"
          />
          <span className="font-semibold text-gray-700">Power</span>
        </label>
        <label className="flex items-center gap-2 px-3 py-1.5 bg-white rounded border border-gray-200 text-xs cursor-pointer hover:bg-gray-50">
          <input
            type="checkbox"
            checked={showPorts}
            onChange={(e) => setShowPorts(e.target.checked)}
            className="w-3 h-3 rounded"
          />
          <span className="font-semibold text-gray-700">Ports & Metrics</span>
        </label>
      </div>

      {/* Rack Visualization */}
      <div className="flex-1 bg-white rounded-lg border border-gray-200 p-4 overflow-y-auto">
        <div className="font-mono text-xs space-y-1">
          {/* U Scale */}
          <div className="sticky top-0 bg-white border-b border-gray-200 pb-2 mb-2">
            <p className="text-gray-600 font-bold text-center">
              {cabinet.name} • {cabinet.location}
            </p>
          </div>

          {/* Rack Units */}
          {cabinet.units.map((unit) => (
            <button
              key={unit.u}
              onClick={() => onDeviceSelect?.(unit)}
              className={`w-full text-left p-2 rounded transition ${getHealthColor(unit.health)} hover:shadow-md`}
            >
              <div className="flex items-center gap-2">
                <span className="w-6 font-bold text-gray-700">[U{unit.u}]</span>
                <span className="text-lg">{getDeviceIcon(unit.type)}</span>
                <span className="flex-1 font-semibold text-gray-900">{unit.device}</span>

                {/* Metrics */}
                <div className="flex items-center gap-3 text-xs">
                  {unit.alarmCount > 0 && (
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      unit.health === 'down' ? 'bg-red-200 text-red-800' :
                      unit.health === 'degraded' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-gray-200 text-gray-800'
                    }`}>
                      {unit.alarmCount} alarms
                    </span>
                  )}
                  {showPower && unit.power && (
                    <span className="text-gray-700">⚡ {unit.power}W</span>
                  )}
                  {unit.temp && (
                    <span className={`text-gray-700 ${unit.temp > 50 ? 'text-orange-600 font-bold' : ''}`}>
                      🌡️ {unit.temp}°C
                    </span>
                  )}
                  {showPorts && unit.ports && (
                    <span className="text-gray-700">{unit.ports}P</span>
                  )}
                  {showPorts && unit.errors && unit.errors > 0 && (
                    <span className="text-red-700 font-bold">⚠️ {unit.errors} err</span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <p className="text-xs font-semibold text-gray-700 mb-2">Device Types</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            { icon: '📡', label: 'RRU (Radio Remote Unit)' },
            { icon: '🔧', label: 'BBU (BaseBand Unit)' },
            { icon: '🖥️', label: 'Server/Router' },
            { icon: '🔀', label: 'Switch' },
            { icon: '⚡', label: 'Power Distribution' },
            { icon: '🔌', label: 'Patch Panel' }
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1 text-gray-700">
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Field Engineer Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Zap className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-900">
            <p className="font-semibold mb-1">For Field Engineers:</p>
            <p>Click any device to see detailed specifications, alarms, and correlated topology objects.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
