export default function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      <div className="mx-auto max-w-[1400px] px-6 pt-32 pb-20 md:pt-40 md:pb-28 text-center relative z-10">
        <h1 className="mt-6 text-display-lg md:text-[64px] md:leading-[68px] tracking-tight">
          Build automations that generate<br />
          verifiable data every time they run. <span className="text-primary">On-chain.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-body-lg text-muted-foreground">
          Visual workflow builder on Sui, Walrus, and MemWal. Drag nodes, connect them, run it — and every execution produces a verifiable, privacy-safe dataset stored on Walrus.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <a
            href="http://152.67.149.134:5177"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center rounded-md bg-primary px-6 text-sm font-semibold text-white transition-all hover:brightness-110 active:opacity-80"
          >
            Start Building
          </a>
          <a
            href="#how-it-works"
            className="inline-flex h-11 items-center rounded-md border border-border bg-transparent px-6 text-sm font-semibold text-slate-300 transition-all hover:border-primary/60 hover:text-white"
          >
            See how it works
          </a>
        </div>
      </div>
    </section>
  );
}
