'use client'

/** Info mode panel: Overview / Injuries & Prevention / Quiz tabs. */

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { OverviewTab } from '@/components/info/OverviewTab'
import { InjuryPreventionTab } from '@/components/info/InjuryPreventionTab'
import { QuizTab } from '@/components/info/QuizTab'
import type { RegionContent } from '@/types'

export interface InfoPanelProps {
  content: RegionContent
}

export function InfoPanel({ content }: InfoPanelProps) {
  return (
    <Tabs defaultValue="overview" className="flex flex-col gap-4 px-4 py-4 sm:px-5">
      <TabsList className="grid w-full grid-cols-3 bg-surface-raised/80">
        <TabsTrigger value="overview" className="px-1 text-xs data-[state=active]:text-foreground">
          Overview
        </TabsTrigger>
        <TabsTrigger value="prevention" className="px-1 text-xs data-[state=active]:text-foreground">
          Injuries
        </TabsTrigger>
        <TabsTrigger value="quiz" className="px-1 text-xs data-[state=active]:text-foreground">
          Quiz
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-0 focus-visible:outline-none">
        <OverviewTab content={content} />
      </TabsContent>

      <TabsContent value="prevention" className="mt-0 focus-visible:outline-none">
        <InjuryPreventionTab content={content} />
      </TabsContent>

      <TabsContent value="quiz" className="mt-0 focus-visible:outline-none">
        <QuizTab />
      </TabsContent>
    </Tabs>
  )
}
