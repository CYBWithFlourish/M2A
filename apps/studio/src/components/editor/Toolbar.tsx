import { MousePointer, Hand, Play, Loader2, Square } from "lucide-react";
import { useWorkflow } from "@/lib/workflow-context";

interface ToolbarProps {
  onAddComponent: () => void;
  onAddNote: () => void;
  view: { x: number; y: number; k: number };
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  mode: "select" | "pan";
  onModeChange: (mode: "select" | "pan") => void;
}

export function Toolbar({ onAddComponent, onAddNote, view, onZoomIn, onZoomOut, onResetZoom, mode, onModeChange }: ToolbarProps) {
  const { running, runWorkflow, stopWorkflow } = useWorkflow();

  return (
    <div className="pointer-events-auto absolute right-4 top-4 z-20 flex items-center gap-1 rounded-lg border border-border bg-surface-container/90 px-1.5 py-1 backdrop-blur">
      <button onClick={onAddComponent} className="grid h-7 place-items-center rounded px-1.5 text-[10px] text-muted-foreground hover:bg-surface-container-hover hover:text-foreground transition" title="Add components (Cmd+K)">
        <span className="text-[10px] font-medium">+ Components</span>
      </button>
      <div className="mx-0.5 h-4 w-px bg-border" />
      <button onClick={() => onModeChange(mode === "select" ? "pan" : "select")}
        className={`grid h-7 place-items-center rounded px-1.5 text-[10px] text-muted-foreground hover:bg-surface-container-hover hover:text-foreground transition ${mode === "pan" ? "bg-primary/10 text-primary" : ""}`}
        title={mode === "select" ? "Switch to pan mode" : "Switch to select mode"}>
        {mode === "select" ? <MousePointer className="h-3.5 w-3.5" /> : <Hand className="h-3.5 w-3.5" />}
      </button>
      <button onClick={onZoomOut} className="grid h-7 place-items-center rounded px-1.5 text-[10px] text-muted-foreground hover:bg-surface-container-hover hover:text-foreground transition" title="Zoom out">-</button>
      <button onClick={onResetZoom} className="grid h-7 place-items-center rounded px-1.5 font-mono text-[10px] w-10 text-muted-foreground hover:bg-surface-container-hover hover:text-foreground transition">{(view.k * 100).toFixed(0)}%</button>
      <button onClick={onZoomIn} className="grid h-7 place-items-center rounded px-1.5 text-[10px] text-muted-foreground hover:bg-surface-container-hover hover:text-foreground transition" title="Zoom in">+</button>
      <div className="mx-0.5 h-4 w-px bg-border" />
      <button onClick={onAddNote} className="grid h-7 place-items-center rounded px-1.5 text-[10px] text-muted-foreground hover:bg-surface-container-hover hover:text-foreground transition" title="Add sticky note">
        + Note
      </button>
      <div className="mx-0.5 h-4 w-px bg-border" />
      {running ? (
        <button onClick={stopWorkflow} className="grid h-7 place-items-center rounded px-1.5 text-[10px] text-muted-foreground hover:bg-surface-container-hover hover:text-foreground transition bg-danger/10 text-danger hover:bg-danger/20" title="Stop execution">
          <Square className="h-3.5 w-3.5" />
        </button>
      ) : (
        <button onClick={runWorkflow} className="grid h-7 place-items-center rounded px-1.5 text-[10px] bg-primary/10 text-primary hover:bg-primary/20 transition" title="Execute workflow">
          <Play className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
