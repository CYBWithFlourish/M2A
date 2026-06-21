const STATS = [
  { value: '48', label: 'Node Types' },
  { value: '14', label: 'Protocol Integrations' },
  { value: '6', label: 'Move Modules' },
  { value: '4', label: 'LLM Providers' },
];

export default function ArchitectureSection() {
  return (
    <section id="architecture" className="border-b border-border bg-surface">
      <div className="mx-auto max-w-[1400px] px-6 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
            Blockchain isn't a feature checkbox. It's the foundation.
          </h2>
          <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
            Every write is a Sui transaction. Every dataset is a Walrus blob. This is real infrastructure.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto mb-12">
          {STATS.map(s => (
            <div key={s.label} className="rounded-xl border border-border bg-surface-container p-6 text-center">
              <div className="text-3xl font-bold text-primary">{s.value}</div>
              <div className="text-xs text-slate-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="max-w-3xl mx-auto">
          <h3 className="text-sm font-semibold text-white mb-4 text-center">Tech Stack</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {['Sui Network', 'Walrus', 'MemWal', 'SEAL', 'Groq + Llama 3.3', 'React 19', 'Vite 8', 'Tailwind CSS 4', 'Express + TypeScript', 'PostgreSQL + Redis'].map(t => (
              <span key={t} className="rounded-full border border-border bg-surface-container px-3 py-1 text-xs text-slate-400">{t}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
