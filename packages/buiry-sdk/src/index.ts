import { createPoolClient, createUserClient, MemoryRouter as CoreMemoryRouter, ns, UserContext } from '@m2a/client';
import type { RecallMemory } from '@m2a/sdk';

export interface BuiryConfig {
  workspaceId: string;
  agentId: string;
  relayerUrl?: string;
  platformAccountId?: string;
  delegateKey?: string;
  accountId?: string;
  memoryRouter?: CoreMemoryRouter;
}

export interface RememberOptions {
  namespace?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface RecallOptions {
  namespace?: string;
  limit?: number;
  minDistance?: number;
}

export class Buiry {
  private config: BuiryConfig;
  private poolClient?: any;
  private userClient?: any;
  private router?: CoreMemoryRouter;
  private initialized = false;

  constructor(config: BuiryConfig) {
    this.config = {
      relayerUrl: 'http://localhost:8000',
      ...config,
    };
  }

  async init(context?: { delegateKey: string; accountId: string }): Promise<void> {
    if (this.initialized) return;

    if (this.config.memoryRouter) {
      this.router = this.config.memoryRouter;
    } else {
      if (this.config.platformAccountId && this.config.delegateKey) {
        this.poolClient = createPoolClient({
          relayerUrl: this.config.relayerUrl!,
          platformAccountId: this.config.platformAccountId,
          platformDelegateKey: this.config.delegateKey,
        });
      }

      this.router = new CoreMemoryRouter(
        this.poolClient,
        (dk: string, aid: string) =>
          createUserClient({
            relayerUrl: this.config.relayerUrl!,
            userDelegateKey: dk,
            userAccountId: aid,
          })
      );
    }

    if (context) {
      this.userClient = createUserClient({
        relayerUrl: this.config.relayerUrl!,
        userDelegateKey: context.delegateKey,
        userAccountId: context.accountId,
      });
    }

    this.initialized = true;
  }

  async remember(text: string, options?: RememberOptions): Promise<void> {
    if (!this.initialized || !this.router) throw new Error('Buiry not initialized. Call init() first.');

    const namespace = options?.namespace || ns.private(
      this.config.workspaceId,
      `agent::${this.config.agentId}`
    );

    const pseudoNode = {
      type: 'agent' as const,
      memory_tier: { read: [], write: [namespace] },
    };

    const userContext: any = {
      userId: this.config.workspaceId,
      delegateKey: this.config.delegateKey || '',
      accountId: this.config.accountId || '',
    };

    await this.router.rememberFromNode(pseudoNode as any, text, userContext);
  }

  async recall(query: string, options?: RecallOptions): Promise<RecallMemory[]> {
    if (!this.initialized || !this.router) throw new Error('Buiry not initialized. Call init() first.');

    const namespace = options?.namespace || ns.private(
      this.config.workspaceId,
      `agent::${this.config.agentId}`
    );

    const pseudoNode = {
      type: 'agent' as const,
      memory_tier: {
        read: [namespace],
        write: [],
      },
    };

    const userContext: UserContext & { delegateKey: string; accountId: string } = {
      userId: this.config.workspaceId,
      delegateKey: this.config.delegateKey || '',
      accountId: this.config.accountId || '',
    };

    const results = await this.router.recallForNode(pseudoNode as any, query, userContext);

    if (options?.limit) return results.slice(0, options.limit);
    return results;
  }

  async forget(memoryId: string): Promise<void> {
    console.warn('[Buiry] forget() is not yet supported by the MemWal backend');
  }
}

export { CoreMemoryRouter as MemoryRouter, ns, createPoolClient, createUserClient };
export type { UserContext, RecallMemory };
export { BuiryMemory, type BuiryMemoryConfig } from './langchain.js';
