import { Transaction } from '@mysten/sui/transactions';

const BLUEFIN_PACKAGE = '0x1c540fb6c51d53e0c1ceb11aafc4c8db1a8e2764d857440510c34b3a03c9c3b2';

export const bluefinService = {
  id: 'bluefin',
  name: 'Bluefin Perpetuals',
  description: 'Open and close leveraged perpetual positions on Bluefin',

  buildOpenPositionTx(params: {
    market: string;
    side: 'long' | 'short';
    marginAmount: string;
    leverage: number;
    walletAddress: string;
  }): Transaction {
    const tx = new Transaction();
    const [margin] = tx.splitCoins(tx.gas, [tx.pure.u64(BigInt(params.marginAmount))]);
    tx.moveCall({
      target: `${BLUEFIN_PACKAGE}::exchange::open_position`,
      arguments: [
        tx.pure.string(params.market),
        tx.pure.bool(params.side === 'long'),
        margin,
        tx.pure.u64(BigInt(params.leverage * 1000)),
      ],
    });
    return tx;
  },

  buildClosePositionTx(params: {
    positionId: string;
    walletAddress: string;
  }): Transaction {
    const tx = new Transaction();
    tx.moveCall({
      target: `${BLUEFIN_PACKAGE}::exchange::close_position`,
      arguments: [tx.object(params.positionId)],
    });
    return tx;
  },

  async getMarkets(): Promise<any> {
    try {
      const res = await fetch('https://api.bluefin.io/api/markets');
      return await res.json();
    } catch {
      return { markets: [], note: 'Bluefin API unavailable' };
    }
  },
};
