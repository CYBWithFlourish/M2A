import { Component, output, signal, inject, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface ActionPaletteItem {
  type: string;
  label: string;
  category: string;
  icon: string;
  color: string;
}

const ITEMS: ActionPaletteItem[] = [
  { type: 'input', label: 'Input Trigger', category: 'Essentials', icon: 'arrow-in', color: '#22c55e' },
  { type: 'agent', label: 'M2A Agent', category: 'Essentials', icon: 'hexagon', color: '#8b5cf6' },
  { type: 'output', label: 'Final Output', category: 'Essentials', icon: 'arrow-out', color: '#f87171' },
  { type: 'walrus', label: 'Walrus Storage', category: 'Decentralized Stack', icon: 'database', color: '#3b82f6' },
  { type: 'sui', label: 'Sui Network', category: 'Decentralized Stack', icon: 'blocks', color: '#f59e0b' },
  { type: 'http', label: 'HTTP Request', category: 'Integration', icon: 'globe', color: '#14b8a6' },
  { type: 'conditional', label: 'Condition', category: 'Logic', icon: 'git-branch', color: '#f97316' },
  { type: 'file', label: 'File I/O', category: 'Decentralized Stack', icon: 'file', color: '#3b82f6' },
  { type: 'agent_spawn', label: 'Spawn Agent', category: 'Agents', icon: 'users', color: '#a855f7' },
  { type: 'webhook_trigger', label: 'Webhook Trigger', category: 'Triggers', icon: 'globe', color: '#06b6d4' },
  { type: 'schedule_trigger', label: 'Schedule Trigger', category: 'Triggers', icon: 'clock', color: '#f59e0b' },
  { type: 'merge', label: 'Merge', category: 'Logic', icon: 'git-merge', color: '#ec4899' },
  { type: 'aftermath', label: 'Aftermath Swap', category: 'DeFi', icon: 'swap', color: '#06b6d4' },
  { type: 'navi', label: 'Navi Lend', category: 'DeFi', icon: 'bank', color: '#10b981' },
  { type: 'suilend', label: 'Suilend', category: 'DeFi', icon: 'landmark', color: '#6366f1' },
  { type: 'haedal', label: 'Haedal Stake', category: 'DeFi', icon: 'coins', color: '#14b8a6' },
  { type: 'volo', label: 'Volo Stake', category: 'DeFi', icon: 'coins', color: '#8b5cf6' },
  { type: 'bucket', label: 'Bucket Mint', category: 'DeFi', icon: 'dollar-sign', color: '#f59e0b' },
  { type: 'loop', label: 'Loop / Iterator', category: 'Logic', icon: 'repeat', color: '#ec4899' },
  { type: 'code', label: 'Code', category: 'Logic', icon: 'code', color: '#06b6d4' },
  { type: 'wormhole', label: 'Wormhole Bridge', category: 'Bridge', icon: 'globe', color: '#6366f1' },
  { type: 'sui_bridge', label: 'Sui Bridge', category: 'Bridge', icon: 'link', color: '#3b82f6' },
  { type: 'alphafi', label: 'AlphaFi Yield', category: 'DeFi', icon: 'trending-up', color: '#10b981' },
  { type: 'bluefin', label: 'Bluefin Perps', category: 'DeFi', icon: 'trending-up', color: '#06b6d4' },
  { type: 'pyth', label: 'Pyth Price Feed', category: 'Data', icon: 'bar-chart', color: '#8b5cf6' },
  { type: 'switchboard', label: 'Switchboard Feed', category: 'Data', icon: 'antenna', color: '#f59e0b' },
  { type: 'tradeport', label: 'TradePort NFT', category: 'NFT', icon: 'image', color: '#ec4899' },
  { type: 'event_trigger', label: 'On-Chain Event', category: 'Triggers', icon: 'zap', color: '#f97316' },
  { type: 'google_sheets', label: 'Google Sheets', category: 'Web2', icon: 'table', color: '#34A853' },
  { type: 'airtable', label: 'Airtable', category: 'Web2', icon: 'database', color: '#18BFFF' },
  { type: 'notion', label: 'Notion', category: 'Web2', icon: 'file-text', color: '#000000' },
  { type: 'twitter', label: 'X / Twitter Post', category: 'Web2', icon: 'twitter', color: '#1DA1F2' },
  { type: 'rss_reader', label: 'RSS Feed Read', category: 'Data', icon: 'rss', color: '#f97316' },
  { type: 'csv_parser', label: 'CSV Parser', category: 'Data', icon: 'file-spreadsheet', color: '#22c55e' },
  { type: 'ipfs', label: 'IPFS Upload', category: 'Decentralized Stack', icon: 'cloud-upload', color: '#65C2CB' },
  { type: 'form_trigger', label: 'Form Trigger', category: 'Triggers', icon: 'form-input', color: '#06b6d4' },
  { type: 'discord_trigger', label: 'Discord Trigger', category: 'Triggers', icon: 'message-circle', color: '#5865F2' },
  { type: 'price_alert', label: 'Price Alert', category: 'DeFi', icon: 'bell', color: '#f59e0b' },
  { type: 'balance_monitor', label: 'Balance Monitor', category: 'Blockchain', icon: 'wallet', color: '#10b981' },
  { type: 'nft_floor_alert', label: 'NFT Floor Alert', category: 'NFT', icon: 'alert-triangle', color: '#ec4899' },
  { type: 'counter', label: 'Counter', category: 'Logic', icon: 'hash', color: '#8b5cf6' },
  { type: 'email', label: 'Send Email', category: 'Web2', icon: 'mail', color: '#ef4444' },
  { type: 'slack', label: 'Slack Message', category: 'Web2', icon: 'slack', color: '#4A154B' },
  { type: 'discord', label: 'Discord Message', category: 'Web2', icon: 'message-circle', color: '#5865F2' },
  { type: 'telegram_send', label: 'Telegram Send', category: 'Web2', icon: 'send', color: '#0088cc' },
  { type: 'wait', label: 'Wait / Delay', category: 'Logic', icon: 'clock', color: '#f59e0b' },
  { type: 'json_parser', label: 'JSON Parser', category: 'Data', icon: 'braces', color: '#6366f1' },
  { type: 'suins', label: 'SuiNS Resolver', category: 'Blockchain', icon: 'at-sign', color: '#06b6d4' },
];

@Component({
  selector: 'app-action-palette',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div
      class="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm"
      (click)="close.emit()"
    >
      <div
        class="w-full max-w-lg animate-slide-up rounded-2xl border border-harbor-border bg-harbor-card-bg shadow-2xl"
        (click)="$event.stopPropagation()"
      >
        <div class="p-3">
          <input
            [(ngModel)]="query"
            (keydown)="onKeydown($event)"
            #searchInput
            placeholder="Search nodes..."
            class="w-full rounded-xl border border-harbor-border-input bg-harbor-surface px-4 py-2.5 text-sm text-harbor-text-heading outline-none placeholder:text-harbor-text-muted focus:border-walrus-400"
          />
        </div>

        <div class="max-h-80 overflow-y-auto px-3 pb-3">
          @for (item of filtered(); track item.type) {
            <button
              (click)="select(item)"
              class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-harbor-control-hover"
              [class.bg-harbor-control-active]="selectedIndex() === $index"
            >
              <div
                class="flex h-8 w-8 items-center justify-center rounded-lg"
                [style.background]="item.color + '20'"
                [style.color]="item.color"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  @switch (item.icon) {
                    @case ('arrow-in') { <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/> }
                    @case ('hexagon') { <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/> }
                    @case ('arrow-out') { <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 19 19 12 12 5"/> }
                    @case ('database') { <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/> }
                    @case ('blocks') { <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/> }
                    @case ('globe') { <circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/> }
                    @case ('git-branch') { <line x1="6" y1="3" x2="6" y2="15"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="6" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/> }
                    @case ('file') { <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/> }
                    @case ('users') { <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/> }
                    @case ('clock') { <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/> }
                    @case ('git-merge') { <circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M6 21V9a9 9 0 0 0 9 9"/> }
                    @case ('swap') { <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/> }
                    @case ('bank') { <polygon points="12 2 22 8.5 22 11 2 11 2 8.5"/><line x1="4" y1="11" x2="4" y2="21"/><line x1="9" y1="11" x2="9" y2="21"/><line x1="14" y1="11" x2="14" y2="21"/><line x1="19" y1="11" x2="19" y2="21"/><rect x="1" y="21" width="22" height="2"/> }
                    @case ('landmark') { <line x1="12" y1="2" x2="12" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/> }
                    @case ('coins') { <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/> }
                    @case ('dollar-sign') { <line x1="12" y1="2" x2="12" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/> }
                    @case ('repeat') { <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/> }
                    @case ('code') { <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/> }
                    @case ('link') { <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/> }
                    @case ('trending-up') { <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/> }
                    @case ('bar-chart') { <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/> }
                    @case ('antenna') { <path d="M5 16.66C3.67 15.18 3 13.19 3 11s.67-4.18 2-5.66"/><path d="M8 13.83c-.83-.78-1.33-1.9-1.33-3.11s.5-2.33 1.33-3.11"/><path d="M2 20h20"/><circle cx="15" cy="7" r="3"/> }
                    @case ('image') { <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/> }
                    @case ('zap') { <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/> }
                    @case ('table') { <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/> }
                    @case ('file-text') { <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/> }
                    @case ('twitter') { <path d="M4 4l7 7m0 0l7 7M11 11L4 18m7-7l7-7"/><circle cx="12" cy="12" r="10"/> }
                    @case ('rss') { <path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/> }
                    @case ('file-spreadsheet') { <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/><line x1="8" y1="9" x2="10" y2="9"/> }
                    @case ('cloud-upload') { <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/><polyline points="12 12 12 21"/><polyline points="8 17 12 21 16 17"/> }
                    @case ('form-input') { <rect x="5" y="2" width="14" height="20" rx="2"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="11" y2="16"/> }
                    @case ('message-circle') { <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/> }
                    @case ('bell') { <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/> }
                    @case ('wallet') { <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/> }
                    @case ('alert-triangle') { <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/> }
                    @case ('hash') { <line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/> }
                    @case ('mail') { <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/> }
                    @case ('slack') { <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v5a2.5 2.5 0 0 0 5 0v-5A2.5 2.5 0 0 0 14.5 2z"/><path d="M22 9.5a2.5 2.5 0 0 0-2.5-2.5h-5a2.5 2.5 0 0 0 0 5h5a2.5 2.5 0 0 0 2.5-2.5z"/><path d="M9.5 22A2.5 2.5 0 0 1 7 19.5v-5A2.5 2.5 0 0 1 9.5 12a2.5 2.5 0 0 1 2.5 2.5v5a2.5 2.5 0 0 1-2.5 2.5z"/> }
                    @case ('send') { <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/> }
                    @case ('braces') { <path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5a2 2 0 0 0 2 2h1"/><path d="M16 21h1a2 2 0 0 0 2-2v-5a2 2 0 0 1 2-2 2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1"/> }
                    @case ('at-sign') { <circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/> }
                  }
                </svg>
              </div>
              <div>
                <div class="text-sm font-medium text-harbor-text-heading">{{ item.label }}</div>
                <div class="text-xs text-harbor-text-muted">{{ item.category }}</div>
              </div>
            </button>
          } @empty {
            <div class="py-8 text-center text-sm text-harbor-text-muted">No nodes found</div>
          }
        </div>
      </div>
    </div>
  `,
})
export class ActionPaletteComponent {
  close = output();
  selectNode = output<string>();

  query = signal('');
  selectedIndex = signal(0);
  items = ITEMS;

  filtered = () => {
    const q = this.query().toLowerCase();
    if (!q) return this.items;
    return this.items.filter(
      i => i.label.toLowerCase().includes(q) || i.category.toLowerCase().includes(q)
    );
  };

  select(item: ActionPaletteItem) {
    this.selectNode.emit(item.type);
  }

  onKeydown(event: KeyboardEvent) {
    const filtered = this.filtered();
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.selectedIndex.update(i => Math.min(i + 1, filtered.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.selectedIndex.update(i => Math.max(i - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (filtered[this.selectedIndex()]) {
        this.select(filtered[this.selectedIndex()]);
      }
    } else if (event.key === 'Escape') {
      this.close.emit();
    }
  }
}
