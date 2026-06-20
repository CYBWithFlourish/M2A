import { createSuiClient } from '../../config.js';

export const switchboardService = {
  id: 'switchboard',
  name: 'Switchboard Oracle',
  description: 'On-demand price feeds and data from Switchboard',

  async getFeed(params: { feedAddress: string }): Promise<any> {
    try {
      const client = createSuiClient();
      const obj = await (client as any).getObject(params.feedAddress, { showContent: true });
      return obj.data?.content || { feed: params.feedAddress, status: 'unavailable' };
    } catch {
      return { feed: params.feedAddress, status: 'error', note: 'Unable to fetch Switchboard feed' };
    }
  },

  async requestUpdate(params: { feedAddress: string; walletAddress: string }): Promise<any> {
    return {
      feed: params.feedAddress,
      message: 'Switchboard update requested',
      note: 'Use Switchboard SDK or PTB for on-demand updates',
    };
  },
};
