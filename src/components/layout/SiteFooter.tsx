import Link from 'next/link'
import { Activity, ShieldAlert } from 'lucide-react'
import { SITE, SITE_NAV } from '@/config/site'
import { MODES } from '@/config/theme'

/** Site footer with the permanent safety disclaimer and team credit. */
export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-white/8 bg-surface/60">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.2fr_1fr_1.4fr]">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-copper" aria-hidden="true" />
            <span className="font-heading text-base font-bold text-foreground">{SITE.name}</span>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">{SITE.pitch}</p>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground/70">{SITE.tagline}</p>
        </div>

        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-foreground/80">Explore</h2>
          <ul className="space-y-2 text-sm">
            {SITE_NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-muted-foreground transition-colors duration-150 hover:text-foreground">
                  {item.label}
                </Link>
              </li>
            ))}
            {MODES.map((mode) => (
              <li key={mode.id} className="flex items-center gap-2">
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: mode.color }} />
                <span className="text-muted-foreground">{mode.label} mode</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-foreground/80">
            <ShieldAlert className="h-3.5 w-3.5 text-mode-pain" aria-hidden="true" />
            Important disclaimer
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">{SITE.disclaimerLong}</p>
        </div>
      </div>
      <div className="border-t border-white/8 py-4">
        <p className="mx-auto w-full max-w-7xl px-4 text-center text-xs text-muted-foreground/80 sm:px-6">
          Built by {SITE.team} for the {SITE.event} · {SITE.name} {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  )
}
