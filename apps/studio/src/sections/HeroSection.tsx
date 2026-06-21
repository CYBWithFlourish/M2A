import { Link } from '@tanstack/react-router';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center bg-surface pt-16">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
      <div className="mx-auto max-w-[1400px] px-6 py-16 md:py-24 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight">
            Build automations that generate{' '}
            <span className="text-primary">verifiable data</span> every time they run.
          </h1>
          <p className="mt-6 text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
            Visual workflow builder on Sui, Walrus, and MemWal. Drag nodes, connect them, run it — and every execution produces a verifiable, privacy-safe dataset stored on Walrus.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link to="/studio" className="inline-flex h-12 items-center rounded-lg bg-primary px-6 text-sm font-semibold text-white hover:brightness-110 transition">
              Start Building
            </Link>
            <a href="#how-it-works" className="inline-flex h-12 items-center rounded-lg border border-border px-6 text-sm font-medium text-slate-300 hover:text-white hover:border-white/20 transition">
              See how it works
            </a>
          </div>
          <p className="mt-8 font-mono text-sm text-slate-500">npm install buiry</p>
        </div>
      </div>
    </section>
  );
}
