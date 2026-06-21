import { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { useTheme } from '@/lib/theme';
import { Sun, Moon } from 'lucide-react';

const SECTIONS = [
  { label: 'Automation', id: 'features' },
  { label: 'Datasets', id: 'datasets' },
  { label: 'Architecture', id: 'architecture' },
  { label: 'Docs', id: 'docs', href: '#' },
  { label: 'GitHub', id: 'github', href: 'https://github.com/CYBWithFlourish/M2A' },
];

export function LandingNavbar() {
  const [active, setActive] = useState('');
  const { theme, toggle } = useTheme();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        }
      },
      { rootMargin: '-40% 0px -60% 0px' }
    );
    const els = document.querySelectorAll('section[id]');
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <header className="fixed top-0 z-40 w-full border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-6">
        <a href="#" className="flex items-center gap-2.5 shrink-0">
          <img src="/M2ALightLogo.png" alt="M2A" className="h-8 w-auto" />
        </a>
        <nav className="hidden md:flex items-center gap-1">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={s.href || `#${s.id}`}
              target={s.href?.startsWith('http') ? '_blank' : undefined}
              rel={s.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
              className={`relative px-3 py-1.5 text-sm font-medium transition-colors rounded-md ${
                active === s.id ? 'text-primary' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {s.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button onClick={toggle} className="grid h-9 w-9 place-items-center rounded-md text-slate-400 hover:text-white hover:bg-white/5">
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <Link to="/studio" className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-semibold text-white hover:brightness-110">
            Open Studio
          </Link>
        </div>
      </div>
    </header>
  );
}
