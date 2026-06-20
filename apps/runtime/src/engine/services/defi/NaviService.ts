import { Transaction } from '@mysten/sui/transactions';
import { ServiceDefinition } from '../ServiceDefinition.js';
import { createSuiClient, naviPackageId } from '../../../config.js';

const client = createSuiClient();

export const naviService: ServiceDefinition = {
  id: 'navi',
  name: 'Navi Protocol',
  description: 'Supply, borrow, and manage positions on Navi lending protocol',
  category: 'defi',
  requiresAuth: true,
  requiresFunds: true,
  methods: ['supply', 'borrow', 'repay', 'getPosition'],
  async execute(method, params, _context) {
    switch (method) {
      case 'supply': {
        const { assetType, amount, walletAddress } = params;
        const tx = new Transaction();
        const [supplyCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(BigInt(amount))]);
        tx.moveCall({
          target: `${naviPackageId()}::lending::supply`,
          arguments: [supplyCoin],
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
          protocol: 'navi',
          action: 'supply',
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
          target: `${naviPackageId()}::lending::borrow`,
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
          protocol: 'navi',
          action: 'borrow',
          assetType,
          amount: amount.toString(),
          txDigest: txResult?.digest || '',
          transaction: tx.serialize(),
        };
      }
      case 'repay': {
        const { assetType, amount, walletAddress } = params;
        const tx = new Transaction();
        const [repayCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(BigInt(amount))]);
        tx.moveCall({
          target: `${naviPackageId()}::lending::repay`,
          arguments: [repayCoin],
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
          protocol: 'navi',
          action: 'repay',
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
          target: `${naviPackageId()}::lending::get_position`,
          arguments: [tx.pure.address(walletAddress)],
          typeArguments: [],
        });
        const result = await client.simulateTransaction({
          transaction: tx,
          include: { commandResults: true },
        });
        return {
          protocol: 'navi',
          action: 'getPosition',
          walletAddress,
          position: result.commandResults?.[0]?.returnValues || {},
        };
      }
      default:
        throw new Error(`Method '${method}' not found on navi service`);
    }
  },
};
