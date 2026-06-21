import { M2ATool, toolRegistry } from '../ToolRegistry.js';

const SEARCH_PROVIDER = process.env.SEARCH_PROVIDER || 'duckduckgo';

export const webSearchTool: M2ATool = {
  name: 'web_search',
  description: 'Search the web for current information. Supports DuckDuckGo (default, no key needed), Tavily, and SerpAPI.',
  parameters: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'Search query' },
      maxResults: { type: 'number', description: 'Maximum results to return (default 5)' },
      provider: { type: 'string', description: 'Override default search provider' },
    },
    required: ['query'],
  },
  execute: async ({ query, maxResults = 5, provider }) => {
    const activeProvider = provider || SEARCH_PROVIDER;
    try {
      switch (activeProvider) {
        case 'tavily':
          return await tavilySearch(query, maxResults);
        case 'serpapi':
          return await serpApiSearch(query, maxResults);
        case 'duckduckgo':
        default:
          return await duckDuckGoSearch(query, maxResults);
      }
    } catch (error) {
      return { error: `Search failed: ${error instanceof Error ? error.message : 'unknown error'}`, results: [] };
    }
  },
};

async function duckDuckGoSearch(query: string, maxResults: number) {
  const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
  const res = await fetch(url);
  const data = await res.json();

  const results: Array<{ title: string; snippet: string; url: string }> = [];

  if (data.AbstractText) {
    results.push({
      title: data.Heading || 'Answer',
      snippet: data.AbstractText,
      url: data.AbstractURL || '',
    });
  }

  if (data.RelatedTopics) {
    for (const topic of data.RelatedTopics.slice(0, maxResults)) {
      if (topic.Text) {
        results.push({
          title: topic.Text.split(' - ')[0] || topic.FirstURL || '',
          snippet: topic.Text,
          url: topic.FirstURL || '',
        });
      }
    }
  }

  return { results, provider: 'duckduckgo', total: results.length };
}

async function tavilySearch(query: string, maxResults: number) {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) throw new Error('TAVILY_API_KEY not set');

  const res = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: apiKey, query, max_results: maxResults }),
  });
  const data = await res.json();

  return {
    results: (data.results || []).map((r: any) => ({
      title: r.title,
      snippet: r.content || r.snippet,
      url: r.url,
    })),
    provider: 'tavily',
    total: data.results?.length || 0,
  };
}

async function serpApiSearch(query: string, maxResults: number) {
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) throw new Error('SERPAPI_API_KEY not set');

  const res = await fetch(`https://serpapi.com/search?q=${encodeURIComponent(query)}&api_key=${apiKey}&engine=google&num=${maxResults}`);
  const data = await res.json();

  return {
    results: (data.organic_results || []).map((r: any) => ({
      title: r.title,
      snippet: r.snippet,
      url: r.link,
    })),
    provider: 'serpapi',
    total: data.organic_results?.length || 0,
  };
}

toolRegistry.registerTool(webSearchTool);
