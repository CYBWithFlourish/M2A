const NODE_CATEGORIES = [
  { name: 'DeFi Protocols', count: 12, color: '#06b6d4' },
  { name: 'Web2 Integrations', count: 7, color: '#ef4444' },
  { name: 'Triggers', count: 6, color: '#22c55e' },
  { name: 'Blockchain', count: 5, color: '#f59e0b' },
  { name: 'AI Agents', count: 4, color: '#8b5cf6' },
  { name: 'Logic & Data', count: 7, color: '#f97316' },
  { name: 'NFT', count: 3, color: '#ec4899' },
  { name: 'Oracles', count: 2, color: '#8b5cf6' },
  { name: 'Bridges', count: 2, color: '#6366f1' },
  { name: 'Storage', count: 1, color: '#65C2CB' },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="border-b border-border bg-surface">
      <div className="mx-auto max-w-[1400px] px-6 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
            48 node types. One canvas. Build any automation.
          </h2>
          <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
            Drag, connect, configure. No orchestration code. No YAML pipelines. Just nodes and edges.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
          {NODE_CATEGORIES.map(cat => (
            <div key={cat.name} className="rounded-xl border border-border bg-surface-container p-4 text-center hover:border-primary/30 transition">
              <div className="text-2xl font-bold text-white" style={{ color: cat.color }}>{cat.count}</div>
              <div className="text-xs text-slate-400 mt-1">{cat.name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
