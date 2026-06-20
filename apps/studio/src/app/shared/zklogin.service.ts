import { Injectable } from '@angular/core';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { generateNonce, generateRandomness } from '@mysten/sui/zklogin';
import { SuiContractService } from '../shared/contract.service';
import { environment } from '../../environments/environment';

const ZKL_SERVICE = environment.zkLoginServiceUrl;
const ZKL_API_KEY = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_ZKL_API_KEY) || '';

export interface AgentZkLoginData {
  address: string;
  walletAddress: string;
  keypair: Ed25519Keypair;
  proofPoints: any;
  issBase64Details: any;
  headerBase64: string;
  salt: string;
  maxEpoch: number;
  token: string;
}

@Injectable({ providedIn: 'root' })
export class ZkLoginService {
  private popupWindow: Window | null = null;
  private popupCheckInterval: ReturnType<typeof setInterval> | null = null;

  constructor(private contract: SuiContractService) {}

  async openAgentWalletAuth(): Promise<AgentZkLoginData> {
    const keypair = new Ed25519Keypair();
    const publicKey = keypair.getPublicKey();
    const randomness = generateRandomness();

    const epoch = await this.contract.getCurrentEpoch();
    const maxEpoch = epoch + 20;
    const nonce = generateNonce(publicKey, maxEpoch, randomness);

    const stateId = crypto.randomUUID();
    sessionStorage.setItem(`zklogin_agent_${stateId}`, JSON.stringify({
      secretKey: Array.from(keypair.getSecretKey()),
      publicKey: publicKey.toBase64(),
      randomness,
      nonce,
      epoch,
      maxEpoch,
    }));

    const redirect = encodeURIComponent(`${window.location.origin}/agent-callback`);
    const url = `${ZKL_SERVICE}/auth/google?nonce=${encodeURIComponent(nonce)}&api_key=${ZKL_API_KEY}&redirect=${redirect}&state=${stateId}`;

    return new Promise((resolve, reject) => {
      this.popupWindow = window.open(url, 'zklogin_agent', 'width=600,height=700');
      if (!this.popupWindow) {
        reject(new Error('Popup blocked. Please allow popups for this site.'));
        return;
      }

      this.popupCheckInterval = setInterval(async () => {
        try {
          if (this.popupWindow?.closed) {
            this.cleanup();
            const result = sessionStorage.getItem(`zklogin_agent_result_${stateId}`);
            if (result) {
              sessionStorage.removeItem(`zklogin_agent_result_${stateId}`);
              const params = JSON.parse(result);
              const agentData = await this.completeZkLogin(stateId, params);
              resolve(agentData);
            } else {
              reject(new Error('Popup closed without completing authentication'));
            }
          }
        } catch {}
      }, 500);

      setTimeout(() => {
        this.cleanup();
        this.popupWindow?.close();
        reject(new Error('Authentication timed out'));
      }, 300_000);
    });
  }

  async completeZkLogin(stateId: string, params: { token: string; salt: string; address: string }): Promise<AgentZkLoginData> {
    const stored = sessionStorage.getItem(`zklogin_agent_${stateId}`);
    if (!stored) throw new Error('No ephemeral key found');
    const data = JSON.parse(stored);
    sessionStorage.removeItem(`zklogin_agent_${stateId}`);

    const secretKey = new Uint8Array(data.secretKey);
    const keypair = Ed25519Keypair.fromSecretKey(secretKey);
    const publicKey = keypair.getPublicKey();

    const proveResponse = await fetch(`${ZKL_SERVICE}/auth/prove`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jwt: params.token,
        extendedEphemeralPublicKey: publicKey.toSuiPublicKey(),
        maxEpoch: data.maxEpoch,
        jwtRandomness: data.randomness,
        salt: params.salt,
        keyClaimName: 'sub',
      }),
    });

    if (!proveResponse.ok) {
      const errText = await proveResponse.text();
      throw new Error(`Proof generation failed (${proveResponse.status}): ${errText}`);
    }

    const proof = await proveResponse.json();

    return {
      address: params.address,
      walletAddress: params.address,
      keypair,
      proofPoints: proof.proofPoints,
      issBase64Details: proof.issBase64Details,
      headerBase64: proof.headerBase64,
      salt: params.salt,
      maxEpoch: data.maxEpoch,
      token: params.token,
    };
  }

  private cleanup() {
    if (this.popupCheckInterval) {
      clearInterval(this.popupCheckInterval);
      this.popupCheckInterval = null;
    }
    this.popupWindow = null;
  }
}
