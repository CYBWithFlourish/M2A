import { Injectable, signal, inject, Injector } from '@angular/core';
import { ClassicPreset } from 'rete';
import type { NodeDefinition } from '../shared/types';

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
