import { Link } from '@tanstack/react-router';

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="border-b border-border bg-surface-low">
      <div className="mx-auto max-w-[1400px] px-6 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
            Build a workflow. Run it. Get a verifiable dataset.
          </h2>
          <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
            From canvas to verifiable data in three steps. One SDK, zero infrastructure to manage.
          </p>
        </div>
        <div className="max-w-3xl mx-auto grid md:grid-cols-3 gap-4">
          {[
            { step: '1', title: 'Build', desc: 'Drag nodes onto the canvas — agents, DeFi protocols, oracles, Web2 APIs. Connect them with edges. Configure each node\'s behavior.' },
            { step: '2', title: 'Run', desc: 'Hit execute. The DAG engine resolves dependencies, runs agents in parallel, streams results via SSE. Every step is a Sui transaction.' },
            { step: '3', title: 'Dataset', desc: 'The Data Processing Agent captures the run, strips PII, generates statistical claims, and stores a verifiable dataset on Walrus. Privacy score: 100/100.' },
          ].map(item => (
            <div key={item.step} className="rounded-xl border border-border bg-surface-container p-6 text-center">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary font-bold text-sm mx-auto mb-3">{item.step}</div>
              <h3 className="font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link to="/studio" className="inline-flex h-12 items-center rounded-lg bg-primary px-6 text-sm font-semibold text-white hover:brightness-110">Start Building</Link>
        </div>
      </div>
    </section>
  );
}
