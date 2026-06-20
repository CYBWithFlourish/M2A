import { Transaction } from '@mysten/sui/transactions';
import { SkillDefinition, SkillResult, SkillParams, ExecutionContext } from '../SkillDefinition.js';
import { skillRegistry } from '../SkillRegistry.js';
import { createSuiClient, naviPackageId, SUI_CLOCK } from '../../../config.js';

const client = createSuiClient();

const NAVI_ACTIONS = ['supply', 'borrow', 'repay', 'getPosition'] as const;

export const naviSkill: SkillDefinition = {
  id: 'navi-lending',
  name: 'Navi Lending',
  description: 'Supply, borrow, and manage positions on Navi lending protocol',
  category: 'defi',
  subcategory: 'lending',
  protocols: ['navi'],
  requiredTools: ['sui-tx'],
  requiredServices: ['navi', 'sui-rpc'],
  requiresFunds: true,
  inputSchema: {
    type: 'object',
    properties: {
      action: { type: 'string', enum: NAVI_ACTIONS, description: 'Lending action' },
      assetType: { type: 'string', description: 'Coin type (e.g., 0x2::sui::SUI)' },
      amount: { type: 'string', description: 'Amount in MIST (as string for precision)' },
    },
    required: ['action', 'assetType', 'amount'],
  },
  async execute(params: SkillParams, context: ExecutionContext): Promise<SkillResult> {
    try {
      const { action, assetType, amount } = params;

      if (!NAVI_ACTIONS.includes(action as typeof NAVI_ACTIONS[number])) {
        return { success: false, error: `Unknown action: ${action}` };
      }

      const amountVal = BigInt(amount);

      if (action === 'getPosition') {
        const tx = new Transaction();
        tx.moveCall({
          target: `${naviPackageId()}::lending::get_position`,
          arguments: [tx.pure.address(context.agentWallet.address)],
          typeArguments: [],
        });
        const result = await client.simulateTransaction({
          transaction: tx,
          include: { commandResults: true },
        });
        return {
          success: true,
          data: {
            action: 'getPosition',
            walletAddress: context.agentWallet.address,
            position: result.commandResults?.[0]?.returnValues || {},
          },
        };
      }

      const tx = new Transaction();

      if (action === 'supply' || action === 'repay') {
        const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(amountVal)]);
        tx.moveCall({
          target: `${naviPackageId()}::lending::${action}`,
          arguments: [coin, tx.object(SUI_CLOCK)],
          typeArguments: [assetType],
        });
      } else if (action === 'borrow') {
        tx.moveCall({
          target: `${naviPackageId()}::lending::borrow`,
          arguments: [tx.pure.u64(amountVal), tx.object(SUI_CLOCK)],
          typeArguments: [assetType],
        });
      }

      tx.setSender(context.agentWallet.address);
      const txBytes = await tx.build({ client });
      const result = await client.simulateTransaction({
        transaction: txBytes,
        include: { effects: true, balanceChanges: true },
      });

      if (result.$kind !== 'Transaction') {
        return { success: false, error: 'Transaction simulation failed', data: { digest: result.FailedTransaction?.digest } };
      }

      const txResult = result.Transaction;
      const success = txResult.status.success === true;

      return {
        success,
        data: {
          action,
          assetType,
          amount: amountVal.toString(),
          txDigest: txResult.digest,
          transaction: tx.serialize(),
          balanceChanges: txResult.balanceChanges ?? [],
        },
        error: success ? undefined : (txResult.status.error?.message ?? `${action} failed`),
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};

skillRegistry.register(naviSkill);
