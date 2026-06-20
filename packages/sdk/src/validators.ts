import { z } from 'zod';

export const PositionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export const MemoryTierConfigSchema = z.object({
  read: z.array(z.string()),
  write: z.array(z.string()),
});

export const BaseWorkflowNodeSchema = z.object({
  id: z.string(),
  label: z.string().optional().default(''),
  position: PositionSchema,
  dependencies: z.array(z.string()).optional(),
  data: z.record(z.unknown()).optional(),
});

export const AgentNodeSchema = BaseWorkflowNodeSchema.extend({
  type: z.literal('agent'),
  role: z.string().optional().default(''),
  model: z.string().optional().default('llama-4-maverick-17b-128e-instruct'),
  tools: z.array(z.string()).optional().default([]),
  memory_tier: MemoryTierConfigSchema.optional().default({ read: [], write: [] }),
});

export const InputNodeSchema = BaseWorkflowNodeSchema.extend({
  type: z.literal('input'),
  schema: z.record(z.enum(['string', 'number', 'boolean'])).optional().default({}),
});

export const OutputNodeSchema = BaseWorkflowNodeSchema.extend({
  type: z.literal('output'),
});

export const WalrusNodeSchema = BaseWorkflowNodeSchema.extend({
  type: z.literal('walrus'),
});

export const SuiNodeSchema = BaseWorkflowNodeSchema.extend({
  type: z.literal('sui'),
});

export const HttpNodeSchema = BaseWorkflowNodeSchema.extend({
  type: z.literal('http'),
});

export const ConditionalNodeSchema = BaseWorkflowNodeSchema.extend({
  type: z.literal('conditional'),
});

export const FileNodeSchema = BaseWorkflowNodeSchema.extend({
  type: z.literal('file'),
});

export const AgentSpawnNodeSchema = BaseWorkflowNodeSchema.extend({
  type: z.literal('agent_spawn'),
});

export const WebhookTriggerNodeSchema = BaseWorkflowNodeSchema.extend({
  type: z.literal('webhook_trigger'),
});

export const ScheduleTriggerNodeSchema = BaseWorkflowNodeSchema.extend({
  type: z.literal('schedule_trigger'),
});

export const MergeNodeSchema = BaseWorkflowNodeSchema.extend({
  type: z.literal('merge'),
});

export const AftermathNodeSchema = BaseWorkflowNodeSchema.extend({
  type: z.literal('aftermath'),
});

export const NaviNodeSchema = BaseWorkflowNodeSchema.extend({
  type: z.literal('navi'),
});

export const SuilendNodeSchema = BaseWorkflowNodeSchema.extend({
  type: z.literal('suilend'),
});

export const HaedalNodeSchema = BaseWorkflowNodeSchema.extend({
  type: z.literal('haedal'),
});

export const VoloNodeSchema = BaseWorkflowNodeSchema.extend({
  type: z.literal('volo'),
});

export const BucketNodeSchema = BaseWorkflowNodeSchema.extend({
  type: z.literal('bucket'),
});

export const LoopNodeSchema = BaseWorkflowNodeSchema.extend({
  type: z.literal('loop'),
});

export const CodeNodeSchema = BaseWorkflowNodeSchema.extend({
  type: z.literal('code'),
});

export const WormholeNodeSchema = BaseWorkflowNodeSchema.extend({
  type: z.literal('wormhole'),
});

export const SuiBridgeNodeSchema = BaseWorkflowNodeSchema.extend({
  type: z.literal('sui_bridge'),
});

export const AlphaFiNodeSchema = BaseWorkflowNodeSchema.extend({
  type: z.literal('alphafi'),
});

export const BluefinNodeSchema = BaseWorkflowNodeSchema.extend({
  type: z.literal('bluefin'),
});

export const PythNodeSchema = BaseWorkflowNodeSchema.extend({
  type: z.literal('pyth'),
});

export const SwitchboardNodeSchema = BaseWorkflowNodeSchema.extend({
  type: z.literal('switchboard'),
});

export const TradeportNodeSchema = BaseWorkflowNodeSchema.extend({
  type: z.literal('tradeport'),
});

export const EventTriggerNodeSchema = BaseWorkflowNodeSchema.extend({
  type: z.literal('event_trigger'),
});

export const GoogleSheetsNodeSchema = BaseWorkflowNodeSchema.extend({
  type: z.literal('google_sheets'),
});

export const AirtableNodeSchema = BaseWorkflowNodeSchema.extend({
  type: z.literal('airtable'),
});

export const NotionNodeSchema = BaseWorkflowNodeSchema.extend({
  type: z.literal('notion'),
});

export const TwitterNodeSchema = BaseWorkflowNodeSchema.extend({
  type: z.literal('twitter'),
});

export const RssReaderNodeSchema = BaseWorkflowNodeSchema.extend({
  type: z.literal('rss_reader'),
});

export const CsvParserNodeSchema = BaseWorkflowNodeSchema.extend({
  type: z.literal('csv_parser'),
});

export const IpfsNodeSchema = BaseWorkflowNodeSchema.extend({
  type: z.literal('ipfs'),
});

export const FormTriggerNodeSchema = BaseWorkflowNodeSchema.extend({
  type: z.literal('form_trigger'),
});

export const DiscordTriggerNodeSchema = BaseWorkflowNodeSchema.extend({
  type: z.literal('discord_trigger'),
});

export const PriceAlertTriggerNodeSchema = BaseWorkflowNodeSchema.extend({
  type: z.literal('price_alert'),
});

export const BalanceMonitorNodeSchema = BaseWorkflowNodeSchema.extend({
  type: z.literal('balance_monitor'),
});

export const NftFloorAlertNodeSchema = BaseWorkflowNodeSchema.extend({
  type: z.literal('nft_floor_alert'),
});

export const CounterNodeSchema = BaseWorkflowNodeSchema.extend({
  type: z.literal('counter'),
});

export const EmailNodeSchema = BaseWorkflowNodeSchema.extend({
  type: z.literal('email'),
});

export const SlackNodeSchema = BaseWorkflowNodeSchema.extend({
  type: z.literal('slack'),
});

export const DiscordNodeSchema = BaseWorkflowNodeSchema.extend({
  type: z.literal('discord'),
});

export const TelegramSendNodeSchema = BaseWorkflowNodeSchema.extend({
  type: z.literal('telegram_send'),
});

export const WaitNodeSchema = BaseWorkflowNodeSchema.extend({
  type: z.literal('wait'),
});

export const JsonParserNodeSchema = BaseWorkflowNodeSchema.extend({
  type: z.literal('json_parser'),
});

export const SuiNSNodeSchema = BaseWorkflowNodeSchema.extend({
  type: z.literal('suins'),
});

export const WorkflowNodeSchema = z.discriminatedUnion('type', [
  AgentNodeSchema,
  InputNodeSchema,
  OutputNodeSchema,
  WalrusNodeSchema,
  SuiNodeSchema,
  HttpNodeSchema,
  ConditionalNodeSchema,
  FileNodeSchema,
  AgentSpawnNodeSchema,
  WebhookTriggerNodeSchema,
  ScheduleTriggerNodeSchema,
  MergeNodeSchema,
  AftermathNodeSchema,
  NaviNodeSchema,
  SuilendNodeSchema,
  HaedalNodeSchema,
  VoloNodeSchema,
  BucketNodeSchema,
  LoopNodeSchema,
  CodeNodeSchema,
  WormholeNodeSchema,
  SuiBridgeNodeSchema,
  AlphaFiNodeSchema,
  BluefinNodeSchema,
  PythNodeSchema,
  SwitchboardNodeSchema,
  TradeportNodeSchema,
  EventTriggerNodeSchema,
  GoogleSheetsNodeSchema,
  AirtableNodeSchema,
  NotionNodeSchema,
  TwitterNodeSchema,
  RssReaderNodeSchema,
  CsvParserNodeSchema,
  IpfsNodeSchema,
  FormTriggerNodeSchema,
  DiscordTriggerNodeSchema,
  PriceAlertTriggerNodeSchema,
  BalanceMonitorNodeSchema,
  NftFloorAlertNodeSchema,
  CounterNodeSchema,
  EmailNodeSchema,
  SlackNodeSchema,
  DiscordNodeSchema,
  TelegramSendNodeSchema,
  WaitNodeSchema,
  JsonParserNodeSchema,
  SuiNSNodeSchema,
]);

export const WorkflowEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  sourceHandle: z.string().optional(),
  targetHandle: z.string().optional(),
});

export const WorkflowDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string(),
  namespace_prefix: z.string().optional().default(''),
  nodes: z.array(WorkflowNodeSchema),
  edges: z.array(WorkflowEdgeSchema),
});

export const AgentPolicySchema = z.object({
  budgetCap: z.number().min(0),
  budgetUsed: z.number().min(0),
  protocolWhitelist: z.array(z.string()),
  toolWhitelist: z.array(z.string()),
  expiryEpoch: z.number().min(0),
  isActive: z.boolean(),
});

export const ActivityEntrySchema = z.object({
  id: z.string(),
  timestamp: z.number(),
  action: z.string(),
  protocol: z.string(),
  amountSpent: z.number(),
  txDigest: z.string(),
  status: z.enum(['pending', 'success', 'failed']),
});

export const AgentConfigSchema = z.object({
  walletAddress: z.string().nullable(),
  policy: AgentPolicySchema,
  skills: z.array(z.string()),
  services: z.array(z.string()),
  tools: z.array(z.string()),
  integrations: z.array(z.string()),
});

// === On-Chain Schemas ===

export const AgentPolicyOnChainSchema = z.object({
  id: z.string(),
  agent_id: z.string(),
  owner: z.string(),
  agent_wallet: z.string(),
  budget_cap: z.number(),
  budget_used: z.number(),
  protocol_whitelist: z.array(z.string()),
  tool_whitelist: z.array(z.string()),
  expiry_epoch: z.number(),
  is_active: z.boolean(),
});

export const ActivityEntryOnChainSchema = z.object({
  timestamp_ms: z.number(),
  action: z.string(),
  protocol: z.string(),
  amount_spent: z.number(),
  tx_digest: z.string(),
  status: z.number(),
});

export const ExecutionResultSchema = z.object({
  id: z.string(),
  workflowId: z.string(),
  status: z.enum(['pending', 'running', 'completed', 'failed']),
  outputs: z.record(z.string()),
  logs: z.array(z.object({
    timestamp: z.number(),
    nodeId: z.string(),
    nodeLabel: z.string(),
    type: z.enum(['recall', 'remember', 'llm', 'tool', 'error', 'info']),
    message: z.string(),
  })),
  startedAt: z.number(),
  completedAt: z.number().optional(),
});
