'use client'

/**
 * The 3-zone explore workspace: Region List (left) · 3D avatar with overlays
 * (center) · Context Panel (right). Mobile: avatar fills the screen, the
 * panel becomes a bottom sheet and the region list opens in a drawer.
 */

import { useCallback, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { List, Loader2, MousePointerClick, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ModeSwitcher } from '@/components/layout/ModeSwitcher'
import { ViewControls } from '@/components/avatar/ViewControls'
import { LayerControls } from '@/components/info/LayerControls'
import { ContextPanel } from '@/components/explore/ContextPanel'
import { MobileSheet, MobileSheetHeader } from '@/components/explore/MobileSheet'
import { RegionList } from '@/components/explore/RegionList'
import { REGION_BY_ID } from '@/config/regions'
import { MODE_COLORS } from '@/config/theme'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { usePrefetchRegions } from '@/hooks/useRegionContent'
import { useRegionVisualState } from '@/hooks/useRegionVisualState'
import { useUrlSync } from '@/hooks/useUrlSync'
import { useExplorerStore } from '@/store/useExplorerStore'
import { useQuizStore } from '@/store/useQuizStore'
import { useHydrated } from '@/hooks/useHydrated'
import { isProfileComplete } from '@/lib/health/profileValidation'
import { useProfileStore } from '@/store/useProfileStore'
import { ProfileRequiredState } from '@/components/health/ProfileRequiredState'
import type { RegionId } from '@/types'

const AvatarCanvas = dynamic(() => import('@/components/avatar/AvatarCanvas'), {
  ssr: false,
  loading: () => (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-3"
      role="status"
      aria-label="Loading 3D body map"
    >
      <Loader2 className="h-6 w-6 animate-spin text-copper" aria-hidden="true" />
      <p className="text-xs text-muted-foreground">Loading 3D body map…</p>
    </div>
  ),
})

const MODE_LABELS = { build: 'Build', pain: 'Pain', info: 'Info' } as const

export function ExploreWorkspace({ embedded = false }: { embedded?: boolean }) {
  const hydrated = useHydrated()
  const profile = useProfileStore((state) => state.profile)

  if (!hydrated) {
    return <div className="h-full min-h-[420px] animate-pulse bg-background" aria-busy="true" />
  }

  if (!isProfileComplete(profile)) {
    return (
      <div
        className={
          embedded
            ? 'min-h-[520px] bg-background p-6'
            : 'flex flex-1 items-center justify-center bg-background p-6'
        }
      >
        <ProfileRequiredState
          title="Set up your profile to explore"
          description="Create your local profile first so Build, Pain and personalized recommendations can use your goals and safety information. Your profile stays on this device."
        />
      </div>
    )
  }

  return <ExploreWorkspaceContent embedded={embedded} />
}

function ExploreWorkspaceContent({ embedded }: { embedded: boolean }) {
  useUrlSync()
  useKeyboardShortcuts()
  usePrefetchRegions()

  const mode = useExplorerStore((state) => state.mode)
  const selectedRegionId = useExplorerStore((state) => state.selectedRegionId)
  const hoveredRegionId = useExplorerStore((state) => state.hoveredRegionId)
  const labelsVisible = useExplorerStore((state) => state.labelsVisible)
  const isolate = useExplorerStore((state) => state.isolate)
  const silhouette = useExplorerStore((state) => state.silhouette)
  const cameraView = useExplorerStore((state) => state.cameraView)
  const cameraRequestId = useExplorerStore((state) => state.cameraRequestId)
  const selectRegion = useExplorerStore((state) => state.selectRegion)
  const setHoveredRegion = useExplorerStore((state) => state.setHoveredRegion)
  const setRegionsDrawerOpen = useExplorerStore((state) => state.setRegionsDrawerOpen)
  const regionsDrawerOpen = useExplorerStore((state) => state.regionsDrawerOpen)

  const quizActive = useQuizStore((state) => state.status === 'active')
  const quizAnswer = useQuizStore((state) => state.answer)

  const regionStyles = useRegionVisualState(mode)
  const [listOpenDesktop, setListOpenDesktop] = useState(true)

  /** Region clicks route to the quiz while it is running. */
  const handleSelect = useCallback(
    (regionId: RegionId | null) => {
      if (quizActive && regionId !== null) {
        quizAnswer(regionId)
        return
      }
      selectRegion(regionId)
    },
    [quizActive, quizAnswer, selectRegion],
  )

  const openRegionsBrowser = useCallback(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setRegionsDrawerOpen(true)
    } else {
      setListOpenDesktop(true)
    }
  }, [setRegionsDrawerOpen])

  const sheetHeader = useMemo(() => {
    const accent = MODE_COLORS[mode]
    if (selectedRegionId) {
      return (
        <MobileSheetHeader
          title={REGION_BY_ID[selectedRegionId].label}
          subtitle={`${MODE_LABELS[mode]} mode — use the mode pills above the body`}
          accent={accent}
        />
      )
    }
    return (
      <MobileSheetHeader
        title="Tap a body part to begin"
        subtitle="Tap · Explore · Act"
        accent={accent}
      />
    )
  }, [mode, selectedRegionId])

  return (
    <div
      className={`flex w-full overflow-hidden ${
        embedded ? 'h-[min(900px,calc(100dvh-4rem))] min-h-[680px]' : 'h-[calc(100dvh-4rem)]'
      }`}
    >
      {/* Left: region list (desktop) */}
      {listOpenDesktop ? (
        <aside
          aria-label="Region list"
          className="hidden w-64 shrink-0 flex-col border-r border-white/8 bg-surface/70 lg:flex"
        >
          <div className="flex items-center justify-between border-b border-white/8 px-3 py-2.5">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Body regions
            </h2>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Collapse region list"
              className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
              onClick={() => setListOpenDesktop(false)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
          <RegionList onSelect={handleSelect} />
        </aside>
      ) : null}

      {/* Center: 3D avatar with overlays */}
      <main className="relative min-w-0 flex-1">
        <div className="absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-2 p-3">
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={openRegionsBrowser}
              className={`border-white/15 bg-surface/85 text-muted-foreground backdrop-blur-md hover:text-foreground ${
                listOpenDesktop ? 'lg:hidden' : ''
              }`}
            >
              <List className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" /> Regions
            </Button>
          </div>
          <ModeSwitcher className="mx-auto" />
          <div aria-hidden="true" className="w-[72px] sm:w-[124px]" />
        </div>

        {mode === 'info' && !quizActive ? (
          <LayerControls className="absolute right-3 top-[5.5rem] z-20 sm:top-24" />
        ) : null}

        {/* Selected region chip */}
        {selectedRegionId && !quizActive ? (
          <div className="absolute left-1/2 top-[4.2rem] z-20 -translate-x-1/2 sm:top-[4.6rem]">
            <span
              className="flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold text-foreground shadow-lg backdrop-blur-md"
              style={{ borderColor: `${MODE_COLORS[mode]}66`, backgroundColor: `${MODE_COLORS[mode]}1F` }}
            >
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: MODE_COLORS[mode] }}
              />
              {REGION_BY_ID[selectedRegionId].label}
              <button
                type="button"
                aria-label="Clear region selection"
                onClick={() => handleSelect(null)}
                className="rounded-full p-0.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-copper"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          </div>
        ) : !quizActive ? (
          <div className="pointer-events-none absolute bottom-[118px] left-1/2 z-10 -translate-x-1/2 lg:bottom-8">
            <span className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-white/10 bg-surface/85 px-3.5 py-1.5 text-xs text-muted-foreground shadow-lg backdrop-blur-md">
              <MousePointerClick className="h-3.5 w-3.5 text-copper" aria-hidden="true" />
              Tap a body part to begin
            </span>
          </div>
        ) : null}

        <div className="absolute bottom-3 left-1/2 z-10 hidden -translate-x-1/2 lg:block">
          <ViewControls />
        </div>
        <div className="absolute bottom-[118px] right-3 z-10 lg:hidden">
          <ViewControls />
        </div>

        <div className="h-full w-full">
          <AvatarCanvas
            selectedRegionId={selectedRegionId}
            hoveredRegionId={hoveredRegionId}
            regionStyles={regionStyles}
            labelsVisible={quizActive ? false : labelsVisible}
            silhouette={quizActive ? false : silhouette}
            showTooltip={!quizActive}
            interactive={true}
            viewRequestView={cameraView === 'free' ? 'front' : cameraView}
            viewRequestId={cameraRequestId}
            onSelect={handleSelect}
            onHover={setHoveredRegion}
            onOpenRegions={openRegionsBrowser}
          />
        </div>

        {isolate && selectedRegionId ? (
          <p className="pointer-events-none absolute bottom-16 left-1/2 z-10 hidden -translate-x-1/2 text-[11px] text-mode-info lg:block">
            Isolate on — other regions faded
          </p>
        ) : null}
      </main>

      {/* Right: context panel (desktop) */}
      <aside
        aria-label="Region details"
        className="hidden w-[440px] shrink-0 flex-col border-l border-white/8 bg-surface/70 lg:flex"
      >
        <div className="min-h-0 flex-1">
          <ContextPanel onSelect={handleSelect} />
        </div>
      </aside>

      {/* Mobile: bottom sheet panel */}
      <div className="lg:hidden">
        <MobileSheet header={sheetHeader} expandSignal={selectedRegionId}>
          <ContextPanel onSelect={handleSelect} />
        </MobileSheet>
      </div>

      {/* Mobile: regions drawer */}
      <Sheet open={regionsDrawerOpen} onOpenChange={setRegionsDrawerOpen}>
        <SheetContent side="left" className="w-72 border-white/10 bg-surface p-0">
          <SheetHeader className="border-b border-white/8 px-3 py-3">
            <SheetTitle className="text-sm font-semibold">Body regions</SheetTitle>
          </SheetHeader>
          <RegionList onSelect={handleSelect} onNavigate={() => setRegionsDrawerOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  )
}
