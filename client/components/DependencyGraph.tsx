import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, {
  Background,
  ConnectionMode,
  Controls,
  Edge,
  MarkerType,
  Node,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  ArrowDown,
  ArrowUp,
  ChevronsDown,
  ChevronsUp,
  Focus,
  GitBranch,
  Loader2,
  RefreshCw,
  ScanSearch,
  Search,
  Target,
} from 'lucide-react';
import { TopologyObject } from '../utils/topologyData';
import DependencyNode from './DependencyNode';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface DependencyGraphProps {
  topology: TopologyObject[];
  selectedNode?: TopologyObject | null;
  onNodeSelect?: (node: TopologyObject) => void;
}

type ScopeLevel = 'all' | 'global' | 'country' | 'region' | 'cluster' | 'site' | 'node' | 'rack';
type UiStatus = 'all' | 'healthy' | 'warning' | 'degraded' | 'critical' | 'offline';

type HierarchyRecord = {
  country?: string;
  region?: string;
  cluster?: string;
  site?: string;
  rack?: string;
};

const nodeTypes = { dependency: DependencyNode };

function healthToUiStatus(node: TopologyObject): Exclude<UiStatus, 'all'> {
  if (node.healthState === 'healthy') return 'healthy';
  if (node.healthState === 'degraded') return 'degraded';
  if (node.healthState === 'down') {
    return node.alarmSummary.critical > 0 ? 'critical' : 'offline';
  }
  return 'warning';
}

function getLevelKey(node: TopologyObject): ScopeLevel {
  if (node.type === 'country') return 'country';
  if (node.type === 'region') return 'region';
  if (node.type === 'cluster') return 'cluster';
  if (node.type === 'site') return 'site';
  if (node.type === 'rack') return 'rack';
  if (node.type === 'interface' || node.type === 'cell' || node.type === 'port' || node.type === 'board') return 'node';
  return 'node';
}

function DependencyGraphContent({ topology, selectedNode, onNodeSelect }: DependencyGraphProps) {
  const { fitView, setCenter } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [scopeLevel, setScopeLevel] = useState<ScopeLevel>('all');
  const [region, setRegion] = useState<string>('all');
  const [cluster, setCluster] = useState<string>('all');
  const [site, setSite] = useState<string>('all');
  const [rack, setRack] = useState<string>('all');
  const [status, setStatus] = useState<UiStatus>('all');
  const [search, setSearch] = useState('');

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [clickedId, setClickedId] = useState<string | null>(selectedNode?.id || null);
  const [showOnlyPaths, setShowOnlyPaths] = useState(false);
  const [hideHealthy, setHideHealthy] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const [traceSource, setTraceSource] = useState<string>('none');
  const [traceTarget, setTraceTarget] = useState<string>('none');
  const [tracedPath, setTracedPath] = useState<string[]>([]);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string>(new Date().toISOString());

  const nodeMap = useMemo(() => new Map(topology.map((node) => [node.id, node])), [topology]);

  const parentMap = useMemo(() => {
    const map = new Map<string, string[]>();
    topology.forEach((item) => {
      if (!map.has(item.id)) map.set(item.id, []);
      if (item.parentId) {
        map.set(item.id, [...(map.get(item.id) || []), item.parentId]);
        map.set(item.parentId, [...(map.get(item.parentId) || []), item.id]);
      }
    });
    return map;
  }, [topology]);

  const hierarchyById = useMemo(() => {
    const walk = (node: TopologyObject): HierarchyRecord => {
      const base: HierarchyRecord = {};
      let cursor: TopologyObject | undefined = node;
      while (cursor) {
        if (cursor.type === 'country') base.country = cursor.name;
        if (cursor.type === 'region') base.region = cursor.name;
        if (cursor.type === 'cluster') base.cluster = cursor.name;
        if (cursor.type === 'site') base.site = cursor.name;
        if (cursor.type === 'rack') base.rack = cursor.name;
        cursor = cursor.parentId ? nodeMap.get(cursor.parentId) : undefined;
      }
      return base;
    };

    const map = new Map<string, HierarchyRecord>();
    topology.forEach((node) => map.set(node.id, walk(node)));
    return map;
  }, [nodeMap, topology]);

  const regionOptions = useMemo(() => {
    return Array.from(new Set(topology.filter((n) => n.type === 'region').map((n) => n.name))).sort();
  }, [topology]);

  const clusterOptions = useMemo(() => {
    const rows = topology.filter((n) => n.type === 'cluster').filter((n) => {
      const h = hierarchyById.get(n.id);
      return region === 'all' || h?.region === region;
    });
    return Array.from(new Set(rows.map((n) => n.name))).sort();
  }, [hierarchyById, region, topology]);

  const siteOptions = useMemo(() => {
    const rows = topology.filter((n) => n.type === 'site').filter((n) => {
      const h = hierarchyById.get(n.id);
      if (region !== 'all' && h?.region !== region) return false;
      if (cluster !== 'all' && h?.cluster !== cluster) return false;
      return true;
    });
    return Array.from(new Set(rows.map((n) => n.name))).sort();
  }, [cluster, hierarchyById, region, topology]);

  const rackOptions = useMemo(() => {
    const rows = topology.filter((n) => n.type === 'rack').filter((n) => {
      const h = hierarchyById.get(n.id);
      if (region !== 'all' && h?.region !== region) return false;
      if (cluster !== 'all' && h?.cluster !== cluster) return false;
      if (site !== 'all' && h?.site !== site) return false;
      return true;
    });
    return Array.from(new Set(rows.map((n) => n.name))).sort();
  }, [cluster, hierarchyById, region, site, topology]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const timer = setTimeout(() => {
      if (!topology.length) {
        setError('No topology data available.');
      }
      setLoading(false);
      setLastUpdatedAt(new Date().toISOString());
    }, 180);
    return () => clearTimeout(timer);
  }, [topology]);

  useEffect(() => {
    if (!autoRefresh) return;
    const timer = setInterval(() => setLastUpdatedAt(new Date().toISOString()), 15000);
    return () => clearInterval(timer);
  }, [autoRefresh]);

  useEffect(() => {
    if (region !== 'all' && !regionOptions.includes(region)) setRegion('all');
  }, [region, regionOptions]);

  useEffect(() => {
    if (cluster !== 'all' && !clusterOptions.includes(cluster)) setCluster('all');
  }, [cluster, clusterOptions]);

  useEffect(() => {
    if (site !== 'all' && !siteOptions.includes(site)) setSite('all');
  }, [site, siteOptions]);

  useEffect(() => {
    if (rack !== 'all' && !rackOptions.includes(rack)) setRack('all');
  }, [rack, rackOptions]);

  const scopedTopology = useMemo(() => {
    let rows = [...topology];

    rows = rows.filter((node) => {
      const h = hierarchyById.get(node.id);
      if (region !== 'all' && h?.region !== region) return false;
      if (cluster !== 'all' && h?.cluster !== cluster) return false;
      if (site !== 'all' && h?.site !== site) return false;
      if (rack !== 'all' && h?.rack !== rack && node.name !== rack) return false;
      return true;
    });

    if (scopeLevel !== 'all') {
      rows = rows.filter((node) => scopeLevel === getLevelKey(node) || (scopeLevel === 'global' && node.type === 'country'));
    }

    if (status !== 'all') {
      rows = rows.filter((node) => healthToUiStatus(node) === status);
    }

    if (hideHealthy) {
      rows = rows.filter((node) => node.healthState !== 'healthy');
    }

    if (collapsed) {
      rows = rows.filter((node) => !['cell', 'interface', 'port', 'board', 'module', 'rru', 'bbu'].includes(node.type));
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter((node) => {
        const h = hierarchyById.get(node.id);
        return [node.name, node.type, h?.region, h?.cluster, h?.site, h?.rack].join(' ').toLowerCase().includes(q);
      });
    }

    return rows.slice(0, 400);
  }, [cluster, collapsed, hierarchyById, hideHealthy, rack, region, scopeLevel, search, site, status, topology]);

  const scopedNodeIds = useMemo(() => new Set(scopedTopology.map((n) => n.id)), [scopedTopology]);

  const graphEdges = useMemo(() => {
    return scopedTopology
      .filter((node) => node.parentId && scopedNodeIds.has(node.parentId))
      .map((node) => ({
        id: `${node.parentId}-${node.id}`,
        source: node.parentId as string,
        target: node.id,
      }));
  }, [scopedNodeIds, scopedTopology]);

  const neighbors = useMemo(() => {
    const set = new Set<string>();
    if (!hoveredId && !clickedId) return set;
    const seed = hoveredId || clickedId;
    if (!seed) return set;
    set.add(seed);
    (parentMap.get(seed) || []).forEach((id) => set.add(id));
    return set;
  }, [clickedId, hoveredId, parentMap]);

  const tracedNodeSet = useMemo(() => new Set(tracedPath), [tracedPath]);

  const buildLaneNodes = useCallback((): Node[] => {
    const laneIndex = (node: TopologyObject) => {
      if (node.type === 'country' || node.type === 'region') return 0;
      if (node.type === 'cluster') return 1;
      if (node.type === 'site') return 2;
      if (node.type === 'rack') return 3;
      return 4;
    };

    const groups = new Map<string, TopologyObject[]>();
    scopedTopology.forEach((node) => {
      const h = hierarchyById.get(node.id);
      const key = `${h?.region || 'region-unknown'}::${h?.cluster || 'cluster-unknown'}::${h?.site || 'site-unknown'}::${laneIndex(node)}`;
      groups.set(key, [...(groups.get(key) || []), node]);
    });

    const yCounters = new Map<string, number>();
    const laneX = [40, 360, 680, 1000, 1320];

    return scopedTopology.map((item) => {
      const lIdx = laneIndex(item);
      const h = hierarchyById.get(item.id);
      const groupKey = `${h?.region || 'region-unknown'}::${h?.cluster || 'cluster-unknown'}::${h?.site || 'site-unknown'}::${lIdx}`;
      const current = yCounters.get(groupKey) || 0;
      const y = current * 110 + (h?.region ? regionOptions.indexOf(h.region) * 24 : 0);
      yCounters.set(groupKey, current + 1);

      const alerts = item.alarmSummary.critical + item.alarmSummary.major;
      const isTraced = tracedNodeSet.size > 0 && tracedNodeSet.has(item.id);
      const dimmed = (neighbors.size > 0 && !neighbors.has(item.id)) || (tracedNodeSet.size > 0 && !isTraced) || (showOnlyPaths && !isTraced);

      return {
        id: item.id,
        position: { x: laneX[lIdx], y },
        type: 'dependency',
        data: {
          label: item.name,
          type: item.type,
          health: item.healthState,
          alerts,
          childCount: item.childrenIds.length,
          isHovered: hoveredId === item.id,
          isDimmed: dimmed,
          isRelated: neighbors.has(item.id) || isTraced,
        },
      } as Node;
    });
  }, [hierarchyById, hoveredId, neighbors, regionOptions, scopedTopology, showOnlyPaths, tracedNodeSet]);

  useEffect(() => {
    const builtNodes = buildLaneNodes();
    const builtEdges: Edge[] = graphEdges.map((edge) => {
      const source = nodeMap.get(edge.source);
      const target = nodeMap.get(edge.target);
      const sourceRisk = source ? source.healthState !== 'healthy' : false;
      const targetRisk = target ? target.healthState !== 'healthy' : false;
      const onTrace = tracedNodeSet.has(edge.source) && tracedNodeSet.has(edge.target);
      const isRelated = neighbors.has(edge.source) && neighbors.has(edge.target);
      const dimmed = (neighbors.size > 0 && !isRelated) || (tracedNodeSet.size > 0 && !onTrace) || (showOnlyPaths && !onTrace);

      return {
        ...edge,
        type: 'step',
        markerEnd: { type: MarkerType.ArrowClosed },
        animated: onTrace,
        style: {
          stroke: onTrace ? 'hsl(var(--primary))' : sourceRisk || targetRisk ? '#f59e0b' : 'hsl(var(--muted-foreground))',
          strokeWidth: onTrace ? 3.2 : 1.3,
          opacity: dimmed ? 0.08 : onTrace ? 1 : 0.35,
        },
      } as Edge;
    });

    setNodes(builtNodes);
    setEdges(builtEdges);
  }, [buildLaneNodes, graphEdges, neighbors, nodeMap, setEdges, setNodes, showOnlyPaths, tracedNodeSet]);

  useEffect(() => {
    fitView({ padding: 0.2, duration: 250, minZoom: 0.35 });
  }, [nodes.length, edges.length, fitView]);

  const connectedForSelected = useMemo(() => {
    if (!clickedId) return { upstream: [] as string[], downstream: [] as string[] };
    const upstream = topology.filter((n) => n.childrenIds.includes(clickedId)).map((n) => n.id);
    const current = nodeMap.get(clickedId);
    const downstream = current?.childrenIds || [];
    return { upstream, downstream };
  }, [clickedId, nodeMap, topology]);

  const selectedEntity = useMemo(() => (clickedId ? nodeMap.get(clickedId) || null : null), [clickedId, nodeMap]);

  const bfsPath = useCallback(
    (sourceId: string, targetId: string): string[] => {
      if (sourceId === targetId) return [sourceId];
      const queue: string[] = [sourceId];
      const seen = new Set<string>([sourceId]);
      const prev = new Map<string, string>();

      while (queue.length) {
        const cur = queue.shift() as string;
        for (const next of parentMap.get(cur) || []) {
          if (!scopedNodeIds.has(next) || seen.has(next)) continue;
          seen.add(next);
          prev.set(next, cur);
          if (next === targetId) {
            const path = [targetId];
            let walk = targetId;
            while (prev.has(walk)) {
              walk = prev.get(walk) as string;
              path.unshift(walk);
            }
            return path;
          }
          queue.push(next);
        }
      }

      return [];
    },
    [parentMap, scopedNodeIds],
  );

  const handleTracePath = useCallback(() => {
    if (traceSource === 'none' || traceTarget === 'none') return;
    setTracedPath(bfsPath(traceSource, traceTarget));
  }, [bfsPath, traceSource, traceTarget]);

  const warningPathCount = useMemo(() => {
    return graphEdges.filter((e) => {
      const s = nodeMap.get(e.source);
      const t = nodeMap.get(e.target);
      return s?.healthState !== 'healthy' || t?.healthState !== 'healthy';
    }).length;
  }, [graphEdges, nodeMap]);

  const degradedCount = useMemo(() => scopedTopology.filter((n) => n.healthState === 'degraded' || n.healthState === 'down').length, [scopedTopology]);

  const pathSummary = useMemo(() => {
    if (tracedPath.length < 2) return null;
    const nodesInPath = tracedPath.map((id) => nodeMap.get(id)).filter(Boolean) as TopologyObject[];
    const degradedHops = nodesInPath.filter((node) => node.healthState !== 'healthy').length;
    const bottlenecks = nodesInPath
      .filter((node) => node.alarmSummary.critical > 0 || node.kpiSummary.utilization > 85)
      .map((node) => node.name)
      .slice(0, 4);
    return {
      hops: tracedPath.length - 1,
      degradedHops,
      bottlenecks,
    };
  }, [nodeMap, tracedPath]);

  const traceCandidates = useMemo(() => scopedTopology.slice(0, 250), [scopedTopology]);

  const resetFilters = () => {
    setScopeLevel('all');
    setRegion('all');
    setCluster('all');
    setSite('all');
    setRack('all');
    setStatus('all');
    setSearch('');
    setHideHealthy(false);
    setShowOnlyPaths(false);
    setCollapsed(false);
    setTracedPath([]);
    setTraceSource('none');
    setTraceTarget('none');
  };

  const focusSelection = () => {
    if (!selectedEntity) return;
    const node = nodes.find((n) => n.id === selectedEntity.id);
    if (!node) return;
    setCenter(node.position.x + 110, node.position.y + 50, { duration: 260, zoom: 0.95 });
  };

  const focusRackSelection = useEffect(() => {
    if (rack === 'all') return;
    const rackNode = scopedTopology.find((node) => node.type === 'rack' && node.name === rack);
    if (!rackNode) return;
    setClickedId(rackNode.id);
    onNodeSelect?.(rackNode);
  }, [onNodeSelect, rack, scopedTopology]);

  void focusRackSelection;

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-border bg-card">
        <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Building dependency lanes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-red-500/40 bg-red-500/5">
        <div className="text-sm text-red-700 dark:text-red-300">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="grid grid-cols-2 gap-2 rounded-xl border border-border bg-card p-3 text-xs md:grid-cols-6">
        <Metric title="Nodes" value={scopedTopology.length.toString()} />
        <Metric title="Relationships" value={graphEdges.length.toString()} />
        <Metric title="Degraded" value={degradedCount.toString()} tone="warning" />
        <Metric title="Warning Paths" value={warningPathCount.toString()} tone="warning" />
        <Metric title="Last Updated" value={new Date(lastUpdatedAt).toLocaleTimeString()} />
        <div className="flex items-center justify-between rounded-lg border border-border px-2 py-1.5">
          <span className="text-muted-foreground">Auto refresh</span>
          <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-3">
        <div className="grid grid-cols-1 gap-2 xl:grid-cols-8">
          <Select value={scopeLevel} onValueChange={(v) => setScopeLevel(v as ScopeLevel)}>
            <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Scope Level" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem><SelectItem value="global">Global</SelectItem><SelectItem value="country">Country</SelectItem><SelectItem value="region">Region</SelectItem><SelectItem value="cluster">Cluster</SelectItem><SelectItem value="site">Site</SelectItem><SelectItem value="node">Node</SelectItem><SelectItem value="rack">Rack</SelectItem>
            </SelectContent>
          </Select>

          <FilterSelect value={region} onChange={setRegion} placeholder="Select region (e.g. Cairo, Alexandria, Riyadh)" options={regionOptions} emptyHint="No regions found for the current dataset." />
          <FilterSelect value={cluster} onChange={setCluster} placeholder="Select cluster (e.g. Cairo-Cluster-1, Giza-Cluster-2)" options={clusterOptions} emptyHint="No clusters available for selected region." />
          <FilterSelect value={site} onChange={setSite} placeholder="Select site (e.g. Abu Dhabi, Sharjah, Jeddah Core Site)" options={siteOptions} emptyHint="No sites available for selected region/cluster." />
          <FilterSelect value={rack} onChange={setRack} placeholder="Select rack (e.g. Rack-A12, Rack-B04, Core-Rack-7)" options={rackOptions} emptyHint="No racks available for selected parent filters." />

          <Select value={status} onValueChange={(v) => setStatus(v as UiStatus)}>
            <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem><SelectItem value="healthy">Healthy</SelectItem><SelectItem value="warning">Warning</SelectItem><SelectItem value="degraded">Degraded</SelectItem><SelectItem value="critical">Critical</SelectItem><SelectItem value="offline">Offline</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative xl:col-span-2">
            <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 pl-8 text-xs" placeholder="Search node, path, dependency, site, rack..." />
          </div>
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={resetFilters}><RefreshCw className="mr-1 h-3.5 w-3.5" />Reset Filters</Button>
          <Button size="sm" variant="outline" onClick={() => fitView({ padding: 0.25, duration: 220 })}><ScanSearch className="mr-1 h-3.5 w-3.5" />Fit to Screen</Button>
          <Button size="sm" variant="outline" disabled={!selectedEntity} onClick={focusSelection}><Focus className="mr-1 h-3.5 w-3.5" />Focus Selection</Button>
          <Button size="sm" variant={showOnlyPaths ? 'default' : 'outline'} onClick={() => setShowOnlyPaths((v) => !v)}><GitBranch className="mr-1 h-3.5 w-3.5" />Show Paths</Button>
          <Button size="sm" variant={hideHealthy ? 'default' : 'outline'} onClick={() => setHideHealthy((v) => !v)}>Hide Healthy</Button>
          <Button size="sm" variant="outline" onClick={() => setCollapsed(false)}><ChevronsDown className="mr-1 h-3.5 w-3.5" />Expand All</Button>
          <Button size="sm" variant="outline" onClick={() => setCollapsed(true)}><ChevronsUp className="mr-1 h-3.5 w-3.5" />Collapse All</Button>
        </div>

        <div className="mt-3 rounded-lg border border-border p-2">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_1fr_auto]">
            <Select value={traceSource} onValueChange={setTraceSource}>
              <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Source node" /></SelectTrigger>
              <SelectContent>{traceCandidates.map((n) => <SelectItem key={n.id} value={n.id}>{n.name}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={traceTarget} onValueChange={setTraceTarget}>
              <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Target node" /></SelectTrigger>
              <SelectContent>{traceCandidates.map((n) => <SelectItem key={n.id} value={n.id}>{n.name}</SelectItem>)}</SelectContent>
            </Select>
            <Button onClick={handleTracePath} disabled={traceSource === 'none' || traceTarget === 'none'} className="h-9"><Target className="mr-1 h-4 w-4" />Trace Path</Button>
          </div>
          {pathSummary && (
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <Badge variant="secondary">Hops: {pathSummary.hops}</Badge>
              <Badge variant="secondary">Degraded hops: {pathSummary.degradedHops}</Badge>
              <Badge variant="secondary">Bottlenecks: {pathSummary.bottlenecks.join(', ') || 'None'}</Badge>
            </div>
          )}
        </div>
      </div>

      {scopedTopology.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border bg-card text-sm text-muted-foreground">
          No graph entities match the current filters. Try resetting filters or changing scope.
        </div>
      ) : (
        <div className="flex-1 min-h-0 rounded-xl border border-border bg-card">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            connectionMode={ConnectionMode.Loose}
            onNodeMouseEnter={(_, n) => setHoveredId(n.id)}
            onNodeMouseLeave={() => setHoveredId(null)}
            onNodeDoubleClick={(_, n) => {
              const obj = nodeMap.get(n.id);
              if (!obj) return;
              if (obj.type === 'region') setRegion(obj.name);
              if (obj.type === 'cluster') setCluster(obj.name);
              if (obj.type === 'site') setSite(obj.name);
              if (obj.type === 'rack') setRack(obj.name);
            }}
            onNodeClick={(_, n) => {
              setClickedId(n.id);
              const obj = nodeMap.get(n.id);
              if (obj) onNodeSelect?.(obj);
            }}
            fitView
            minZoom={0.2}
            maxZoom={1.8}
            defaultEdgeOptions={{ type: 'step' }}
          >
            <Background gap={22} size={1} className="opacity-30" />
            <Controls position="bottom-left" showInteractive={false} />
          </ReactFlow>
        </div>
      )}

      <Sheet open={!!selectedEntity} onOpenChange={(open) => !open && setClickedId(null)}>
        <SheetContent side="right" className="w-[420px] sm:max-w-[420px]">
          {selectedEntity && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedEntity.name}</SheetTitle>
                <SheetDescription className="capitalize">{selectedEntity.type} dependency details</SheetDescription>
              </SheetHeader>
              <div className="mt-4 space-y-2 text-sm">
                <DrawerRow label="Status" value={healthToUiStatus(selectedEntity)} />
                <DrawerRow label="Parent" value={selectedEntity.parentId ? nodeMap.get(selectedEntity.parentId)?.name || 'Unknown' : 'Root'} />
                <DrawerRow label="Child count" value={String(selectedEntity.childrenIds.length)} />
                <DrawerRow label="Upstream dependencies" value={String(connectedForSelected.upstream.length)} />
                <DrawerRow label="Downstream dependents" value={String(connectedForSelected.downstream.length)} />
                <DrawerRow label="Active alerts" value={String(selectedEntity.alarmSummary.critical + selectedEntity.alarmSummary.major)} />
                <DrawerRow label="Last updated" value={new Date(selectedEntity.lastStateChange).toLocaleString()} />
                <DrawerRow label="Health summary" value={`Avail ${selectedEntity.kpiSummary.availability.toFixed(1)}% · Lat ${selectedEntity.kpiSummary.latency.toFixed(1)}ms`} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button size="sm" variant="outline" onClick={focusSelection}>Focus on graph</Button>
                <Button size="sm" variant="outline" onClick={() => setTracedPath([selectedEntity.id, ...connectedForSelected.upstream.slice(0, 3)])}><ArrowUp className="mr-1 h-4 w-4" />Trace upstream</Button>
                <Button size="sm" variant="outline" onClick={() => setTracedPath([selectedEntity.id, ...connectedForSelected.downstream.slice(0, 3)])}><ArrowDown className="mr-1 h-4 w-4" />Trace downstream</Button>
                <Button size="sm" variant="outline" onClick={() => setShowOnlyPaths((v) => !v)}>Show impact analysis</Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const h = hierarchyById.get(selectedEntity.id);
                    if (h?.region) setRegion(h.region);
                    if (h?.cluster) setCluster(h.cluster);
                    if (h?.site) setSite(h.site);
                    if (h?.rack) setRack(h.rack);
                  }}
                >
                  Filter by this entity
                </Button>
                <Button size="sm" variant="outline" onClick={() => window.location.assign('/topology-management')}>Open related module</Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Metric({ title, value, tone = 'default' }: { title: string; value: string; tone?: 'default' | 'warning' }) {
  return (
    <div className={cn('rounded-lg border border-border px-2 py-1.5', tone === 'warning' && 'border-amber-500/40 bg-amber-500/5')}>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{title}</p>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function DrawerRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-md border border-border px-2 py-1.5">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right text-foreground">{value}</span>
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
  placeholder,
  emptyHint,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  emptyHint: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 text-xs">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All</SelectItem>
        {options.length > 0 ? options.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>) : <div className="px-2 py-1 text-xs text-muted-foreground">{emptyHint}</div>}
      </SelectContent>
    </Select>
  );
}

export const DependencyGraph: React.FC<DependencyGraphProps> = (props) => {
  return (
    <ReactFlowProvider>
      <DependencyGraphContent {...props} />
    </ReactFlowProvider>
  );
};

export default DependencyGraph;
