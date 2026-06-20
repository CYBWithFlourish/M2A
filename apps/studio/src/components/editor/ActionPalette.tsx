import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { NODE_CATALOG } from "@/lib/nodes";
import { useWorkflow } from "@/lib/workflow-context";

export function ActionPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addNodeOfType } = useWorkflow();
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);

  const results = useMemo(
    () =>
      NODE_CATALOG.filter(
        (n) => n.label.toLowerCase().includes(q.toLowerCase()) || n.type.includes(q.toLowerCase()),
      ).slice(0, 60),
    [q],
  );

  useEffect(() => {
    setIdx(0);
  }, [q, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowDown") {
        setIdx((i) => Math.min(results.length - 1, i + 1));
      } else if (e.key === "ArrowUp") {
        setIdx((i) => Math.max(0, i - 1));
      } else if (e.key === "Enter") {
        const sel = results[idx];
        if (sel) {
          addNodeOfType(sel.type, 320 + Math.random() * 200, 200 + Math.random() * 200);
          onClose();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, idx, results, addNodeOfType, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-start bg-black/60 pt-24 backdrop-blur-sm" onClick={onClose}>
      <div
        className="mx-auto w-full max-w-xl rounded-xl border border-border bg-popover shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search nodes & actions…"
            className="flex-1 bg-transparent text-sm outline-none"
          />
          <kbd className="rounded bg-surface-high px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">esc</kbd>
        </div>
        <div className="scrollbar-thin max-h-80 overflow-y-auto p-1">
          {results.length === 0 && (
            <div className="py-8 text-center text-xs text-muted-foreground">No matching nodes.</div>
          )}
          {results.map((n, i) => {
            const Icon = n.icon;
            return (
              <button
                key={n.type}
                onMouseEnter={() => setIdx(i)}
                onClick={() => {
                  addNodeOfType(n.type, 320 + Math.random() * 200, 200 + Math.random() * 200);
                  onClose();
                }}
                className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm ${
                  idx === i ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                }`}
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded" style={{ background: `${n.color}1f`, color: n.color }}>
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="flex-1 truncate">{n.label}</span>
                <span className="rounded-full bg-surface-high px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                  {n.category}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}