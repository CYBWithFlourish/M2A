import { useEffect, useState } from "react";
import { X, FileJson, History, Settings, Loader2 } from "lucide-react";
import { useWorkflow } from "@/lib/workflow-context";
import { api } from "@/lib/api";
import { getNodeDef } from "@/lib/nodes";
import { MemoryReferenceAutocomplete } from "@/components/memory/MemoryReferenceAutocomplete";

type Tab = "payload" | "history" | "config";

export function SidePanel({ onClose }: { onClose: () => void }) {
  const { nodes, selectedId, dispatch } = useWorkflow();
  const [tab, setTab] = useState<Tab>("config");
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const node = nodes.find(n => n.id === selectedId);
  if (!node) return null;
  const def = getNodeDef(node.type);

  return (
    <aside className="flex w-80 shrink-0 flex-col border-l border-border bg-sidebar">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <h3 className="text-sm font-semibold">{def?.label || node.type}</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
      </div>
      <div className="flex border-b border-border text-xs">
        {([["config", Settings], ["payload", FileJson], ["history", History]] as [Tab, any][]).map(([t, Icon]) => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 font-medium capitalize ${tab === t ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}>
            {t}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        {tab === "config" && <ConfigTab node={node} dispatch={dispatch} />}
        {tab === "payload" && <PayloadTab node={node} />}
        {tab === "history" && <HistoryTab node={node} />}
      </div>
    </aside>
  );
}

function ConfigTab({ node, dispatch }: { node: any; dispatch: any }) {
  const def = getNodeDef(node.type);
  if (!def?.fields?.length) return <p className="text-xs text-muted-foreground py-8 text-center">No configuration for this node type</p>;
  
  return (
    <div className="space-y-3">
      {def.fields.map(f => (
        <div key={f.key}>
          <label className="mb-1 block text-[10px] font-medium text-muted-foreground uppercase">{f.label}</label>
          {f.type === 'textarea' ? (
            <MemoryReferenceAutocomplete
              value={String(node.config?.[f.key] || f.defaultValue || '')}
              onChange={val => dispatch({ type: "update_node_config", id: node.id, config: { [f.key]: val } })}
              placeholder={f.placeholder}
              rows={4}
            />
          ) : f.type === 'select' && f.options ? (
            <select
              defaultValue={String(node.config?.[f.key] || f.defaultValue || f.options[0]?.value || '')}
              className="w-full rounded border border-border bg-surface-container px-2 py-1.5 text-xs"
              onChange={e => dispatch({ type: "update_node_config", id: node.id, config: { [f.key]: e.target.value } })}
            >
              {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          ) : (
            <input
              type={f.type === 'number' ? 'number' : f.type === 'password' ? 'password' : 'text'}
              defaultValue={String(node.config?.[f.key] || f.defaultValue || '')}
              placeholder={f.placeholder}
              className="w-full rounded border border-border bg-surface-container px-2 py-1.5 text-xs"
              onChange={e => dispatch({ type: "update_node_config", id: node.id, config: { [f.key]: e.target.value } })}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function PayloadTab({ node }: { node: any }) {
  const output = node.config?.output;
  if (!output) return <p className="text-xs text-muted-foreground py-8 text-center">No output yet. Run the workflow to see payload data.</p>;
  return (
    <pre className="whitespace-pre-wrap break-all rounded bg-surface-container p-2 text-[10px] font-mono text-foreground">
      {typeof output === 'string' ? output : JSON.stringify(output, null, 2)}
    </pre>
  );
}

function HistoryTab({ node }: { node: any }) {
  const { dispatch } = useWorkflow();
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await api.listExecutionHistory();
        const filtered = (res || []).filter((e: any) => 
          e.node_results && JSON.stringify(e.node_results).includes(node.id)
        );
        setEntries(filtered.slice(0, 20));
      } catch { setEntries([]); }
      finally { setLoading(false); }
    }
    load();
  }, [node.id]);

  if (loading) return <Loader2 className="mx-auto mt-4 h-4 w-4 animate-spin" />;
  if (!entries.length) return <p className="text-xs text-muted-foreground py-8 text-center">No execution history for this node</p>;
  
  return (
    <div className="space-y-1.5">
      {entries.map((e: any) => (
        <div key={e.id} className="rounded border border-border bg-surface-container px-2 py-1.5 text-xs cursor-pointer hover:bg-surface-container-hover"
          onClick={() => {
            api.fetchRunChain(e.id).then(chain => {
              dispatch({ type: "show_run_chain", runId: chain.runId, executedNodes: chain.nodes.filter((n: any) => n.executed).map((n: any) => n.nodeId), traversedEdges: chain.edges.map((e: any) => e.id) });
            });
          }}>
          <div className="flex justify-between">
            <span className={`font-medium ${e.status === 'completed' ? 'text-success' : 'text-danger'}`}>{e.status}</span>
            <span className="text-[10px] text-muted-foreground">{new Date(e.started_at).toLocaleTimeString()}</span>
          </div>
          <div className="text-muted-foreground">{e.workflow_name}</div>
        </div>
      ))}
    </div>
  );
}
