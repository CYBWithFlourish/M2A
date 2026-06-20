import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertTriangle,
  AtSign,
  Bell,
  Bot,
  Boxes,
  Braces,
  Briefcase,
  Cable,
  Calendar,
  Clock,
  CloudUpload,
  Code2,
  Coins,
  Database,
  Diamond,
  FileSpreadsheet,
  FileText,
  FormInput,
  Gauge,
  GitBranch,
  GitMerge,
  Globe,
  Hash,
  HardDrive,
  Layers,
  LineChart,
  Mail,
  MessageSquare,

  Play,
  Repeat,
  Rss,
  Send,
  Server,
  Sparkles,
  TrendingUp,
  Twitter,
  Wallet,
  Webhook,
  Workflow,
  Zap,
} from "lucide-react";

export type NodeCategory =
  | "Essentials"
  | "Triggers"
  | "AI Agents"
  | "Logic"
  | "DeFi"
  | "Bridge"
  | "Oracle"
  | "NFT"
  | "Web2"
  | "Blockchain"
  | "Data";

export type NodeDef = {
  type: string;
  label: string;
  description: string;
  category: NodeCategory;
  badge: string; // short pill text
  color: string; // hex
  icon: LucideIcon;
};

export const NODE_CATALOG: NodeDef[] = [
  // Essentials
  { type: "input", label: "Input", description: "Workflow entry pass-through", category: "Essentials", badge: "Trigger", color: "#22c55e", icon: Play },
  { type: "agent", label: "Agent", description: "AI persona with tools & memory", category: "Essentials", badge: "AI", color: "#8b5cf6", icon: Bot },
  { type: "output", label: "Output", description: "Terminal sink for results", category: "Essentials", badge: "Output", color: "#f87171", icon: Send },

  // Triggers
  { type: "webhook_trigger", label: "Webhook", description: "Listen for HTTP callbacks", category: "Triggers", badge: "Trigger", color: "#06b6d4", icon: Webhook },
  { type: "schedule_trigger", label: "Schedule", description: "Run on cron schedule", category: "Triggers", badge: "Trigger", color: "#f59e0b", icon: Calendar },
  { type: "event_trigger", label: "On-Chain Event", description: "React to Sui Move events", category: "Triggers", badge: "Trigger", color: "#06b6d4", icon: Zap },
  { type: "form_trigger", label: "Form", description: "Public form submissions", category: "Triggers", badge: "Trigger", color: "#06b6d4", icon: FormInput },
  { type: "discord_trigger", label: "Discord Bot", description: "Discord channel messages", category: "Triggers", badge: "Trigger", color: "#5865F2", icon: MessageSquare },

  // AI Agents
  { type: "agent_spawn", label: "Spawn Agent", description: "Sub-agent inheriting context", category: "AI Agents", badge: "AI", color: "#8b5cf6", icon: Sparkles },
  { type: "code", label: "Code", description: "TypeScript / JavaScript snippet", category: "AI Agents", badge: "Logic", color: "#a78bfa", icon: Code2 },
  { type: "loop", label: "Loop", description: "Iterate over array items", category: "AI Agents", badge: "Logic", color: "#8b5cf6", icon: Repeat },

  // Logic
  { type: "conditional", label: "Conditional", description: "Branch on expression", category: "Logic", badge: "Logic", color: "#f97316", icon: GitBranch },
  { type: "merge", label: "Merge", description: "Combine branch outputs", category: "Logic", badge: "Logic", color: "#ec4899", icon: GitMerge },
  { type: "wait", label: "Wait", description: "Delay execution", category: "Logic", badge: "Logic", color: "#f59e0b", icon: Clock },
  { type: "counter", label: "Counter", description: "Persistent counter store", category: "Logic", badge: "Logic", color: "#8b5cf6", icon: Hash },
  { type: "json_parser", label: "JSON Parser", description: "Extract JSON path", category: "Logic", badge: "Logic", color: "#6366f1", icon: Braces },

  // DeFi
  { type: "aftermath", label: "Aftermath", description: "Aggregator swap & quote", category: "DeFi", badge: "DeFi", color: "#06b6d4", icon: Coins },
  { type: "navi", label: "Navi", description: "Lending — supply / borrow", category: "DeFi", badge: "DeFi", color: "#10b981", icon: Briefcase },
  { type: "suilend", label: "Suilend", description: "Lend & borrow markets", category: "DeFi", badge: "DeFi", color: "#10b981", icon: Briefcase },
  { type: "haedal", label: "Haedal", description: "Liquid staking", category: "DeFi", badge: "DeFi", color: "#06b6d4", icon: Layers },
  { type: "volo", label: "Volo", description: "vSUI liquid staking", category: "DeFi", badge: "DeFi", color: "#06b6d4", icon: Layers },
  { type: "bucket", label: "Bucket", description: "Mint & redeem stablecoin", category: "DeFi", badge: "DeFi", color: "#10b981", icon: Boxes },
  { type: "bluefin", label: "Bluefin", description: "Perp futures positions", category: "DeFi", badge: "DeFi", color: "#3b82f6", icon: TrendingUp },
  { type: "alphafi", label: "AlphaFi", description: "Auto-compounding vaults", category: "DeFi", badge: "DeFi", color: "#10b981", icon: Workflow },
  { type: "price_alert", label: "Price Alert", description: "Threshold price monitor", category: "DeFi", badge: "DeFi", color: "#f59e0b", icon: Bell },

  // Bridge
  { type: "wormhole", label: "Wormhole", description: "Cross-chain bridge transfers", category: "Bridge", badge: "Bridge", color: "#6366f1", icon: Cable },
  { type: "sui_bridge", label: "Sui Bridge", description: "Sui ↔ Ethereum bridge", category: "Bridge", badge: "Bridge", color: "#3b82f6", icon: Cable },

  // Oracle
  { type: "pyth", label: "Pyth", description: "Pyth price feed", category: "Oracle", badge: "Oracle", color: "#8b5cf6", icon: LineChart },
  { type: "switchboard", label: "Switchboard", description: "Switchboard data feeds", category: "Oracle", badge: "Oracle", color: "#f59e0b", icon: Gauge },

  // NFT
  { type: "tradeport", label: "TradePort", description: "NFT marketplace data", category: "NFT", badge: "NFT", color: "#ec4899", icon: Diamond },
  { type: "nft_floor_alert", label: "NFT Floor Alert", description: "Collection floor alerts", category: "NFT", badge: "NFT", color: "#ec4899", icon: AlertTriangle },

  // Web2
  { type: "http", label: "HTTP Request", description: "Generic REST request", category: "Web2", badge: "Web2", color: "#14b8a6", icon: Globe },
  { type: "email", label: "Email", description: "Send via SMTP", category: "Web2", badge: "Web2", color: "#ef4444", icon: Mail },
  { type: "slack", label: "Slack", description: "Slack webhook message", category: "Web2", badge: "Web2", color: "#4A154B", icon: MessageSquare },
  { type: "discord", label: "Discord", description: "Discord webhook message", category: "Web2", badge: "Web2", color: "#5865F2", icon: MessageSquare },
  { type: "telegram_send", label: "Telegram", description: "Send via Telegram bot", category: "Web2", badge: "Web2", color: "#0284c7", icon: Send },
  { type: "twitter", label: "Twitter / X", description: "Post or read tweets", category: "Web2", badge: "Web2", color: "#1DA1F2", icon: Twitter },
  { type: "google_sheets", label: "Google Sheets", description: "Read & append rows", category: "Web2", badge: "Web2", color: "#34A853", icon: FileSpreadsheet },
  { type: "airtable", label: "Airtable", description: "List & create records", category: "Web2", badge: "Web2", color: "#18BFFF", icon: Database },
  { type: "notion", label: "Notion", description: "Query & create pages", category: "Web2", badge: "Web2", color: "#0f172a", icon: FileText },

  // Data
  { type: "rss_reader", label: "RSS Reader", description: "Poll RSS feeds", category: "Data", badge: "Data", color: "#f97316", icon: Rss },
  { type: "csv_parser", label: "CSV Parser", description: "Parse CSV rows", category: "Data", badge: "Data", color: "#22c55e", icon: FileSpreadsheet },
  { type: "file", label: "File I/O", description: "Walrus blob store", category: "Data", badge: "Data", color: "#3b82f6", icon: HardDrive },
  { type: "ipfs", label: "IPFS", description: "Pin via Pinata / web3.storage", category: "Data", badge: "Data", color: "#65C2CB", icon: CloudUpload },

  // Blockchain
  { type: "sui", label: "Sui RPC", description: "Sui object & tx queries", category: "Blockchain", badge: "Chain", color: "#06b6d4", icon: Server },
  { type: "walrus", label: "Walrus", description: "Decentralized blob store", category: "Blockchain", badge: "Chain", color: "#3b82f6", icon: Database },
  { type: "suins", label: "SuiNS", description: "Resolve Sui name service", category: "Blockchain", badge: "Chain", color: "#06b6d4", icon: AtSign },
  { type: "balance_monitor", label: "Balance Monitor", description: "Wallet balance threshold", category: "Blockchain", badge: "Chain", color: "#10b981", icon: Wallet },
];

export const CATEGORY_ORDER: NodeCategory[] = [
  "Essentials",
  "Triggers",
  "AI Agents",
  "Logic",
  "DeFi",
  "Bridge",
  "Oracle",
  "NFT",
  "Web2",
  "Data",
  "Blockchain",
];

export function getNodeDef(type: string): NodeDef | undefined {
  return NODE_CATALOG.find((n) => n.type === type);
}

export const ICON_FALLBACK: LucideIcon = Activity;