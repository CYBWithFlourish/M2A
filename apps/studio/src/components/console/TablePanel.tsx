import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export function TablePanel({ dataSource }: { dataSource: any }) {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    api.listExecutionHistory().then(d => setRows((d || []).slice(0, 10)));
  }, []);
  return (
    <div className="text-[10px]">
      <div className="grid grid-cols-3 gap-2 font-semibold text-muted-foreground mb-1">
        <span>Workflow</span><span>Status</span><span>Time</span>
      </div>
      {rows.map(r => (
        <div key={r.id} className="grid grid-cols-3 gap-2 py-0.5">
          <span className="truncate">{r.workflow_name}</span>
          <span className={r.status === 'completed' ? 'text-success' : 'text-danger'}>{r.status}</span>
          <span>{new Date(r.started_at).toLocaleTimeString()}</span>
        </div>
      ))}
    </div>
  );
}
