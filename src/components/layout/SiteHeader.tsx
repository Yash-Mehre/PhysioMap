'use client'

/** Sticky top bar: logo, nav links, profile/preferences dialog. */

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Activity, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SITE, SITE_NAV } from '@/config/site'
import { ProfileDialog } from '@/components/layout/ProfileDialog'
import { cn } from '@/lib/utils'

export function SiteHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-copper" aria-label="PhysioMap home">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-copper/30 bg-surface-raised transition-colors duration-150 group-hover:border-copper/60">
            <Activity className="h-4.5 w-4.5 text-copper" aria-hidden="true" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-heading text-lg font-bold tracking-tight text-foreground">{SITE.name}</span>
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Interactive body map
            </span>
          </span>
        </Link>

        <nav aria-label="Main navigation" className="flex items-center gap-1">
          {SITE_NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper sm:px-4',
                  active ? 'bg-white/8 text-foreground' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground',
                )}
              >
                {item.label}
              </Link>
            )
          })}
          <ProfileDialog>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open profile and preferences"
              className="ml-1 h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
            >
              <UserRound className="h-4.5 w-4.5" />
            </Button>
          </ProfileDialog>
        </nav>
      </div>
    </header>
  )
}
