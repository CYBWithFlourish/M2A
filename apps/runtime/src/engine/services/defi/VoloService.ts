import { Transaction } from '@mysten/sui/transactions';

const VOLO_PACKAGE = '0x549e8b69270defbfafd4f94e17ec44cdbdd99820b33bda2278dea3b9a32d3f55';

export const voloService = {
  id: 'volo',
  name: 'Volo Liquid Staking',
  description: 'Stake SUI and receive vSUI via Volo',

  buildStakeTx(params: { amountMist: string; walletAddress: string }): Transaction {
    const tx = new Transaction();
    const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(BigInt(params.amountMist))]);
    tx.moveCall({
      target: `${VOLO_PACKAGE}::volo::stake`,
      arguments: [coin],
    });
    return tx;
  },

  buildUnstakeTx(params: { vSuiAmount: string; walletAddress: string }): Transaction {
    const tx = new Transaction();
    tx.moveCall({
      target: `${VOLO_PACKAGE}::volo::unstake`,
      arguments: [tx.pure.u64(BigInt(params.vSuiAmount))],
    });
    return tx;
  },

  async getAPR(): Promise<any> {
    try {
      const res = await fetch('https://api.volo.fi/api/apr');
      return await res.json();
    } catch {
      return { apr: '~4.2%', note: 'Using estimated APR' };
    }
  },
};
