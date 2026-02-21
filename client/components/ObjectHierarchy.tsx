import React from 'react';
import { ChevronRight, Home, MapPin, Database, Wifi } from 'lucide-react';
import { ObjectHierarchy as ObjectHierarchyType } from '../utils/alarmData';

interface ObjectHierarchyProps {
  hierarchy: ObjectHierarchyType;
  onHierarchyFilter: (level: string, value: string) => void;
  currentFilters?: {
    region?: string;
    cluster?: string;
    site?: string;
    node?: string;
  };
}

interface BreadcrumbItem {
  level: string;
  value: string;
  icon: React.ReactNode;
  label: string;
}

export const ObjectHierarchy: React.FC<ObjectHierarchyProps> = ({
  hierarchy,
  onHierarchyFilter,
  currentFilters = {}
}) => {
  // Build breadcrumb items
  const breadcrumbs: BreadcrumbItem[] = [
    {
      level: 'root',
      value: 'network',
      icon: <Home className="w-4 h-4" />,
      label: 'Network'
    }
  ];

  if (hierarchy.region) {
    breadcrumbs.push({
      level: 'region',
      value: hierarchy.region,
      icon: <MapPin className="w-4 h-4" />,
      label: hierarchy.region
    });
  }

  if (hierarchy.cluster) {
    breadcrumbs.push({
      level: 'cluster',
      value: hierarchy.cluster,
      icon: <Database className="w-4 h-4" />,
      label: hierarchy.cluster
    });
  }

  if (hierarchy.site) {
    breadcrumbs.push({
      level: 'site',
      value: hierarchy.site,
      icon: <MapPin className="w-4 h-4" />,
      label: hierarchy.site
    });
  }

  if (hierarchy.node) {
    breadcrumbs.push({
      level: 'node',
      value: hierarchy.node,
      icon: <Wifi className="w-4 h-4" />,
      label: hierarchy.node
    });
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-3">
      <h3 className="text-xs font-bold text-gray-900">Object Hierarchy</h3>

      {/* Breadcrumb navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {breadcrumbs.map((item, index) => (
          <React.Fragment key={`${item.level}-${item.value}`}>
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
            )}
            <button
              onClick={() => onHierarchyFilter(item.level, item.value)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap transition flex-shrink-0 ${
                currentFilters[item.level as keyof typeof currentFilters] === item.value
                  ? 'bg-blue-100 text-blue-800 border border-blue-300 font-semibold'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
              }`}
              title={`Filter by ${item.level}: ${item.value}`}
            >
              {item.icon}
              <span className="text-sm">{item.label}</span>
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* Hierarchy details */}
      <div className="space-y-3 mt-4">
        <div>
          <h4 className="text-xs font-semibold text-gray-600 mb-2">Hierarchy Path</h4>
          <div className="flex flex-col gap-1 text-sm text-gray-800 p-3 bg-gray-50 rounded border border-gray-200">
            {hierarchy.region && (
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-red-600" />
                <span className="font-medium">{hierarchy.region}</span>
                <span className="text-xs text-gray-500">(Region)</span>
              </div>
            )}
            {hierarchy.cluster && (
              <div className="flex items-center gap-2 ml-6">
                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                <Database className="w-3.5 h-3.5 text-blue-600" />
                <span className="font-medium">{hierarchy.cluster}</span>
                <span className="text-xs text-gray-500">(Cluster)</span>
              </div>
            )}
            {hierarchy.site && (
              <div className="flex items-center gap-2 ml-6">
                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                <MapPin className="w-3.5 h-3.5 text-orange-600" />
                <span className="font-medium">{hierarchy.site}</span>
                <span className="text-xs text-gray-500">(Site)</span>
              </div>
            )}
            {hierarchy.node && (
              <div className="flex items-center gap-2 ml-6">
                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                <Wifi className="w-3.5 h-3.5 text-green-600" />
                <span className="font-medium">{hierarchy.node}</span>
                <span className="text-xs text-gray-500">(Node)</span>
              </div>
            )}
            {hierarchy.cell && (
              <div className="flex items-center gap-2 ml-6">
                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                <Wifi className="w-3.5 h-3.5 text-purple-600" />
                <span className="font-medium">{hierarchy.cell}</span>
                <span className="text-xs text-gray-500">(Cell)</span>
              </div>
            )}
            {hierarchy.interface && (
              <div className="flex items-center gap-2 ml-6">
                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                <Wifi className="w-3.5 h-3.5 text-cyan-600" />
                <span className="font-medium">{hierarchy.interface}</span>
                <span className="text-xs text-gray-500">(Interface)</span>
              </div>
            )}
          </div>
        </div>

        {/* Object levels summary */}
        <div>
          <h4 className="text-xs font-semibold text-gray-600 mb-2">Levels</h4>
          <div className="grid grid-cols-2 gap-2">
            {[
              { level: 'region', label: 'Region', icon: '🗺️' },
              { level: 'cluster', label: 'Cluster', icon: '🏢' },
              { level: 'site', label: 'Site', icon: '📍' },
              { level: 'node', label: 'Node', icon: '📡' }
            ].map(({ level, label, icon }) => (
              <div
                key={level}
                className={`p-2 rounded border text-xs text-center font-medium transition cursor-pointer ${
                  currentFilters[level as keyof typeof currentFilters]
                    ? 'bg-blue-50 border-blue-300 text-blue-900'
                    : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => {
                  const value = hierarchy[level as keyof ObjectHierarchyType];
                  if (value) {
                    onHierarchyFilter(level, value);
                  }
                }}
              >
                <span>{icon} {label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick drill-down info */}
        <div className="p-3 bg-blue-50 rounded border border-blue-200">
          <p className="text-xs text-blue-800">
            <span className="font-semibold">Tip:</span> Click any breadcrumb or level to filter alarms by that object.
          </p>
        </div>
      </div>
    </div>
  );
};
