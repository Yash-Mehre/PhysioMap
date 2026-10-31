'use client'

/**
 * Landing page header: transparent over the hero, solid + blurred once the
 * page scrolls. Anchor nav with smooth scrolling (gated by reduced motion),
 * primary CTA and a mobile sheet menu.
 */

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Activity, ArrowRight, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { SITE } from '@/config/site'
import { HEADER_CTA, HEADER_NAV } from '@/config/landingContent'
import { cn } from '@/lib/utils'

/** Scroll to an anchor target, smooth unless the user prefers reduced motion. */
function scrollToAnchor(href: string): void {
  const element = document.getElementById(href.slice(1))
  if (!element) return
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  element.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' })
  window.history.replaceState(null, '', href)
}

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = (): void => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleAnchorClick = useCallback((event: React.MouseEvent<HTMLAnchorElement>, href: string): void => {
    event.preventDefault()
    scrollToAnchor(href)
  }, [])

  const handleMobileAnchorClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, href: string): void => {
      event.preventDefault()
      setMobileOpen(false)
      // Wait for the sheet's scroll lock to release before scrolling.
      window.setTimeout(() => scrollToAnchor(href), 120)
    },
    [],
  )

  return (
    <header
      className={cn(
        'sticky top-0 z-40 transition-colors duration-300',
        scrolled ? 'border-b border-white/8 bg-background/85 backdrop-blur-md' : 'border-b border-transparent bg-transparent',
      )}
    >
      <div className="flex h-16 w-full max-w-none items-center justify-between gap-3 px-3 sm:px-4">
        <Link
          href="/"
          aria-label="PhysioMap home"
          className="group flex shrink-0 items-center gap-2.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-copper"
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

        {/* Section anchors: centered between the two clusters on xl screens */}
        <nav
          aria-label="Landing page sections"
          className="hidden flex-1 items-center justify-center gap-1 xl:flex"
        >
          {HEADER_NAV.map((item) => (
            <a
              key={item.id}
              href={item.href}
              onClick={(event) => handleAnchorClick(event, item.href)}
              className="flex h-11 items-center rounded-full px-3.5 text-sm font-medium text-muted-foreground transition-colors duration-150 hover:bg-white/5 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            asChild
            className="hidden h-11 bg-brand-blue px-5 font-semibold text-white hover:bg-brand-blue/85 sm:inline-flex"
          >
            <Link href={HEADER_CTA.href}>{HEADER_CTA.label}</Link>
          </Button>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open navigation menu"
                className="h-11 w-11 rounded-full text-muted-foreground hover:text-foreground xl:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="border-white/10 bg-surface">
              <SheetHeader>
                <SheetTitle className="font-heading text-left">{HEADER_CTA.mobileMenuLabel}</SheetTitle>
                <SheetDescription className="sr-only">{HEADER_CTA.mobileMenuDescription}</SheetDescription>
              </SheetHeader>
              <nav aria-label="Landing page sections, mobile" className="flex flex-col gap-1 px-4">
                {HEADER_NAV.map((item) => (
                  <a
                    key={item.id}
                    href={item.href}
                    onClick={(event) => handleMobileAnchorClick(event, item.href)}
                    className="flex h-11 items-center rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors duration-150 hover:bg-white/5 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper"
                  >
                    {item.label}
                  </a>
                ))}
                <Button
                  asChild
                  className="mt-4 h-12 bg-brand-blue text-base font-semibold text-white hover:bg-brand-blue/85"
                >
                  <Link href={HEADER_CTA.href} onClick={() => setMobileOpen(false)}>
                    {HEADER_CTA.label}
                    <ArrowRight className="ml-2 h-4.5 w-4.5" aria-hidden="true" />
                  </Link>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
