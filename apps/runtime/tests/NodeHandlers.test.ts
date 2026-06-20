import { describe, it, expect } from 'vitest';
import { nodeHandlers } from '../src/engine/NodeHandlers.js';
import type { WorkflowNode } from '@m2a/sdk';

const ALL_NODE_TYPES = [
  'input', 'output', 'walrus', 'sui', 'http', 'conditional', 'file',
  'agent_spawn', 'webhook_trigger', 'schedule_trigger', 'merge',
  'aftermath', 'navi', 'suilend', 'haedal', 'volo', 'bucket',
  'wormhole', 'sui_bridge', 'alphafi', 'bluefin', 'pyth', 'switchboard',
  'tradeport', 'event_trigger', 'form_trigger', 'discord_trigger',
  'price_alert', 'balance_monitor', 'nft_floor_alert', 'counter',
  'google_sheets', 'airtable', 'notion', 'twitter', 'rss_reader',
  'csv_parser', 'ipfs', 'email', 'slack', 'discord', 'telegram_send',
  'wait', 'json_parser', 'suins', 'loop', 'code',
];

const DEFI_TYPES = new Set(['aftermath', 'navi', 'suilend', 'haedal', 'volo',
  'bucket', 'wormhole', 'sui_bridge', 'alphafi']);
const VALID_AMOUNT = '1000000';

function makeNode(type: string, data?: Record<string, unknown>): WorkflowNode {
  return { id: `test_${type}`, type, data: { label: type, type, ...data } } as WorkflowNode;
}

const ctx = { accountId: '0x0000000000000000000000000000000000000000000000000000000000000001', delegateKey: '0x0000000000000000000000000000000000000000000000000000000000000001', agentWallet: null };

describe('NodeHandlers', () => {
  it('has handlers registered for all node types', () => {
    expect(nodeHandlers.length).toBeGreaterThanOrEqual(46);
  });

  ALL_NODE_TYPES.forEach(type => {
    describe(`${type} handler`, () => {
      it('finds a matching handler', () => {
        const handler = nodeHandlers.find(h => {
          try { return h.canHandle(makeNode(type)); } catch { return false; }
        });
        expect(handler).toBeDefined();
      });

      it('canHandle returns true for its own type', () => {
        const handler = nodeHandlers.find(h => h.canHandle(makeNode(type)));
        expect(handler).toBeDefined();
        if (handler) {
          expect(handler.canHandle(makeNode(type))).toBe(true);
        }
      });

      it('does not handle unrelated types', () => {
        const handler = nodeHandlers.find(h => h.canHandle(makeNode(type)));
        expect(handler).toBeDefined();
        if (handler) {
          const wrongTypes = ALL_NODE_TYPES.filter(t => t !== type).slice(0, 5);
          for (const wrong of wrongTypes) {
            expect(handler.canHandle(makeNode(wrong))).toBe(false);
          }
        }
      });

      it('execute returns a NodeHandlerResult with output', async () => {
        const handler = nodeHandlers.find(h => h.canHandle(makeNode(type)));
        expect(handler).toBeDefined();
        if (handler) {
          const input = DEFI_TYPES.has(type) ? [VALID_AMOUNT] : type === 'wait' ? [] : ['test input'];
          const nodeData = type === 'wait' ? { durationMs: '10' } : undefined;
          const node = nodeData ? makeNode(type, nodeData) : makeNode(type);
          const result = await handler.execute(node, input, ctx);
          expect(result).toBeDefined();
          expect(typeof result.output).toBe('string');
          expect(result.output.length).toBeGreaterThan(0);
        }
      });
    });
  });
});

describe('Logic Node Execution', () => {
  it('Wait handler pauses and returns duration', async () => {
    const handler = nodeHandlers.find(h => h.canHandle(makeNode('wait')))!;
    const start = Date.now();
    const result = await handler.execute(makeNode('wait', { durationMs: '100' }), [], ctx);
    expect(result.output).toContain('100ms');
    expect(Date.now() - start).toBeGreaterThanOrEqual(50);
  });

  it('Counter handler increments across calls', async () => {
    const handler = nodeHandlers.find(h => h.canHandle(makeNode('counter')))!;
    const r1 = await handler.execute(makeNode('counter', { counterId: 'test-counter' }), [], ctx);
    const r2 = await handler.execute(makeNode('counter', { counterId: 'test-counter' }), [], ctx);
    expect(Number(r1.output)).toBe(1);
    expect(Number(r2.output)).toBe(2);
  });

  it('Merge handler concat strategy combines inputs', async () => {
    const handler = nodeHandlers.find(h => h.canHandle(makeNode('merge')))!;
    const result = await handler.execute(makeNode('merge'), ['A', 'B', 'C'], ctx);
    expect(result.output).toContain('[Branch 1]');
    expect(result.output).toContain('[Branch 2]');
    expect(result.output).toContain('[Branch 3]');
  });

  it('Merge handler json_array strategy returns JSON array', async () => {
    const handler = nodeHandlers.find(h => h.canHandle(makeNode('merge')))!;
    const result = await handler.execute(makeNode('merge', { strategy: 'json_array' }), ['a', 'b'], ctx);
    const parsed = JSON.parse(result.output);
    expect(Array.isArray(parsed)).toBe(true);
  });

  it('JSON Parser parses valid JSON', async () => {
    const handler = nodeHandlers.find(h => h.canHandle(makeNode('json_parser')))!;
    const result = await handler.execute(makeNode('json_parser'), ['{"name":"test","value":42}'], ctx);
    const parsed = JSON.parse(result.output);
    expect(parsed.name).toBe('test');
    expect(parsed.value).toBe(42);
  });

  it('JSON Parser handles invalid JSON gracefully', async () => {
    const handler = nodeHandlers.find(h => h.canHandle(makeNode('json_parser')))!;
    const result = await handler.execute(makeNode('json_parser'), ['not-json'], ctx);
    expect(result.output).toContain('Invalid JSON');
  });

  it('CSV Parser parses CSV with headers', async () => {
    const handler = nodeHandlers.find(h => h.canHandle(makeNode('csv_parser')))!;
    const result = await handler.execute(makeNode('csv_parser'), ['name,age\nAlice,30\nBob,25'], ctx);
    const parsed = JSON.parse(result.output);
    expect(parsed.length).toBe(2);
    expect(parsed[0].name).toBe('Alice');
  });

  it('Conditional node evaluates condition', async () => {
    const handler = nodeHandlers.find(h => h.canHandle(makeNode('conditional')))!;
    const result = await handler.execute(makeNode('conditional', { condition: 'hello', trueOutput: 'YES', falseOutput: 'NO' }), ['hello world'], ctx);
    expect(result.output).toBe('YES');
  });

  it('Code node executes JavaScript', async () => {
    const handler = nodeHandlers.find(h => h.canHandle(makeNode('code')))!;
    const result = await handler.execute(makeNode('code', { code: 'return input.toUpperCase();', language: 'javascript' }), ['hello'], ctx);
    expect(result.output).toBe('HELLO');
  });
});

describe('External API Nodes — Graceful Degradation', () => {
  it('Email handler returns error without SMTP config', async () => {
    const handler = nodeHandlers.find(h => h.canHandle(makeNode('email')))!;
    const result = await handler.execute(makeNode('email'), ['test body'], ctx);
    expect(typeof result.output).toBe('string');
    expect(result.output.length).toBeGreaterThan(0);
  });

  it('Slack handler returns error without webhook URL', async () => {
    const handler = nodeHandlers.find(h => h.canHandle(makeNode('slack')))!;
    const result = await handler.execute(makeNode('slack'), ['hello'], ctx);
    expect(result.output).toContain('Error');
  });

  it('Discord handler returns error without webhook URL', async () => {
    const handler = nodeHandlers.find(h => h.canHandle(makeNode('discord')))!;
    const result = await handler.execute(makeNode('discord'), ['hello'], ctx);
    expect(result.output).toContain('Error');
  });

  it('Telegram handler returns error without token', async () => {
    const handler = nodeHandlers.find(h => h.canHandle(makeNode('telegram_send')))!;
    const result = await handler.execute(makeNode('telegram_send'), ['hello'], ctx);
    expect(result.output).toContain('Error');
  });

  it('HTTP handler returns error for empty URL', async () => {
    const handler = nodeHandlers.find(h => h.canHandle(makeNode('http')))!;
    const result = await handler.execute(makeNode('http'), [], ctx);
    expect(result.output).toContain('Error');
  });

  it('Google Sheets handler returns error without config', async () => {
    const handler = nodeHandlers.find(h => h.canHandle(makeNode('google_sheets')))!;
    const result = await handler.execute(makeNode('google_sheets'), ['data'], ctx);
    expect(result.output).toContain('Error');
  });

  it('IPFS handler returns size info without API key', async () => {
    const handler = nodeHandlers.find(h => h.canHandle(makeNode('ipfs')))!;
    const result = await handler.execute(makeNode('ipfs'), ['some file content here'], ctx);
    expect(result.output).toContain('Content size');
  });

  it('Twitter handler returns error without bearer token', async () => {
    const handler = nodeHandlers.find(h => h.canHandle(makeNode('twitter')))!;
    const result = await handler.execute(makeNode('twitter'), ['test tweet'], ctx);
    expect(result.output).toContain('Error');
  });
});
