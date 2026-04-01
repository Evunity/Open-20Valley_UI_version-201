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
    color: 'surface-info border'
  },
  'Saudi Arabia': {
    name: 'Saudi Arabia',
    code: 'SA',
    timezone: 'AST (UTC+3)',
    objectCount: 0,
    healthStatus: 'healthy',
    tenantIsolation: 'strict',
    color: 'surface-success border'
  },
  'UAE': {
    name: 'UAE',
    code: 'AE',
    timezone: 'GST (UTC+4)',
    objectCount: 0,
    healthStatus: 'healthy',
    tenantIsolation: 'strict',
    color: 'surface-warning border'
  }
};

const TENANTS_CONFIG: TenantInfo[] = [
  {
    id: 'tenant-1',
    name: 'Regional Operator A',
    countries: ['Egypt', 'Saudi Arabia'],
    dataResidency: 'MENA',
    isolationLevel: 'complete',
    color: 'surface-info border'
  },
  {
    id: 'tenant-2',
    name: 'Regional Operator B',
    countries: ['UAE'],
    dataResidency: 'MENA',
    isolationLevel: 'complete',
    color: 'surface-info border'
  },
  {
    id: 'tenant-3',
    name: 'Global Enterprise',
    countries: ['Egypt', 'Saudi Arabia', 'UAE'],
    dataResidency: 'Multi-region',
    isolationLevel: 'logical',
    color: 'surface-warning border'
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
    <div className="w-full flex flex-col gap-2 bg-card text-card-foreground rounded-lg border border-border p-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Globe className="w-4 h-4 text-[hsl(var(--info))]" />
          <h3 className="font-semibold text-xs text-foreground">Multi-Tenant</h3>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setViewMode('countries')}
            className={`px-2 py-0.5 rounded text-xs font-semibold transition ${
              viewMode === 'countries'
                ? 'bg-blue-600 text-white'
                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
            }`}
          >
            C
          </button>
          <button
            onClick={() => setViewMode('tenants')}
            className={`px-2 py-0.5 rounded text-xs font-semibold transition ${
              viewMode === 'tenants'
                ? 'bg-blue-600 text-white'
                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
            }`}
          >
            T
          </button>
        </div>
      </div>

      {/* Country View */}
      {viewMode === 'countries' && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between mb-1.5">
            <h4 className="text-xs font-semibold text-muted-foreground">Country Boundaries</h4>
            <label className="flex items-center gap-1 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={showTimezoneInfo}
                onChange={(e) => setShowTimezoneInfo(e.target.checked)}
                className="w-3 h-3 rounded"
              />
              <span className="text-xs">TZ</span>
            </label>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {Object.entries(countriesWithData).map(([countryName, country]) => (
              <div
                key={countryName}
                onClick={() => {
                  onCountryChange?.(countryName);
                  setExpandedCountry(expandedCountry === countryName ? null : countryName);
                }}
                className={`p-2 rounded-lg border-2 cursor-pointer transition ${
                  selectedCountry === countryName
                    ? `${country.color} border-current shadow-sm`
                    : `${country.color} hover:border-current border-border/60`
                }`}
              >
                <div className="flex items-start justify-between gap-1 mb-1">
                  <div>
                    <p className="font-semibold text-xs text-foreground">{country.code}</p>
                  </div>
                  <span className={`px-1 py-0.5 rounded text-xs font-semibold leading-none ${
                    country.healthStatus === 'healthy'
                      ? 'surface-success'
                      : country.healthStatus === 'degraded'
                      ? 'surface-warning'
                      : 'bg-destructive/20 text-destructive-foreground border border-destructive/35'
                  }`}>
                    {country.healthStatus[0].toUpperCase()}
                  </span>
                </div>

                <div className="space-y-0.5 text-xs text-muted-foreground">
                  <p className="text-xs">Obj: <strong>{country.objectCount}</strong></p>
                  {showTimezoneInfo && (
                    <div className="flex items-center gap-0.5 text-xs">
                      <Clock className="w-2.5 h-2.5" />
                      <span className="text-xs">{country.timezone.split(' ')[0]}</span>
                    </div>
                  )}
                </div>

                {expandedCountry === countryName && (
                  <div className="mt-1 pt-1 border-t border-current border-opacity-30">
                    {showTimezoneInfo && (
                      <p className="text-xs font-mono text-center p-0.5 bg-black bg-opacity-5 rounded">
                        {getCurrentTimeForCountry(country.timezone).split(':').slice(0, 2).join(':')}
                      </p>
                    )}
                    <p className="text-xs mt-1 flex items-center gap-0.5">
                      <Shield className="w-2.5 h-2.5" />
                      <strong className="text-xs text-foreground">{country.tenantIsolation[0]}</strong>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {selectedCountry && (
            <div className="p-1.5 surface-info border rounded-lg">
              <p className="text-xs font-semibold text-current">{selectedCountry}</p>
              <p className="text-xs text-current/90">
                {visibleObjects.length} objects
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tenant View */}
      {viewMode === 'tenants' && (
        <div className="space-y-1.5">
          <h4 className="text-xs font-semibold text-muted-foreground mb-1.5">Tenant Isolation</h4>

          <div className="grid grid-cols-1 gap-1.5">
            {TENANTS_CONFIG.map(tenant => (
              <div
                key={tenant.id}
                onClick={() => onTenantChange?.(tenant.id)}
                className={`p-2 rounded-lg border-2 cursor-pointer transition ${
                  selectedTenant === tenant.id
                    ? `${tenant.color} border-current shadow-sm`
                    : `${tenant.color} hover:border-current border-border/60`
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-0.5">
                      <Building2 className="w-3 h-3 flex-shrink-0" />
                      <p className="font-semibold text-xs text-foreground truncate">{tenant.name}</p>
                    </div>
                    <div className="space-y-0.5 text-xs text-muted-foreground">
                      <p className="truncate">C: <strong>{tenant.countries.join(', ')}</strong></p>
                      <p className="truncate">DR: <strong>{tenant.dataResidency}</strong></p>
                      <p className="truncate">IL: <strong className="uppercase text-foreground">{tenant.isolationLevel[0]}</strong></p>
                    </div>
                  </div>
                  <span className={`px-1 py-0.5 rounded text-xs font-semibold whitespace-nowrap flex-shrink-0 ${
                    tenant.isolationLevel === 'complete'
                      ? 'surface-success border'
                      : tenant.isolationLevel === 'logical'
                      ? 'surface-warning border'
                      : 'surface-info border'
                  }`}>
                    {tenant.isolationLevel[0]}
                  </span>
                </div>

                {selectedTenant === tenant.id && (
                  <div className="mt-1 pt-1 border-t border-current border-opacity-30 text-xs text-muted-foreground">
                    <p className="flex items-center gap-0.5">
                      <Shield className="w-2.5 h-2.5" />
                      <span className="text-xs">Isolated</span>
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {visibleObjects.length} objects
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="p-1.5 bg-muted/50 rounded-lg border border-border/60">
        <p className="text-xs text-muted-foreground">
          {viewMode === 'countries'
            ? '✓ Country isolation'
            : '✓ Tenant isolation'}
        </p>
      </div>
    </div>
  );
};
