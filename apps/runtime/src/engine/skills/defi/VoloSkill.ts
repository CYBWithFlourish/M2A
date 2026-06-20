import { SkillDefinition, SkillResult, SkillParams, ExecutionContext } from '../SkillDefinition.js';
import { skillRegistry } from '../SkillRegistry.js';
import { voloService } from '../../services/defi/VoloService.js';

export const voloSkill: SkillDefinition = {
  id: 'volo',
  name: 'Volo Staking',
  description: 'Stake SUI and receive vSUI liquid staking tokens',
  category: 'defi',
  subcategory: 'yield',
  protocols: ['volo'],
  requiredTools: ['sui-tx'],
  requiredServices: ['sui-rpc'],
  requiresFunds: true,
  inputSchema: {
    type: 'object',
    properties: {
      action: { type: 'string', enum: ['stake', 'unstake', 'apr'], description: 'Action to perform' },
      amount: { type: 'string', description: 'Amount (in SUI for stake, vSUI for unstake)' },
    },
    required: ['action'],
  },
  async execute(params: SkillParams, context: ExecutionContext): Promise<SkillResult> {
    try {
      const { action, amount } = params;

      if (action === 'apr') {
        const apr = await voloService.getAPR();
        return { success: true, data: { protocol: 'volo', action: 'apr', ...apr } };
      }

      if (action === 'stake') {
        const amountSui = amount || '1';
        const amountMist = (BigInt(Math.floor(parseFloat(amountSui) * 1_000_000_000))).toString();
        const tx = voloService.buildStakeTx({ amountMist, walletAddress: context.agentWallet.address });
        return {
          success: true,
          data: { protocol: 'volo', action: 'stake', amount: `${amountSui} SUI`, transaction: tx.serialize() },
        };
      }

      if (action === 'unstake') {
        const amountVSui = amount || '1';
        const tx = voloService.buildUnstakeTx({ vSuiAmount: amountVSui, walletAddress: context.agentWallet.address });
        return {
          success: true,
          data: { protocol: 'volo', action: 'unstake', amount: `${amountVSui} vSUI`, transaction: tx.serialize() },
        };
      }

      return { success: false, error: `Unknown action: ${action}` };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};

skillRegistry.register(voloSkill);
