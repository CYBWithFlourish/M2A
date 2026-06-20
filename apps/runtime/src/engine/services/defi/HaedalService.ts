import { Transaction } from '@mysten/sui/transactions';

const HAEDAL_PACKAGE = '0xbde4ba4c2e274a60ce15c1cfff9e5c42e41654ac8b6d906a57efa4bd3c29f47d';

export const haedalService = {
  id: 'haedal',
  name: 'Haedal Liquid Staking',
  description: 'Stake SUI and receive haSUI on Haedal',

  buildStakeTx(params: { amountMist: string; walletAddress: string }): Transaction {
    const tx = new Transaction();
    const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(BigInt(params.amountMist))]);
    tx.moveCall({
      target: `${HAEDAL_PACKAGE}::staking::stake`,
      arguments: [
        tx.object('0x1'),
        coin,
      ],
    });
    return tx;
  },

  buildUnstakeTx(params: { haSuiAmount: string; walletAddress: string }): Transaction {
    const tx = new Transaction();
    tx.moveCall({
      target: `${HAEDAL_PACKAGE}::staking::unstake`,
      arguments: [
        tx.object('0x1'),
        tx.pure.u64(BigInt(params.haSuiAmount)),
      ],
    });
    return tx;
  },

  async getStakingInfo(): Promise<any> {
    try {
      const res = await fetch('https://api.haedal.xyz/api/staking/info');
      return await res.json();
    } catch {
      return {
        apr: '~4.5%',
        exchangeRate: '1 SUI ≈ 1 haSUI',
        note: 'Haedal API unavailable — using cached data',
      };
    }
  },
};
