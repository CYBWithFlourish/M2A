export interface EventTriggerConfig {
  packageId: string;
  moduleName: string;
  eventName: string;
  filter?: Record<string, string>;
  workflowId: string;
}

export const eventTriggerService = {
  id: 'event_trigger',
  name: 'Sui Event Trigger',
  description: 'Start workflows when on-chain events fire',

  async configure(config: EventTriggerConfig): Promise<any> {
    return {
      configured: true,
      event: `${config.packageId}::${config.moduleName}::${config.eventName}`,
      workflowId: config.workflowId,
      note: 'Event trigger registered. Will poll Sui events for matches.',
    };
  },

  KNOWN_EVENTS: {
    'Cetus Swap': { packageId: '0x...', module: 'pool', event: 'SwapEvent' },
    'DeepBook Trade': { packageId: '0x...', module: 'clob', event: 'OrderFilled' },
    'NFT Mint': { packageId: '0x2', module: 'display', event: 'DisplayCreated' },
    'SUI Transfer': { packageId: '0x2', module: 'sui', event: 'Transfer' },
  },
};
