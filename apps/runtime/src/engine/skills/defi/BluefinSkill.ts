import { Transaction } from '@mysten/sui/transactions';
import { SkillDefinition, SkillResult, SkillParams, ExecutionContext } from '../SkillDefinition.js';
import { skillRegistry } from '../SkillRegistry.js';
import { bluefinService } from '../../services/defi/BluefinService.js';

export const bluefinSkill: SkillDefinition = {
  id: 'bluefin',
  name: 'Bluefin Perpetuals',
  description: 'Open and close leveraged perpetual positions on Bluefin',
  category: 'defi',
  subcategory: 'trading',
  protocols: ['bluefin'],
  requiredTools: ['sui-tx'],
  requiredServices: ['sui-rpc'],
  requiresFunds: true,
  inputSchema: {
    type: 'object',
    properties: {
      action: { type: 'string', enum: ['open_position', 'close_position', 'markets'], description: 'Action to perform' },
      market: { type: 'string', description: 'Market symbol (e.g. SUI-PERP)' },
      side: { type: 'string', enum: ['long', 'short'], description: 'Position side' },
      marginAmount: { type: 'string', description: 'Margin amount in MIST' },
      leverage: { type: 'number', description: 'Leverage multiplier' },
      positionId: { type: 'string', description: 'Position object ID to close' },
    },
    required: ['action'],
  },
  async execute(params: SkillParams, context: ExecutionContext): Promise<SkillResult> {
    try {
      const { action, market, side, marginAmount, leverage, positionId } = params;

      if (action === 'markets') {
        const markets = await bluefinService.getMarkets();
        return { success: true, data: { protocol: 'bluefin', action: 'markets', ...markets } };
      }

      if (action === 'open_position') {
        if (!market || !side || !marginAmount || !leverage) {
          return { success: false, error: 'market, side, marginAmount, and leverage required' };
        }
        const tx = bluefinService.buildOpenPositionTx({
          market, side, marginAmount, leverage, walletAddress: context.agentWallet.address,
        });
        return {
          success: true,
          data: { protocol: 'bluefin', action: 'open_position', market, side, marginAmount, leverage, transaction: tx.serialize() },
        };
      }

      if (action === 'close_position') {
        if (!positionId) {
          return { success: false, error: 'positionId required' };
        }
        const tx = bluefinService.buildClosePositionTx({
          positionId, walletAddress: context.agentWallet.address,
        });
        return {
          success: true,
          data: { protocol: 'bluefin', action: 'close_position', positionId, transaction: tx.serialize() },
        };
      }

      return { success: false, error: `Unknown action: ${action}` };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};

skillRegistry.register(bluefinSkill);
