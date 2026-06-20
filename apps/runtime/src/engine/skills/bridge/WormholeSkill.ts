import { SkillDefinition, SkillResult, SkillParams, ExecutionContext } from '../SkillDefinition.js';
import { skillRegistry } from '../SkillRegistry.js';
import { wormholeService } from '../../services/bridge/WormholeService.js';

export const wormholeSkill: SkillDefinition = {
  id: 'wormhole',
  name: 'Wormhole Bridge',
  description: 'Cross-chain token transfers (30+ chains)',
  category: 'defi',
  subcategory: 'transfer',
  protocols: ['wormhole'],
  requiredTools: ['sui-tx'],
  requiredServices: ['sui-rpc'],
  requiresFunds: true,
  inputSchema: {
    type: 'object',
    properties: {
      action: { type: 'string', enum: ['transfer', 'get_vaa', 'list_chains'], description: 'Action to perform' },
      tokenType: { type: 'string', description: 'Token type to bridge' },
      amount: { type: 'string', description: 'Amount to transfer' },
      targetChain: { type: 'number', description: 'Wormhole chain ID' },
      targetAddress: { type: 'string', description: 'Destination address on target chain' },
    },
    required: ['action'],
  },
  async execute(params: SkillParams, context: ExecutionContext): Promise<SkillResult> {
    try {
      const { action, tokenType, amount, targetChain, targetAddress } = params;

      if (action === 'list_chains') {
        return { success: true, data: { chains: wormholeService.KNOWN_CHAINS } };
      }

      if (action === 'get_vaa') {
        const vaa = await wormholeService.getVAA({
          emitterChain: targetChain || 2,
          emitterAddress: targetAddress || '',
          sequence: amount || '1',
        });
        return { success: true, data: vaa };
      }

      if (action === 'transfer') {
        const tx = wormholeService.buildTransferTx({
          tokenType: tokenType || '0x2::sui::SUI',
          amount: amount || '1000000000',
          targetChain: targetChain || 2,
          targetAddress: targetAddress || context.agentWallet.address,
          walletAddress: context.agentWallet.address,
        });
        return {
          success: true,
          data: { protocol: 'wormhole', action: 'transfer', targetChain, amount, transaction: tx.serialize() },
        };
      }

      return { success: false, error: `Unknown action: ${action}` };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};

skillRegistry.register(wormholeSkill);
