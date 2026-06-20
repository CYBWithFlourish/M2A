import { SkillDefinition, SkillResult, SkillParams, ExecutionContext } from '../SkillDefinition.js';
import { skillRegistry } from '../SkillRegistry.js';
import { bucketService } from '../../services/defi/BucketService.js';

export const bucketSkill: SkillDefinition = {
  id: 'bucket',
  name: 'Bucket Protocol',
  description: 'Mint and redeem $BUCK stablecoin on Bucket Protocol',
  category: 'defi',
  subcategory: 'lending',
  protocols: ['bucket'],
  requiredTools: ['sui-tx'],
  requiredServices: ['sui-rpc'],
  requiresFunds: true,
  inputSchema: {
    type: 'object',
    properties: {
      action: { type: 'string', enum: ['mint', 'redeem', 'ratio'], description: 'Action to perform' },
      amount: { type: 'string', description: 'Amount (in SUI for mint, $BUCK for redeem)' },
    },
    required: ['action'],
  },
  async execute(params: SkillParams, context: ExecutionContext): Promise<SkillResult> {
    try {
      const { action, amount } = params;

      if (action === 'ratio') {
        const ratio = await bucketService.getCollateralRatio();
        return { success: true, data: { protocol: 'bucket', action: 'ratio', ...ratio } };
      }

      if (action === 'mint') {
        const collateralSui = amount || '1';
        const collateralMist = (BigInt(Math.floor(parseFloat(collateralSui) * 1_000_000_000))).toString();
        const tx = bucketService.buildMintTx({ collateralAmount: collateralMist, walletAddress: context.agentWallet.address });
        return {
          success: true,
          data: { protocol: 'bucket', action: 'mint', collateral: `${collateralSui} SUI`, transaction: tx.serialize() },
        };
      }

      if (action === 'redeem') {
        const buckAmount = amount || '1';
        const tx = bucketService.buildRedeemTx({ buckAmount, walletAddress: context.agentWallet.address });
        return {
          success: true,
          data: { protocol: 'bucket', action: 'redeem', amount: `${buckAmount} BUCK`, transaction: tx.serialize() },
        };
      }

      return { success: false, error: `Unknown action: ${action}` };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};

skillRegistry.register(bucketSkill);
