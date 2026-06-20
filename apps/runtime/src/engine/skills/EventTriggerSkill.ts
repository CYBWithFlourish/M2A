import { SkillDefinition, SkillResult, SkillParams, ExecutionContext } from './SkillDefinition.js';
import { skillRegistry } from './SkillRegistry.js';
import { eventTriggerService } from '../services/EventTriggerService.js';

export const eventTriggerSkill: SkillDefinition = {
  id: 'event_trigger',
  name: 'Sui Event Trigger',
  description: 'Start workflows when on-chain events fire',
  category: 'data',
  subcategory: 'query',
  protocols: ['event_trigger'],
  requiredTools: [],
  requiredServices: ['event_trigger'],
  requiresFunds: false,
  inputSchema: {
    type: 'object',
    properties: {
      action: { type: 'string', enum: ['configure'], description: 'Action to perform' },
      packageId: { type: 'string', description: 'Package ID of the Move module' },
      moduleName: { type: 'string', description: 'Move module name' },
      eventName: { type: 'string', description: 'Event struct name' },
      workflowId: { type: 'string', description: 'Workflow ID to trigger' },
    },
    required: ['action', 'packageId', 'moduleName', 'eventName', 'workflowId'],
  },
  async execute(params: SkillParams, context: ExecutionContext): Promise<SkillResult> {
    try {
      const { action, packageId, moduleName, eventName, workflowId } = params;

      if (action === 'configure') {
        if (!packageId || !eventName || !workflowId) {
          return { success: false, error: 'packageId, eventName, and workflowId required' };
        }
        const result = await eventTriggerService.configure({
          packageId, moduleName: moduleName || '', eventName, workflowId,
        });
        return { success: true, data: { protocol: 'event_trigger', ...result } };
      }

      return { success: false, error: `Unknown action: ${action}` };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};

skillRegistry.register(eventTriggerSkill);
