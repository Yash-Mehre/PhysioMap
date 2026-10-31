'use client'

/**
 * Layout-level site chrome. The welcome page is immersive (no header, no
 * footer) and the landing page manages its own LandingHeader/SiteFooter
 * sections; every other route gets the sticky app header — and a sticky
 * footer on scrolling pages (the explorer stays a full-height workspace).
 */

import { usePathname } from 'next/navigation'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (pathname === '/welcome' || pathname === '/') {
    return <>{children}</>
  }

  if (pathname === '/explore') {
    return (
      <div className="flex h-dvh flex-col overflow-hidden">
        <SiteHeader />
        {children}
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  )
}
