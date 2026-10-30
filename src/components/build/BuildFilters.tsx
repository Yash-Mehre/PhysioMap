'use client'

/** Exercise filters: level select, equipment multi-select, goal select. */

import { Dumbbell } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { EQUIPMENT_LABELS, LEVEL_LABELS, TRAINING_GOAL_LABELS } from '@/config/labels'
import { EQUIPMENT_OPTIONS, LEVEL_OPTIONS, TRAINING_GOAL_OPTIONS } from '@/config/profileOptions'
import type { Equipment, Level, TrainingGoal } from '@/types'

export interface BuildFilterState {
  level: Level | 'any'
  equipment: Equipment[]
  goal: TrainingGoal
}

export interface BuildFiltersProps {
  value: BuildFilterState
  onChange: (next: BuildFilterState) => void
}

export function BuildFilters({ value, onChange }: BuildFiltersProps) {
  const toggleEquipment = (item: Equipment): void => {
    const equipment = value.equipment.includes(item)
      ? value.equipment.filter((entry) => entry !== item)
      : [...value.equipment, item]
    onChange({ ...value, equipment })
  }

  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Exercise filters">
      <Select
        value={value.level}
        onValueChange={(level) => onChange({ ...value, level: level as BuildFilterState['level'] })}
      >
        <SelectTrigger aria-label="Filter by level" className="h-9 w-[132px] border-white/10 bg-surface-raised text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="any">Any level</SelectItem>
          {LEVEL_OPTIONS.map((level) => (
            <SelectItem key={level} value={level}>
              {LEVEL_LABELS[level]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="h-9 border-white/10 bg-surface-raised text-xs font-normal hover:bg-surface"
            aria-label="Filter by equipment"
          >
            <Dumbbell className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
            Equipment
            {value.equipment.length > 0 ? (
              <span className="ml-1 rounded-full bg-mode-build/20 px-1.5 py-0.5 text-[10px] font-semibold text-mode-build">
                {value.equipment.length}
              </span>
            ) : null}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-56 border-white/10 bg-surface">
          <div className="space-y-1">
            <p className="px-1 pb-1 text-[11px] text-muted-foreground">Show exercises using:</p>
            {EQUIPMENT_OPTIONS.map((item) => (
              <label
                key={item}
                className="flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
              >
                {EQUIPMENT_LABELS[item]}
                <Checkbox checked={value.equipment.includes(item)} onCheckedChange={() => toggleEquipment(item)} />
              </label>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <Select
        value={value.goal}
        onValueChange={(goal) => onChange({ ...value, goal: goal as TrainingGoal })}
      >
        <SelectTrigger aria-label="Training goal" className="h-9 w-[150px] border-white/10 bg-surface-raised text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {TRAINING_GOAL_OPTIONS.map((goal) => (
            <SelectItem key={goal} value={goal}>
              {TRAINING_GOAL_LABELS[goal]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
