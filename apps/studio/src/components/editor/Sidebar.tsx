import { useCallback, useEffect, useState } from "react";
import { Search, FolderOpen, History, Boxes, PanelLeftClose, PanelRightOpen, Loader2, RefreshCw, Play } from "lucide-react";
import { CATEGORY_ORDER, NODE_CATALOG, type NodeDef } from "@/lib/nodes";
import { useWorkflow } from "@/lib/workflow-context";
import { api } from "@/lib/api";

type Tab = "nodes" | "workflows" | "executions";

export function EditorSidebar() {
  const [tab, setTab] = useState<Tab>("nodes");
  const [q, setQ] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const { addNodeOfType, logs } = useWorkflow();

  const filtered = NODE_CATALOG.filter(
    (n) => n.label.toLowerCase().includes(q.toLowerCase()) || n.type.includes(q.toLowerCase()),
  );

  const grouped = CATEGORY_ORDER.map((cat) => ({
    cat,
    items: filtered.filter((n) => n.category === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <aside className={`flex shrink-0 flex-col border-r border-border bg-sidebar transition-all ${collapsed ? 'w-12' : 'w-72'}`}>
      {collapsed ? (
        <div className="flex flex-col items-center gap-3 p-2">
          <button
            onClick={() => setCollapsed(false)}
            className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-surface-container-hover hover:text-foreground"
            title="Expand sidebar"
          >
            <PanelRightOpen className="h-4 w-4" />
          </button>
          <div className="flex flex-col items-center gap-2.5">
            {(["nodes", "workflows", "executions"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`grid h-8 w-8 place-items-center rounded-md text-[10px] font-medium uppercase transition ${
                  tab === t ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-surface-container-hover hover:text-foreground"
                }`}
                title={t}
              >
                {t[0]}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <div className="grid h-9 w-9 place-items-center rounded-md bg-primary/15 text-primary">
              <Boxes className="h-4 w-4" />
            </div>
            <div className="leading-tight flex-1">
              <div className="text-sm font-semibold">Library</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Workflow Assets</div>
            </div>
            <button
              onClick={() => setCollapsed(true)}
              className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-surface-container-hover hover:text-foreground"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </div>

          <div className="flex border-b border-border text-xs">
            {(["nodes", "workflows", "executions"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`relative flex-1 py-2.5 font-medium capitalize transition ${
                  tab === t ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
                {tab === t && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-primary" />}
              </button>
            ))}
          </div>

          {tab === "nodes" && (
            <>
              <div className="px-3 pt-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search nodes…"
                    className="h-8 w-full rounded-md border border-border bg-surface-container pl-8 pr-2 text-xs outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="scrollbar-thin flex-1 overflow-y-auto px-3 pb-4 pt-3">
                {grouped.map(({ cat, items }) => (
                  <div key={cat} className="mb-4">
                    <div className="mb-2 px-1 text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                      {cat}
                    </div>
                    <div className="space-y-1.5">
                      {items.map((n) => (
                        <NodeCard key={n.type} def={n} onAdd={() => addNodeOfType(n.type, 320 + Math.random() * 200, 200 + Math.random() * 200)} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

      {tab === "workflows" && <WorkflowsTab />}

          {tab === "executions" && (
            <div className="scrollbar-thin flex-1 overflow-y-auto px-3 py-3">
              {logs.length === 0 ? (
                <div className="px-1 py-6 text-center text-xs text-muted-foreground">
                  <History className="mx-auto mb-2 h-6 w-6 opacity-50" />
                  No executions yet.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {logs
                    .slice()
                    .reverse()
                    .slice(0, 30)
                    .map((l) => (
                      <div
                        key={l.id}
                        className="rounded-md border-l-2 bg-surface-container px-2.5 py-1.5 text-xs"
                        style={{
                          borderColor:
                            l.level === "error"
                              ? "var(--danger)"
                              : l.level === "success"
                                ? "var(--success)"
                                : l.level === "llm"
                                  ? "var(--warning)"
                                  : "var(--info)",
                        }}
                      >
                        <div className="text-foreground">{l.message}</div>
                        <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">{l.ts}</div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </aside>
  );
}

function WorkflowsTab() {
  const { loadWorkflow } = useWorkflow();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api.listWorkflows()
      .then((data) => setItems(data || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="grid flex-1 place-items-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex-1 px-4 py-6 text-center text-xs text-muted-foreground">
        <FolderOpen className="mx-auto mb-2 h-6 w-6 opacity-50" />
        No saved workflows yet.
        <button onClick={load} className="mt-2 block mx-auto text-primary hover:underline">
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="scrollbar-thin flex-1 overflow-y-auto px-3 py-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase text-muted-foreground">{items.length} saved</span>
        <button onClick={load} className="rounded p-0.5 text-muted-foreground hover:text-foreground" title="Refresh">
          <RefreshCw className="h-3 w-3" />
        </button>
      </div>
      <div className="space-y-1.5">
        {items.map((w) => (
          <button
            key={w.id}
            onClick={() => loadWorkflow(w.id)}
            className="flex w-full items-center gap-2 rounded-md border border-border bg-surface-container px-2.5 py-2 text-left hover:bg-accent transition"
          >
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded bg-primary/15 text-primary">
              <Play className="h-3 w-3" />
            </span>
            <span className="min-w-0 flex-1 text-xs font-medium truncate">{w.name || w.id}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function NodeCard({ def, onAdd }: { def: NodeDef; onAdd: () => void }) {
  const Icon = def.icon;
  return (
    <button
      onClick={onAdd}
      draggable
      onDragStart={(e) => e.dataTransfer.setData("application/node-type", def.type)}
      className="group flex w-full items-center gap-2.5 rounded-lg border border-transparent bg-surface-container/60 px-2.5 py-2 text-left transition hover:border-border hover:bg-surface-container hover:shadow-sm"
    >
      <span
        className="grid h-8 w-8 shrink-0 place-items-center rounded-md"
        style={{ background: `${def.color}1f`, color: def.color }}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs font-semibold text-foreground">{def.label}</span>
        <span className="block truncate text-[10px] text-muted-foreground">{def.description}</span>
      </span>
    </button>
  );
}