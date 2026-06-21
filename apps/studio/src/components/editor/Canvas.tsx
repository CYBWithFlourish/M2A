import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Plus } from "lucide-react";
import { getNodeDef } from "@/lib/nodes";
import { useWorkflow, type CanvasNode } from "@/lib/workflow-context";
import { ErrorBoundary } from "@/lib/error-boundary";
import { ShortcutsOverlay } from "./ShortcutsOverlay";
import { Toolbar } from "./Toolbar";
import { StickyNote } from "./StickyNote";
import { NodeCard } from "./NodeCard";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";

const NODE_W = 220;
const NODE_H = 84;

export function EditorCanvas({ onOpenPalette }: { onOpenPalette: () => void }) {
  const { nodes, connections, selectedId, stickyNotes, runChain, dispatch, addNodeOfType } = useWorkflow();
  const containerRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState({ x: 0, y: 0, k: 1 });
  const [panning, setPanning] = useState(false);
  const [mode, setMode] = useState<"select" | "pan">("select");
  const [showShortcuts, setShowShortcuts] = useState(false);
  const panStart = useRef<{ x: number; y: number; vx: number; vy: number } | null>(null);
  const [pendingFrom, setPendingFrom] = useState<string | null>(null);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const clipboard = useRef<CanvasNode | null>(null);

  const screenToCanvas = useCallback(
    (sx: number, sy: number) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return { x: sx, y: sy };
      return { x: (sx - rect.left - view.x) / view.k, y: (sy - rect.top - view.y) / view.k };
    },
    [view],
  );

  const isDragging = useRef(false);

  const onCanvasPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (isDragging.current) return;
    if (mode !== "pan") return;
    setPanning(true);
    panStart.current = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y };
    (e.target as Element).setPointerCapture(e.pointerId);
    dispatch({ type: "select", id: null });
    setPendingFrom(null);
  };
  const onCanvasPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (panning && panStart.current) {
      setView((v) => ({ ...v, x: panStart.current!.vx + (e.clientX - panStart.current!.x), y: panStart.current!.vy + (e.clientY - panStart.current!.y) }));
    }
    if (pendingFrom) {
      const p = screenToCanvas(e.clientX, e.clientY);
      setCursor(p);
    }
    if (draggingNode) {
      const p = screenToCanvas(e.clientX, e.clientY);
      dispatch({ type: "move_node", id: draggingNode, x: p.x - dragOffset.current.x, y: p.y - dragOffset.current.y });
    }
  };
  const onCanvasPointerUp = () => {
    setPanning(false);
    panStart.current = null;
    setDraggingNode(null);
  };

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.001;
    setView((v) => {
      const k = Math.min(2, Math.max(0.4, v.k + delta));
      return { ...v, k };
    });
  };
  // suppress browser scroll on canvas
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const h = (e: WheelEvent) => e.preventDefault();
    el.addEventListener("wheel", h, { passive: false });
    return () => el.removeEventListener("wheel", h);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      const key = e.key.toLowerCase();
      if (meta && key === 'z' && !e.shiftKey) {
        e.preventDefault();
        dispatch({ type: "undo" });
      }
      if (meta && key === 'z' && e.shiftKey) {
        e.preventDefault();
        dispatch({ type: "redo" });
      }
      if (meta && key === 'y') {
        e.preventDefault();
        dispatch({ type: "redo" });
      }
      if (meta && key === 'c' && !e.shiftKey && selectedId) {
        e.preventDefault();
        const node = nodes.find(n => n.id === selectedId);
        if (node) clipboard.current = { ...node };
      }
      if (meta && key === 'v' && !e.shiftKey && clipboard.current) {
        e.preventDefault();
        const src = clipboard.current;
        addNodeOfType(src.type, src.x + 40, src.y + 40);
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault();
        dispatch({ type: "remove_node", id: selectedId });
      }
      if (e.key === '?' && !meta) {
        e.preventDefault();
        setShowShortcuts(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [dispatch, nodes, selectedId, addNodeOfType]);

  const startConnect = (id: string) => {
    setPendingFrom(id);
  };
  const finishConnect = (targetId: string) => {
    if (!pendingFrom) return;
    if (pendingFrom === targetId) { setPendingFrom(null); setCursor(null); return; }
    const sourceNode = nodes.find(n => n.id === pendingFrom);
    const targetNode = nodes.find(n => n.id === targetId);
    if (!sourceNode || !targetNode) { setPendingFrom(null); setCursor(null); return; }
    const sourceType = sourceNode.type;
    const targetType = targetNode.type;
    const invalid =
      sourceType === 'output' ||
      targetType === 'input' ||
      ['webhook_trigger','schedule_trigger','event_trigger','form_trigger','discord_trigger','input'].includes(targetType) ||
      sourceType === 'merge';
    if (!invalid) {
      dispatch({ type: "connect", from: pendingFrom, to: targetId });
    }
    setPendingFrom(null);
    setCursor(null);
  };

  const onDropNode = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData("application/node-type");
    if (!type) return;
    const p = screenToCanvas(e.clientX, e.clientY);
    addNodeOfType(type, p.x - NODE_W / 2, p.y - NODE_H / 2);
  };

  const startDragNode = (e: ReactPointerEvent, n: CanvasNode) => {
    e.stopPropagation();
    dispatch({ type: "select", id: n.id });
    const p = screenToCanvas(e.clientX, e.clientY);
    dragOffset.current = { x: p.x - n.x, y: p.y - n.y };
    setDraggingNode(n.id);
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  };

  const isEmpty = nodes.length === 0;

  const addStickyNote = useCallback(() => {
    const center = screenToCanvas(window.innerWidth / 2, window.innerHeight / 2);
    dispatch({ type: "add_sticky_note", note: { id: `note_${Date.now()}`, x: center.x, y: center.y, content: '' } });
  }, [screenToCanvas, dispatch]);

  return (
    <ErrorBoundary>
    <div
      ref={containerRef}
      onPointerDown={onCanvasPointerDown}
      onPointerMove={onCanvasPointerMove}
      onPointerUp={onCanvasPointerUp}
      onPointerLeave={onCanvasPointerUp}
      onWheel={onWheel}
      onDragOver={(e) => { e.preventDefault(); isDragging.current = true; }}
      onDrop={(e) => { isDragging.current = false; onDropNode(e); }}
      onDragLeave={() => { isDragging.current = false; }}
      className="canvas-grid relative flex-1 overflow-hidden bg-surface-dim"
      style={{ cursor: panning ? "grabbing" : mode === "pan" ? "grab" : "default" }}
    >
      {/* Toolbar */}
      <Toolbar
        onAddComponent={onOpenPalette}
        onAddNote={addStickyNote}
        view={view}
        onZoomIn={() => setView(v => ({ ...v, k: Math.min(2, v.k + 0.1) }))}
        onZoomOut={() => setView(v => ({ ...v, k: Math.max(0.4, v.k - 0.1) }))}
        onResetZoom={() => setView({ x: 0, y: 0, k: 1 })}
        mode={mode}
        onModeChange={setMode}
      />

      {/* minimap */}
      {!isEmpty && nodes.length > 0 && (() => {
        const bounds = nodes.reduce((acc, n) => ({
          minX: Math.min(acc.minX, n.x),
          minY: Math.min(acc.minY, n.y),
          maxX: Math.max(acc.maxX, n.x + NODE_W),
          maxY: Math.max(acc.maxY, n.y + NODE_H),
        }), { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity });

        const w = bounds.maxX - bounds.minX + 100;
        const h = bounds.maxY - bounds.minY + 100;
        const scale = Math.min(160 / w, 112 / h);

        return (
          <div className="absolute bottom-4 right-4 z-20 w-40 h-28 rounded-lg border border-border bg-surface-container/80 backdrop-blur overflow-hidden">
            <div className="relative" style={{ transform: `scale(${scale})`, transformOrigin: '0 0', width: w, height: h }}>
              {nodes.map(n => (
                <div
                  key={n.id}
                  className="absolute rounded-sm"
                  style={{
                    left: n.x - bounds.minX + 50,
                    top: n.y - bounds.minY + 50,
                    width: NODE_W,
                    height: NODE_H,
                    background: (getNodeDef(n.type)?.color || '#64748b') + '30',
                    border: `1px solid ${(getNodeDef(n.type)?.color || '#64748b')}50`,
                  }}
                />
              ))}
            </div>
    </div>
  );
      })()}

      {/* World transform */}
      <div
        className="absolute inset-0 origin-top-left"
        style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.k})` }}
      >
        {/* Wires */}
        <svg className="pointer-events-none absolute" style={{ overflow: "visible", width: 1, height: 1 }}>
          {connections.map((c) => {
            const from = nodes.find((n) => n.id === c.from);
            const to = nodes.find((n) => n.id === c.to);
            if (!from || !to) return null;
            const x1 = from.x + NODE_W;
            const y1 = from.y + NODE_H / 2;
            const x2 = to.x;
            const y2 = to.y + NODE_H / 2;
            const isEdgeInRun = !runChain || runChain.traversedEdges.includes(c.id);
            return <Wire key={c.id} x1={x1} y1={y1} x2={x2} y2={y2} animated={from.status === "running" || from.status === "success"} opacity={isEdgeInRun ? 1 : 0.2} />;
          })}
          {pendingFrom && cursor && (() => {
            const from = nodes.find((n) => n.id === pendingFrom);
            if (!from) return null;
            return <Wire x1={from.x + NODE_W} y1={from.y + NODE_H / 2} x2={cursor.x} y2={cursor.y} dashed />;
          })()}
        </svg>

        {/* Nodes */}
        {nodes.map((n) => (
          <NodeView
            key={n.id}
            node={n}
            selected={selectedId === n.id}
            pendingFrom={pendingFrom}
            onPointerDown={(e) => startDragNode(e, n)}
            onStartConnect={() => startConnect(n.id)}
            onFinishConnect={() => finishConnect(n.id)}
            onDelete={() => dispatch({ type: "remove_node", id: n.id })}
            onCopy={() => {
              const node = nodes.find(x => x.id === n.id);
              if (node) clipboard.current = { ...node };
            }}
            onPaste={() => {
              if (clipboard.current) addNodeOfType(clipboard.current.type, n.x + 40, n.y + 40);
            }}
          />
        ))}

        {/* Sticky Notes */}
        {stickyNotes.map((n) => (
          <StickyNote key={n.id} note={n} onUpdate={(c) => dispatch({ type: "update_sticky_note", id: n.id, content: c })}
            onDelete={() => dispatch({ type: "remove_sticky_note", id: n.id })} />
        ))}
      </div>

      {showShortcuts && <ShortcutsOverlay onClose={() => setShowShortcuts(false)} />}

      {isEmpty && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="pointer-events-auto text-center">
            <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-primary/15 text-primary">
              <Plus className="h-7 w-7" />
            </div>
            <h2 className="font-display text-lg font-semibold">Build Your Workflow</h2>
            <p className="mt-1 text-sm text-muted-foreground">Drag nodes from the sidebar, or press ⌘K to add nodes.</p>
            <button
              onClick={onOpenPalette}
              className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-1.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              <Plus className="h-4 w-4" /> Add First Node
            </button>
          </div>
        </div>
      )}
    </div>
  </ErrorBoundary>
  );
}

function NodeView({
  node,
  selected,
  pendingFrom,
  onPointerDown,
  onStartConnect,
  onFinishConnect,
  onDelete,
  onCopy,
  onPaste,
}: {
  node: CanvasNode;
  selected: boolean;
  pendingFrom: string | null;
  onPointerDown: (e: ReactPointerEvent) => void;
  onStartConnect: () => void;
  onFinishConnect: () => void;
  onDelete: () => void;
  onCopy: () => void;
  onPaste: () => void;
}) {
  const { runChain, dispatch } = useWorkflow();
  const isConnecting = pendingFrom && pendingFrom !== node.id;
  const isInRun = !runChain || runChain.executedNodes.includes(node.id);

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          style={{ left: node.x, top: node.y, width: NODE_W, opacity: isInRun ? 1 : 0.2 }}
          onPointerDown={onPointerDown}
          className="absolute select-none"
        >
          <NodeCard node={node} selected={selected} onDelete={onDelete} />
      <button
        onPointerDown={(e) => {
          e.stopPropagation();
          if (pendingFrom) onFinishConnect();
        }}
        className={`absolute -left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border-2 border-card transition ${
          isConnecting ? "bg-success" : "bg-muted-foreground"
        }`}
        title="Input"
      />
      <button
        onPointerDown={(e) => {
          e.stopPropagation();
          onStartConnect();
        }}
        className="absolute -right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border-2 border-card bg-primary transition hover:scale-110"
        title="Output"
      />
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="z-50 min-w-32">
        <ContextMenuItem onSelect={() => onCopy()}>
          Copy
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => onPaste()}>
          Paste
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onSelect={() => onDelete()} className="text-destructive">
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

function Wire({ x1, y1, x2, y2, animated, dashed, opacity }: { x1: number; y1: number; x2: number; y2: number; animated?: boolean; dashed?: boolean; opacity?: number }) {
  const dx = Math.max(40, Math.abs(x2 - x1) * 0.5);
  const d = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
  return (
    <path
      d={d}
      fill="none"
      stroke={dashed ? "var(--muted-foreground)" : animated ? "var(--success)" : "var(--primary)"}
      strokeWidth={2}
      strokeDasharray={dashed ? "6 4" : animated ? "8 4" : undefined}
      opacity={opacity ?? 1}
      style={animated ? { animation: "wire-flow 0.6s linear infinite" } : undefined}
    />
  );
}