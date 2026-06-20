import { Component, input, output, inject, AfterViewInit, OnDestroy, ElementRef, viewChild, HostListener, effect, Injector, runInInjectionContext } from '@angular/core';
import type { NodeDefinition, EdgeDefinition } from '../shared/types';
import { EditorService } from './editor.service';
import { WorkflowStore } from '../stores/workflow.store';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [],
  host: { '[class]': '"block h-full w-full"' },
  template: `
    <div #editorContainer class="h-full w-full rete">
      @if (!editorService.isReady()) {
        <div class="flex h-full items-center justify-center">
          <div class="text-center">
            <div class="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-walrus-400 border-t-transparent mx-auto"></div>
            <div class="text-sm text-harbor-text-muted">Loading Editor...</div>
          </div>
        </div>
      } @else if (nodes().length === 0) {
        <div class="flex h-full items-center justify-center">
          <div class="text-center max-w-sm">
            <div class="mb-4 mx-auto w-16 h-16 rounded-2xl bg-walrus-500/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="1.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
            </div>
            <h3 class="text-lg font-semibold text-harbor-text-heading mb-1">Build Your Workflow</h3>
            <p class="text-sm text-harbor-text-muted mb-6">Drag nodes from the sidebar, or press <kbd class="rounded border border-harbor-border bg-harbor-surface px-1.5 py-0.5 text-xs">Cmd+K</kbd> to add nodes.</p>
            <button
              (click)="addSampleNode()"
              class="rounded-lg bg-walrus-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-walrus-600"
            >
              + Add First Node
            </button>
          </div>
        </div>
      }
    </div>
  `,
})
export class EditorComponent implements AfterViewInit, OnDestroy {
  editorService = inject(EditorService);
  private store = inject(WorkflowStore);
  private injector = inject(Injector);

  editorContainer = viewChild.required<ElementRef<HTMLDivElement>>('editorContainer');

  nodes = input<NodeDefinition[]>([]);
  edges = input<EdgeDefinition[]>([]);
  selectedNodeId = input<string | null>(null);

  nodesChange = output<NodeDefinition[]>();
  edgesChange = output<EdgeDefinition[]>();
  selectNode = output<string>();
  deselectNode = output();

  private _docDragOver = (event: DragEvent) => {
    const container = this.editorContainer()?.nativeElement;
    if (!container || !container.contains(event.target as Node)) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
  };

  private _docDrop = (event: DragEvent) => {
    const container = this.editorContainer()?.nativeElement;
    if (!container || !container.contains(event.target as Node)) return;
    event.preventDefault();
    const type = event.dataTransfer?.getData('text/plain');
    if (!type) return;
    const rect = container.getBoundingClientRect();
    const pos = {
      x: event.clientX - rect.left - 120,
      y: event.clientY - rect.top - 30,
    };
    this.editorService.addNode(type, pos).then((nodeDef) => {
      if (nodeDef) this.syncNodesToStore();
    });
  };

  async ngAfterViewInit() {
    const container = this.editorContainer()?.nativeElement;
    if (container) {
      await this.editorService.createEditor(container);
      this.setupEditorListeners();
    }
    document.addEventListener('dragover', this._docDragOver);
    document.addEventListener('drop', this._docDrop);
  }

  private setupEditorListeners() {
    const editor = this.editorService.editor;
    if (!editor) return;

    editor.addPipe((context: any) => {
      if (!context || typeof context !== 'object' || !('type' in context)) return context;

      if (context.type === 'nodecreated' || context.type === 'noderemoved') {
        this.syncNodesToStore();
      }
      if (context.type === 'connectioncreated' || context.type === 'connectionremoved') {
        this.syncEdgesToStore();
      }
      if (context.type === 'connectioncreated') {
        if (!this.validateConnection(context.data.source, context.data.target)) {
          const area = this.editorService.area;
          setTimeout(() => {
            try {
              const connView = area?.nodeViews.get(context.data.id);
              if (connView) {
                const el = (connView as any).element as HTMLElement;
                el?.classList.add('connection-invalid');
              }
            } catch {}
          }, 0);
        }
      }
      return context;
    });

    const area = this.editorService.area;
    if (area) {
      area.addPipe((context: any) => {
        if (!context || typeof context !== 'object' || !('type' in context)) return context;

        if (context.type === 'nodepicked') {
          this.selectNode.emit(context.data.id);
        }
        if (context.type === 'pointerdown' && context.data.event.target === area.container) {
          this.deselectNode.emit();
        }
        return context;
      });
    }

    runInInjectionContext(this.injector, () => this.setupNodeStateEffect());
  }

  private setupNodeStateEffect() {
    effect(() => {
      const states = this.store.nodeStates();
      const area = this.editorService.area;
      if (!area) return;

      for (const [nodeId, state] of Object.entries(states)) {
        try {
          const nodeView = area.nodeViews.get(nodeId);
          if (!nodeView) continue;
          const el = (nodeView as any).element as HTMLElement;
          if (!el) continue;

          el.classList.remove('node-running', 'node-success', 'node-error');

          if (state === 'running') el.classList.add('node-running');
          else if (state === 'success') el.classList.add('node-success');
          else if (state === 'error') el.classList.add('node-error');
        } catch {}
      }

      for (const [nodeId, state] of Object.entries(states)) {
        if (state !== 'running') continue;
        const connections = this.editorService.editor?.getConnections();
        if (!connections) continue;
        for (const conn of connections) {
          if (conn.target === nodeId || conn.source === nodeId) {
            try {
              const connView = area.nodeViews.get(conn.id);
              if (connView) {
                const el = (connView as any).element as HTMLElement;
                el?.classList.add('edge-running');
              }
            } catch {}
          }
        }
      }
    });
  }

  private syncNodesToStore() {
    const editor = this.editorService.editor;
    if (!editor) return;
    this.store.takeSnapshot();
    const reteNodes = editor.getNodes();
    const nodeDefs: NodeDefinition[] = reteNodes.map((rn: any) => ({
      id: rn.id,
      type: rn.nodeType || 'unknown',
      position: this.getNodePosition(rn.id),
      data: {
        label: rn.label || '',
        type: rn.nodeType || 'unknown',
        status: 'idle' as const,
      },
    }));
    this.nodesChange.emit(nodeDefs);
  }

  private syncEdgesToStore() {
    const editor = this.editorService.editor;
    if (!editor) return;
    this.store.takeSnapshot();
    const reteConns = editor.getConnections();
    const edgeDefs: EdgeDefinition[] = reteConns.map((rc: any) => ({
      id: rc.id,
      source: rc.source,
      target: rc.target,
      sourceHandle: rc.sourceOutput,
      targetHandle: rc.targetInput,
    }));
    this.edgesChange.emit(edgeDefs);
  }

  private getNodePosition(nodeId: string): { x: number; y: number } {
    const area = this.editorService.area;
    if (!area) return { x: 0, y: 0 };
    const nodeView = area.nodeViews.get(nodeId);
    return nodeView ? { ...nodeView.position } : { x: 0, y: 0 };
  }

  async addSampleNode() {
    const nodeDef = await this.editorService.addNode('input');
    if (nodeDef) {
      this.syncNodesToStore();
    }
  }

  @HostListener('document:keydown.control.z', ['$event'])
  @HostListener('document:keydown.meta.z', ['$event'])
  onUndo(event: Event) {
    event.preventDefault();
    this.store.undo();
  }

  @HostListener('document:keydown.control.shift.z', ['$event'])
  @HostListener('document:keydown.meta.shift.z', ['$event'])
  @HostListener('document:keydown.control.y', ['$event'])
  @HostListener('document:keydown.meta.y', ['$event'])
  onRedo(event: Event) {
    event.preventDefault();
    this.store.redo();
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
  }

  async onDrop(event: DragEvent) {
    event.preventDefault();
    const type = event.dataTransfer?.getData('text/plain');
    if (!type) return;

    const container = this.editorContainer()?.nativeElement;
    const rect = container?.getBoundingClientRect();
    const pos = rect
      ? {
          x: event.clientX - rect.left - 120,
          y: event.clientY - rect.top - 30,
        }
      : { x: 200, y: 200 };

    const nodeDef = await this.editorService.addNode(type, pos);
    if (nodeDef) {
      this.syncNodesToStore();
    }
  }

  private validateConnection(sourceId: string, targetId: string): boolean {
    const nodes = this.editorService.editor?.getNodes() || [];
    const sourceNode = nodes.find((n: any) => n.id === sourceId);
    const targetNode = nodes.find((n: any) => n.id === targetId);

    if (!sourceNode || !targetNode) return true;

    const sourceType = (sourceNode as any).nodeType || 'unknown';
    const targetType = (targetNode as any).nodeType || 'unknown';

    if (sourceType === 'output') return false;
    if (targetType === 'input') return false;
    if (targetType === 'webhook_trigger' || targetType === 'schedule_trigger') return false;
    if (sourceType === 'merge') return false;

    return true;
  }

  ngOnDestroy() {
    document.removeEventListener('dragover', this._docDragOver);
    document.removeEventListener('drop', this._docDrop);
    this.editorService.destroy();
  }
}
