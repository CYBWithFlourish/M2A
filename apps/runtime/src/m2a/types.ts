import type { GatewayAuthzRequest, GatewayAuthzResponse } from '@m2a/sdk';

export type { GatewayAuthzRequest, GatewayAuthzResponse };

export interface RuntimeAuthzRequest extends GatewayAuthzRequest {
  protocols?: string[];
  tools?: string[];
}
export type RuntimeAuthzResponse = GatewayAuthzResponse;
