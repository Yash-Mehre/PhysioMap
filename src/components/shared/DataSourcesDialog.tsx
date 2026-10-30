'use client';

/**
 * Data sources dialog — shows which health data providers are active.
 * The curated local dataset is always on; live adapters (wger, Open Food
 * Facts) are optional and toggled by environment flags. Status is fetched
 * with TanStack Query, only while the dialog is open.
 */

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { healthDataService } from '@/services/nutritionService'

const STALE_TIME_MS = 5 * 60 * 1000
const ACTIVE_DOT_COLOR = '#58B584'
const INACTIVE_DOT_COLOR = '#9AA6BC'

export function DataSourcesDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  const { data, isPending, isError } = useQuery({
    queryKey: ['health-data-status'],
    queryFn: () => healthDataService.getStatus(),
    enabled: open,
    staleTime: STALE_TIME_MS,
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto border-white/10 bg-surface sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">Data sources</DialogTitle>
          <DialogDescription>
            PhysioMap runs fully offline on its curated local datasets. Optional live adapters extend it when
            enabled.
          </DialogDescription>
        </DialogHeader>

        {isPending ? (
          <div className="space-y-3 py-2" aria-busy="true">
            <Skeleton className="h-16 w-full bg-white/8" />
            <Skeleton className="h-16 w-full bg-white/8" />
            <Skeleton className="h-16 w-full bg-white/8" />
          </div>
        ) : isError || !data ? (
          <p className="rounded-lg border border-white/8 bg-surface-raised/60 px-4 py-3 text-sm text-muted-foreground">
            Could not load provider status right now. The curated local dataset stays active either way.
          </p>
        ) : (
          <ul className="space-y-3 py-1">
            {data.providers.map((provider) => (
              <li
                key={provider.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-white/8 bg-surface-raised/60 px-4 py-3"
              >
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: provider.enabled ? ACTIVE_DOT_COLOR : INACTIVE_DOT_COLOR }}
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">{provider.label}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{provider.description}</p>
                  </div>
                </div>
                {provider.enabled ? (
                  <span className="shrink-0 rounded-full border border-[#58B584]/30 bg-[#58B584]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[#58B584]">
                    Active
                  </span>
                ) : (
                  <span className="shrink-0 rounded-full border border-white/15 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                    Optional · off
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}

        <Separator className="bg-white/8" />
        <p className="text-xs leading-relaxed text-muted-foreground">
          Enable adapters with ENABLE_WGER / ENABLE_OPEN_FOOD_FACTS environment flags.
        </p>
      </DialogContent>
    </Dialog>
  )
}
