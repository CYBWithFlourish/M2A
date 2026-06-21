export default function SolutionSection() {
  return (
    <section id="solution" className="border-b border-border bg-surface">
      <div className="mx-auto max-w-[1400px] px-6 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
            An automation engine that gets smarter every time you use it.
          </h2>
          <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
            Three primitives. Workflow engine to build. Dataset generation to compound. Memory to make it smart.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="rounded-xl border border-border bg-surface-container p-6">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary mb-4">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Workflow Engine</h3>
            <p className="text-sm text-slate-400 mb-3">Visual canvas, 48 node types, drag-connect-execute. Like n8n but on-chain.</p>
            <p className="text-xs text-slate-500">Compose automations visually. Parallel execution, branching, conditional logic. Every run verified on Sui.</p>
            <div className="mt-3 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary uppercase">48 node types</div>
          </div>
          <div className="rounded-xl border-2 border-primary/30 bg-surface-container p-6 ring-1 ring-primary/10 md:col-span-1">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-success/10 text-success mb-4">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Dataset Generation</h3>
            <p className="text-sm text-slate-400 mb-3">Every automation run produces a verifiable, privacy-safe dataset — automatically. This is what n8n doesn't do.</p>
            <p className="text-xs text-slate-500">The Data Processing Agent captures interactions, strips PII at entry, aggregates into statistical claims, verifies privacy, and publishes to Walrus. You get training data without lifting a finger.</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="inline-flex items-center rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success uppercase">Privacy 100/100</span>
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary uppercase">Walrus Blob</span>
              <span className="inline-flex items-center rounded-full bg-warning/10 px-2 py-0.5 text-[10px] font-bold text-warning uppercase">Verifiable</span>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-surface-container p-6">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-warning/10 text-warning mb-4">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Persistent Memory</h3>
            <p className="text-sm text-slate-400 mb-3">The mechanism that makes automations smarter across runs — and datasets more valuable.</p>
            <p className="text-xs text-slate-500">This is how M2A's automations stay smart across runs. Agents recall context across sessions. Every write is a Sui transaction — immutable proof.</p>
            <div className="mt-3 inline-flex items-center rounded-full bg-warning/10 px-2 py-0.5 text-[10px] font-bold text-warning uppercase">3-tier namespaces</div>
          </div>
        </div>
      </div>
    </section>
  );
}
