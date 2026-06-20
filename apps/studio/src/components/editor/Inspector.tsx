import { useEffect, useRef, useState } from "react";
import { ChevronDown, Settings2, X } from "lucide-react";
import { getNodeDef } from "@/lib/nodes";
import { useWorkflow } from "@/lib/workflow-context";

type Tab = "persona" | "memory" | "tools";

export function Inspector() {
  const { selectedId, nodes, dispatch } = useWorkflow();
  const [tab, setTab] = useState<Tab>("persona");
  const node = nodes.find((n) => n.id === selectedId);
  const formRef = useRef<HTMLFormElement>(null);
  const [dirty, setDirty] = useState(false);
  const dirtyRef = useRef(false);

  useEffect(() => {
    dirtyRef.current = false;
    setDirty(false);
  }, [selectedId]);

  const applyChanges = () => {
    if (!node || !formRef.current) return;
    const fd = new FormData(formRef.current);
    const config: Record<string, unknown> = {};
    fd.forEach((value, key) => {
      if (value === "") return;
      if (key === "temperature" || key === "maxTokens") {
        config[key] = Number(value);
      } else {
        config[key] = value;
      }
    });
    if (Object.keys(config).length > 0) {
      dispatch({ type: "update_node_config", id: node.id, config });
    }
    dirtyRef.current = false;
    setDirty(false);
  };

  const markDirty = () => {
    if (!dirtyRef.current) {
      dirtyRef.current = true;
      setDirty(true);
    }
  };

  if (!node) {
    return (
      <aside className="hidden w-80 shrink-0 flex-col border-l border-border bg-surface lg:flex">
        <Header subtitle="No selection" />
        <div className="grid flex-1 place-items-center px-6 text-center text-xs text-muted-foreground">
          Select a node on the canvas to view its inspector.
        </div>
      </aside>
    );
  }

  const def = getNodeDef(node.type);
  const isAgent = node.type === "agent" || node.type === "agent_spawn";

  return (
    <aside className="hidden w-80 shrink-0 flex-col border-l border-border bg-surface lg:flex">
      <Header subtitle={def?.label ?? node.type} />

      <div className="flex border-b border-border text-xs">
        {(["persona", "memory", "tools"] as Tab[]).map((t) => (
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

      <form ref={formRef} className="scrollbar-thin flex-1 overflow-y-auto px-4 py-4" onChange={markDirty}>
        <div className="mb-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{node.id}</div>

        {tab === "persona" && (isAgent ? <PersonaForm config={node.config} /> : <DefaultConfig type={node.type} config={node.config} />)}
        {tab === "memory" && <MemoryForm config={node.config} />}
        {tab === "tools" && (isAgent ? <ToolsForm config={node.config} /> : <Empty>No tools available for this node type.</Empty>)}
      </form>

      <div className="border-t border-border bg-surface-container/50 px-4 py-3">
        <button
          onClick={applyChanges}
          disabled={!dirty}
          className="w-full rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Apply Changes
        </button>
      </div>
    </aside>
  );
}

function Header({ subtitle }: { subtitle: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-border px-4 py-3">
      <Settings2 className="h-4 w-4 text-primary" />
      <span className="text-sm font-semibold">Inspector</span>
      <span className="ml-auto rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
        {subtitle}
      </span>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mb-3 block">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function PersonaForm({ config }: { config?: Record<string, unknown> }) {
  return (
    <>
      <Field label="Role / Directives">
        <textarea
          name="directives"
          rows={4}
          defaultValue={(config?.directives as string) || ""}
          placeholder="e.g. You are a Sui DeFi analyst that summarizes pool conditions."
          className="w-full resize-none rounded-md border border-border bg-surface-container px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </Field>
      <Field label="Model">
        <Select
          name="model"
          options={["llama-3.3-70b", "gemini-2.5-flash", "gemini-2.5-pro", "claude-sonnet-4"]}
          defaultValue={(config?.model as string) || "llama-3.3-70b"}
        />
      </Field>
      <Field label={`Temperature — ${config?.temperature ?? "0.7"}`}>
        <input
          name="temperature"
          type="range"
          min={0}
          max={2}
          step={0.1}
          defaultValue={String(config?.temperature ?? 0.7)}
          className="w-full accent-primary"
        />
      </Field>
      <Field label="Max Tokens">
        <input
          name="maxTokens"
          type="number"
          placeholder="2048"
          defaultValue={(config?.maxTokens as string) || ""}
          className="w-full rounded-md border border-border bg-surface-container px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </Field>
    </>
  );
}

function DefaultConfig({ type, config }: { type: string; config?: Record<string, unknown> }) {
  const labelMap: Record<string, string[]> = {
    aftermath: ["coinIn", "coinOut", "slippage"],
    navi: ["asset", "action", "amount"],
    pyth: ["priceFeedId"],
    conditional: ["condition"],
    schedule_trigger: ["cronExpression"],
  };
  const fields = labelMap[type] ?? ["configuration"];
  return (
    <>
      {fields.map((f) => (
        <Field key={f} label={f}>
          <input
            name={f}
            placeholder={`Set ${f.toLowerCase()}`}
            defaultValue={(config?.[f] as string) || ""}
            className="w-full rounded-md border border-border bg-surface-container px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </Field>
      ))}
    </>
  );
}

function MemoryForm({ config }: { config?: Record<string, unknown> }) {
  const readChannels = (config?.readChannels as string[]) || [];
  const writeChannels = (config?.writeChannels as string[]) || [];
  return (
    <>
      <Field label="Read Channels">
        <Tags name="readChannels" initial={readChannels} />
      </Field>
      <Field label="Write Destinations">
        <Tags name="writeChannels" initial={writeChannels} />
      </Field>
    </>
  );
}

function Tags({ name, initial }: { name: string; initial: string[] }) {
  const [tags, setTags] = useState<string[]>(initial);
  const [v, setV] = useState("");
  return (
    <div className="flex flex-wrap gap-1.5 rounded-md border border-border bg-surface-container px-2 py-1.5">
      {tags.map((t) => (
        <span key={t} className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary">
          {t}
          <button type="button" onClick={() => setTags(tags.filter((x) => x !== t))} className="text-primary/70 hover:text-primary">
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        name={name}
        type="hidden"
        value={tags.join(",")}
        readOnly
      />
      <input
        value={v}
        onChange={(e) => setV(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && v.trim()) {
            setTags([...tags, v.trim()]);
            setV("");
          }
        }}
        placeholder="add…"
        className="min-w-[80px] flex-1 bg-transparent text-xs outline-none"
      />
    </div>
  );
}

function ToolsForm({ config }: { config?: Record<string, unknown> }) {
  const tools = [
    { id: "walrus_store", label: "Store to Walrus", desc: "Persist artifacts to decentralized storage" },
    { id: "walrus_fetch", label: "Fetch from Walrus", desc: "Read prior artifacts by blob ID" },
    { id: "sui_rpc", label: "Sui RPC Query", desc: "Query Sui objects, events, and balances" },
  ];
  const enabled = (config?.tools as string[]) || [];
  return (
    <div className="space-y-2.5">
      {tools.map((t) => (
        <label key={t.id} className="flex cursor-pointer gap-2.5 rounded-md border border-border bg-surface-container px-3 py-2.5">
          <input type="checkbox" name={`tool_${t.id}`} defaultChecked={enabled.includes(t.id)} className="mt-0.5 accent-primary" />
          <span className="text-xs">
            <span className="block font-semibold">{t.label}</span>
            <span className="block text-muted-foreground">{t.desc}</span>
          </span>
        </label>
      ))}
    </div>
  );
}

function Select({ name, options, defaultValue }: { name: string; options: string[]; defaultValue?: string }) {
  return (
    <div className="relative">
      <select
        name={name}
        defaultValue={defaultValue}
        className="h-9 w-full appearance-none rounded-md border border-border bg-surface-container px-3 pr-8 text-sm outline-none focus:ring-2 focus:ring-ring"
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="py-6 text-center text-xs text-muted-foreground">{children}</div>;
}
