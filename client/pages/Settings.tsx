import { useState, useCallback } from "react";
import { Eye, EyeOff, GripVertical, RotateCcw } from "lucide-react";
import { useLocalStorage, DEFAULT_WIDGETS, type DashboardLayout, type WidgetConfig } from "@/hooks/useLocalStorage";
import { cn } from "@/lib/utils";

const WIDGET_LABELS: Record<string, { title: string; description: string }> = {
  voice: {
    title: "Voice",
    description: "Voice traffic and call quality metrics",
  },
  data: {
    title: "Data",
    description: "Data traffic and consumption patterns",
  },
  subscribers: {
    title: "Subscribers",
    description: "Subscriber distribution by type",
  },
  vendors: {
    title: "Mobile Device Vendors",
    description: "Device distribution by manufacturer",
  },
  aiActions: {
    title: "Recent AI-Engine Actions",
    description: "Recent automated network operations",
  },
  alarms: {
    title: "Network Alarms",
    description: "Network alarm trends and incidents",
  },
  failures: {
    title: "Total Failures per Vendor",
    description: "Equipment failures by vendor",
  },
};

export default function Settings() {
  const [widgetLayout, setWidgetLayout] = useLocalStorage<DashboardLayout>(
    "dashboard_layout",
    DEFAULT_WIDGETS
  );
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const widgets = Object.entries(widgetLayout).sort(
    ([, a], [, b]) => a.order - b.order
  );

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const draggedIndex = widgets.findIndex(([id]) => id === draggedId);
    const targetIndex = widgets.findIndex(([id]) => id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Create new layout with swapped orders
    const newLayout = { ...widgetLayout };
    const draggedOrder = newLayout[draggedId].order;
    const targetOrder = newLayout[targetId].order;

    newLayout[draggedId] = { ...newLayout[draggedId], order: targetOrder };
    newLayout[targetId] = { ...newLayout[targetId], order: draggedOrder };

    setWidgetLayout(newLayout);
    setDraggedId(null);
  };

  const toggleVisibility = useCallback(
    (id: string) => {
      setWidgetLayout((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          visible: !prev[id].visible,
        },
      }));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    },
    [setWidgetLayout]
  );

  const resetAll = useCallback(() => {
    setWidgetLayout(DEFAULT_WIDGETS);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  }, [setWidgetLayout]);

  const visibleCount = widgets.filter(([, config]) => config.visible).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Dashboard Settings</h1>
        <p className="text-muted-foreground">
          Customize your dashboard layout, show/hide widgets, and reset to defaults
        </p>
      </div>

      {/* Success Message */}
      {saveSuccess && (
        <div className="fixed bottom-6 right-6 bg-status-healthy text-white px-6 py-3 rounded-lg shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-300">
          <p className="text-sm font-medium">Settings saved to your device</p>
        </div>
      )}

      {/* Settings Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Widget Management */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card-elevated p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Manage Widgets</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {visibleCount} of {widgets.length} widgets visible
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {widgets.map(([id, config]) => {
                const label = WIDGET_LABELS[id as keyof typeof WIDGET_LABELS] || {
                  title: id,
                  description: "Widget",
                };

                return (
                  <div
                    key={id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, id)}
                    className={cn(
                      "p-4 border rounded-lg transition-all cursor-move",
                      draggedId === id
                        ? "border-primary bg-primary/5 opacity-50"
                        : "border-border hover:border-primary/50 bg-card"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      {/* Drag Handle */}
                      <div className="mt-1 flex-shrink-0 text-muted-foreground cursor-grab active:cursor-grabbing">
                        <GripVertical className="w-5 h-5" />
                      </div>

                      {/* Widget Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground">{label.title}</h3>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {label.description}
                        </p>
                      </div>

                      {/* Visibility Toggle */}
                      <button
                        onClick={() => toggleVisibility(id)}
                        className={cn(
                          "flex-shrink-0 p-2 rounded-lg transition-colors",
                          config.visible
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/70"
                        )}
                        title={config.visible ? "Hide widget" : "Show widget"}
                      >
                        {config.visible ? (
                          <Eye className="w-5 h-5" />
                        ) : (
                          <EyeOff className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground mb-4">
                💡 Drag widgets to reorder them on your dashboard
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <div className="card-elevated p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Actions</h2>

            {/* Reset Button */}
            <button
              onClick={resetAll}
              className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 mb-3"
            >
              <RotateCcw className="w-4 h-4" />
              Reset to Default
            </button>

            <div className="p-4 bg-secondary/20 rounded-lg space-y-3">
              <div>
                <h3 className="font-semibold text-sm text-foreground">Widget Count</h3>
                <p className="text-2xl font-bold text-primary mt-1">{visibleCount}/{widgets.length}</p>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground">Auto-Save</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Changes are automatically saved to your device
                </p>
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="card-elevated p-6">
            <h3 className="font-semibold text-foreground mb-3">Customization Info</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-primary flex-shrink-0">•</span>
                <span>Drag to reorder widgets</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary flex-shrink-0">•</span>
                <span>Toggle visibility on/off</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary flex-shrink-0">•</span>
                <span>Change chart types in dashboard</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary flex-shrink-0">•</span>
                <span>Toggle tooltips & legends</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary flex-shrink-0">•</span>
                <span>Reset individual widgets</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
