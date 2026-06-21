import { Link } from '@tanstack/react-router';
import { useTheme } from '@/lib/theme';
import { Sun, Moon } from 'lucide-react';

const NAV = [
  { label: 'Features', href: '#features' },
  { label: 'Architecture', href: '#architecture' },
  { label: 'Docs', href: '#' },
  { label: 'GitHub', href: 'https://github.com/CYBWithFlourish/M2A' },
] as const;

export function LandingNavbar() {
  const { theme, toggle } = useTheme();

  return (
    <header className="w-full border-b border-border bg-surface/95">
      <div className="flex h-16 max-w-[1400px] items-center justify-between gap-4 px-6">
        <a href="#" className="flex items-center gap-2.5 shrink-0">
          <img src="/M2ALightLogo.png" alt="M2A" className="h-8 w-auto" />
        </a>

        <nav className="hidden md:flex items-center gap-1">
          {NAV.map((n) => (
            <a
              key={n.label}
              href={n.href}
              className="relative px-3 py-1.5 text-sm font-medium text-slate-400 transition-colors hover:text-white rounded-md hover:bg-white/5"
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button onClick={toggle} className="grid h-9 w-9 place-items-center rounded-md text-slate-400 hover:text-white hover:bg-white/5">
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <Link
            to="/studio"
            className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-semibold text-white transition-all hover:brightness-110 active:opacity-80"
          >
            Open Studio
          </Link>
        </div>
      </div>
    </header>
  );
}
