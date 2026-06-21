import { MarkdownPanel } from "./MarkdownPanel";
import { TablePanel } from "./TablePanel";
import { ChartPanel } from "./ChartPanel";
import { NumberPanel } from "./NumberPanel";
import { NodePanel_Pinned } from "./NodePanel_Pinned";
import { KeyNodesPanel } from "./KeyNodesPanel";

export function PanelGrid({ panels, editing, onRemove }: { panels: any[]; editing: boolean; onRemove: (id: string) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-min">
      {panels.map(p => (
        <div key={p.id} className={`relative rounded-lg border border-border bg-surface-container p-4 ${editing ? 'ring-1 ring-primary/30' : ''}`}>
          {editing && (
            <button onClick={() => onRemove(p.id)} className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-danger text-white text-[10px] flex items-center justify-center">×</button>
          )}
          <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{p.title}</h3>
          {p.type === "markdown" && <MarkdownPanel config={p.config} />}
          {p.type === "table" && <TablePanel dataSource={p.dataSource} />}
          {p.type === "chart" && <ChartPanel dataSource={p.dataSource} config={p.config} />}
          {p.type === "number" && <NumberPanel title={p.title} dataSource={p.dataSource} />}
          {p.type === "node" && <NodePanel_Pinned config={p.config} />}
          {p.type === "keynodes" && <KeyNodesPanel config={p.config} />}
        </div>
      ))}
    </div>
  );
}
