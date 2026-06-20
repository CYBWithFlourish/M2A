import { Transaction } from '@mysten/sui/transactions';

const WORMHOLE_PACKAGE = '0x5306f64e312b581766351c07af79c72fcb1cd25147157fdc2f8ad76de9a3fb6a';
const WORMHOLE_STATE = '0xaeab97f96cf9877fee2883315d459552b2b921edc16d7ceac6eab944dd88919c';

export const wormholeService = {
  id: 'wormhole',
  name: 'Wormhole Bridge',
  description: 'Cross-chain token transfers via Wormhole',

  buildTransferTx(params: {
    tokenType: string;
    amount: string;
    targetChain: number;
    targetAddress: string;
    walletAddress: string;
  }): Transaction {
    const tx = new Transaction();
    const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(BigInt(params.amount))]);
    tx.moveCall({
      target: `${WORMHOLE_PACKAGE}::token_bridge::transfer_tokens`,
      arguments: [
        tx.object(WORMHOLE_STATE),
        coin,
        tx.pure.u16(params.targetChain),
        tx.pure.vector('u8', Buffer.from(params.targetAddress.slice(2), 'hex')),
        tx.pure.u64(BigInt(0)),
        tx.pure.u64(BigInt(0)),
      ],
    });
    return tx;
  },

  async getVAA(params: { emitterChain: number; emitterAddress: string; sequence: string }): Promise<any> {
    try {
      const res = await fetch(`https://wormhole-v2-mainnet-api.certus.one/v1/signed_vaa/${params.emitterChain}/${params.emitterAddress}/${params.sequence}`);
      return await res.json();
    } catch {
      return { vaa: null, note: 'Wormhole guardian API unavailable' };
    }
  },

  KNOWN_CHAINS: {
    'Ethereum': 2,
    'Solana': 1,
    'Polygon': 5,
    'Arbitrum': 23,
    'Optimism': 24,
    'Base': 30,
    'Avalanche': 6,
    'BSC': 4,
  },
};
