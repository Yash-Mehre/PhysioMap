'use client'

/** Pain mode panel: Assess / Relief / Ergonomics / Remedies / Pain Log. */

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SymptomForm, type SymptomFormValues } from '@/components/pain/SymptomForm'
import { AssessmentResult } from '@/components/pain/AssessmentResult'
import { ReliefTab } from '@/components/pain/ReliefTab'
import { ErgonomicsTab } from '@/components/pain/ErgonomicsTab'
import { RemediesTab } from '@/components/pain/RemediesTab'
import { PainLogTab } from '@/components/pain/PainLogTab'
import { painService } from '@/services/painService'
import { useProfileStore } from '@/store/useProfileStore'
import type { PainAssessmentResult, PainLogEntry, RegionContent } from '@/types'

export interface PainPanelProps {
  content: RegionContent
}

export function PainPanel({ content }: PainPanelProps) {
  const [assessment, setAssessment] = useState<PainAssessmentResult | null>(null)
  const [assessmentInput, setAssessmentInput] = useState<SymptomFormValues | null>(null)
  const [assessmentSaved, setAssessmentSaved] = useState(false)
  const [activeTab, setActiveTab] = useState('assess')
  const profile = useProfileStore((state) => state.profile)

  const handleSubmit = async (values: SymptomFormValues): Promise<PainAssessmentResult> => {
    const result = await painService.assess({
      regionId: content.region.id,
      sensations: values.sensations,
      severity: values.severity,
      onset: values.onset,
      duration: values.duration,
      aggravators: values.aggravators,
      redFlags: values.redFlags,
    })
    setAssessmentInput(values)
    setAssessment(result)
    setAssessmentSaved(false)
    return result
  }

  const handleSelectLogEntry = (entry: PainLogEntry): void => {
    if (!entry.result) return
    setAssessment(entry.result)
    setAssessmentSaved(true)
    setAssessmentInput({
      sensations: entry.sensations,
      severity: entry.severity,
      onset: entry.onset ?? 'gradual',
      duration: entry.duration ?? 'under-1-week',
      aggravators: entry.aggravators ?? [],
      redFlags: entry.redFlags ?? [],
    })
    setActiveTab('assess')
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col gap-4 px-4 py-4 sm:px-5">
      <div className="flex items-start gap-2 rounded-xl border border-mode-pain/25 bg-mode-pain/8 p-3">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-mode-pain" aria-hidden="true" />
        <p className="text-[11px] leading-relaxed text-foreground/90">
          <span className="font-semibold">Suggestion mode:</span> guidance is tailored to your saved profile
          {profile.trainingGoal ? ` and ${profile.trainingGoal} goal` : ''} and
          current region. It is educational self-care support, not a diagnosis; urgent warning signs always take
          priority.
        </p>
      </div>
      <TabsList className="grid w-full grid-cols-5 bg-surface-raised/80">
        <TabsTrigger value="assess" className="px-1 text-[11px] data-[state=active]:text-foreground">
          Assess
        </TabsTrigger>
        <TabsTrigger value="relief" className="px-1 text-[11px] data-[state=active]:text-foreground">
          Relief
        </TabsTrigger>
        <TabsTrigger value="ergonomics" className="px-1 text-[11px] data-[state=active]:text-foreground">
          Desk
        </TabsTrigger>
        <TabsTrigger value="remedies" className="px-1 text-[11px] data-[state=active]:text-foreground">
          Remedies
        </TabsTrigger>
        <TabsTrigger value="log" className="px-1 text-[11px] data-[state=active]:text-foreground">
          Log
        </TabsTrigger>
      </TabsList>

      <TabsContent value="assess" className="mt-0 focus-visible:outline-none">
        {assessment && assessmentInput ? (
          <AssessmentResult
            result={assessment}
            input={assessmentInput}
            regionId={content.region.id}
            regionLabel={content.region.label}
            onRestart={() => {
              setAssessment(null)
              setAssessmentInput(null)
              setAssessmentSaved(false)
              setActiveTab('assess')
            }}
            initialSaved={assessmentSaved}
          />
        ) : (
          <SymptomForm regionLabel={content.region.label} onSubmit={handleSubmit} />
        )}
      </TabsContent>

      <TabsContent value="relief" className="mt-0 focus-visible:outline-none">
        <ReliefTab content={content} />
      </TabsContent>

      <TabsContent value="ergonomics" className="mt-0 focus-visible:outline-none">
        <ErgonomicsTab content={content} />
      </TabsContent>

      <TabsContent value="remedies" className="mt-0 focus-visible:outline-none">
        <RemediesTab content={content} />
      </TabsContent>

      <TabsContent value="log" className="mt-0 focus-visible:outline-none">
        <PainLogTab content={content} onSelectEntry={handleSelectLogEntry} />
      </TabsContent>
    </Tabs>
  )
}
