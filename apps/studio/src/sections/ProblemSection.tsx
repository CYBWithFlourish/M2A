export default function ProblemSection() {
  return (
    <section id="problem" className="border-b border-border bg-surface-low">
      <div className="mx-auto max-w-[1400px] px-6 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
            Automation platforms today run workflows.<br/>Then the value disappears.
          </h2>
          <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
            No verifiable record. No reusable data. Nothing compounds. Every run starts from zero.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="rounded-xl border border-danger/20 bg-danger/5 p-6">
            <h3 className="text-sm font-semibold text-danger mb-3">Without M2A</h3>
            <div className="space-y-3 text-sm text-slate-400">
              <div className="flex gap-3"><span className="text-danger mt-0.5">✕</span> Workflow runs → gets a result</div>
              <div className="flex gap-3"><span className="text-danger mt-0.5">✕</span> Result delivered, internal state discarded</div>
              <div className="flex gap-3"><span className="text-danger mt-0.5">✕</span> No verifiable record of what happened</div>
              <div className="flex gap-3"><span className="text-danger mt-0.5">✕</span> No data retained for the next run</div>
            </div>
            <div className="mt-4 rounded bg-surface p-3 font-mono text-xs text-slate-500">
              Workflow complete. Data retained: 0 bytes. Verifiable: No.
            </div>
          </div>
          <div className="rounded-xl border border-success/20 bg-success/5 p-6">
            <h3 className="text-sm font-semibold text-success mb-3">With M2A</h3>
            <div className="space-y-3 text-sm text-slate-400">
              <div className="flex gap-3"><span className="text-success mt-0.5">✓</span> Workflow runs → gets a result</div>
              <div className="flex gap-3"><span className="text-success mt-0.5">✓</span> Result verified, PII stripped, statistical claims extracted</div>
              <div className="flex gap-3"><span className="text-success mt-0.5">✓</span> Verifiable dataset published to Walrus as a permanent blob</div>
              <div className="flex gap-3"><span className="text-success mt-0.5">✓</span> Next run is smarter — prior datasets inform new executions</div>
            </div>
            <div className="mt-4 rounded bg-surface p-3 font-mono text-xs text-slate-500">
              Workflow complete. Dataset: walrus://3BxGhz...f8Kp. Verifiable: Yes. Privacy: 100/100.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
