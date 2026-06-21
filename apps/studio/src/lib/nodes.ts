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

export type ConfigField = {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "select" | "checkbox" | "password";
  placeholder?: string;
  options?: { value: string; label: string }[];
  defaultValue?: string;
};

export type NodeDef = {
  type: string;
  label: string;
  description: string;
  category: NodeCategory;
  badge: string;
  color: string;
  icon: LucideIcon;
  fields?: ConfigField[];
};

export const NODE_CATALOG: NodeDef[] = [
  // Essentials
  {
    type: "input", label: "Input", description: "Workflow entry pass-through", category: "Essentials", badge: "Trigger", color: "#22c55e", icon: Play,
    fields: [
      { key: "token", label: "Auth Token", type: "password", placeholder: "Bearer token for this input" },
      { key: "description", label: "Description", type: "text", placeholder: "What this input accepts" },
    ],
  },
  {
    type: "agent", label: "Agent", description: "AI persona with tools & memory", category: "Essentials", badge: "AI", color: "#8b5cf6", icon: Bot,
    fields: [
      { key: "role", label: "Role / Directives", type: "textarea", placeholder: "Describe the agent's role and behavior..." },
      { key: "model", label: "Model", type: "select", options: [
        { value: "llama-3.3-70b-versatile", label: "Llama 3.3 70B (Groq)" },
        { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
        { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
        { value: "claude-sonnet-4-20250514", label: "Claude Sonnet 4" },
      ], defaultValue: "llama-3.3-70b-versatile" },
      { key: "temperature", label: "Temperature", type: "number", placeholder: "0.7" },
      { key: "maxTokens", label: "Max Tokens", type: "number", placeholder: "2048" },
    ],
  },
  {
    type: "output", label: "Output", description: "Terminal sink for results", category: "Essentials", badge: "Output", color: "#f87171", icon: Send,
    fields: [
      { key: "label", label: "Label", type: "text", placeholder: "Output label" },
      { key: "format", label: "Format", type: "select", options: [
        { value: "raw", label: "Raw" },
        { value: "json", label: "JSON Pretty" },
      ], defaultValue: "raw" },
    ],
  },

  // Triggers
  {
    type: "webhook_trigger", label: "Webhook", description: "Listen for HTTP callbacks", category: "Triggers", badge: "Trigger", color: "#06b6d4", icon: Webhook,
    fields: [
      { key: "token", label: "Secret Token", type: "password", placeholder: "Webhook verification token" },
      { key: "path", label: "Path", type: "text", placeholder: "/webhook/my-agent" },
    ],
  },
  {
    type: "schedule_trigger", label: "Schedule", description: "Run on cron schedule", category: "Triggers", badge: "Trigger", color: "#f59e0b", icon: Calendar,
    fields: [
      { key: "cronExpression", label: "Cron Expression", type: "text", placeholder: "0 * * * * (hourly)" },
    ],
  },
  {
    type: "event_trigger", label: "On-Chain Event", description: "React to Sui Move events", category: "Triggers", badge: "Trigger", color: "#06b6d4", icon: Zap,
    fields: [
      { key: "packageId", label: "Package ID", type: "text", placeholder: "0x..." },
      { key: "moduleName", label: "Module Name", type: "text", placeholder: "pool" },
      { key: "eventType", label: "Event Type", type: "text", placeholder: "SwapEvent" },
    ],
  },
  {
    type: "form_trigger", label: "Form", description: "Public form submissions", category: "Triggers", badge: "Trigger", color: "#06b6d4", icon: FormInput,
    fields: [
      { key: "formId", label: "Form ID", type: "text", placeholder: "contact-form-1" },
      { key: "fields", label: "Form Fields", type: "textarea", placeholder: '["name", "email", "message"]' },
    ],
  },
  {
    type: "discord_trigger", label: "Discord Bot", description: "Discord channel messages", category: "Triggers", badge: "Trigger", color: "#5865F2", icon: MessageSquare,
    fields: [
      { key: "botToken", label: "Bot Token", type: "password", placeholder: "Discord bot token" },
      { key: "channelId", label: "Channel ID", type: "text", placeholder: "Discord channel ID" },
    ],
  },

  // AI Agents
  {
    type: "agent_spawn", label: "Spawn Agent", description: "Sub-agent inheriting context", category: "AI Agents", badge: "AI", color: "#8b5cf6", icon: Sparkles,
    fields: [
      { key: "role", label: "Role / Directives", type: "textarea", placeholder: "Describe the sub-agent's role..." },
      { key: "model", label: "Model", type: "select", options: [
        { value: "llama-3.3-70b-versatile", label: "Llama 3.3 70B (Groq)" },
        { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
        { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
        { value: "claude-sonnet-4-20250514", label: "Claude Sonnet 4" },
      ], defaultValue: "llama-3.3-70b-versatile" },
      { key: "temperature", label: "Temperature", type: "number", placeholder: "0.7" },
      { key: "maxTokens", label: "Max Tokens", type: "number", placeholder: "2048" },
    ],
  },
  {
    type: "code", label: "Code", description: "TypeScript / JavaScript snippet", category: "AI Agents", badge: "Logic", color: "#a78bfa", icon: Code2,
    fields: [
      { key: "code", label: "Code Snippet", type: "textarea", placeholder: "// Your TypeScript code here..." },
      { key: "language", label: "Language", type: "select", options: [
        { value: "typescript", label: "TypeScript" },
        { value: "javascript", label: "JavaScript" },
      ], defaultValue: "typescript" },
    ],
  },
  {
    type: "loop", label: "Loop", description: "Iterate over array items", category: "AI Agents", badge: "Logic", color: "#8b5cf6", icon: Repeat,
    fields: [
      { key: "iterator", label: "Iterator Variable", type: "text", placeholder: "item" },
      { key: "maxIterations", label: "Max Iterations", type: "number", placeholder: "100" },
    ],
  },

  // Logic
  {
    type: "conditional", label: "Conditional", description: "Branch on expression", category: "Logic", badge: "Logic", color: "#f97316", icon: GitBranch,
    fields: [
      { key: "condition", label: "Condition", type: "text", placeholder: "keyword to match" },
      { key: "trueOutput", label: "True Output", type: "text", placeholder: "Condition met" },
      { key: "falseOutput", label: "False Output", type: "text", placeholder: "Condition not met" },
    ],
  },
  {
    type: "merge", label: "Merge", description: "Combine branch outputs", category: "Logic", badge: "Logic", color: "#ec4899", icon: GitMerge,
    fields: [
      { key: "strategy", label: "Merge Strategy", type: "select", options: [
        { value: "first", label: "First Arrived" },
        { value: "wait_all", label: "Wait For All" },
      ], defaultValue: "first" },
    ],
  },
  {
    type: "wait", label: "Wait", description: "Delay execution", category: "Logic", badge: "Logic", color: "#f59e0b", icon: Clock,
    fields: [
      { key: "duration", label: "Duration", type: "number", placeholder: "5" },
      { key: "unit", label: "Unit", type: "select", options: [
        { value: "seconds", label: "Seconds" },
        { value: "minutes", label: "Minutes" },
        { value: "hours", label: "Hours" },
      ], defaultValue: "seconds" },
    ],
  },
  {
    type: "counter", label: "Counter", description: "Persistent counter store", category: "Logic", badge: "Logic", color: "#8b5cf6", icon: Hash,
    fields: [
      { key: "initialValue", label: "Initial Value", type: "number", placeholder: "0" },
      { key: "operation", label: "Operation", type: "select", options: [
        { value: "increment", label: "Increment" },
        { value: "decrement", label: "Decrement" },
        { value: "reset", label: "Reset" },
      ], defaultValue: "increment" },
    ],
  },
  {
    type: "json_parser", label: "JSON Parser", description: "Extract JSON path", category: "Logic", badge: "Logic", color: "#6366f1", icon: Braces,
    fields: [
      { key: "jsonPath", label: "JSON Path", type: "text", placeholder: "$.data.result.price" },
    ],
  },

  // DeFi
  {
    type: "aftermath", label: "Aftermath", description: "Aggregator swap & quote", category: "DeFi", badge: "DeFi", color: "#06b6d4", icon: Coins,
    fields: [
      { key: "action", label: "Action", type: "select", options: [
        { value: "swap", label: "Swap" },
        { value: "quote", label: "Get Quote" },
      ], defaultValue: "swap" },
      { key: "coinIn", label: "Coin In", type: "text", placeholder: "0x2::sui::SUI" },
      { key: "coinOut", label: "Coin Out", type: "text", placeholder: "0x...::usdc::USDC" },
      { key: "amount", label: "Amount", type: "text", placeholder: "1.0" },
      { key: "slippage", label: "Slippage %", type: "number", placeholder: "0.5" },
    ],
  },
  {
    type: "navi", label: "Navi", description: "Lending — supply / borrow", category: "DeFi", badge: "DeFi", color: "#10b981", icon: Briefcase,
    fields: [
      { key: "action", label: "Action", type: "select", options: [
        { value: "supply", label: "Supply" },
        { value: "borrow", label: "Borrow" },
        { value: "withdraw", label: "Withdraw" },
        { value: "repay", label: "Repay" },
      ], defaultValue: "supply" },
      { key: "asset", label: "Asset", type: "text", placeholder: "SUI" },
      { key: "amount", label: "Amount", type: "text", placeholder: "1.0" },
    ],
  },
  {
    type: "suilend", label: "Suilend", description: "Lend & borrow markets", category: "DeFi", badge: "DeFi", color: "#10b981", icon: Briefcase,
    fields: [
      { key: "action", label: "Action", type: "select", options: [
        { value: "supply", label: "Supply" },
        { value: "borrow", label: "Borrow" },
        { value: "withdraw", label: "Withdraw" },
        { value: "repay", label: "Repay" },
      ], defaultValue: "supply" },
      { key: "asset", label: "Asset", type: "text", placeholder: "SUI" },
      { key: "amount", label: "Amount", type: "text", placeholder: "1.0" },
    ],
  },
  {
    type: "haedal", label: "Haedal", description: "Liquid staking", category: "DeFi", badge: "DeFi", color: "#06b6d4", icon: Layers,
    fields: [
      { key: "action", label: "Action", type: "select", options: [
        { value: "stake", label: "Stake" },
        { value: "unstake", label: "Unstake" },
      ], defaultValue: "stake" },
      { key: "amount", label: "Amount", type: "text", placeholder: "1.0" },
    ],
  },
  {
    type: "volo", label: "Volo", description: "vSUI liquid staking", category: "DeFi", badge: "DeFi", color: "#06b6d4", icon: Layers,
    fields: [
      { key: "action", label: "Action", type: "select", options: [
        { value: "stake", label: "Stake SUI" },
        { value: "unstake", label: "Unstake vSUI" },
      ], defaultValue: "stake" },
      { key: "amount", label: "Amount", type: "text", placeholder: "1.0" },
    ],
  },
  {
    type: "bucket", label: "Bucket", description: "Mint & redeem stablecoin", category: "DeFi", badge: "DeFi", color: "#10b981", icon: Boxes,
    fields: [
      { key: "action", label: "Action", type: "select", options: [
        { value: "mint", label: "Mint" },
        { value: "redeem", label: "Redeem" },
      ], defaultValue: "mint" },
      { key: "amount", label: "Amount", type: "text", placeholder: "1.0" },
    ],
  },
  {
    type: "bluefin", label: "Bluefin", description: "Perp futures positions", category: "DeFi", badge: "DeFi", color: "#3b82f6", icon: TrendingUp,
    fields: [
      { key: "action", label: "Action", type: "select", options: [
        { value: "open_position", label: "Open Position" },
        { value: "close_position", label: "Close Position" },
      ], defaultValue: "open_position" },
      { key: "pair", label: "Trading Pair", type: "text", placeholder: "SUI-PERP" },
      { key: "leverage", label: "Leverage", type: "number", placeholder: "5" },
      { key: "amount", label: "Amount", type: "text", placeholder: "1.0" },
    ],
  },
  {
    type: "alphafi", label: "AlphaFi", description: "Auto-compounding vaults", category: "DeFi", badge: "DeFi", color: "#10b981", icon: Workflow,
    fields: [
      { key: "action", label: "Action", type: "select", options: [
        { value: "deposit", label: "Deposit" },
        { value: "withdraw", label: "Withdraw" },
      ], defaultValue: "deposit" },
      { key: "vault", label: "Vault", type: "text", placeholder: "vSUI" },
      { key: "amount", label: "Amount", type: "text", placeholder: "1.0" },
    ],
  },
  {
    type: "cetus_trade",
    label: "Cetus Trade",
    description: "Swap tokens on Cetus CLMM DEX",
    category: "DeFi",
    badge: "DeFi",
    color: "#06b6d4",
    icon: Coins,
    fields: [
      { key: "action", label: "Action", type: "select", options: [
        { value: "get_pool_info", label: "Pool Info" },
        { value: "estimate_swap", label: "Estimate Swap" },
        { value: "swap", label: "Swap (Simulate)" },
      ], defaultValue: "swap" },
      { key: "poolId", label: "Pool ID", type: "text", placeholder: "0x..." },
      { key: "coinIn", label: "Coin In", type: "text", placeholder: "0x2::sui::SUI" },
      { key: "coinOut", label: "Coin Out", type: "text", placeholder: "0x...::usdc::USDC" },
      { key: "amount", label: "Amount", type: "text", placeholder: "1.0" },
      { key: "slippage", label: "Slippage %", type: "number", placeholder: "0.5" },
    ],
  },
  {
    type: "cetus_lend",
    label: "Cetus Lend",
    description: "Lending operations on Cetus",
    category: "DeFi",
    badge: "DeFi",
    color: "#10b981",
    icon: Briefcase,
    fields: [
      { key: "action", label: "Action", type: "select", options: [
        { value: "supply", label: "Supply" },
        { value: "withdraw", label: "Withdraw" },
      ], defaultValue: "supply" },
      { key: "asset", label: "Asset", type: "text", placeholder: "SUI" },
      { key: "amount", label: "Amount", type: "text", placeholder: "1.0" },
    ],
  },
  {
    type: "price_alert", label: "Price Alert", description: "Threshold price monitor", category: "DeFi", badge: "DeFi", color: "#f59e0b", icon: Bell,
    fields: [
      { key: "asset", label: "Asset", type: "text", placeholder: "SUI" },
      { key: "threshold", label: "Threshold", type: "number", placeholder: "2.50" },
      { key: "operator", label: "Condition", type: "select", options: [
        { value: "above", label: "Above" },
        { value: "below", label: "Below" },
      ], defaultValue: "above" },
    ],
  },
  {
    type: "deepbook_trade",
    label: "DeepBook Trade",
    description: "Execute swaps and limit orders on DeepBook DEX",
    category: "DeFi",
    badge: "DeFi",
    color: "#8B5CF6",
    icon: TrendingUp,
    fields: [
      { key: "action", label: "Action", type: "select", options: [
        { value: "get_pools", label: "List Available Pools" },
        { value: "swap", label: "Swap (Simulate)" },
        { value: "swap_and_submit", label: "Swap & Submit (Live)" },
        { value: "limit_order", label: "Limit Order" },
        { value: "cancel", label: "Cancel Order" },
        { value: "get_pool_info", label: "Pool Info" },
        { value: "get_order_book", label: "Order Book" },
        { value: "estimate_swap", label: "Estimate Swap" },
      ], defaultValue: "swap" },
      { key: "pool", label: "Pool ID", type: "text", placeholder: "0x..." },
      { key: "amount", label: "Amount (SUI)", type: "number", placeholder: "10" },
      { key: "side", label: "Side", type: "select", options: [
        { value: "bid", label: "Buy" },
        { value: "ask", label: "Sell" },
      ], defaultValue: "bid" },
      { key: "price", label: "Limit Price", type: "number", placeholder: "Optional for limit orders" },
    ],
  },
  {
    type: "deepbook_lend",
    label: "DeepBook Lend",
    description: "Deposit, withdraw, borrow, or repay on DeepBook Lending",
    category: "DeFi",
    badge: "DeFi",
    color: "#8B5CF6",
    icon: Coins,
    fields: [
      { key: "action", label: "Action", type: "select", options: [
        { value: "deposit", label: "Deposit" },
        { value: "withdraw", label: "Withdraw" },
        { value: "borrow", label: "Borrow" },
        { value: "repay", label: "Repay" },
      ], defaultValue: "deposit" },
      { key: "pool", label: "Pool ID", type: "text", placeholder: "0x..." },
      { key: "amount", label: "Amount", type: "number", placeholder: "10" },
      { key: "token", label: "Token Type", type: "text", placeholder: "0x2::sui::SUI" },
    ],
  },

  // Bridge
  {
    type: "wormhole", label: "Wormhole", description: "Cross-chain bridge transfers", category: "Bridge", badge: "Bridge", color: "#6366f1", icon: Cable,
    fields: [
      { key: "action", label: "Action", type: "select", options: [
        { value: "bridge_transfer", label: "Bridge Transfer" },
      ], defaultValue: "bridge_transfer" },
      { key: "sourceChain", label: "Source Chain", type: "text", placeholder: "sui" },
      { key: "targetChain", label: "Target Chain", type: "text", placeholder: "ethereum" },
      { key: "token", label: "Token", type: "text", placeholder: "USDC" },
      { key: "amount", label: "Amount", type: "text", placeholder: "1.0" },
    ],
  },
  {
    type: "sui_bridge", label: "Sui Bridge", description: "Sui ↔ Ethereum bridge", category: "Bridge", badge: "Bridge", color: "#3b82f6", icon: Cable,
    fields: [
      { key: "action", label: "Action", type: "select", options: [
        { value: "bridge_to_eth", label: "Sui → Ethereum" },
        { value: "bridge_to_sui", label: "Ethereum → Sui" },
      ], defaultValue: "bridge_to_eth" },
      { key: "token", label: "Token", type: "text", placeholder: "SUI" },
      { key: "amount", label: "Amount", type: "text", placeholder: "1.0" },
    ],
  },

  // Oracle
  {
    type: "pyth", label: "Pyth", description: "Pyth price feed", category: "Oracle", badge: "Oracle", color: "#8b5cf6", icon: LineChart,
    fields: [
      { key: "action", label: "Action", type: "select", options: [
        { value: "get_price", label: "Get Price" },
        { value: "get_ema", label: "Get EMA" },
      ], defaultValue: "get_price" },
      { key: "priceFeedId", label: "Price Feed ID", type: "text", placeholder: "0x23d7... (SUI/USD)" },
    ],
  },
  {
    type: "switchboard", label: "Switchboard", description: "Switchboard data feeds", category: "Oracle", badge: "Oracle", color: "#f59e0b", icon: Gauge,
    fields: [
      { key: "action", label: "Action", type: "select", options: [
        { value: "get_data", label: "Get Data" },
      ], defaultValue: "get_data" },
      { key: "feedId", label: "Feed ID", type: "text", placeholder: "0x... feed address" },
    ],
  },

  // NFT
  {
    type: "tradeport", label: "TradePort", description: "NFT marketplace data", category: "NFT", badge: "NFT", color: "#ec4899", icon: Diamond,
    fields: [
      { key: "action", label: "Action", type: "select", options: [
        { value: "get_listings", label: "Get Listings" },
        { value: "get_collection_stats", label: "Collection Stats" },
      ], defaultValue: "get_listings" },
      { key: "collection", label: "Collection", type: "text", placeholder: "SuiFrens" },
    ],
  },
  {
    type: "nft_floor_alert", label: "NFT Floor Alert", description: "Collection floor alerts", category: "NFT", badge: "NFT", color: "#ec4899", icon: AlertTriangle,
    fields: [
      { key: "collection", label: "Collection", type: "text", placeholder: "SuiFrens" },
      { key: "threshold", label: "Floor Threshold (SUI)", type: "number", placeholder: "1.5" },
      { key: "operator", label: "Condition", type: "select", options: [
        { value: "above", label: "Above" },
        { value: "below", label: "Below" },
      ], defaultValue: "below" },
    ],
  },

  // Web2
  {
    type: "http", label: "HTTP Request", description: "Generic REST request", category: "Web2", badge: "Web2", color: "#14b8a6", icon: Globe,
    fields: [
      { key: "url", label: "URL", type: "text", placeholder: "https://api.example.com" },
      { key: "method", label: "Method", type: "select", options: [
        { value: "GET", label: "GET" },
        { value: "POST", label: "POST" },
        { value: "PUT", label: "PUT" },
        { value: "DELETE", label: "DELETE" },
      ], defaultValue: "GET" },
      { key: "headers", label: "Headers (JSON)", type: "textarea", placeholder: '{"Content-Type": "application/json"}' },
      { key: "body", label: "Body", type: "textarea", placeholder: "Request body..." },
    ],
  },
  {
    type: "email", label: "Email", description: "Send via SMTP", category: "Web2", badge: "Web2", color: "#ef4444", icon: Mail,
    fields: [
      { key: "to", label: "To", type: "text", placeholder: "user@example.com" },
      { key: "subject", label: "Subject", type: "text", placeholder: "Hello from Buiry" },
      { key: "from", label: "From", type: "text", placeholder: "noreply@buiry.xyz" },
      { key: "smtpHost", label: "SMTP Host", type: "text", placeholder: "smtp.gmail.com" },
      { key: "smtpPort", label: "SMTP Port", type: "number", placeholder: "587" },
      { key: "smtpUser", label: "SMTP User", type: "text", placeholder: "user@gmail.com" },
      { key: "smtpPass", label: "SMTP Password", type: "password", placeholder: "••••••••" },
    ],
  },
  {
    type: "slack", label: "Slack", description: "Slack webhook message", category: "Web2", badge: "Web2", color: "#4A154B", icon: MessageSquare,
    fields: [
      { key: "webhookUrl", label: "Webhook URL", type: "text", placeholder: "https://hooks.slack.com/services/..." },
      { key: "text", label: "Message", type: "textarea", placeholder: "Hello from Buiry!" },
    ],
  },
  {
    type: "discord", label: "Discord", description: "Discord webhook message", category: "Web2", badge: "Web2", color: "#5865F2", icon: MessageSquare,
    fields: [
      { key: "webhookUrl", label: "Webhook URL", type: "text", placeholder: "https://discord.com/api/webhooks/..." },
      { key: "content", label: "Content", type: "textarea", placeholder: "Hello from Buiry!" },
    ],
  },
  {
    type: "telegram_send", label: "Telegram", description: "Send via Telegram bot", category: "Web2", badge: "Web2", color: "#0284c7", icon: Send,
    fields: [
      { key: "botToken", label: "Bot Token", type: "password", placeholder: "123456:ABC-DEF..." },
      { key: "chatId", label: "Chat ID", type: "text", placeholder: "-1001234567890" },
      { key: "text", label: "Message", type: "textarea", placeholder: "Hello from Buiry!" },
    ],
  },
  {
    type: "twitter", label: "Twitter / X", description: "Post or read tweets", category: "Web2", badge: "Web2", color: "#1DA1F2", icon: Twitter,
    fields: [
      { key: "action", label: "Action", type: "select", options: [
        { value: "post_tweet", label: "Post Tweet" },
        { value: "search", label: "Search Tweets" },
      ], defaultValue: "post_tweet" },
      { key: "query", label: "Content / Query", type: "textarea", placeholder: "Tweet content or search query..." },
      { key: "apiKey", label: "API Key", type: "password", placeholder: "Twitter API key" },
    ],
  },
  {
    type: "google_sheets", label: "Google Sheets", description: "Read & append rows", category: "Web2", badge: "Web2", color: "#34A853", icon: FileSpreadsheet,
    fields: [
      { key: "spreadsheetId", label: "Spreadsheet ID", type: "text", placeholder: "1abc..." },
      { key: "action", label: "Action", type: "select", options: [
        { value: "read", label: "Read Rows" },
        { value: "append", label: "Append Row" },
      ], defaultValue: "read" },
      { key: "range", label: "Range", type: "text", placeholder: "Sheet1!A1:D100" },
      { key: "apiKey", label: "API Key", type: "password", placeholder: "Google Sheets API key" },
    ],
  },
  {
    type: "airtable", label: "Airtable", description: "List & create records", category: "Web2", badge: "Web2", color: "#18BFFF", icon: Database,
    fields: [
      { key: "baseId", label: "Base ID", type: "text", placeholder: "appABC..." },
      { key: "tableName", label: "Table Name", type: "text", placeholder: "Contacts" },
      { key: "action", label: "Action", type: "select", options: [
        { value: "list", label: "List Records" },
        { value: "create", label: "Create Record" },
      ], defaultValue: "list" },
      { key: "apiKey", label: "API Key", type: "password", placeholder: "Airtable personal access token" },
    ],
  },
  {
    type: "notion", label: "Notion", description: "Query & create pages", category: "Web2", badge: "Web2", color: "#0f172a", icon: FileText,
    fields: [
      { key: "action", label: "Action", type: "select", options: [
        { value: "query", label: "Query Database" },
        { value: "create", label: "Create Page" },
      ], defaultValue: "query" },
      { key: "databaseId", label: "Database ID", type: "text", placeholder: "notion database ID" },
      { key: "apiKey", label: "API Key", type: "password", placeholder: "Notion integration token" },
    ],
  },

  // Data
  {
    type: "rss_reader", label: "RSS Reader", description: "Poll RSS feeds", category: "Data", badge: "Data", color: "#f97316", icon: Rss,
    fields: [
      { key: "feedUrl", label: "Feed URL", type: "text", placeholder: "https://example.com/rss" },
      { key: "maxItems", label: "Max Items", type: "number", placeholder: "10" },
    ],
  },
  {
    type: "csv_parser", label: "CSV Parser", description: "Parse CSV rows", category: "Data", badge: "Data", color: "#22c55e", icon: FileSpreadsheet,
    fields: [
      { key: "filePath", label: "File Path", type: "text", placeholder: "/data/export.csv" },
      { key: "delimiter", label: "Delimiter", type: "text", placeholder: "," },
    ],
  },
  {
    type: "file", label: "File I/O", description: "Walrus blob store", category: "Data", badge: "Data", color: "#3b82f6", icon: HardDrive,
    fields: [
      { key: "action", label: "Action", type: "select", options: [
        { value: "read", label: "Read" },
        { value: "write", label: "Write" },
      ], defaultValue: "read" },
      { key: "blobId", label: "Blob ID", type: "text", placeholder: "walrus blob ID" },
    ],
  },
  {
    type: "ipfs", label: "IPFS", description: "Pin via Pinata / web3.storage", category: "Data", badge: "Data", color: "#65C2CB", icon: CloudUpload,
    fields: [
      { key: "action", label: "Action", type: "select", options: [
        { value: "pin", label: "Pin File" },
        { value: "retrieve", label: "Retrieve" },
      ], defaultValue: "pin" },
      { key: "cid", label: "CID", type: "text", placeholder: "Qm... IPFS content ID" },
      { key: "apiKey", label: "API Key", type: "password", placeholder: "Pinata / web3.storage key" },
    ],
  },

  // Blockchain
  {
    type: "sui", label: "Sui RPC", description: "Sui object & tx queries", category: "Blockchain", badge: "Chain", color: "#06b6d4", icon: Server,
    fields: [
      { key: "action", label: "Action", type: "select", options: [
        { value: "get_object", label: "Get Object" },
        { value: "query_events", label: "Query Events" },
        { value: "get_balance", label: "Get Balance" },
      ], defaultValue: "get_object" },
      { key: "objectId", label: "Object ID", type: "text", placeholder: "0x... object or address" },
      { key: "rpcUrl", label: "RPC URL", type: "text", placeholder: "https://fullnode.mainnet.sui.io" },
    ],
  },
  {
    type: "walrus", label: "Walrus", description: "Decentralized blob store", category: "Blockchain", badge: "Chain", color: "#3b82f6", icon: Database,
    fields: [
      { key: "action", label: "Action", type: "select", options: [
        { value: "store", label: "Store" },
        { value: "retrieve", label: "Retrieve" },
      ], defaultValue: "store" },
      { key: "blobId", label: "Blob ID", type: "text", placeholder: "walrus blob ID" },
      { key: "publisherUrl", label: "Publisher URL", type: "text", placeholder: "https://publisher.walrus.xyz" },
    ],
  },
  {
    type: "suins", label: "SuiNS", description: "Resolve Sui name service", category: "Blockchain", badge: "Chain", color: "#06b6d4", icon: AtSign,
    fields: [
      { key: "action", label: "Action", type: "select", options: [
        { value: "resolve_name", label: "Resolve Name" },
        { value: "reverse_lookup", label: "Reverse Lookup" },
      ], defaultValue: "resolve_name" },
      { key: "name", label: "Name / Address", type: "text", placeholder: "example.sui" },
    ],
  },
  {
    type: "balance_monitor", label: "Balance Monitor", description: "Wallet balance threshold", category: "Blockchain", badge: "Chain", color: "#10b981", icon: Wallet,
    fields: [
      { key: "address", label: "Wallet Address", type: "text", placeholder: "0x..." },
      { key: "threshold", label: "Threshold", type: "number", placeholder: "100" },
      { key: "operator", label: "Condition", type: "select", options: [
        { value: "above", label: "Above" },
        { value: "below", label: "Below" },
      ], defaultValue: "below" },
      { key: "coinType", label: "Coin Type", type: "text", placeholder: "0x2::sui::SUI" },
    ],
  },
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
