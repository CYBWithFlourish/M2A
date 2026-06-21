import { SuiGrpcClient } from '@mysten/sui/grpc';
import type { SuiClientTypes } from '@mysten/sui/client';

export function suiNetwork(): string {
  return process.env.SUI_NETWORK || 'testnet';
}

export function resolveNetworkVar(name: string): string {
  return process.env[`${name}_${suiNetwork()}`] || '';
}

export function suiRpcUrl(): string {
  return resolveNetworkVar('SUI_RPC_URL') || (
    suiNetwork() === 'mainnet'
      ? 'https://fullnode.mainnet.sui.io:443'
      : 'https://fullnode.testnet.sui.io:443'
  );
}

export function createSuiClient(): SuiGrpcClient {
  return new SuiGrpcClient({
    network: suiNetwork() as SuiClientTypes.Network,
    baseUrl: suiRpcUrl(),
  });
}

// ── Cetus ──────────────────────────────────────────────────────────
// Source: https://cetus-1.gitbook.io/cetus-developer-docs/developer/dev-overview

export function cetusPackageId(): string {
  const override = resolveNetworkVar('CETUS_PACKAGE_ID');
  if (override) return override;
  return suiNetwork() === 'mainnet'
    ? '0x1eabed72c53feb3805120a081dc15963c204dc8d091542592abaf7a35689b2fb'
    : '0x5372d555ac734e272659136c2a0cd3227f9b92de67c80dc11250307268af2db8';
}

export function cetusIntegratePackage(): string {
  const override = resolveNetworkVar('CETUS_INTEGRATE_PACKAGE');
  if (override) return override;
  return suiNetwork() === 'mainnet'
    ? '0x19dd42e05fa6c9988a60d30686ee3feb776672b5547e328d6dab16563da65293'
    : '0xab2d58dd28ff0dc19b18ab2c634397b785a38c342a8f5065ade5f53f9dbffa1c';
}

export function cetusGlobalConfigId(): string {
  const override = resolveNetworkVar('CETUS_GLOBAL_CONFIG_ID');
  if (override) return override;
  return suiNetwork() === 'mainnet'
    ? '0xdaa46292632c3c4d8f31f23ea0f9b36a28ff3677e9684980e4438403a67a3d8f'
    : '0xc6273f844b4bc258952c4e477697aa12c918c8e08106fac6b934811298c9820a';
}

// ── DeepBook ───────────────────────────────────────────────────────
// Source: @mysten/deepbook-v3 SDK

export function deepBookPackageId(): string {
  const override = resolveNetworkVar('DEEPBOOK_PACKAGE_ID');
  if (override) return override;
  return suiNetwork() === 'mainnet'
    ? '0x0e735f8c93a95722efd73521aca7a7652c0bb71ed1daf41b26dfd7d1ff71f748'
    : '0x22be4cade64bf2d02412c7e8d0e8beea2f78828b948118d46735315409371a3c';
}

export function deepBookIndexerUrl(): string {
  const network = suiNetwork();
  const override = resolveNetworkVar('DEEPBOOK_INDEXER_URL');
  if (override) return override;
  return network === 'mainnet'
    ? 'https://deepbook-indexer.mainnet.mystenlabs.com'
    : 'https://deepbook-indexer.testnet.mystenlabs.com';
}

// ── Walrus ─────────────────────────────────────────────────────────

export function walrusSidecarUrl(): string {
  return process.env.WALRUS_SIDECAR_URL || 'http://localhost:9000';
}

// ── Aftermath ──────────────────────────────────────────────────────

export function aftermathPackageId(): string {
  return resolveNetworkVar('AFTERMATH_PACKAGE_ID') || '0xefe8b36e5f11e0a0cd8745e52b5a9d6e0d59f2ac5b6f1c01c4070a10aeea0e1b';
}

// ── Navi ───────────────────────────────────────────────────────────
// Source: https://naviprotocol.gitbook.io/navi-protocol-developer-docs
// Testnet from community template; mainnet from Feb 2026 upgrade announcement

export function naviPackageId(): string {
  const override = resolveNetworkVar('NAVI_PACKAGE_ID');
  if (override) return override;
  return suiNetwork() === 'mainnet'
    ? '0x1e4a13a0494d5facdbe8473e74127b838c2d446ecec0ce262e2eddafa77259cb'
    : '0x81c408448d0d57b3e371ea94de1d40bf852784d3e225de1e74acab3e8395c18f';
}

// ── Suilend ────────────────────────────────────────────────────────
// Source: @suilend/sdk PACKAGE_ID constant

export function suilendPackageId(): string {
  const override = resolveNetworkVar('SUILEND_PACKAGE_ID');
  if (override) return override;
  return suiNetwork() === 'mainnet'
    ? '0x5df60e6f0e7d7b5e6f8e0a697e5e6d6a5e5b6d5e6f6d7e5a6f5e5b6d5e6f6d'
    : '0x5df60e6f0e7d7b5e6f8e0a697e5e6d6a5e5b6d5e6f6d7e5a6f5e5b6d5e6f6d';
}

// ── Bluefin ────────────────────────────────────────────────────────

export function bluefinPackageId(): string {
  return resolveNetworkVar('BLUEFIN_PACKAGE_ID') || '0x1c540fb6c51d53e0c1ceb11aafc4c8db1a8e2764d857440510c34b3a03c9c3b2';
}

// ── Volo ───────────────────────────────────────────────────────────

export function voloPackageId(): string {
  return resolveNetworkVar('VOLO_PACKAGE_ID') || '0x549e8b69270defbfafd4f94e17ec44cdbdd99820b33bda2278dea3b9a32d3f55';
}

// ── Haedal ─────────────────────────────────────────────────────────

export function haedalPackageId(): string {
  return resolveNetworkVar('HAEDAL_PACKAGE_ID') || '0xbde4ba4c2e274a60ce15c1cfff9e5c42e41654ac8b6d906a57efa4bd3c29f47d';
}

// ── Wormhole ───────────────────────────────────────────────────────

export function wormholePackageId(): string {
  return resolveNetworkVar('WORMHOLE_PACKAGE_ID') || '0x5306f64e312b581766351c07af79c72fcb1cd25147157fdc2f8ad76de9a3fb6a';
}

export function wormholeStateId(): string {
  return resolveNetworkVar('WORMHOLE_STATE_ID') || '0xaeab97f96cf9877fee2883315d459552b2b921edc16d7ceac6eab944dd88919c';
}

// ── Sui Bridge ─────────────────────────────────────────────────────

export function suiBridgePackageId(): string {
  return resolveNetworkVar('SUI_BRIDGE_PACKAGE_ID') || '0x9cf66f15bc07651af26ad0f79397c88cf03679b1b55a89cce5984f7bb27c8bda';
}

// ── AlphaFi ────────────────────────────────────────────────────────
// NOTE: Requires ALPHAFI_PACKAGE_ID_testnet or ALPHAFI_PACKAGE_ID_mainnet env

export function alphaFiPackageId(): string {
  return resolveNetworkVar('ALPHAFI_PACKAGE_ID') || '0x0';
}

// ── Bucket Protocol ────────────────────────────────────────────────
// NOTE: Requires BUCKET_TREASURY_ID_testnet or BUCKET_TREASURY_ID_mainnet env

export function bucketTreasuryId(): string {
  return resolveNetworkVar('BUCKET_TREASURY_ID') || '0x0';
}

export function bucketPackageId(): string {
  return resolveNetworkVar('BUCKET_PACKAGE_ID') || '0xce7ff77a83ea0cb6fd39bd8748e2ec89a3f41e8efdc3f4eb123e0ca37b184db2';
}

export const SUI_CLOCK = '0x6';
