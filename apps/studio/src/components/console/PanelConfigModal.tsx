import { useState } from "react";
import { X } from "lucide-react";

const PANEL_TYPES = [
  { value: "number", label: "Number (KPI)" },
  { value: "table", label: "Table" },
  { value: "chart", label: "Chart" },
  { value: "markdown", label: "Markdown" },
  { value: "keynodes", label: "Key Nodes" },
  { value: "node", label: "Single Node" },
];

export function PanelConfigModal({ onSave, onClose }: { onSave: (c: any) => void; onClose: () => void }) {
  const [type, setType] = useState("number");
  const [title, setTitle] = useState("");

  const handleSave = () => {
    onSave({
      id: `p_${Date.now()}`,
      type,
      title: title || PANEL_TYPES.find(t => t.value === type)?.label || "Panel",
      dataSource: { type: "executions" },
      config: {},
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="w-80 rounded-xl border border-border bg-surface-container p-5 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Add Panel</h3>
          <button onClick={onClose}><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-medium text-muted-foreground uppercase">Type</label>
            <select value={type} onChange={e => setType(e.target.value)} className="w-full mt-1 rounded border border-border bg-surface px-2 py-1.5 text-xs">
              {PANEL_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-medium text-muted-foreground uppercase">Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Panel title" className="w-full mt-1 rounded border border-border bg-surface px-2 py-1.5 text-xs" />
          </div>
          <button onClick={handleSave} className="w-full rounded bg-primary py-1.5 text-xs font-medium text-primary-foreground">Add Panel</button>
        </div>
      </div>
    </div>
  );
}
