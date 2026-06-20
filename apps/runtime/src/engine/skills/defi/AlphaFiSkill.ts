import { SkillDefinition, SkillResult, SkillParams, ExecutionContext } from '../SkillDefinition.js';
import { skillRegistry } from '../SkillRegistry.js';
import { alphaFiService } from '../../services/defi/AlphaFiService.js';

export const alphaFiSkill: SkillDefinition = {
  id: 'alphafi',
  name: 'AlphaFi Yield',
  description: 'Auto-compounding yield aggregator across Sui DeFi',
  category: 'defi',
  subcategory: 'yield',
  protocols: ['alphafi'],
  requiredTools: ['sui-tx'],
  requiredServices: ['sui-rpc'],
  requiresFunds: true,
  inputSchema: {
    type: 'object',
    properties: {
      action: { type: 'string', enum: ['deposit', 'withdraw', 'vaults', 'position'], description: 'Action to perform' },
      vaultType: { type: 'string', description: 'Vault type (sui, usdc, usdt)' },
      amount: { type: 'string', description: 'Amount (in MIST for deposit, shares for withdraw)' },
      tokenType: { type: 'string', description: 'Token type for deposit' },
    },
    required: ['action'],
  },
  async execute(params: SkillParams, context: ExecutionContext): Promise<SkillResult> {
    try {
      const { action, vaultType, amount, tokenType } = params;

      if (action === 'vaults') {
        const vaults = await alphaFiService.getVaults();
        return { success: true, data: vaults };
      }

      if (action === 'position') {
        const position = await alphaFiService.getPosition({ walletAddress: context.agentWallet.address });
        return { success: true, data: position };
      }

      if (action === 'deposit') {
        const tx = alphaFiService.buildDepositTx({
          tokenType: tokenType || '0x2::sui::SUI',
          amount: amount || '1000000000',
          vaultType: vaultType || 'sui',
          walletAddress: context.agentWallet.address,
        });
        return {
          success: true,
          data: { protocol: 'alphafi', action: 'deposit', vaultType, amount, transaction: tx.serialize() },
        };
      }

      if (action === 'withdraw') {
        const tx = alphaFiService.buildWithdrawTx({
          vaultType: vaultType || 'sui',
          shares: amount || '1000000000',
          walletAddress: context.agentWallet.address,
        });
        return {
          success: true,
          data: { protocol: 'alphafi', action: 'withdraw', vaultType, shares: amount, transaction: tx.serialize() },
        };
      }

      return { success: false, error: `Unknown action: ${action}` };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};

skillRegistry.register(alphaFiSkill);
