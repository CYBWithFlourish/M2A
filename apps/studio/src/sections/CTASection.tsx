import { Link } from '@tanstack/react-router';

export default function CTASection() {
  return (
    <section className="bg-surface-low">
      <div className="mx-auto max-w-[1400px] px-6 py-16 md:py-24 text-center">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
          Start building automations that generate verifiable data.
        </h2>
        <p className="mt-4 text-slate-400">Free. Built on Sui. Stored on Walrus.</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link to="/studio" className="inline-flex h-12 items-center rounded-lg bg-primary px-6 text-sm font-semibold text-white hover:brightness-110">Start Building Free</Link>
          <a href="#" className="inline-flex h-12 items-center rounded-lg border border-border px-6 text-sm font-medium text-slate-300 hover:text-white">Read the Docs</a>
        </div>
        <p className="mt-6 font-mono text-sm text-slate-500">npm install buiry</p>
      </div>
    </section>
  );
}
