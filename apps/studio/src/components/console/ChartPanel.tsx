import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export function ChartPanel({ dataSource, config }: { dataSource: any; config: any }) {
  const [data, setData] = useState<any[]>([]);
  useEffect(() => {
    api.listExecutionHistory().then(d => {
      const counts: Record<string, number> = {};
      (d || []).forEach((e: any) => {
        const h = new Date(e.started_at).getHours();
        counts[h] = (counts[h] || 0) + 1;
      });
      setData(Object.entries(counts).map(([h, c]) => ({ hour: h, count: c })));
    });
  }, []);
  const max = Math.max(1, ...data.map(d => d.count));
  return (
    <div className="flex items-end gap-1 h-20">
      {data.map(d => (
        <div key={d.hour} className="flex-1 flex flex-col items-center gap-0.5">
          <div className="w-full rounded-t bg-primary/60" style={{ height: `${(d.count / max) * 100}%` }} />
          <span className="text-[8px] text-muted-foreground">{d.hour}h</span>
        </div>
      ))}
      {data.length === 0 && <span className="text-xs text-muted-foreground">No data</span>}
    </div>
  );
}
