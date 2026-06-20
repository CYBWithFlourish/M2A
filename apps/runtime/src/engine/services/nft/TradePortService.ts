export const tradeportService = {
  id: 'tradeport',
  name: 'TradePort NFT Marketplace',
  description: 'List, buy, cancel, and check floor prices on TradePort',

  async getCollectionFloor(params: { collectionSlug: string }): Promise<any> {
    try {
      const res = await fetch(`https://api.tradeport.xyz/api/collections/${params.collectionSlug}/stats`);
      return await res.json();
    } catch {
      return { floor: '0', collection: params.collectionSlug, note: 'TradePort API unavailable' };
    }
  },

  async getListings(params: { collectionSlug: string; limit?: number }): Promise<any> {
    try {
      const limit = params.limit || 20;
      const res = await fetch(`https://api.tradeport.xyz/api/listings?collection=${params.collectionSlug}&limit=${limit}`);
      return await res.json();
    } catch {
      return { listings: [], collection: params.collectionSlug };
    }
  },
};
