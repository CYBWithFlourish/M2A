import { SkillDefinition, SkillResult, SkillParams, ExecutionContext } from './SkillDefinition.js';
import { skillRegistry } from './SkillRegistry.js';
import { switchboardService } from '../services/SwitchboardService.js';

export const switchboardSkill: SkillDefinition = {
  id: 'switchboard',
  name: 'Switchboard Oracle',
  description: 'On-demand price feeds and data from Switchboard',
  category: 'data',
  subcategory: 'query',
  protocols: ['switchboard'],
  requiredTools: ['sui-rpc'],
  requiredServices: ['switchboard'],
  requiresFunds: false,
  inputSchema: {
    type: 'object',
    properties: {
      action: { type: 'string', enum: ['get_feed', 'request_update'], description: 'Action to perform' },
      feedAddress: { type: 'string', description: 'Switchboard feed object address' },
    },
    required: ['action'],
  },
  async execute(params: SkillParams, context: ExecutionContext): Promise<SkillResult> {
    try {
      const { action, feedAddress } = params;

      if (action === 'get_feed') {
        if (!feedAddress) {
          return { success: false, error: 'feedAddress required' };
        }
        const feed = await switchboardService.getFeed({ feedAddress });
        return { success: true, data: { protocol: 'switchboard', action: 'get_feed', ...feed } };
      }

      if (action === 'request_update') {
        if (!feedAddress) {
          return { success: false, error: 'feedAddress required' };
        }
        const result = await switchboardService.requestUpdate({
          feedAddress, walletAddress: context.agentWallet.address,
        });
        return { success: true, data: { protocol: 'switchboard', action: 'request_update', ...result } };
      }

      return { success: false, error: `Unknown action: ${action}` };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};

skillRegistry.register(switchboardSkill);
