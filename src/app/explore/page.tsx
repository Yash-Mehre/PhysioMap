import type { Metadata } from 'next'
import { ExploreWorkspace } from '@/components/explore/ExploreWorkspace'
import { SiteHeader } from '@/components/layout/SiteHeader'

export const metadata: Metadata = {
  title: 'Explore',
  description: 'Tap a body part on the 3D muscle map and explore Build, Pain and Info modes.',
}

export default function ExplorePage() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <SiteHeader />
      <ExploreWorkspace />
    </div>
  )
}
