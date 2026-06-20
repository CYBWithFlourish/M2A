import { SkillDefinition, SkillResult, SkillParams, ExecutionContext } from './SkillDefinition.js';
import { skillRegistry } from './SkillRegistry.js';
import { pythService } from '../services/PythService.js';

export const pythSkill: SkillDefinition = {
  id: 'pyth',
  name: 'Pyth Oracle',
  description: 'Real-time price feeds from Pyth Network',
  category: 'data',
  subcategory: 'query',
  protocols: ['pyth'],
  requiredTools: ['sui-rpc'],
  requiredServices: ['pyth'],
  requiresFunds: false,
  inputSchema: {
    type: 'object',
    properties: {
      action: { type: 'string', enum: ['get_price', 'get_ema', 'list_feeds'], description: 'Action to perform' },
      priceFeedId: { type: 'string', description: 'Pyth price feed ID' },
    },
    required: ['action'],
  },
  async execute(params: SkillParams, context: ExecutionContext): Promise<SkillResult> {
    try {
      const { action, priceFeedId } = params;

      if (action === 'list_feeds') {
        return { success: true, data: { protocol: 'pyth', action: 'list_feeds', feeds: pythService.KNOWN_FEEDS } };
      }

      if (action === 'get_price') {
        if (!priceFeedId) {
          return { success: false, error: 'priceFeedId required' };
        }
        const price = await pythService.getPrice({ priceFeedId });
        return { success: true, data: { protocol: 'pyth', action: 'get_price', ...price } };
      }

      if (action === 'get_ema') {
        if (!priceFeedId) {
          return { success: false, error: 'priceFeedId required' };
        }
        const ema = await pythService.getEMA({ priceFeedId });
        return { success: true, data: { protocol: 'pyth', action: 'get_ema', ...ema } };
      }

      return { success: false, error: `Unknown action: ${action}` };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};

skillRegistry.register(pythSkill);
