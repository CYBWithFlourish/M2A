import { MemoryRouter as CoreMemoryRouter, UserContext } from '@m2a/client';
import { MemoryTierConfig, RecallMemory } from '@m2a/sdk';

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

