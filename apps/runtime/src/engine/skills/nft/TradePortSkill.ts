import { SkillDefinition, SkillResult, SkillParams, ExecutionContext } from '../SkillDefinition.js';
import { skillRegistry } from '../SkillRegistry.js';
import { tradeportService } from '../../services/nft/TradePortService.js';

export const tradePortSkill: SkillDefinition = {
  id: 'tradeport',
  name: 'TradePort NFT Marketplace',
  description: 'Check floor prices and listings on TradePort',
  category: 'nft',
  subcategory: 'query',
  protocols: ['tradeport'],
  requiredTools: [],
  requiredServices: ['tradeport'],
  requiresFunds: false,
  inputSchema: {
    type: 'object',
    properties: {
      action: { type: 'string', enum: ['get_floor', 'get_listings'], description: 'Action to perform' },
      collectionSlug: { type: 'string', description: 'Collection slug (e.g. suifrens)' },
      limit: { type: 'number', description: 'Max listings to fetch' },
    },
    required: ['action', 'collectionSlug'],
  },
  async execute(params: SkillParams, context: ExecutionContext): Promise<SkillResult> {
    try {
      const { action, collectionSlug, limit } = params;

      if (action === 'get_floor') {
        if (!collectionSlug) {
          return { success: false, error: 'collectionSlug required' };
        }
        const floor = await tradeportService.getCollectionFloor({ collectionSlug });
        return { success: true, data: { protocol: 'tradeport', action: 'get_floor', ...floor } };
      }

      if (action === 'get_listings') {
        if (!collectionSlug) {
          return { success: false, error: 'collectionSlug required' };
        }
        const listings = await tradeportService.getListings({ collectionSlug, limit });
        return { success: true, data: { protocol: 'tradeport', action: 'get_listings', ...listings } };
      }

      return { success: false, error: `Unknown action: ${action}` };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};

skillRegistry.register(tradePortSkill);
