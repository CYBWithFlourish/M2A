import { Transaction } from '@mysten/sui/transactions';
import { SkillDefinition, SkillResult, SkillParams, ExecutionContext } from '../SkillDefinition.js';
import { skillRegistry } from '../SkillRegistry.js';
import { createSuiClient, aftermathPackageId, SUI_CLOCK } from '../../../config.js';

const client = createSuiClient();

export const aftermathSwapSkill: SkillDefinition = {
  id: 'aftermath-swap',
  name: 'Aftermath Swap',
  description: 'Swap tokens at best price via Aftermath DEX aggregator',
  category: 'defi',
  subcategory: 'trading',
  protocols: ['aftermath'],
  requiredTools: ['sui-tx'],
  requiredServices: ['aftermath', 'sui-rpc'],
  requiresFunds: true,
  inputSchema: {
    type: 'object',
    properties: {
      action: { type: 'string', enum: ['swap', 'quote'], description: 'Action to perform' },
      coinInType: { type: 'string', description: 'Input coin type (e.g., 0x2::sui::SUI)' },
      coinOutType: { type: 'string', description: 'Output coin type' },
      amountIn: { type: 'string', description: 'Amount in MIST (as string for precision)' },
      slippage: { type: 'number', description: 'Slippage tolerance (e.g. 0.01 for 1%)' },
    },
    required: ['action', 'coinInType', 'coinOutType', 'amountIn'],
  },
  async execute(params: SkillParams, context: ExecutionContext): Promise<SkillResult> {
    try {
      const { action, coinInType, coinOutType, amountIn, slippage = 0.01 } = params;

      if (action === 'quote') {
        try {
          const res = await fetch(
            `https://aftermath.finance/api/router/quote?coinInType=${encodeURIComponent(coinInType)}&coinOutType=${encodeURIComponent(coinOutType)}&amountIn=${amountIn}`
          );
          const quote = await res.json();
          return { success: true, data: { action: 'quote', coinInType, coinOutType, amountIn: amountIn.toString(), quote } };
        } catch {
          return { success: false, error: 'Failed to fetch quote from Aftermath API' };
        }
      }

      if (action !== 'swap') {
        return { success: false, error: `Unknown action: ${action}` };
      }

      const amountVal = BigInt(amountIn);
      const minOut = BigInt(Math.floor(Number(amountVal) * (1 - slippage)));

      const tx = new Transaction();
      const [inputCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(amountVal)]);
      tx.moveCall({
        target: `${aftermathPackageId()}::router::swap`,
        arguments: [
          inputCoin,
          tx.pure.string(coinInType),
          tx.pure.string(coinOutType),
          tx.pure.u64(minOut),
          tx.object(SUI_CLOCK),
        ],
        typeArguments: [coinInType, coinOutType],
      });
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
          action: 'swap',
          coinInType,
          coinOutType,
          amountIn: amountVal.toString(),
          minOut: minOut.toString(),
          slippage,
          txDigest: txResult.digest,
          transaction: tx.serialize(),
          balanceChanges: txResult.balanceChanges ?? [],
        },
        error: success ? undefined : (txResult.status.error?.message ?? 'Swap failed'),
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};

skillRegistry.register(aftermathSwapSkill);
