'use client'

/** Pain mode panel: Assess / Relief / Ergonomics / Remedies / Pain Log. */

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SymptomForm, type SymptomFormValues } from '@/components/pain/SymptomForm'
import { AssessmentResult } from '@/components/pain/AssessmentResult'
import { ReliefTab } from '@/components/pain/ReliefTab'
import { ErgonomicsTab } from '@/components/pain/ErgonomicsTab'
import { RemediesTab } from '@/components/pain/RemediesTab'
import { PainLogTab } from '@/components/pain/PainLogTab'
import { painService } from '@/services/painService'
import type { PainAssessmentResult, RegionContent } from '@/types'

export interface PainPanelProps {
  content: RegionContent
}

export function PainPanel({ content }: PainPanelProps) {
  const [assessment, setAssessment] = useState<PainAssessmentResult | null>(null)
  const [assessmentInput, setAssessmentInput] = useState<SymptomFormValues | null>(null)

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
    return result
  }

  return (
    <Tabs defaultValue="assess" className="flex flex-col gap-4 px-4 py-4 sm:px-5">
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
            }}
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
        <PainLogTab content={content} />
      </TabsContent>
    </Tabs>
  )
}
