import { memoryRouter, platformAccountId, platformDelegateKey } from './engine/components.js';
import { db } from './db.js';

const REQUIRED_POOLS = ['pool::code-review', 'pool::research', 'pool::trading'];

const BUILTIN_TEMPLATES = [
  {
    id: 'code-review',
    name: 'Code Review Agent',
    description: 'Multi-reviewer code analysis pipeline',
    category: 'Development',
    owner: '',
    is_public: true,
    fork_count: 0,
    definition: {
      id: 'code-review',
      name: 'Code Review Agent',
      version: '1.0.0',
      namespace_prefix: '',
      nodes: [
        { id: 'input_1', type: 'input', position: { x: 50, y: 200 }, data: { label: 'Input', type: 'input' } },
        { id: 'agent_1', type: 'agent', position: { x: 350, y: 120 }, data: { label: 'Senior Reviewer', type: 'agent', model: 'llama-3.3-70b-versatile', directives: 'Review code for bugs, style, and security issues.' } },
        { id: 'agent_2', type: 'agent', position: { x: 350, y: 320 }, data: { label: 'Junior Reviewer', type: 'agent', model: 'llama-3.3-70b-versatile', directives: 'Check for common mistakes and suggest improvements.' } },
        { id: 'output_1', type: 'output', position: { x: 650, y: 200 }, data: { label: 'Output', type: 'output' } },
      ],
      edges: [
        { id: 'e1', source: 'input_1', target: 'agent_1' },
        { id: 'e2', source: 'input_1', target: 'agent_2' },
        { id: 'e3', source: 'agent_1', target: 'output_1' },
        { id: 'e4', source: 'agent_2', target: 'output_1' },
      ],
    },
  },
  {
    id: 'market-research',
    name: 'Market Research Agent',
    description: 'Automated market research and analysis',
    category: 'Research',
    owner: '',
    is_public: true,
    fork_count: 0,
    definition: {
      id: 'market-research',
      name: 'Market Research Agent',
      version: '1.0.0',
      namespace_prefix: '',
      nodes: [
        { id: 'input_1', type: 'input', position: { x: 50, y: 200 }, data: { label: 'Input', type: 'input' } },
        { id: 'agent_1', type: 'agent', position: { x: 350, y: 200 }, data: { label: 'Researcher', type: 'agent', directives: 'Research market trends and competitors.' } },
        { id: 'output_1', type: 'output', position: { x: 650, y: 200 }, data: { label: 'Output', type: 'output' } },
      ],
      edges: [
        { id: 'e1', source: 'input_1', target: 'agent_1' },
        { id: 'e2', source: 'agent_1', target: 'output_1' },
      ],
    },
  },
  {
    id: 'customer-support',
    name: 'Customer Support Bot',
    description: 'AI-powered customer support with knowledge base',
    category: 'Support',
    owner: '',
    is_public: true,
    fork_count: 0,
    definition: {
      id: 'customer-support',
      name: 'Customer Support Bot',
      version: '1.0.0',
      namespace_prefix: '',
      nodes: [
        { id: 'input_1', type: 'input', position: { x: 50, y: 200 }, data: { label: 'Input', type: 'input' } },
        { id: 'agent_1', type: 'agent', position: { x: 350, y: 120 }, data: { label: 'Support Agent', type: 'agent', directives: 'Provide helpful customer support.' } },
        { id: 'walrus_1', type: 'walrus', position: { x: 350, y: 320 }, data: { label: 'KB Storage', type: 'walrus' } },
        { id: 'output_1', type: 'output', position: { x: 650, y: 200 }, data: { label: 'Output', type: 'output' } },
      ],
      edges: [
        { id: 'e1', source: 'input_1', target: 'agent_1' },
        { id: 'e2', source: 'walrus_1', target: 'agent_1' },
        { id: 'e3', source: 'agent_1', target: 'output_1' },
      ],
    },
  },
  {
    id: 'defi-trading',
    name: 'DeFi Trading Agent',
    description: 'Automated DeFi trading and analysis',
    category: 'DeFi',
    owner: '',
    is_public: true,
    fork_count: 0,
    definition: {
      id: 'defi-trading',
      name: 'DeFi Trading Agent',
      version: '1.0.0',
      namespace_prefix: '',
      nodes: [
        { id: 'input_1', type: 'input', position: { x: 50, y: 200 }, data: { label: 'Input', type: 'input' } },
        { id: 'sui_1', type: 'sui', position: { x: 50, y: 350 }, data: { label: 'Price Feed', type: 'sui' } },
        { id: 'agent_1', type: 'agent', position: { x: 350, y: 200 }, data: { label: 'Trading Agent', type: 'agent', directives: 'You are an automated DeFi trading agent. You have access to DeepBook, Cetus, Aftermath, and other DeFi protocols. Analyze market data using the Sui Query tool, then build and simulate trades using the available DeFi tools. Always explain your analysis before executing any trade.' } },
      ],
      edges: [
        { id: 'e1', source: 'input_1', target: 'agent_1' },
        { id: 'e2', source: 'sui_1', target: 'agent_1' },
        { id: 'e3', source: 'agent_1', target: 'output_1' },
      ],
    },
  },
  {
    id: 'deepbook-trading',
    name: 'DeepBook DEX Trader',
    description: 'Execute token swaps and limit orders using DeepBook order-book DEX',
    category: 'DeFi',
    owner: '',
    is_public: true,
    fork_count: 0,
    definition: {
      id: 'deepbook-trading',
      name: 'DeepBook DEX Trader',
      version: '1.0.0',
      namespace_prefix: '',
      nodes: [
        { id: 'input_1', type: 'input', position: { x: 50, y: 200 }, data: { label: 'Trade Input', type: 'input' } },
        { id: 'sui_1', type: 'sui', position: { x: 50, y: 360 }, data: { label: 'Price Feed', type: 'sui' } },
        { id: 'agent_1', type: 'agent', position: { x: 350, y: 200 }, data: { label: 'DeepBook Trader', type: 'agent', directives: 'You are a DeepBook DEX trading agent. You can use the defi-deepbook-trade tool to execute swaps, limit orders, and cancel orders on DeepBook, and the defi-deepbook-lend tool for lending operations. First check the pool info using sui_query, then execute the requested trade. Only simulate trades unless user explicitly asks for live execution.' } },
        { id: 'output_1', type: 'output', position: { x: 650, y: 200 }, data: { label: 'Trade Result', type: 'output' } },
      ],
      edges: [
        { id: 'e1', source: 'input_1', target: 'agent_1' },
        { id: 'e2', source: 'sui_1', target: 'agent_1' },
        { id: 'e3', source: 'agent_1', target: 'output_1' },
      ],
    },
  },
];

export async function initializePlatform(): Promise<void> {
  for (const tmpl of BUILTIN_TEMPLATES) {
    try {
      await db.saveTemplate(tmpl);
    } catch (e: any) {
      console.warn(`[init] Failed to seed template '${tmpl.id}': ${e.message}`);
    }
  }
  console.log(`[init] ${BUILTIN_TEMPLATES.length} templates seeded`);

  if (!platformDelegateKey) {
    console.warn('[init] SERVER_SUI_PRIVATE_KEY not set, skipping platform init');
    return;
  }

  if (!platformAccountId) {
    console.warn('[init] MEMWAL_PLATFORM_ACCOUNT_ID not found, skipping platform init');
    return;
  }

  console.log('[init] Initializing shared pool namespaces...');

  let initialized = 0;
  for (const pool of REQUIRED_POOLS) {
    try {
      await memoryRouter.saveArtifacts(
        { read: [], write: [pool] },
        `System initialized: Shared pool [${pool}] is now active.`,
        { accountId: platformAccountId, delegateKey: platformDelegateKey } as any
      );
      initialized++;
    } catch (e: any) {
      console.warn(`[init] Could not initialize [${pool}]: ${e.message}`);
    }
  }

  console.log(`[init] ${initialized}/${REQUIRED_POOLS.length} pool namespaces active`);
}
