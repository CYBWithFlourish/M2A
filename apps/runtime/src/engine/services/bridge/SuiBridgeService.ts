import { Transaction } from '@mysten/sui/transactions';
import { suiBridgePackageId } from '../../../config.js';

export const suiBridgeService = {
  id: 'sui_bridge',
  name: 'Sui Bridge (Native)',
  description: 'Native Sui-to-Ethereum bridge',

  buildBridgeToEthTx(params: {
    amountMist: string;
    ethDestination: string;
    walletAddress: string;
  }): Transaction {
    const tx = new Transaction();
    const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(BigInt(params.amountMist))]);
    tx.moveCall({
      target: `${suiBridgePackageId()}::bridge::bridge_sui_to_eth`,
      arguments: [
        coin,
        tx.pure.vector('u8', Buffer.from(params.ethDestination.slice(2), 'hex')),
      ],
    });
    return tx;
  },

  buildBridgeFromEthTx(params: {
    suiDestination: string;
    txProof: string;
  }): Transaction {
    const tx = new Transaction();
    tx.moveCall({
      target: `${suiBridgePackageId()}::bridge::claim_eth_bridge`,
      arguments: [
        tx.pure.address(params.suiDestination),
        tx.pure.vector('u8', Buffer.from(params.txProof, 'hex')),
      ],
    });
    return tx;
  },

  async getBridgeStatus(): Promise<any> {
    return {
      status: 'active',
      supportedTokens: ['SUI', 'ETH'],
      note: 'Native Sui Bridge is live on mainnet',
    };
  },
};
