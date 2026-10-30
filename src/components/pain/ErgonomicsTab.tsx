'use client'

/** Ergonomics tab: region tips + the global desk-worker checklist with posture score. */

import { useCallback, useEffect, useState } from 'react'
import { Armchair, CheckCircle2, MonitorCheck } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { DESK_CHECKLIST } from '@/config/ergonomics'
import { STORAGE_KEYS } from '@/config/storageKeys'
import { readStoredValue, writeStoredValue } from '@/lib/storage/storage'
import { useHydrated } from '@/hooks/useHydrated'
import type { RegionContent } from '@/types'

export interface ErgonomicsTabProps {
  content: RegionContent
}

function postureLabel(score: number): string {
  if (score >= 85) return 'Excellent desk setup'
  if (score >= 60) return 'Solid — a few tweaks left'
  return 'Worth a desk reset today'
}

export function ErgonomicsTab({ content }: ErgonomicsTabProps) {
  const hydrated = useHydrated()
  const [checked, setChecked] = useState<string[]>([])

  useEffect(() => {
    if (!hydrated) return
    setChecked(readStoredValue<string[]>(STORAGE_KEYS.deskChecklist, []))
  }, [hydrated])

  const toggleItem = useCallback((id: string): void => {
    setChecked((current) => {
      const next = current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id]
      writeStoredValue(STORAGE_KEYS.deskChecklist, next)
      return next
    })
  }, [])

  const score = Math.round((checked.length / DESK_CHECKLIST.length) * 100)

  return (
    <div className="space-y-5">
      <section aria-label="Region ergonomics" className="space-y-2.5">
        <h2 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-copper">
          <Armchair className="h-3.5 w-3.5" aria-hidden="true" /> For your {content.region.label.toLowerCase()}
        </h2>
        <ul className="space-y-2">
          {content.pain.ergonomics.map((tip) => (
            <li key={tip.title} className="rounded-xl border border-white/8 bg-surface-raised/60 p-3.5">
              <p className="text-sm font-semibold text-foreground">{tip.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{tip.detail}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="Desk worker checklist" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-copper">
            <MonitorCheck className="h-3.5 w-3.5" aria-hidden="true" /> Desk worker checklist
          </h2>
          <span className="text-[11px] text-muted-foreground">
            {checked.length}/{DESK_CHECKLIST.length} · {postureLabel(score)}
          </span>
        </div>
        <Progress
          value={score}
          aria-label={`Posture score ${score} out of 100`}
          className="h-2 bg-white/8 [&>div]:bg-mode-pain"
        />
        <ul className="space-y-2">
          {DESK_CHECKLIST.map((item) => {
            const isChecked = checked.includes(item.id)
            return (
              <li key={item.id}>
                <label
                  className={`flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 transition-colors duration-150 ${
                    isChecked ? 'border-mode-pain/30 bg-mode-pain/8' : 'border-white/8 bg-surface-raised/50 hover:border-white/15'
                  }`}
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={() => toggleItem(item.id)}
                    className="mt-0.5 data-[state=checked]:border-mode-pain data-[state=checked]:bg-mode-pain"
                    aria-label={item.label}
                  />
                  <span className="min-w-0">
                    <span
                      className={`flex items-center gap-1.5 text-sm font-medium ${
                        isChecked ? 'text-foreground' : 'text-foreground/90'
                      }`}
                    >
                      {isChecked ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-mode-pain" aria-hidden="true" />
                      ) : null}
                      {item.label}
                    </span>
                    <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">
                      {item.detail}
                    </span>
                  </span>
                </label>
              </li>
            )
          })}
        </ul>
        <p className="text-[11px] text-muted-foreground/80">Progress is saved on this device.</p>
      </section>
    </div>
  )
}
