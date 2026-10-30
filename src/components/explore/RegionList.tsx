'use client'

/** Searchable, grouped region list — the keyboard & no-WebGL selection path. */

import { useMemo, useState } from 'react'
import { ChevronDown, Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { REGION_BY_ID, REGIONS } from '@/config/regions'
import { REGION_GROUP_LABELS, REGION_GROUP_ORDER } from '@/config/labels'
import { MODE_COLORS } from '@/config/theme'
import { useExplorerStore } from '@/store/useExplorerStore'
import { cn } from '@/lib/utils'
import type { RegionId } from '@/types'

export interface RegionListProps {
  onSelect: (regionId: RegionId) => void
  /** Compact variant for the mobile drawer. */
  onNavigate?: () => void
}

export function RegionList({ onSelect, onNavigate }: RegionListProps) {
  const [query, setQuery] = useState('')
  const selectedRegionId = useExplorerStore((state) => state.selectedRegionId)
  const mode = useExplorerStore((state) => state.mode)

  const groups = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return REGION_GROUP_ORDER.map((group) => ({
      group,
      regions: REGIONS.filter(
        (region) =>
          region.group === group &&
          (normalized === '' ||
            region.label.toLowerCase().includes(normalized) ||
            REGION_BY_ID[region.id].group.includes(normalized)),
      ),
    })).filter((entry) => entry.regions.length > 0)
  }, [query])

  const handleSelect = (regionId: RegionId): void => {
    onSelect(regionId)
    onNavigate?.()
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="relative px-3 pb-2 pt-3">
        <Search className="pointer-events-none absolute left-5.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search body parts…"
          aria-label="Search body parts"
          className="border-white/10 bg-surface-raised pl-9 text-sm placeholder:text-muted-foreground/60 focus-visible:ring-copper/50"
        />
        {query ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => setQuery('')}
            className="absolute right-5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>

      <nav aria-label="Body regions" className="scroll-slim min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        {groups.length === 0 ? (
          <p className="px-3 py-8 text-center text-sm text-muted-foreground">
            No regions match “{query}”.
          </p>
        ) : (
          groups.map(({ group, regions }) => (
            <section key={group} className="mb-1.5">
              <h3 className="sticky top-0 z-10 flex items-center gap-1 bg-surface px-2.5 pb-1 pt-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/80">
                <ChevronDown className="h-3 w-3" aria-hidden="true" />
                {REGION_GROUP_LABELS[group]}
              </h3>
              <ul className="mt-0.5 space-y-0.5">
                {regions.map((region) => {
                  const active = region.id === selectedRegionId
                  return (
                    <li key={region.id}>
                      <button
                        type="button"
                        onClick={() => handleSelect(region.id)}
                        aria-current={active ? 'true' : undefined}
                        className={cn(
                          'flex w-full touch-target items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-copper',
                          active
                            ? 'bg-white/10 font-semibold text-foreground'
                            : 'text-muted-foreground hover:bg-white/5 hover:text-foreground',
                        )}
                      >
                        <span
                          aria-hidden="true"
                          className={cn('h-2 w-2 shrink-0 rounded-full transition-all duration-150')}
                          style={{
                            backgroundColor: active ? MODE_COLORS[mode] : 'rgba(255,255,255,0.14)',
                            boxShadow: active ? `0 0 8px ${MODE_COLORS[mode]}` : undefined,
                          }}
                        />
                        {region.label}
                        {active ? (
                          <span
                            aria-hidden="true"
                            className="ml-auto rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                            style={{ backgroundColor: `${MODE_COLORS[mode]}22`, color: MODE_COLORS[mode] }}
                          >
                            Active
                          </span>
                        ) : null}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </section>
          ))
        )}
      </nav>
    </div>
  )
}
