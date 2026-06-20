const PYTH_PACKAGE = '0xffa2e9f844b4b93b5bfd1869abcd0594fccb9f30a97f1bf8b38ab342eb66fc77';

export const pythService = {
  id: 'pyth',
  name: 'Pyth Oracle',
  description: 'Real-time price feeds from Pyth Network',

  async getPrice(params: { priceFeedId: string }): Promise<any> {
    try {
      const res = await fetch(`https://hermes.pyth.network/v2/updates/price/latest?ids[]=${params.priceFeedId}`);
      const data = await res.json();
      const parsed = data.parsed?.[0];
      if (parsed) {
        const price = Number(parsed.price.price) * Math.pow(10, parsed.price.expo);
        return { price, conf: parsed.price.conf, feedId: params.priceFeedId };
      }
    } catch {}
    return { price: '0', feedId: params.priceFeedId, note: 'Pyth not available — use cached or mock data' };
  },

  async getEMA(params: { priceFeedId: string }): Promise<any> {
    const price = await this.getPrice(params);
    return { ...price, type: 'ema' };
  },

  KNOWN_FEEDS: {
    'SUI/USD': '0x23d7315113f5b1d3ba7a83604c44b94d79f4fd69af77f804fc7f920a6dc65744',
    'BTC/USD': '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
    'ETH/USD': '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
    'USDC/USD': '0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a',
  },
};
