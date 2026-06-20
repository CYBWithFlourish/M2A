import { Transaction } from '@mysten/sui/transactions';

export const alphaFiService = {
  id: 'alphafi',
  name: 'AlphaFi Yield',
  description: 'Auto-compounding yield aggregator across Sui DeFi protocols',

  buildDepositTx(params: {
    tokenType: string;
    amount: string;
    vaultType: string;
    walletAddress: string;
  }): Transaction {
    const tx = new Transaction();
    const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(BigInt(params.amount))]);
    tx.moveCall({
      target: '0x0::alphafi::deposit',
      arguments: [
        tx.pure.string(params.vaultType),
        coin,
      ],
    });
    return tx;
  },

  buildWithdrawTx(params: {
    vaultType: string;
    shares: string;
    walletAddress: string;
  }): Transaction {
    const tx = new Transaction();
    tx.moveCall({
      target: '0x0::alphafi::withdraw',
      arguments: [
        tx.pure.string(params.vaultType),
        tx.pure.u64(BigInt(params.shares)),
      ],
    });
    return tx;
  },

  async getVaults(): Promise<any> {
    try {
      const res = await fetch('https://api.alphafi.xyz/vaults');
      return await res.json();
    } catch {
      return {
        vaults: [
          { name: 'SUI Vault', apy: '~8.2%', tvl: '$12M' },
          { name: 'USDC Vault', apy: '~12.5%', tvl: '$8M' },
          { name: 'USDT Vault', apy: '~10.1%', tvl: '$5M' },
        ],
        note: 'Using estimated AlphaFi data — live API unavailable',
      };
    }
  },

  async getPosition(params: { walletAddress: string }): Promise<any> {
    try {
      const res = await fetch(`https://api.alphafi.xyz/positions/${params.walletAddress}`);
      return await res.json();
    } catch {
      return { positions: [], totalValue: '0', note: 'AlphaFi position API unavailable' };
    }
  },
};
