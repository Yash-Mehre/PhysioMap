'use client';

/** Relief tab: the region's relief exercises + guided session launcher. */

import { AlertTriangle, ChevronDown, Play, Timer } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { RELIEF_KIND_LABELS } from '@/config/labels'
import { ReliefPlayer } from '@/components/pain/ReliefPlayer'
import type { RegionContent, ReliefExercise } from '@/types'
import { SaveActionButton } from '@/components/pain/SaveActionButton'

export interface ReliefTabProps {
  content: RegionContent;
}

const KIND_TONE: Record<ReliefExercise['kind'], string> = {
  stretch: '#58B584',
  mobility: '#3B74F2',
  strengthen: '#D9A066',
  release: '#F26B4E',
};

export function ReliefTab({ content }: ReliefTabProps) {
  return (
    <div className="space-y-3">
      <p className="px-0.5 text-[11px] leading-relaxed text-muted-foreground">
        Gentle routines commonly used for this region. Move within comfort — never force a stretch.
      </p>
      <ul className="space-y-2.5">
        {content.pain.relief.map((exercise) => (
          <li key={exercise.id}>
            <ReliefCard exercise={exercise} regionId={content.region.id} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function ReliefCard({ exercise, regionId }: { exercise: ReliefExercise; regionId: RegionContent['region']['id'] }) {
  const tone = KIND_TONE[exercise.kind];
  return (
    <Collapsible className="group rounded-xl border border-white/8 bg-surface-raised/60">
      <div className="flex items-start justify-between gap-2 p-3.5">
        <CollapsibleTrigger className="flex min-w-0 flex-1 items-start gap-3 text-left focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-copper">
          <span
            aria-hidden="true"
            className="mt-1 h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: tone }}
          />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-foreground">{exercise.name}</span>
            <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
              <Badge
                variant="outline"
                className="px-1.5 py-0 text-[10px] font-medium"
                style={{ borderColor: `${tone}55`, backgroundColor: `${tone}15`, color: tone }}
              >
                {RELIEF_KIND_LABELS[exercise.kind]}
              </Badge>
              <span className="flex items-center gap-1">
                <Timer className="h-3 w-3" aria-hidden="true" />
                {formatDose(exercise)}
              </span>
            </span>
          </span>
          <ChevronDown
            className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180"
            aria-hidden="true"
          />
        </CollapsibleTrigger>
        <ReliefPlayer exercise={exercise}>
          <Button
            variant="outline"
            size="sm"
            className="h-8 shrink-0 border-mode-pain/35 text-xs text-mode-pain hover:bg-mode-pain/10 hover:text-mode-pain"
          >
            <Play className="mr-1 h-3.5 w-3.5" aria-hidden="true" /> Session
          </Button>
        </ReliefPlayer>
      </div>
      <CollapsibleContent>
        <div className="space-y-2.5 border-t border-white/8 px-3.5 pb-3.5 pt-3">
          <ol className="space-y-1.5">
            {exercise.steps.map((step, index) => (
              <li key={index} className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
                <span className="font-semibold text-foreground/70">{index + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
          {exercise.cautions.length > 0 ? (
            <p className="flex items-start gap-1.5 rounded-lg border border-mode-pain/25 bg-mode-pain/8 p-2.5 text-[11px] leading-relaxed text-mode-pain">
              <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
              {exercise.cautions.join(' ')}
            </p>
          ) : null}
          <SaveActionButton
            action="relief"
            regionId={regionId}
            title={exercise.name}
            details={exercise.steps.join(' ')}
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function formatDose(exercise: ReliefExercise): string {
  const parts: string[] = [`${exercise.sets} set${exercise.sets > 1 ? 's' : ''}`];
  if (exercise.holdSeconds) parts.push(`${exercise.holdSeconds}s hold`);
  if (exercise.reps) parts.push(`${exercise.reps} reps`);
  return parts.join(' · ');
}
