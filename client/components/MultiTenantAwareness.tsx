import React, { useState, useMemo } from 'react';
import { Globe, Building2, Clock, Shield } from 'lucide-react';
import { TopologyObject } from '../utils/topologyData';

interface CountryInfo {
  name: string;
  code: string;
  timezone: string;
  objectCount: number;
  healthStatus: string;
  tenantIsolation: 'strict' | 'loose';
  color: string;
}

interface TenantInfo {
  id: string;
  name: string;
  countries: string[];
  dataResidency: string;
  isolationLevel: 'complete' | 'logical' | 'shared';
  color: string;
}

interface MultiTenantAwarenessProps {
  topology: TopologyObject[];
  selectedCountry?: string;
  selectedTenant?: string;
  onCountryChange?: (country: string) => void;
  onTenantChange?: (tenant: string) => void;
}

const COUNTRIES_CONFIG: Record<string, CountryInfo> = {
  'Egypt': {
    name: 'Egypt',
    code: 'EG',
    timezone: 'EET (UTC+2)',
    objectCount: 0,
    healthStatus: 'healthy',
    tenantIsolation: 'strict',
    color: 'border-blue-500 bg-blue-50'
  },
  'Saudi Arabia': {
    name: 'Saudi Arabia',
    code: 'SA',
    timezone: 'AST (UTC+3)',
    objectCount: 0,
    healthStatus: 'healthy',
    tenantIsolation: 'strict',
    color: 'border-green-500 bg-green-50'
  },
  'UAE': {
    name: 'UAE',
    code: 'AE',
    timezone: 'GST (UTC+4)',
    objectCount: 0,
    healthStatus: 'healthy',
    tenantIsolation: 'strict',
    color: 'border-orange-500 bg-orange-50'
  }
};

const TENANTS_CONFIG: TenantInfo[] = [
  {
    id: 'tenant-1',
    name: 'Regional Operator A',
    countries: ['Egypt', 'Saudi Arabia'],
    dataResidency: 'MENA',
    isolationLevel: 'complete',
    color: 'bg-purple-100 border-purple-500'
  },
  {
    id: 'tenant-2',
    name: 'Regional Operator B',
    countries: ['UAE'],
    dataResidency: 'MENA',
    isolationLevel: 'complete',
    color: 'bg-cyan-100 border-cyan-500'
  },
  {
    id: 'tenant-3',
    name: 'Global Enterprise',
    countries: ['Egypt', 'Saudi Arabia', 'UAE'],
    dataResidency: 'Multi-region',
    isolationLevel: 'logical',
    color: 'bg-yellow-100 border-yellow-500'
  }
];

export const MultiTenantAwareness: React.FC<MultiTenantAwarenessProps> = ({
  topology,
  selectedCountry,
  selectedTenant,
  onCountryChange,
  onTenantChange
}) => {
  const [viewMode, setViewMode] = useState<'countries' | 'tenants'>('countries');
  const [showTimezoneInfo, setShowTimezoneInfo] = useState(true);
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null);

  // Analyze topology by country
  const countriesWithData = useMemo<Record<string, CountryInfo>>(() => {
    const countries: Record<string, CountryInfo> = {};

    // Initialize with config
    Object.values(COUNTRIES_CONFIG).forEach(country => {
      countries[country.name] = { ...country };
    });

    // Count objects per country
    topology.forEach(obj => {
      if (obj.type === 'country' && countries[obj.name]) {
        countries[obj.name].objectCount = obj.childrenIds.length;
        countries[obj.name].healthStatus = obj.healthState;
      }
    });

    return countries;
  }, [topology]);

  // Filter topology by selected country
  const filteredByCountry = useMemo(() => {
    if (!selectedCountry) return topology;
    const countryObj = topology.find(o => o.type === 'country' && o.name === selectedCountry);
    if (!countryObj) return [];
    
    const filtered: TopologyObject[] = [countryObj];
    const traverse = (parentId: string) => {
      const children = topology.filter(o => o.parentId === parentId);
      filtered.push(...children);
      children.forEach(child => traverse(child.id));
    };
    traverse(countryObj.id);
    return filtered;
  }, [topology, selectedCountry]);

  // Filter by tenant and country
  const filteredByTenant = useMemo(() => {
    if (!selectedTenant) return topology;
    const tenant = TENANTS_CONFIG.find(t => t.id === selectedTenant);
    if (!tenant) return [];
    
    return filteredByCountry.filter(obj => {
      const countryObj = topology.find(o => o.type === 'country' && obj.parentId === o.id);
      return countryObj && tenant.countries.includes(countryObj.name);
    });
  }, [topology, filteredByCountry, selectedTenant]);

  const visibleObjects = selectedTenant ? filteredByTenant : filteredByCountry;

  const getCountryTimezone = (country: string): string => {
    const countryInfo = COUNTRIES_CONFIG[country];
    return countryInfo?.timezone || 'Unknown';
  };

  const getCurrentTimeForCountry = (timezone: string): string => {
    // Simplified timezone conversion
    const timezoneParts = timezone.match(/UTC([+-]\d+)/);
    if (!timezoneParts) return new Date().toLocaleTimeString();
    
    const offset = parseInt(timezoneParts[1]);
    const now = new Date();
    const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
    const countryTime = new Date(utcTime + offset * 3600000);
    
    return countryTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return (
    <div className="w-full flex flex-col gap-4 bg-white rounded-lg border border-gray-200 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Multi-Country & Tenant Awareness</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('countries')}
            className={`px-3 py-1 rounded text-sm font-semibold transition ${
              viewMode === 'countries'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Countries
          </button>
          <button
            onClick={() => setViewMode('tenants')}
            className={`px-3 py-1 rounded text-sm font-semibold transition ${
              viewMode === 'tenants'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tenants
          </button>
        </div>
      </div>

      {/* Country View */}
      {viewMode === 'countries' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-700">Country Boundaries & Regions</h4>
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={showTimezoneInfo}
                onChange={(e) => setShowTimezoneInfo(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span>Show Timezones</span>
            </label>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {Object.entries(countriesWithData).map(([countryName, country]) => (
              <div
                key={countryName}
                onClick={() => {
                  onCountryChange?.(countryName);
                  setExpandedCountry(expandedCountry === countryName ? null : countryName);
                }}
                className={`p-3 rounded-lg border-2 cursor-pointer transition ${
                  selectedCountry === countryName
                    ? `${country.color} border-current`
                    : `${country.color} hover:border-current border-gray-200`
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{country.code}</p>
                    <p className="text-xs text-gray-600">{country.name}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    country.healthStatus === 'healthy'
                      ? 'bg-green-200 text-green-800'
                      : country.healthStatus === 'degraded'
                      ? 'bg-yellow-200 text-yellow-800'
                      : 'bg-red-200 text-red-800'
                  }`}>
                    {country.healthStatus}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-gray-700">
                  <p>Objects: <strong>{country.objectCount}</strong></p>
                  {showTimezoneInfo && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{country.timezone}</span>
                    </div>
                  )}
                </div>

                {expandedCountry === countryName && (
                  <div className="mt-2 pt-2 border-t border-current border-opacity-30">
                    {showTimezoneInfo && (
                      <p className="text-xs font-mono text-center p-1 bg-black bg-opacity-5 rounded">
                        {getCurrentTimeForCountry(country.timezone)}
                      </p>
                    )}
                    <p className="text-xs mt-2 flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Isolation: <strong>{country.tenantIsolation}</strong>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {selectedCountry && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-semibold text-blue-900 mb-1">Selected: {selectedCountry}</p>
              <p className="text-xs text-blue-700">
                Showing {visibleObjects.length} network objects from {selectedCountry}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tenant View */}
      {viewMode === 'tenants' && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Tenant Isolation</h4>

          <div className="grid grid-cols-1 gap-2">
            {TENANTS_CONFIG.map(tenant => (
              <div
                key={tenant.id}
                onClick={() => onTenantChange?.(tenant.id)}
                className={`p-3 rounded-lg border-2 cursor-pointer transition ${
                  selectedTenant === tenant.id
                    ? `${tenant.color} border-current`
                    : `${tenant.color} hover:border-current border-gray-200`
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 className="w-4 h-4" />
                      <p className="font-semibold text-sm text-gray-900">{tenant.name}</p>
                    </div>
                    <div className="space-y-1 text-xs text-gray-700">
                      <p>Countries: <strong>{tenant.countries.join(', ')}</strong></p>
                      <p>Data Residency: <strong>{tenant.dataResidency}</strong></p>
                      <p>Isolation Level: <strong className="uppercase">{tenant.isolationLevel}</strong></p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${
                    tenant.isolationLevel === 'complete'
                      ? 'bg-green-200 text-green-800'
                      : tenant.isolationLevel === 'logical'
                      ? 'bg-yellow-200 text-yellow-800'
                      : 'bg-orange-200 text-orange-800'
                  }`}>
                    {tenant.isolationLevel}
                  </span>
                </div>

                {selectedTenant === tenant.id && (
                  <div className="mt-2 pt-2 border-t border-current border-opacity-30 text-xs text-gray-700">
                    <p className="flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Full network isolation from other tenants
                    </p>
                    <p className="mt-1 text-xs text-gray-600">
                      {visibleObjects.length} network objects visible in this tenant scope
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600">
          {viewMode === 'countries'
            ? '✓ Country boundaries support multi-operator deployments with strict isolation'
            : '✓ Tenant isolation prevents unauthorized cross-tenant data visibility'}
        </p>
      </div>
    </div>
  );
};
