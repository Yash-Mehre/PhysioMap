'use client'

/** Pain Log tab: entries, severity trend sparkline per region, clear/remove. */

import { toast } from 'sonner'
import { NotebookPen, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { REGION_BY_ID } from '@/config/regions'
import { SENSATION_LABELS } from '@/config/assessment'
import { URGENCY_COLORS } from '@/config/theme'
import { regionSeverityTrend, severityToHeat, severityTrendPoints } from '@/lib/pain/heat'
import { HEAT_COLORS } from '@/config/theme'
import { useState } from 'react'
import { useHydrated } from '@/hooks/useHydrated'
import { usePainLogStore } from '@/store/usePainLogStore'
import type { PainLogEntry, RegionContent } from '@/types'

export interface PainLogTabProps {
  content: RegionContent
}

function formatEntryDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function SeverityBadge({ severity }: { severity: number }) {
  const heat = severityToHeat(severity)
  const color = heat === 'mild' ? HEAT_COLORS.mild : heat === 'moderate' ? HEAT_COLORS.moderate : HEAT_COLORS.severe
  return (
    <span
      className="flex h-7 w-7 items-center justify-center rounded-lg font-heading text-sm font-bold"
      style={{ backgroundColor: `${color}22`, color }}
      aria-label={`Severity ${severity} of 10`}
    >
      {severity}
    </span>
  )
}

export function PainLogTab({ content }: PainLogTabProps) {
  const hydrated = useHydrated()
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null)
  const entries = usePainLogStore((state) => state.entries)
  const removeEntry = usePainLogStore((state) => state.removeEntry)
  const clearAll = usePainLogStore((state) => state.clearAll)

  const trend = regionSeverityTrend(entries, content.region.id)
  const trendPoints = severityTrendPoints(trend)
  const selectedEntry = entries.find((entry) => entry.id === selectedEntryId) ?? null

  if (!hydrated) {
    return <div className="h-24 animate-pulse rounded-xl bg-white/5" aria-busy="true" />
  }

  return (
    <div className="space-y-4">
      {trend.length >= 2 ? (
        <section aria-label="Severity trend" className="rounded-xl border border-white/8 bg-surface-raised/60 p-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-copper">
              {content.region.label} severity trend
            </h2>
            <span className="text-[11px] text-muted-foreground">
              last {trend.length} {trend.length === 1 ? 'entry' : 'entries'}
            </span>
          </div>
          <svg viewBox="0 0 100 28" className="mt-2 h-10 w-full" role="img" aria-label="Severity trend line chart">
            <line x1="0" y1="24" x2="100" y2="24" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
            <line x1="0" y1="4" x2="100" y2="4" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" strokeDasharray="2 2" />
            <polyline
              points={trendPoints}
              fill="none"
              stroke={HEAT_COLORS.moderate}
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </section>
      ) : null}

      {entries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/12 p-6 text-center">
          <NotebookPen className="mx-auto mb-2 h-5 w-5 text-copper" aria-hidden="true" />
          <p className="text-sm font-medium text-foreground">No pain entries yet</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Complete an assessment in the Assess tab and tap “Save to Pain Log” — logged regions glow on the body
            map in Pain mode.
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-copper">
              All entries ({entries.length})
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-mode-pain hover:bg-mode-pain/10 hover:text-mode-pain"
              onClick={() => {
                clearAll()
                toast.success('Pain log cleared')
              }}
            >
              <Trash2 className="mr-1 h-3.5 w-3.5" aria-hidden="true" /> Clear log
            </Button>
          </div>
          <ul className="space-y-2">
            {entries.map((entry) => (
              <EntryRow
                key={entry.id}
                entry={entry}
                selected={entry.id === selectedEntryId}
                onSelect={() => setSelectedEntryId(entry.id)}
                onRemove={() => {
                  removeEntry(entry.id)
                  if (selectedEntryId === entry.id) setSelectedEntryId(null)
                }}
              />
            ))}
          </ul>
          {selectedEntry ? <EntryDetails entry={selectedEntry} /> : null}
        </>
      )}
    </div>
  )
}

function EntryRow({
  entry,
  selected,
  onSelect,
  onRemove,
}: {
  entry: PainLogEntry
  selected: boolean
  onSelect: () => void
  onRemove: () => void
}) {
  return (
    <li className={`flex items-start gap-3 rounded-xl border bg-surface-raised/60 p-3 ${selected ? 'border-mode-pain/60' : 'border-white/8'}`}>
      <SeverityBadge severity={entry.severity} />
      <button type="button" className="min-w-0 flex-1 text-left" onClick={onSelect} aria-expanded={selected}>
        <p className="flex flex-wrap items-center gap-x-2 text-xs font-semibold text-foreground">
          {REGION_BY_ID[entry.regionId].label}
          <span className="font-normal text-muted-foreground">{formatEntryDate(entry.date)}</span>
          {entry.urgency ? (
            <span
              className="rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide"
              style={{ backgroundColor: `${URGENCY_COLORS[entry.urgency]}22`, color: URGENCY_COLORS[entry.urgency] }}
            >
              {entry.urgency}
            </span>
          ) : null}
        </p>
        {entry.sensations.length > 0 ? (
          <p className="mt-1 truncate text-[11px] text-muted-foreground">
            {entry.sensations.map((sensation) => SENSATION_LABELS[sensation]).join(', ')}
          </p>
        ) : null}
      </button>
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Remove ${REGION_BY_ID[entry.regionId].label} entry`}
        className="h-7 w-7 shrink-0 rounded-full text-muted-foreground hover:bg-mode-pain/10 hover:text-mode-pain"
        onClick={onRemove}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </li>
  )
}

function EntryDetails({ entry }: { entry: PainLogEntry }) {
  return (
    <section className="rounded-xl border border-mode-pain/30 bg-mode-pain/5 p-4" aria-label="Pain log details">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-mode-pain">
          Log details
        </h3>
        <span className="text-[11px] text-muted-foreground">
          {new Date(entry.date).toLocaleString()}
        </span>
      </div>
      <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
        <div><dt className="text-muted-foreground">Region</dt><dd className="font-medium">{REGION_BY_ID[entry.regionId].label}</dd></div>
        <div><dt className="text-muted-foreground">Severity</dt><dd className="font-medium">{entry.severity} / 10</dd></div>
        <div className="sm:col-span-2"><dt className="text-muted-foreground">Symptoms</dt><dd className="font-medium">{entry.sensations.map((item) => SENSATION_LABELS[item]).join(', ') || 'Not recorded'}</dd></div>
        <div><dt className="text-muted-foreground">Urgency</dt><dd className="font-medium">{entry.urgency ?? 'Not assessed'}</dd></div>
      </dl>
    </section>
  )
}
