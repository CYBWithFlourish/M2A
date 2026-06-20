import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

const ZKL_SERVICE = 'https://zklservicest3rdwl.up.railway.app';

export const Route = createFileRoute('/zklogin-callback')({
  component: ZkLoginCallback,
});

function ZkLoginCallback() {
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const salt = params.get('salt');
    const address = params.get('address');

    if (!token || !salt || !address) {
      setError('Missing authentication parameters.');
      return;
    }

    const stored = sessionStorage.getItem('zklogin_ephemeral');
    if (!stored) {
      setError('No ephemeral key found.');
      return;
    }
    const data = JSON.parse(stored);
    sessionStorage.removeItem('zklogin_ephemeral');

    (async () => {
      const { Ed25519Keypair } = await import('@mysten/sui/keypairs/ed25519');
      const keypair = Ed25519Keypair.fromSecretKey(new Uint8Array(data.secretKey));
      const pk = keypair.getPublicKey();

      const res = await fetch(`${ZKL_SERVICE}/auth/prove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jwt: token,
          extendedEphemeralPublicKey: pk.toSuiPublicKey(),
          maxEpoch: data.maxEpoch,
          jwtRandomness: data.randomness,
          salt,
          keyClaimName: 'sub',
        }),
      });

      if (!res.ok) {
        setError(`Proof generation failed (${res.status})`);
        return;
      }

      const proof = await res.json();
      const session = {
        address,
        token,
        salt,
        proofPoints: proof.proofPoints,
        issBase64Details: proof.issBase64Details,
        headerBase64: proof.headerBase64,
        maxEpoch: data.maxEpoch,
        secretKey: data.secretKey,
      };
      localStorage.setItem('zklogin_user', JSON.stringify(session));

      navigate({ to: '/' });
    })();
  }, []);

  if (error) {
    return <div className="flex min-h-screen items-center justify-center"><p className="text-red-400">{error}</p></div>;
  }
  return <div className="flex min-h-screen items-center justify-center"><p className="text-white">Signing in...</p></div>;
}
