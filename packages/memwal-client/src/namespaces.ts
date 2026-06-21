export interface UserContext {
  userId: string;
  runId?: string;
}

function normalizeContext(ctx: Record<string, any>): Record<string, string> {
  const normalized: Record<string, string> = {};
  for (const key of Object.keys(ctx)) {
    normalized[key] = String(ctx[key]);
  }
  if (ctx.accountId && !ctx.userId) normalized.userId = ctx.accountId;
  if (normalized.runId === undefined) normalized.runId = (ctx.runId || Date.now().toString());
  if (ctx.agentWallet) normalized.wallet = ctx.agentWallet;
  return normalized;
}

/**
 * Standardized namespace builders.
 * Never build namespace strings ad-hoc. Always go through here.
 */
export const ns = {
  pool: (domain: string) => `pool::${domain}`,

  private: (userId: string, path: string) => `private::${userId}::${path}`,

  session: (userId: string, runId: string) => `private::${userId}::session::${runId}`,

  workspace: (teamId: string, project: string) => `workspace::${teamId}::${project}`,

  /**
   * Resolves a dynamic namespace template based on the user's current context.
   */
  resolve: (namespaceStr: string, ctx: UserContext) => {
    const normalized = normalizeContext(ctx as any);
    return namespaceStr
      .replace('{userId}', normalized.userId)
      .replace('{runId}', normalized.runId || 'default_run');
  }
};
