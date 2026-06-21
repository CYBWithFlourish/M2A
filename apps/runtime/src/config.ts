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

export const SUI_CLOCK = '0x6';
