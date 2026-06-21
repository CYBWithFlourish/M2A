import { Loader2, Check, X } from "lucide-react";
import { getNodeDef } from "@/lib/nodes";
import type { CanvasNode } from "@/lib/workflow-context";

export function NodeCard({ node, selected, onSelect, onDelete, compact }: {
  node: CanvasNode;
  selected?: boolean;
  onSelect?: () => void;
  onDelete?: () => void;
  compact?: boolean;
}) {
  const def = getNodeDef(node.type);
  if (!def) return null;
  const Icon = def.icon;
  const status = node.status || 'idle';

  return (
    <div onClick={onSelect} className={`group relative rounded-lg border bg-card transition ${selected ? 'border-primary shadow-[var(--shadow-selected)]' : 'border-border'} ${compact ? 'p-2' : 'p-2.5'}`}>
      <div className="absolute inset-y-0 left-0 w-[3px] rounded-l-lg" style={{ background: def.color }} />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span className="grid h-5 w-5 shrink-0 place-items-center rounded" style={{ background: `${def.color}26`, color: def.color }}>
            <Icon className="h-3 w-3" />
          </span>
          <span className="truncate text-[12px] font-semibold">{def.label}</span>
        </div>
        <div className="flex items-center gap-1">
          {status === 'running' && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
          {status === 'success' && <Check className="h-3 w-3 text-success" />}
          {status === 'error' && <X className="h-3 w-3 text-danger" />}
          {onDelete && (
            <button onClick={e => { e.stopPropagation(); onDelete(); }} className="hidden h-4 w-4 items-center justify-center rounded text-muted-foreground hover:bg-danger/10 hover:text-danger group-hover:flex">
              <X className="h-2.5 w-2.5" />
            </button>
          )}
        </div>
      </div>
      {!compact && (
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider" style={{ background: `${def.color}1f`, color: def.color }}>
            {def.badge}
          </span>
          {node.config?.model && <span className="text-[9px] text-muted-foreground">{String(node.config.model)}</span>}
          {node.config?.action && <span className="text-[9px] italic text-muted-foreground">{String(node.config.action)}</span>}
        </div>
      )}
    </div>
  );
}
