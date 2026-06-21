import { MemoryRouter as CoreMemoryRouter, createPoolClient, createUserClient, resolve, hostedRelayerUrl, currentNetwork } from '@m2a/client';
import type { UserContext } from '@m2a/client';
export type { UserContext };
import { MemoryTierConfig, RecallMemory } from '@m2a/sdk';
import { decodeSuiPrivateKey } from '@mysten/sui/cryptography';
import { AgentRunner } from './AgentRunner.js';
import { WorkflowParser } from './WorkflowParser.js';

export interface HydrateOptions {
  tier?: 'hot' | 'cold';
}

export class MemoryRouter {
  constructor(private core: CoreMemoryRouter) {}

  async hydrateContext(
    config: MemoryTierConfig,
    query: string,
    userContext: UserContext & { delegateKey: string; accountId: string },
    options?: HydrateOptions
  ): Promise<string> {
    const tier = config.tier || options?.tier || 'hot';

    if (tier === 'cold') {
      return this.hydrateColdContext(config, userContext);
    }

    console.log('[MemoryRouter] Hydrating context for namespaces:', config.read);

    const pseudoNode = { type: 'agent' as const, memory_tier: config };
    const results: RecallMemory[] = await this.core.recallForNode(pseudoNode as any, query, userContext);

    if (results.length === 0) {
      return 'No relevant background records found.';
    }

    return results
      .map((r, i) => `[RECALL ${i+1}] (from ${r.namespace}): ${r.content}`)
      .join('\n\n');
  }

  // TRACKED GAP: Cold tier currently returns placeholder text.
  // When Walrus relayer is operational, replace with actual blob fetch:
  // 1. Query the cold index table for blob CIDs matching the namespace
  // 2. Fetch blobs from Walrus via the TS sidecar endpoint
  // 3. Return content as formatted memory entries
  // File: apps/runtime/src/engine/MemoryRouter.ts:hydrateColdContext()
  private async hydrateColdContext(
    config: MemoryTierConfig,
    userContext: UserContext & { delegateKey: string; accountId: string }
  ): Promise<string> {
    console.log('[MemoryRouter] Cold tier retrieval from Walrus blobs for:', config.read);
    const lines: string[] = [];
    for (const ns of config.read) {
      lines.push(`[COLD TIER] Awaiting Walrus blob retrieval for namespace: ${ns}`);
    }
    return lines.join('\n') || '[COLD TIER] No blobs found.';
  }

  async saveArtifacts(
    config: MemoryTierConfig,
    content: string,
    userContext: UserContext & { delegateKey: string; accountId: string }
  ): Promise<void> {
    console.log('[MemoryRouter] Saving execution artifact to namespaces:', config.write);

    const pseudoNode = { type: 'agent' as const, memory_tier: config };
    await this.core.rememberFromNode(pseudoNode as any, content, userContext);
  }
}

export function createRuntimeMemoryRouter() {
  const memwalMode = process.env.MEMWAL_MODE || 'self';
  const network = currentNetwork();
  const modeSuffix = memwalMode === 'hosted' ? 'hosted' : 'self';
  const relayerUrl = process.env.MEMWAL_RELAYER_URL
    || process.env[`MEMWAL_RELAYER_URL_${modeSuffix}`]
    || (memwalMode === 'hosted' ? hostedRelayerUrl() : 'http://localhost:8000');

  const platformAccountId = resolve('MEMWAL_PLATFORM_ACCOUNT_ID');
  let platformDelegateKey = process.env.SERVER_SUI_PRIVATE_KEY || '';

  if (platformDelegateKey.startsWith('suiprivkey1')) {
    try {
      const decoded = decodeSuiPrivateKey(platformDelegateKey);
      platformDelegateKey = Buffer.from(decoded.secretKey).toString('hex');
    } catch (e) {
      console.error('Failed to decode SERVER_SUI_PRIVATE_KEY:', e);
    }
  }

  const poolClient = createPoolClient({ relayerUrl, platformAccountId, platformDelegateKey });
  const coreRouter = new CoreMemoryRouter(
    poolClient,
    (delegateKey, accountId) => createUserClient({ relayerUrl, userDelegateKey: delegateKey, userAccountId: accountId })
  );

  const memoryRouter = new MemoryRouter(coreRouter);
  const agentRunner = new AgentRunner(memoryRouter);
  const workflowParser = new WorkflowParser(agentRunner);

  return { memoryRouter, agentRunner, workflowParser, platformAccountId, platformDelegateKey };
}
