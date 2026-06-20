import { Transaction } from '@mysten/sui/transactions';
import { ServiceDefinition } from '../ServiceDefinition.js';
import { createSuiClient, suilendPackageId } from '../../../config.js';

const client = createSuiClient();

export const suilendService: ServiceDefinition = {
  id: 'suilend',
  name: 'Suilend',
  description: 'Lend and borrow on Suilend protocol',
  category: 'defi',
  requiresAuth: true,
  requiresFunds: true,
  methods: ['lend', 'borrow', 'getPosition'],
  async execute(method, params, _context) {
    switch (method) {
      case 'lend': {
        const { assetType, amount, walletAddress } = params;
        const tx = new Transaction();
        const [lendCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(BigInt(amount))]);
        tx.moveCall({
          target: `${suilendPackageId()}::lending::lend`,
          arguments: [lendCoin],
          typeArguments: [assetType],
        });
        tx.setSender(walletAddress);
        const txBytes = await tx.build({ client });
        const result = await client.simulateTransaction({
          transaction: txBytes,
          include: { effects: true, balanceChanges: true },
        });
        const txResult = result.$kind === 'Transaction' ? result.Transaction : null;
        return {
          protocol: 'suilend',
          action: 'lend',
          assetType,
          amount: amount.toString(),
          txDigest: txResult?.digest || '',
          transaction: tx.serialize(),
        };
      }
      case 'borrow': {
        const { assetType, amount, walletAddress } = params;
        const tx = new Transaction();
        tx.moveCall({
          target: `${suilendPackageId()}::lending::borrow`,
          arguments: [tx.pure.u64(BigInt(amount))],
          typeArguments: [assetType],
        });
        tx.setSender(walletAddress);
        const txBytes = await tx.build({ client });
        const result = await client.simulateTransaction({
          transaction: txBytes,
          include: { effects: true, balanceChanges: true },
        });
        const txResult = result.$kind === 'Transaction' ? result.Transaction : null;
        return {
          protocol: 'suilend',
          action: 'borrow',
          assetType,
          amount: amount.toString(),
          txDigest: txResult?.digest || '',
          transaction: tx.serialize(),
        };
      }
      case 'getPosition': {
        const { walletAddress } = params;
        const tx = new Transaction();
        tx.moveCall({
          target: `${suilendPackageId()}::lending::get_position`,
          arguments: [tx.pure.address(walletAddress)],
          typeArguments: [],
        });
        const result = await client.simulateTransaction({
          transaction: tx,
          include: { commandResults: true },
        });
        return {
          protocol: 'suilend',
          action: 'getPosition',
          walletAddress,
          position: result.commandResults?.[0]?.returnValues || {},
        };
      }
      default:
        throw new Error(`Method '${method}' not found on suilend service`);
    }
  },
};
