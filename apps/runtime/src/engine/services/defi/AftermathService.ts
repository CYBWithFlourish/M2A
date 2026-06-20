import { Transaction } from '@mysten/sui/transactions';
import { ServiceDefinition } from '../ServiceDefinition.js';
import { createSuiClient, aftermathPackageId } from '../../../config.js';

const client = createSuiClient();

export const aftermathService: ServiceDefinition = {
  id: 'aftermath',
  name: 'Aftermath DEX Aggregator',
  description: 'Best-price token swaps via Aftermath aggregation',
  category: 'defi',
  requiresAuth: true,
  requiresFunds: true,
  methods: ['swap', 'getQuote'],
  async execute(method, params, _context) {
    switch (method) {
      case 'swap': {
        const { coinInType, coinOutType, amountIn, slippage = 0.01, walletAddress } = params;
        const tx = new Transaction();
        const [inputCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(BigInt(amountIn))]);
        tx.moveCall({
          target: `${aftermathPackageId()}::router::swap`,
          arguments: [
            inputCoin,
            tx.pure.string(coinInType),
            tx.pure.string(coinOutType),
            tx.pure.u64(BigInt(Math.floor(Number(amountIn) * (1 - slippage)))),
          ],
          typeArguments: [coinInType, coinOutType],
        });
        tx.setSender(walletAddress);
        const txBytes = await tx.build({ client });
        const result = await client.simulateTransaction({
          transaction: txBytes,
          include: { effects: true, balanceChanges: true },
        });
        const txResult = result.$kind === 'Transaction' ? result.Transaction : null;
        return {
          protocol: 'aftermath',
          action: 'swap',
          coinInType,
          coinOutType,
          amountIn,
          slippage,
          txDigest: txResult?.digest || '',
          transaction: tx.serialize(),
        };
      }
      case 'getQuote': {
        const { coinInType, coinOutType, amountIn } = params;
        try {
          const res = await fetch(
            `https://aftermath.finance/api/router/quote?coinInType=${encodeURIComponent(coinInType)}&coinOutType=${encodeURIComponent(coinOutType)}&amountIn=${amountIn}`
          );
          return await res.json();
        } catch {
          const tx = new Transaction();
          tx.moveCall({
            target: `${aftermathPackageId()}::router::get_quote`,
            arguments: [tx.pure.string(coinInType), tx.pure.string(coinOutType), tx.pure.u64(BigInt(amountIn))],
            typeArguments: [coinInType, coinOutType],
          });
          const result = await client.simulateTransaction({
            transaction: tx,
            include: { commandResults: true },
          });
          return {
            coinInType,
            coinOutType,
            amountIn: amountIn.toString(),
            estimatedOutput: result.commandResults?.[0]?.returnValues?.[0]?.bcs || '0',
          };
        }
      }
      default:
        throw new Error(`Method '${method}' not found on aftermath service`);
    }
  },
};
