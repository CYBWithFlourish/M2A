import { M2ATool, toolRegistry } from '../ToolRegistry.js';

const MEMWAL_RELAYER_URL = process.env.MEMWAL_RELAYER_URL || 'http://localhost:8000';

export const semanticSearchTool: M2ATool = {
  name: 'semantic_search',
  description: 'Search agent memory pools using semantic similarity',
  parameters: {
    type: 'object',
    properties: {
      poolName: { type: 'string', description: 'Memory pool to search' },
      query: { type: 'string', description: 'Search query' },
      limit: { type: 'number', description: 'Max results (default 5)' },
    },
    required: ['poolName', 'query'],
  },
  execute: async ({ poolName, query, limit = 5 }) => {
    try {
      const res = await fetch(`${MEMWAL_RELAYER_URL}/v1/pools/${encodeURIComponent(poolName)}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, limit }),
      });
      if (!res.ok) throw new Error(`MemWal relayer returned ${res.status}`);
      const data = await res.json();
      return { results: data.results || data, provider: 'memwal' };
    } catch (error) {
      console.error('[SemanticSearch] Failed:', error);
      return { error: error instanceof Error ? error.message : 'Search failed', results: [] };
    }
  },
};

toolRegistry.registerTool(semanticSearchTool);
