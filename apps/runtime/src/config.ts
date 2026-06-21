import { SuiGrpcClient } from '@mysten/sui/grpc';
import type { SuiClientTypes } from '@mysten/sui/client';

export function suiNetwork(): string {
  return process.env.SUI_NETWORK || 'testnet';
}

export function resolveNetworkVar(name: string): string {
  return process.env[`${name}_${suiNetwork()}`] || '';
}

export function suiRpcUrl(): string {
  return resolveNetworkVar('SUI_RPC_URL') || 'https://fullnode.testnet.sui.io:443';
}

export function createSuiClient(): SuiGrpcClient {
  return new SuiGrpcClient({
    network: suiNetwork() as SuiClientTypes.Network,
    baseUrl: suiRpcUrl(),
  });
}

export function cetusIntegratePackage(): string {
  return resolveNetworkVar('CETUS_INTEGRATE_PACKAGE') || '0x19dd42e05fa6c9988a60d30686ee3feb776672b5547e328d6dab16563da65293';
}

export function cetusGlobalConfigId(): string {
  return resolveNetworkVar('CETUS_GLOBAL_CONFIG_ID') || '0x9774e359588ead122af1c7e7f64e14ade261cfeecdb5d0eb4a5b3b4c8ab8bd3e';
}

export function cetusPackageId(): string {
  return resolveNetworkVar('CETUS_PACKAGE_ID') || '0xcf2df388';
}

export function deepBookPackageId(): string {
  return resolveNetworkVar('DEEPBOOK_PACKAGE_ID') || '0xdee9';
}

export function walrusSidecarUrl(): string {
  return process.env.WALRUS_SIDECAR_URL || 'http://localhost:9000';
}

export function aftermathPackageId(): string {
  return resolveNetworkVar('AFTERMATH_PACKAGE_ID') || '0xefe8b36e5f11e0a0cd8745e52b5a9d6e0d59f2ac5b6f1c01c4070a10aeea0e1b';
}

export function naviPackageId(): string {
  return resolveNetworkVar('NAVI_PACKAGE_ID') || '0x2b4c8b6ef9e7d8a1c5f3b0e9d7a6c5b4e3f2d1a0b9c8d7e6f5a4b3c2d1e0f9a';
}

export function suilendPackageId(): string {
  return resolveNetworkVar('SUILEND_PACKAGE_ID') || '0x5df60e6f0e7d7b5e6f8e0a697e5e6d6a5e5b6d5e6f6d7e5a6f5e5b6d5e6f6d';
}

export function bluefinPackageId(): string {
  return resolveNetworkVar('BLUEFIN_PACKAGE_ID') || '0x1c540fb6c51d53e0c1ceb11aafc4c8db1a8e2764d857440510c34b3a03c9c3b2';
}

export function voloPackageId(): string {
  return resolveNetworkVar('VOLO_PACKAGE_ID') || '0x549e8b69270defbfafd4f94e17ec44cdbdd99820b33bda2278dea3b9a32d3f55';
}

export function haedalPackageId(): string {
  return resolveNetworkVar('HAEDAL_PACKAGE_ID') || '0xbde4ba4c2e274a60ce15c1cfff9e5c42e41654ac8b6d906a57efa4bd3c29f47d';
}

export function wormholePackageId(): string {
  return resolveNetworkVar('WORMHOLE_PACKAGE_ID') || '0x5306f64e312b581766351c07af79c72fcb1cd25147157fdc2f8ad76de9a3fb6a';
}

export function wormholeStateId(): string {
  return resolveNetworkVar('WORMHOLE_STATE_ID') || '0xaeab97f96cf9877fee2883315d459552b2b921edc16d7ceac6eab944dd88919c';
}

export function suiBridgePackageId(): string {
  return resolveNetworkVar('SUI_BRIDGE_PACKAGE_ID') || '0x9cf66f15bc07651af26ad0f79397c88cf03679b1b55a89cce5984f7bb27c8bda';
}

export function alphaFiPackageId(): string {
  return resolveNetworkVar('ALPHAFI_PACKAGE_ID') || '0x0';
}

export function bucketTreasuryId(): string {
  return resolveNetworkVar('BUCKET_TREASURY_ID') || '0x0';
}

export function bucketPackageId(): string {
  return resolveNetworkVar('BUCKET_PACKAGE_ID') || '0xce7ff77a83ea0cb6fd39bd8748e2ec89a3f41e8efdc3f4eb123e0ca37b184db2';
}

export const SUI_CLOCK = '0x6';
