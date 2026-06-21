import { useState } from "react";
import { Copy, ExternalLink, Search } from "lucide-react";

interface MemoryEntry {
  id: string;
  namespace: string;
  content: string;
  agent: string;
  timestamp: string;
  walrusCid?: string;
  suiTx?: string;
}

interface MemoryTableProps {
  entries: MemoryEntry[];
  onSearch?: (query: string) => void;
  loading?: boolean;
  compact?: boolean;
}

export function MemoryTable({ entries, onSearch, loading, compact }: MemoryTableProps) {
  const [sortKey, setSortKey] = useState<keyof MemoryEntry>("timestamp");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [q, setQ] = useState("");

  const sorted = [...entries].sort((a, b) => {
    const va = a[sortKey] || "";
    const vb = b[sortKey] || "";
    return sortDir === "asc" ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
  });

  const filtered = q ? sorted.filter(e =>
    e.content.toLowerCase().includes(q.toLowerCase()) ||
    e.namespace.toLowerCase().includes(q.toLowerCase()) ||
    e.agent.toLowerCase().includes(q.toLowerCase())
  ) : sorted;

  const headers: { key: keyof MemoryEntry; label: string; hideCompact?: boolean }[] = [
    { key: "namespace", label: "Namespace" },
    { key: "content", label: "Content" },
    { key: "agent", label: "Agent" },
    { key: "timestamp", label: "Time" },
    { key: "walrusCid", label: "Walrus", hideCompact: true },
    { key: "suiTx", label: "Sui Tx", hideCompact: true },
  ];

  const visibleHeaders = compact ? headers.filter(h => !h.hideCompact) : headers;

  const toggleSort = (key: keyof MemoryEntry) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  return (
    <div>
      {!compact && (
        <div className="relative mb-3">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={e => { setQ(e.target.value); onSearch?.(e.target.value); }}
            placeholder="Search memories..."
            className="h-8 w-full rounded-md border border-border bg-surface-container pl-8 pr-2 text-xs outline-none"
          />
        </div>
      )}
      {loading ? (
        <div className="py-8 text-center text-xs text-muted-foreground">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="py-8 text-center text-xs text-muted-foreground">No memory entries found</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                {visibleHeaders.map(h => (
                  <th key={h.key} onClick={() => toggleSort(h.key)} className="cursor-pointer px-2 py-1.5 font-medium uppercase tracking-wider hover:text-foreground">
                    {h.label} {sortKey === h.key && (sortDir === "asc" ? "\u2191" : "\u2193")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 50).map(e => (
                <tr key={e.id} className="border-b border-border/50 hover:bg-surface-container-hover">
                  {visibleHeaders.map(h => (
                    <td key={h.key} className="px-2 py-1.5">
                      {h.key === "content" ? (
                        <span className="line-clamp-1">{e.content.slice(0, 80)}</span>
                      ) : h.key === "walrusCid" ? (
                        e.walrusCid ? (
                          <button onClick={() => navigator.clipboard.writeText(e.walrusCid!)} className="text-primary hover:underline flex items-center gap-1">
                            <Copy className="h-2.5 w-2.5" /> {e.walrusCid.slice(0, 10)}...
                          </button>
                        ) : "\u2014"
                      ) : h.key === "suiTx" ? (
                        e.suiTx ? (
                          <a href={`https://suiscan.xyz/testnet/tx/${e.suiTx}`} target="_blank" className="text-primary hover:underline flex items-center gap-1" rel="noreferrer">
                            <ExternalLink className="h-2.5 w-2.5" /> {e.suiTx.slice(0, 8)}...
                          </a>
                        ) : "\u2014"
                      ) : h.key === "timestamp" ? (
                        new Date(e.timestamp).toLocaleTimeString()
                      ) : (
                        <span className="truncate">{String(e[h.key] || "")}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
