import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export function NumberPanel({ title, dataSource }: { title: string; dataSource: any }) {
  const [value, setValue] = useState<number | null>(null);
  useEffect(() => {
    if (dataSource.type === "executions") {
      api.listExecutionHistory().then(d => setValue(Array.isArray(d) ? d.length : 0));
    } else if (dataSource.type === "runs") {
      api.listExecutionHistory().then(d => setValue(Array.isArray(d) ? d.filter((e: any) => e.status === "completed").length : 0));
    } else {
      api.getDatasetStats().then(d => setValue(d.totalInteractions || 0));
    }
  }, [dataSource.type]);
  return <div className="text-3xl font-bold text-foreground">{value ?? "—"}</div>;
}
