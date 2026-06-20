import { Transaction } from '@mysten/sui/transactions';

const BUCKET_PACKAGE = '0xce7ff77a83ea0cb6fd39bd8748e2ec89a3f41e8efdc3f4eb123e0ca37b184db2';
const BUCKET_TREASURY = '0x0';

export const bucketService = {
  id: 'bucket',
  name: 'Bucket Protocol',
  description: 'Mint and redeem $BUCK stablecoin',

  buildMintTx(params: { collateralAmount: string; walletAddress: string }): Transaction {
    const tx = new Transaction();
    const [collateral] = tx.splitCoins(tx.gas, [tx.pure.u64(BigInt(params.collateralAmount))]);
    tx.moveCall({
      target: `${BUCKET_PACKAGE}::tadb::mint`,
      arguments: [tx.object(BUCKET_TREASURY), collateral],
    });
    return tx;
  },

  buildRedeemTx(params: { buckAmount: string; walletAddress: string }): Transaction {
    const tx = new Transaction();
    tx.moveCall({
      target: `${BUCKET_PACKAGE}::tadb::redeem`,
      arguments: [tx.object(BUCKET_TREASURY), tx.pure.u64(BigInt(params.buckAmount))],
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
