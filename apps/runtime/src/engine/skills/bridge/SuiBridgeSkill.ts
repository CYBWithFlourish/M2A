import { SkillDefinition, SkillResult, SkillParams, ExecutionContext } from '../SkillDefinition.js';
import { skillRegistry } from '../SkillRegistry.js';
import { suiBridgeService } from '../../services/bridge/SuiBridgeService.js';

export const suiBridgeSkill: SkillDefinition = {
  id: 'sui_bridge',
  name: 'Sui Bridge (Native)',
  description: 'Native Sui-to-Ethereum bridge',
  category: 'defi',
  subcategory: 'transfer',
  protocols: ['sui_bridge'],
  requiredTools: ['sui-tx'],
  requiredServices: ['sui-rpc'],
  requiresFunds: true,
  inputSchema: {
    type: 'object',
    properties: {
      action: { type: 'string', enum: ['bridge_to_eth', 'claim', 'status'], description: 'Action to perform' },
      amount: { type: 'string', description: 'Amount in MIST' },
      ethDestination: { type: 'string', description: 'Ethereum destination address' },
      txProof: { type: 'string', description: 'Transaction proof from Ethereum' },
    },
    required: ['action'],
  },
  async execute(params: SkillParams, context: ExecutionContext): Promise<SkillResult> {
    try {
      const { action, amount, ethDestination, txProof } = params;

      if (action === 'status') {
        const status = await suiBridgeService.getBridgeStatus();
        return { success: true, data: status };
      }

      if (action === 'bridge_to_eth') {
        const tx = suiBridgeService.buildBridgeToEthTx({
          amountMist: amount || '1000000000',
          ethDestination: ethDestination || '0x0000000000000000000000000000000000000000',
          walletAddress: context.agentWallet.address,
        });
        return {
          success: true,
          data: { protocol: 'sui_bridge', action: 'bridge_to_eth', amount, ethDestination, transaction: tx.serialize() },
        };
      }

      if (action === 'claim') {
        const tx = suiBridgeService.buildBridgeFromEthTx({
          suiDestination: context.agentWallet.address,
          txProof: txProof || '0x',
        });
        return {
          success: true,
          data: { protocol: 'sui_bridge', action: 'claim', transaction: tx.serialize() },
        };
      }

      return { success: false, error: `Unknown action: ${action}` };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};

skillRegistry.register(suiBridgeSkill);
