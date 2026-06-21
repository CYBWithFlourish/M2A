export default function DatasetsSection() {
  return (
    <section id="datasets" className="border-b border-border bg-surface-low">
      <div className="mx-auto max-w-[1400px] px-6 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
            Every automation you run produces a verifiable dataset.
          </h2>
          <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
            Privacy-preserving pipeline: capture, redact, verify, and publish to Walrus — automatically, on every run.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="rounded-xl border border-danger/20 bg-danger/5 p-6">
            <h3 className="text-sm font-semibold text-danger mb-3">Raw Agent Output</h3>
            <pre className="text-xs font-mono text-slate-400 bg-surface rounded p-3 overflow-auto">
{`{
  "user": "john@example.com",
  "ip": "192.168.1.1",
  "phone": "555-1234",
  "behavior": "purchases daily",
  "condition": "type X"
}`}
            </pre>
            <div className="mt-2 flex gap-2">
              <span className="text-[10px] font-bold text-danger uppercase bg-danger/10 px-2 py-0.5 rounded-full">PII Detected</span>
              <span className="text-[10px] font-bold text-warning uppercase bg-warning/10 px-2 py-0.5 rounded-full">3 fields</span>
            </div>
          </div>
          <div className="rounded-xl border border-success/20 bg-success/5 p-6">
            <h3 className="text-sm font-semibold text-success mb-3">Clean Dataset</h3>
            <pre className="text-xs font-mono text-slate-400 bg-surface rounded p-3 overflow-auto">
{`{
  "claim": "68% of users in this cohort exhibit
            purchasing pattern X",
  "confidence": 0.87,
  "sampleSize": 1247,
  "privacyScore": 100,
  "blobId": "walrus://3BxGhz...f8Kp"
}`}
            </pre>
            <div className="mt-2 flex gap-2">
              <span className="text-[10px] font-bold text-success uppercase bg-success/10 px-2 py-0.5 rounded-full">Privacy 100/100</span>
              <span className="text-[10px] font-bold text-primary uppercase bg-primary/10 px-2 py-0.5 rounded-full">Walrus Blob</span>
              <span className="text-[10px] font-bold text-warning uppercase bg-warning/10 px-2 py-0.5 rounded-full">Verifiable on Sui</span>
            </div>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-slate-500 max-w-xl mx-auto">
          The Data Processing Agent never stores raw personal data — only aggregate statistical claims. This is structural privacy, not a policy promise.
        </p>
      </div>
    </section>
  );
}
