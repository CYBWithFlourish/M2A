import { X } from "lucide-react";
import { useWorkflow } from "@/lib/workflow-context";

export function RunChainOverlay() {
  const { runChain, dispatch } = useWorkflow();
  if (!runChain) return null;

  return (
    <div className="absolute top-12 left-4 right-4 z-20 flex items-center gap-2 rounded-lg border border-primary/20 bg-surface-container/95 px-3 py-2 text-xs backdrop-blur">
      <span className="font-semibold text-primary">Run Chain</span>
      <span className="text-muted-foreground">→</span>
      <span className="text-foreground">{runChain.executedNodes.length} nodes executed</span>
      <div className="flex-1" />
      <button onClick={() => dispatch({ type: "clear_run_chain" })}
        className="text-muted-foreground hover:text-foreground">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
