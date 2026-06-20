import { Component, inject, input, output, signal } from '@angular/core';
import { NgClass, DatePipe } from '@angular/common';
import type { LogEntry, WorkflowExecutionResult } from '../shared/types';
import { ApiService } from '../shared/api.service';

@Component({
  selector: 'app-bottom-panel',
  standalone: true,
  imports: [NgClass, DatePipe],
  template: `
    <div
      class="flex flex-col border-t border-harbor-border bg-harbor-surface transition-all"
      [class.h-48]="expanded()"
      [class.h-8]="!expanded()"
    >
      <button
        (click)="toggleExpanded()"
        class="flex h-8 items-center gap-2 border-b border-harbor-border px-4 text-xs font-medium text-harbor-text-muted transition-colors hover:text-harbor-text-heading"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          class="transition-transform"
          [class.rotate-180]="expanded()"
        >
          <polyline points="18 15 12 9 6 15"/>
        </svg>
        {{ expanded() ? 'Hide' : 'Show' }} Panel
      </button>

      @if (expanded()) {
        <div class="flex border-b border-harbor-border">
          @for (tab of tabs; track tab.key) {
            <button
              (click)="activeTab.set(tab.key)"
              class="px-4 py-1.5 text-xs font-medium transition-colors"
              [class.text-harbor-text-heading]="activeTab() === tab.key"
              [class.border-b-2]="activeTab() === tab.key"
              [class.border-walrus-400]="activeTab() === tab.key"
              [class.text-harbor-text-muted]="activeTab() !== tab.key"
            >
              {{ tab.label }}
            </button>
          }
        </div>

        <div class="flex-1 overflow-y-auto p-3">
          @if (activeTab() === 'logs') {
            <div class="space-y-1">
              @for (log of executionLogs(); track log.timestamp) {
                <div
                  class="flex items-start gap-3 rounded-lg border-l-2 px-3 py-2 text-xs"
                  [class.border-blue-500]="log.type === 'info'"
                  [class.border-red-500]="log.type === 'error'"
                  [class.border-amber-500]="log.type === 'llm'"
                  [class.border-indigo-500]="log.type === 'recall'"
                  [class.border-green-500]="log.type === 'remember'"
                >
                  <div class="flex-1">
                    <div class="text-harbor-text-body">{{ log.message }}</div>
                    <div class="mt-0.5 text-harbor-text-muted">{{ log.nodeLabel }} &middot; {{ log.timestamp | date:'HH:mm:ss' }}</div>
                  </div>
                </div>
              } @empty {
                <div class="py-8 text-center text-sm text-harbor-text-muted">No logs yet. Run a workflow to see execution logs.</div>
              }
            </div>
          }

          @if (activeTab() === 'results') {
            <div class="space-y-2">
              @for (result of executionResults(); track result.timestamp) {
                <div class="rounded-lg border border-harbor-border bg-harbor-card-bg p-3">
                  <div class="flex items-center gap-2">
                    <span
                      class="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase"
                      [ngClass]="{
                        'bg-green-500/20 text-green-400': result.status === 'success',
                        'bg-red-500/20 text-red-400': result.status === 'error'
                      }"
                    >
                      {{ result.status }}
                    </span>
                    <span class="text-xs font-medium text-harbor-text-heading">{{ result.nodeLabel }}</span>
                  </div>
                  <div class="mt-1 text-xs text-harbor-text-secondary">{{ result.output }}</div>
                </div>
              } @empty {
                <div class="py-8 text-center text-sm text-harbor-text-muted">No results yet.</div>
              }
            </div>
          }

          @if (activeTab() === 'memory') {
            <div class="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Pool name to search..."
                class="flex-1 rounded border border-harbor-border bg-harbor-card-bg px-3 py-1.5 text-xs text-harbor-text-body placeholder:text-harbor-text-muted outline-none focus:border-walrus-400"
                [value]="memoryQuery()"
                (input)="memoryQuery.set($any($event.target).value)"
                (keydown.enter)="searchMemory()"
              />
              <button
                (click)="searchMemory()"
                class="rounded bg-walrus-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-walrus-600"
              >
                Search Memory
              </button>
            </div>
            @if (isSearching()) {
              <div class="text-xs text-harbor-text-muted">Searching...</div>
            } @else if (memoryResultContext()) {
              <div class="rounded-lg border border-harbor-border bg-harbor-card-bg p-3 text-xs text-harbor-text-body whitespace-pre-wrap">{{ memoryResultContext() }}</div>
            } @else if (memoryQuery()) {
              <div class="py-4 text-center text-xs text-harbor-text-muted">No results found.</div>
            } @else {
              <div class="py-8 text-center text-sm text-harbor-text-muted">
                Enter a pool name above to explore shared agent memory.
              </div>
            }
          }

          @if (activeTab() === 'datasets') {
            <div class="space-y-2">
              @if (datasets().length === 0 && !isLoadingDatasets()) {
                <button (click)="loadDatasets()" class="w-full rounded-lg bg-harbor-control-bg px-3 py-2 text-xs text-harbor-text-body hover:bg-harbor-control-hover">
                  Load Datasets
                </button>
              }
              @if (isLoadingDatasets()) {
                <div class="text-xs text-harbor-text-muted">Loading...</div>
              }
              @for (ds of datasets(); track ds.id) {
                <div class="rounded-lg border border-harbor-border bg-harbor-card-bg p-3">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-medium text-harbor-text-heading">{{ ds.category }}</span>
                    <span class="text-[10px] text-harbor-text-muted">{{ ds.claimCount }} claims</span>
                  </div>
                  <div class="mt-1 text-xs text-harbor-text-secondary">{{ ds.sourceDomain }} &middot; {{ ds.sampleSize }} samples</div>
                  <div class="mt-1 flex items-center gap-2">
                    <span
                      class="text-[10px]"
                      [class.text-green-400]="ds.privacyScore >= 95"
                      [class.text-amber-400]="ds.privacyScore < 95"
                    >
                      Privacy: {{ ds.privacyScore }}/100
                    </span>
                  </div>
                </div>
              }
            </div>
          }

          @if (activeTab() === 'activity') {
            <div class="space-y-2">
              @if (activityEntries().length === 0) {
                <button (click)="loadActivity()" class="w-full rounded-lg bg-harbor-control-bg px-3 py-2 text-xs text-harbor-text-body hover:bg-harbor-control-hover">Load Activity</button>
              }
              @for (entry of activityEntries(); track entry.id) {
                <div class="rounded-lg border border-harbor-border bg-harbor-card-bg px-3 py-2 text-xs">
                  <div class="flex items-center justify-between">
                    <span class="text-harbor-text-heading">{{ entry.action }}</span>
                    <span class="text-harbor-text-muted">{{ entry.created_at | date:'short' }}</span>
                  </div>
                  <div class="text-harbor-text-secondary">{{ entry.protocol }} &middot; {{ entry.amount_spent }} mist</div>
                </div>
              }
            </div>
          }

          @if (activeTab() === 'history') {
            <div class="space-y-2">
              @if (executionHistory().length === 0 && !isLoadingHistory()) {
                <button (click)="loadHistory()" class="w-full rounded-lg bg-harbor-control-bg px-3 py-2 text-xs text-harbor-text-body hover:bg-harbor-control-hover">Load History</button>
              }
              @if (isLoadingHistory()) {
                <div class="text-xs text-harbor-text-muted">Loading...</div>
              }
              @for (entry of executionHistory(); track entry.id) {
                <div class="rounded-lg border border-harbor-border bg-harbor-card-bg p-3">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span
                        class="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase"
                        [ngClass]="{
                          'bg-green-500/20 text-green-400': entry.status === 'completed',
                          'bg-red-500/20 text-red-400': entry.status === 'failed',
                          'bg-amber-500/20 text-amber-400': entry.status !== 'completed' && entry.status !== 'failed'
                        }"
                      >
                        {{ entry.status }}
                      </span>
                      <span class="text-xs font-medium text-harbor-text-heading">{{ entry.workflow_name }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-[10px] text-harbor-text-muted">{{ entry.run_duration_ms }}ms</span>
                      <button
                        (click)="rerunWorkflow.emit(entry.workflow_id)"
                        class="rounded bg-walrus-500 px-2 py-0.5 text-[10px] font-medium text-white transition-colors hover:bg-walrus-600"
                      >
                        Re-run
                      </button>
                    </div>
                  </div>
                  <div class="mt-1 text-[10px] text-harbor-text-muted">{{ entry.started_at | date:'short' }}</div>
                  @if (entry.error_message) {
                    <div class="mt-1 text-[10px] text-red-400">{{ entry.error_message }}</div>
                  }
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class BottomPanelComponent {
  private api = inject(ApiService);
  executionLogs = input<LogEntry[]>([]);
  executionResults = input<WorkflowExecutionResult[]>([]);
  nodeStates = input<Record<string, string>>({});
  agentId = input<string | null>(null);
  expanded = signal(false);
  activeTab = signal<'logs' | 'results' | 'memory' | 'datasets' | 'activity' | 'history'>('logs');
  memoryQuery = signal('');
  memoryResultContext = signal('');
  isSearching = signal(false);
  datasets = signal<any[]>([]);
  isLoadingDatasets = signal(false);
  activityEntries = signal<any[]>([]);
  executionHistory = signal<any[]>([]);
  isLoadingHistory = signal(false);
  rerunWorkflow = output<string>();

  toggleExpanded() {
    this.expanded.update(v => !v);
  }

  async searchMemory() {
    const poolName = this.memoryQuery().trim();
    if (!poolName) return;
    this.isSearching.set(true);
    this.memoryResultContext.set('');
    try {
      const result: any = await this.api.fetchMemoryLogs(poolName);
      this.memoryResultContext.set(result.context || 'No results.');
    } catch {
      this.memoryResultContext.set('Failed to fetch memory. Check the pool name.');
    } finally {
      this.isSearching.set(false);
    }
  }

  async loadDatasets() {
    this.isLoadingDatasets.set(true);
    try {
      const res = await fetch('/api/v1/datasets');
      const data = await res.json();
      this.datasets.set(data.datasets || []);
    } catch {
      this.datasets.set([]);
    } finally {
      this.isLoadingDatasets.set(false);
    }
  }

  async loadHistory() {
    this.isLoadingHistory.set(true);
    try {
      const res = await fetch('/api/v1/execute/history');
      const data = await res.json();
      this.executionHistory.set(data || []);
    } catch {
      this.executionHistory.set([]);
    } finally {
      this.isLoadingHistory.set(false);
    }
  }

  async loadActivity() {
    const id = this.agentId();
    if (!id) return;
    try {
      const entries = await this.api.getAgentActivity(id);
      this.activityEntries.set(entries);
    } catch {
      this.activityEntries.set([]);
    }
  }

  tabs = [
    { key: 'logs' as const, label: 'Execution Logs' },
    { key: 'results' as const, label: 'Results' },
    { key: 'memory' as const, label: 'Memory Explorer' },
    { key: 'datasets' as const, label: 'Datasets' },
    { key: 'activity' as const, label: 'Activity' },
    { key: 'history' as const, label: 'History' },
  ];
}
