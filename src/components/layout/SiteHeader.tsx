'use client'

/**
 * Sticky top bar for the app pages (/explore, /health): logo, nav links
 * (Home · Explore · Health Suite) with active state, mobile hamburger menu
 * (shadcn Sheet) and the profile/preferences dialog.
 */

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Activity, Home, Menu, UserRound, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { SITE, SITE_NAV } from '@/config/site'
import { ProfileDialog } from '@/components/layout/ProfileDialog'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [{ href: '/', label: 'Home' }, ...SITE_NAV] as const

export function SiteHeader() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const isActive = (href: string): boolean =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)

  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link
          href="/"
          className="group flex items-center gap-2.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-copper"
          aria-label="PhysioMap home"
        >
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

        {/* Desktop nav */}
        <nav aria-label="Main navigation" className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href)
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

        {/* Mobile: profile + hamburger */}
        <div className="flex items-center gap-1 md:hidden">
          <ProfileDialog>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open profile and preferences"
              className="h-11 w-11 rounded-full text-muted-foreground hover:text-foreground"
            >
              <UserRound className="h-4.5 w-4.5" />
            </Button>
          </ProfileDialog>
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open navigation menu"
                aria-expanded={menuOpen}
                className="h-11 w-11 rounded-full text-muted-foreground hover:text-foreground"
              >
                {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 border-white/10 bg-surface p-0">
              <SheetHeader className="border-b border-white/8 px-5 py-4">
                <SheetTitle className="flex items-center gap-2 font-heading text-base text-foreground">
                  <Activity className="h-4 w-4 text-copper" aria-hidden="true" />
                  {SITE.name}
                </SheetTitle>
              </SheetHeader>
              <nav aria-label="Mobile navigation" className="flex flex-col gap-1 p-4">
                {NAV_ITEMS.map((item) => {
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'flex touch-target items-center gap-3 rounded-xl px-4 text-sm font-medium transition-colors duration-150',
                        active ? 'bg-white/8 text-foreground' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground',
                      )}
                    >
                      {item.href === '/' ? (
                        <Home className="h-4 w-4 text-copper" aria-hidden="true" />
                      ) : (
                        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-copper/70" />
                      )}
                      {item.label}
                    </Link>
                  )
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
