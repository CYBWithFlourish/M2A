import { Injectable, signal, inject, Injector } from '@angular/core';
import { ClassicPreset } from 'rete';
import type { NodeDefinition } from '../shared/types';

const NODE_COLORS: Record<string, string> = {
  agent: '#8b5cf6', agent_spawn: '#a855f7', code: '#06b6d4', output: '#f87171',
  input: '#22c55e', webhook_trigger: '#06b6d4', schedule_trigger: '#f59e0b',
  event_trigger: '#f97316', form_trigger: '#06b6d4', discord_trigger: '#5865F2',
  conditional: '#f97316', merge: '#ec4899', loop: '#ec4899', counter: '#8b5cf6',
  wait: '#f59e0b', json_parser: '#6366f1', csv_parser: '#22c55e', rss_reader: '#f97316',
  pyth: '#8b5cf6', switchboard: '#f59e0b', http: '#14b8a6', email: '#ef4444',
  slack: '#4A154B', discord: '#5865F2', telegram_send: '#0088cc', twitter: '#1DA1F2',
  google_sheets: '#34A853', airtable: '#18BFFF', notion: '#000000',
  sui: '#f59e0b', walrus: '#3b82f6', file: '#3b82f6', ipfs: '#65C2CB',
  suins: '#06b6d4', balance_monitor: '#10b981', wormhole: '#6366f1',
  sui_bridge: '#3b82f6', aftermath: '#06b6d4', navi: '#10b981', suilend: '#6366f1',
  haedal: '#14b8a6', volo: '#8b5cf6', bucket: '#f59e0b', bluefin: '#06b6d4',
  alphafi: '#10b981', price_alert: '#f59e0b', tradeport: '#ec4899', nft: '#ec4899',
  nft_floor_alert: '#ec4899',
};

const NODE_CATEGORIES: Record<string, string> = {
  agent: 'AI', agent_spawn: 'AI', code: 'Logic', output: 'Output',
  input: 'Trigger', webhook_trigger: 'Trigger', schedule_trigger: 'Trigger',
  event_trigger: 'Trigger', form_trigger: 'Trigger', discord_trigger: 'Trigger',
  conditional: 'Logic', merge: 'Logic', loop: 'Logic', counter: 'Logic',
  wait: 'Logic', json_parser: 'Data', csv_parser: 'Data', rss_reader: 'Data',
  pyth: 'Oracle', switchboard: 'Oracle', http: 'Web2', email: 'Web2',
  slack: 'Web2', discord: 'Web2', telegram_send: 'Web2', twitter: 'Web2',
  google_sheets: 'Web2', airtable: 'Web2', notion: 'Web2',
  sui: 'Chain', walrus: 'Chain', file: 'Chain', ipfs: 'Chain', suins: 'Chain',
  balance_monitor: 'Chain', wormhole: 'Bridge', sui_bridge: 'Bridge',
  aftermath: 'DeFi', navi: 'DeFi', suilend: 'DeFi', haedal: 'DeFi',
  volo: 'DeFi', bucket: 'DeFi', bluefin: 'DeFi', alphafi: 'DeFi',
  price_alert: 'DeFi', tradeport: 'NFT', nft: 'NFT', nft_floor_alert: 'NFT',
};

@Injectable({ providedIn: 'root' })
export class EditorService {
  private reteEditor: any = null;
  private reteArea: any = null;
  private reteConnection: any = null;
  private injector = inject(Injector);

  isReady = signal(false);

  get editor() { return this.reteEditor; }
  get area() { return this.reteArea; }
  get connection() { return this.reteConnection; }

  async createEditor(container: HTMLElement): Promise<void> {
    try {
      const { NodeEditor } = await import('rete');
      const { AreaPlugin } = await import('rete-area-plugin');
      const { ConnectionPlugin, Presets: ConnectionPresets } = await import('rete-connection-plugin');
      const { AngularPlugin, Presets: AngularPresets } = await import('rete-angular-plugin/19');

      const editor = new NodeEditor();
      const area = new AreaPlugin<{ Node: any; Connection: any }, any>(container);
      const connection = new ConnectionPlugin();
      const angular = new AngularPlugin({ injector: this.injector });

      editor.use(area);
      area.use(connection as any);
      area.use(angular as any);

      (connection as any).addPreset(ConnectionPresets.classic.setup());
      (angular as any).addPreset(AngularPresets.classic.setup());

      this.reteEditor = editor;
      this.reteArea = area;
      this.reteConnection = connection;
      this.isReady.set(true);

      this.tryAddMinimap();
      this.tryAddContextMenu();
    } catch (err) {
      console.error('Failed to initialize Rete editor:', err);
      this.isReady.set(true);
    }
  }

  private async tryAddContextMenu() {
    try {
      const { ContextMenuPlugin } = await import('rete-context-menu-plugin');
      const cm = new ContextMenuPlugin({
        items: (nodeId?: string) => {
          const items: any[] = [
            { label: 'Input Trigger', handler: () => { this.addNode('input'); } },
            { label: 'M2A Agent', handler: () => { this.addNode('agent'); } },
            { label: 'Final Output', handler: () => { this.addNode('output'); } },
            { label: 'Walrus Storage', handler: () => { this.addNode('walrus'); } },
            { label: 'Sui Network', handler: () => { this.addNode('sui'); } },
            { label: 'HTTP Request', handler: () => { this.addNode('http'); } },
            { label: 'Conditional Logic', handler: () => { this.addNode('conditional'); } },
            { label: 'File I/O', handler: () => { this.addNode('file'); } },
            { label: 'Agent Spawn', handler: () => { this.addNode('agent_spawn'); } },
            { label: 'Webhook Trigger', handler: () => { this.addNode('webhook_trigger'); } },
            { label: 'Schedule Trigger', handler: () => { this.addNode('schedule_trigger'); } },
            { label: 'Merge', handler: () => { this.addNode('merge'); } },
            { label: 'Aftermath Swap', handler: () => { this.addNode('aftermath'); } },
            { label: 'Navi Lend', handler: () => { this.addNode('navi'); } },
            { label: 'Suilend', handler: () => { this.addNode('suilend'); } },
            { label: 'Haedal Stake', handler: () => { this.addNode('haedal'); } },
            { label: 'Volo Stake', handler: () => { this.addNode('volo'); } },
            { label: 'Bucket Mint', handler: () => { this.addNode('bucket'); } },
            { label: 'Bluefin Perps', handler: () => { this.addNode('bluefin'); } },
            { label: 'Pyth Price Feed', handler: () => { this.addNode('pyth'); } },
            { label: 'Switchboard Feed', handler: () => { this.addNode('switchboard'); } },
            { label: 'TradePort NFT', handler: () => { this.addNode('tradeport'); } },
            { label: 'On-Chain Event', handler: () => { this.addNode('event_trigger'); } },
            { label: 'Google Sheets', handler: () => { this.addNode('google_sheets'); } },
            { label: 'Airtable', handler: () => { this.addNode('airtable'); } },
            { label: 'Notion', handler: () => { this.addNode('notion'); } },
            { label: 'X / Twitter Post', handler: () => { this.addNode('twitter'); } },
            { label: 'RSS Feed Read', handler: () => { this.addNode('rss_reader'); } },
            { label: 'CSV Parser', handler: () => { this.addNode('csv_parser'); } },
            { label: 'IPFS Upload', handler: () => { this.addNode('ipfs'); } },
            { label: 'Loop / Iterator', handler: () => { this.addNode('loop'); } },
            { label: 'Code', handler: () => { this.addNode('code'); } },
            { label: 'Wormhole Bridge', handler: () => { this.addNode('wormhole'); } },
            { label: 'Sui Bridge', handler: () => { this.addNode('sui_bridge'); } },
            { label: 'AlphaFi Yield', handler: () => { this.addNode('alphafi'); } },
            { label: 'Form Trigger', handler: () => { this.addNode('form_trigger'); } },
            { label: 'Discord Trigger', handler: () => { this.addNode('discord_trigger'); } },
            { label: 'Price Alert', handler: () => { this.addNode('price_alert'); } },
            { label: 'Balance Monitor', handler: () => { this.addNode('balance_monitor'); } },
            { label: 'NFT Floor Alert', handler: () => { this.addNode('nft_floor_alert'); } },
            { label: 'Counter', handler: () => { this.addNode('counter'); } },
            { label: 'Send Email', handler: () => { this.addNode('email'); } },
            { label: 'Slack Message', handler: () => { this.addNode('slack'); } },
            { label: 'Discord Message', handler: () => { this.addNode('discord'); } },
            { label: 'Telegram Send', handler: () => { this.addNode('telegram_send'); } },
            { label: 'Wait / Delay', handler: () => { this.addNode('wait'); } },
            { label: 'JSON Parser', handler: () => { this.addNode('json_parser'); } },
            { label: 'SuiNS Resolver', handler: () => { this.addNode('suins'); } },
          ];
          if (nodeId) {
            items.push({ type: 'divider' }, { label: 'Delete', handler: () => this.removeNode(nodeId) });
          }
          return items;
        },
        searchBar: true,
      } as any);
      this.reteEditor.use(cm);
    } catch {
    }
  }

  private async tryAddMinimap() {
    try {
      const { MinimapPlugin } = await import('rete-minimap-plugin');
      const minimap = new MinimapPlugin();
      this.reteArea?.use(minimap);
    } catch {
    }
  }

  async autoArrange() {
    if (!this.reteEditor) return;
    try {
      const { AutoArrangePlugin } = await import('rete-auto-arrange-plugin');
      const arrange = new AutoArrangePlugin();
      this.reteEditor.use(arrange);
      await (arrange as any).layout();
    } catch {
    }
  }

  async addNode(type: string, position?: { x: number; y: number }): Promise<NodeDefinition | null> {
    if (!this.reteEditor || !this.reteArea) return null;

    const label = type.charAt(0).toUpperCase() + type.slice(1);
    const socket = new ClassicPreset.Socket('default');
    const node = new ClassicPreset.Node(label);

    if (type !== 'input') {
      node.addInput('in', new ClassicPreset.Input(socket));
    }
    if (type !== 'output') {
      node.addOutput('out', new ClassicPreset.Output(socket));
    }

    (node as any).nodeType = type;
    (node as any).nodeId = node.id;

    const added = await this.reteEditor.addNode(node);
    if (!added) return null;

    const container = this.reteArea.container as HTMLElement;
    const pos = position ?? {
      x: container.clientWidth / 2 - 120,
      y: container.clientHeight / 2 - 60,
    };

    const nodeView = this.reteArea.nodeViews.get(node.id);
    if (nodeView) {
      await nodeView.translate(pos.x, pos.y);
    }

    this._injectNodeUI(node.id, type);

    return {
      id: node.id,
      type,
      position: pos,
      data: { label, type, status: 'idle' },
    };
  }

  async addConnection(sourceId: string, targetId: string): Promise<boolean> {
    if (!this.reteEditor) return false;
    const sourceNode = this.reteEditor.getNode(sourceId);
    const targetNode = this.reteEditor.getNode(targetId);
    if (!sourceNode || !targetNode) return false;

    const conn = new ClassicPreset.Connection(
      sourceNode,
      'out' as any,
      targetNode,
      'in' as any,
    );
    return this.reteEditor.addConnection(conn);
  }

  async removeNode(nodeId: string) {
    if (!this.reteEditor) return;
    try {
      await this.reteEditor.removeNode(nodeId);
    } catch {}
  }

  async clearEditor() {
    if (!this.reteEditor) return;
    try {
      await this.reteEditor.clear();
    } catch {}
  }

  private _injectNodeUI(nodeId: string, type: string) {
    try {
      const nodeView = this.reteArea.nodeViews.get(nodeId);
      if (!nodeView) return;
      const el = (nodeView as any).element as HTMLElement;
      if (!el) return;

      const colour = NODE_COLORS[type] || '#6b7280';
      const category = NODE_CATEGORIES[type] || 'Other';

      el.style.position = 'relative';
      el.style.borderLeft = `3px solid ${colour}`;

      const btn = document.createElement('button');
      btn.className = 'node-delete-btn';
      btn.innerHTML = '&times;';
      btn.onclick = (e: MouseEvent) => { e.stopPropagation(); this.removeNode(nodeId); };
      el.appendChild(btn);

      const badge = document.createElement('span');
      badge.className = 'node-category-badge';
      badge.style.background = colour + '20';
      badge.style.color = colour;
      badge.textContent = category;
      el.appendChild(badge);
    } catch {}
  }

  destroy() {
    if (this.reteEditor) {
      try { this.reteEditor.destroy(); } catch {}
    }
    this.reteEditor = null;
    this.reteArea = null;
    this.reteConnection = null;
    this.isReady.set(false);
  }
}
