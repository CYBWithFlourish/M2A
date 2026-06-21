import { Transaction } from '@mysten/sui/transactions';
import { bucketPackageId, bucketTreasuryId } from '../../../config.js';

export const bucketService = {
  id: 'bucket',
  name: 'Bucket Protocol',
  description: 'Mint and redeem $BUCK stablecoin',

  buildMintTx(params: { collateralAmount: string; walletAddress: string }): Transaction {
    const tx = new Transaction();
    const [collateral] = tx.splitCoins(tx.gas, [tx.pure.u64(BigInt(params.collateralAmount))]);
    tx.moveCall({
      target: `${bucketPackageId()}::tadb::mint`,
      arguments: [tx.object(bucketTreasuryId()), collateral],
    });
    return tx;
  },

  buildRedeemTx(params: { buckAmount: string; walletAddress: string }): Transaction {
    const tx = new Transaction();
    tx.moveCall({
      target: `${bucketPackageId()}::tadb::redeem`,
      arguments: [tx.object(bucketTreasuryId()), tx.pure.u64(BigInt(params.buckAmount))],
    });
    return tx;
  },

  async getCollateralRatio(): Promise<any> {
    try {
      const res = await fetch('https://api.bucketprotocol.io/api/status');
      return await res.json();
    } catch {
      return { collateralRatio: '150%', note: 'Using estimated ratio' };
    }
  },
};
