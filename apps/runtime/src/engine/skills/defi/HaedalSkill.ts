import { SkillDefinition, SkillResult, SkillParams, ExecutionContext } from '../SkillDefinition.js';
import { skillRegistry } from '../SkillRegistry.js';
import { haedalService } from '../../services/defi/HaedalService.js';

export const haedalSkill: SkillDefinition = {
  id: 'haedal',
  name: 'Haedal Staking',
  description: 'Stake SUI and receive haSUI liquid staking tokens',
  category: 'defi',
  subcategory: 'yield',
  protocols: ['haedal'],
  requiredTools: ['sui-tx'],
  requiredServices: ['sui-rpc'],
  requiresFunds: true,
  inputSchema: {
    type: 'object',
    properties: {
      action: { type: 'string', enum: ['stake', 'unstake', 'info'], description: 'Action to perform' },
      amount: { type: 'string', description: 'Amount (in SUI for stake, haSUI for unstake)' },
    },
    required: ['action'],
  },
  async execute(params: SkillParams, context: ExecutionContext): Promise<SkillResult> {
    try {
      const { action, amount } = params;

      if (action === 'info') {
        const info = await haedalService.getStakingInfo();
        return { success: true, data: { protocol: 'haedal', action: 'info', ...info } };
      }

      if (action === 'stake') {
        const amountSui = amount || '1';
        const amountMist = (BigInt(Math.floor(parseFloat(amountSui) * 1_000_000_000))).toString();
        const tx = haedalService.buildStakeTx({ amountMist, walletAddress: context.agentWallet.address });
        return {
          success: true,
          data: { protocol: 'haedal', action: 'stake', amount: `${amountSui} SUI`, transaction: tx.serialize() },
        };
      }

      if (action === 'unstake') {
        const amountHaSui = amount || '1';
        const tx = haedalService.buildUnstakeTx({ haSuiAmount: amountHaSui, walletAddress: context.agentWallet.address });
        return {
          success: true,
          data: { protocol: 'haedal', action: 'unstake', amount: `${amountHaSui} haSUI`, transaction: tx.serialize() },
        };
      }

      return { success: false, error: `Unknown action: ${action}` };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};

skillRegistry.register(haedalSkill);
