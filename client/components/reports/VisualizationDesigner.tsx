import { useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Palette, Grid3x3, Settings, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Visualization {
  id: string;
  type: 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'heatmap' | 'gauge' | 'sankey';
  title: string;
  dataSource: string;
}

const mockData = [
  { name: 'Jan', value: 4000 },
  { name: 'Feb', value: 3000 },
  { name: 'Mar', value: 2000 },
  { name: 'Apr', value: 2780 },
  { name: 'May', value: 1890 },
];

export default function VisualizationDesigner() {
  const [visualizations, setVisualizations] = useState<Visualization[]>([
    { id: '1', type: 'bar', title: 'Monthly Traffic', dataSource: 'Transport KPI' }
  ]);

  const chartTypes = [
    { type: 'bar' as const, label: 'Bar Chart', icon: '📊' },
    { type: 'line' as const, label: 'Line Chart', icon: '📈' },
    { type: 'pie' as const, label: 'Pie Chart', icon: '🥧' },
    { type: 'area' as const, label: 'Area Chart', icon: '📉' },
    { type: 'scatter' as const, label: 'Scatter', icon: '⚫' },
    { type: 'heatmap' as const, label: 'Heatmap', icon: '🔥' },
    { type: 'gauge' as const, label: 'Gauge', icon: '🎯' },
    { type: 'sankey' as const, label: 'Sankey', icon: '🌊' }
  ];

  const addVisualization = (type: Visualization['type']) => {
    setVisualizations([
      ...visualizations,
      {
        id: Date.now().toString(),
        type,
        title: `New ${chartTypes.find(c => c.type === type)?.label}`,
        dataSource: 'Select dataset...'
      }
    ]);
  };

  const removeVisualization = (id: string) => {
    setVisualizations(visualizations.filter(v => v.id !== id));
  };

  return (
    <div className="space-y-8">
      {/* Chart Type Palette */}
      <div>
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <Palette className="w-5 h-5 text-purple-600" />
          Visualization Palette
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {chartTypes.map(chart => (
            <button
              key={chart.type}
              onClick={() => addVisualization(chart.type)}
              className="group p-3 rounded-lg border border-border/50 hover:border-purple-500/50 hover:bg-muted/50 transition-all text-center"
            >
              <div className="text-2xl mb-1">{chart.icon}</div>
              <p className="text-xs font-semibold text-foreground group-hover:text-purple-600 transition-colors">{chart.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Visualization Gallery */}
      <div>
        <h3 className="font-bold text-foreground mb-4">Your Visualizations</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {visualizations.map(viz => (
            <div key={viz.id} className="rounded-xl border border-border/50 p-6 bg-card/50 group">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-bold text-foreground">{viz.title}</h4>
                  <p className="text-xs text-muted-foreground">Source: {viz.dataSource}</p>
                </div>
                <button
                  onClick={() => removeVisualization(viz.id)}
                  className="px-2 py-1 rounded text-xs bg-red-500/10 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
                >
                  Remove
                </button>
              </div>

              {/* Preview */}
              <div className="mb-4 p-4 bg-muted/30 rounded-lg border border-border/30 min-h-[300px] flex items-center justify-center">
                {viz.type === 'bar' && (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={mockData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
                {viz.type === 'line' && (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={mockData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#3b82f6" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
                {viz.type === 'pie' && (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={mockData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {mockData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'][index]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                )}
                {!['bar', 'line', 'pie'].includes(viz.type) && (
                  <div className="text-center">
                    <p className="text-muted-foreground text-sm">{viz.type} visualization preview</p>
                  </div>
                )}
              </div>

              {/* Configuration */}
              <div className="flex gap-2">
                <button className="flex-1 px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm flex items-center justify-center gap-2">
                  <Grid3x3 className="w-4 h-4" />
                  Configure
                </button>
                <button className="px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors">
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Add New Button */}
          <button className="rounded-xl border-2 border-dashed border-border p-6 hover:border-primary/50 hover:bg-muted/50 transition-all flex flex-col items-center justify-center gap-3 text-muted-foreground hover:text-primary">
            <Plus className="w-8 h-8" />
            <p className="text-sm font-semibold">Add Visualization</p>
            <p className="text-xs">Select a chart type above</p>
          </button>
        </div>
      </div>

      {/* Styling Options */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Theme & Styling</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-semibold text-foreground mb-3">Color Palette</p>
            <div className="flex gap-2">
              {['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#14b8a6'].map(color => (
                <button
                  key={color}
                  className="w-8 h-8 rounded-lg border-2 border-border hover:border-primary transition-all"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground mb-3">Font Style</p>
            <select className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm">
              <option>Modern (System)</option>
              <option>Classic (Serif)</option>
              <option>Minimal (Sans)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Responsive Design */}
      <div className="rounded-xl border border-border/50 p-6 bg-card/50">
        <h3 className="font-bold text-foreground mb-4">Responsive Design</h3>
        <p className="text-sm text-muted-foreground mb-4">
          All visualizations automatically adapt to different screen sizes. Preview how your reports will look:
        </p>
        <div className="grid grid-cols-3 gap-4">
          <button className="px-4 py-3 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all text-sm font-medium">
            📱 Mobile
          </button>
          <button className="px-4 py-3 rounded-lg border border-primary/50 bg-primary/5 text-sm font-medium">
            💻 Desktop
          </button>
          <button className="px-4 py-3 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all text-sm font-medium">
            🖥️ Large Screen
          </button>
        </div>
      </div>
    </div>
  );
}
