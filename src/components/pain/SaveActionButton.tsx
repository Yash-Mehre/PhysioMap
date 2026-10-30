'use client'

import { BookmarkPlus, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useHealthLogStore, type HealthLogAction } from '@/store/useHealthLogStore'
import type { RegionId } from '@/types'

interface SaveActionButtonProps {
  action: HealthLogAction
  regionId: RegionId
  title: string
  details: string
}

export function SaveActionButton({ action, regionId, title, details }: SaveActionButtonProps) {
  const addEntry = useHealthLogStore((state) => state.addEntry)
  const alreadySaved = useHealthLogStore((state) =>
    state.entries.some((entry) => entry.action === action && entry.regionId === regionId && entry.title === title),
  )

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={alreadySaved}
      onClick={() => addEntry({ action, regionId, title, details })}
      className="border-copper/35 text-xs text-copper hover:bg-copper/10"
    >
      {alreadySaved ? <Check className="mr-1 h-3.5 w-3.5" /> : <BookmarkPlus className="mr-1 h-3.5 w-3.5" />}
      {alreadySaved ? 'Saved to health log' : 'Save to health log'}
    </Button>
  )
}
