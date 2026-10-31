import type { Metadata } from 'next'
import { ExploreWorkspace } from '@/components/explore/ExploreWorkspace'

export const metadata: Metadata = {
  title: 'Explore',
  description: 'Tap a body part on the 3D muscle map and explore Build, Pain and Info modes.',
}

/** Explorer page — the sticky header and full-height frame come from SiteChrome. */
export default function ExplorePage() {
  return <ExploreWorkspace />
}
