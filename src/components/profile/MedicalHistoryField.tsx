'use client'

/**
 * Medical-history editor for the profile form: searchable, grouped condition
 * checkboxes (exclusive "None of the above") plus a validated free-text
 * "Other" chip input. Everything stays in local form state until save.
 */

import { useId, useMemo, useState } from 'react'
import { Plus, Search, X } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  MEDICAL_CONDITIONS,
  MEDICAL_CONDITION_GROUP_LABELS,
  MEDICAL_CONDITION_GROUPS,
  OTHER_CONDITION_LIMITS,
} from '@/config/medicalConditions'
import type { MedicalCondition, MedicalConditionGroup, MedicalConditionId } from '@/config/medicalConditions'
import { cn } from '@/lib/utils'

export interface MedicalHistoryValue {
  medicalConditions: MedicalConditionId[]
  otherConditions: string[]
}

export interface MedicalHistoryFieldProps {
  value: MedicalHistoryValue
  onChange: (next: MedicalHistoryValue) => void
}

/** Group the flat condition list once per render. */
const CONDITIONS_BY_GROUP = Object.fromEntries(
  MEDICAL_CONDITION_GROUPS.map((group) => [group, MEDICAL_CONDITIONS.filter((item) => item.group === group)]),
) as unknown as Record<MedicalConditionGroup, readonly MedicalCondition[]>

export function MedicalHistoryField({ value, onChange }: MedicalHistoryFieldProps) {
  const fieldId = useId()
  const [query, setQuery] = useState('')
  const [otherInput, setOtherInput] = useState('')
  const [otherError, setOtherError] = useState<string | null>(null)
  const [openGroups, setOpenGroups] = useState<string[]>([])

  const noneSelected = value.medicalConditions.length === 0 && value.otherConditions.length === 0
  const normalizedQuery = query.trim().toLowerCase()

  /** Groups that still contain matches for the current search query. */
  const visibleGroups = useMemo(() => {
    if (normalizedQuery === '') return MEDICAL_CONDITION_GROUPS
    return MEDICAL_CONDITION_GROUPS.filter((group) =>
      CONDITIONS_BY_GROUP[group].some((condition) =>
        condition.label.toLowerCase().includes(normalizedQuery),
      ),
    )
  }, [normalizedQuery])

  /** While searching, matched groups are forced open; otherwise user-controlled. */
  const accordionValue = normalizedQuery !== '' ? visibleGroups.map(String) : openGroups

  const toggleCondition = (id: MedicalConditionId): void => {
    const next = value.medicalConditions.includes(id)
      ? value.medicalConditions.filter((item) => item !== id)
      : [...value.medicalConditions, id]
    onChange({ ...value, medicalConditions: next })
  }

  const handleNoneToggle = (checked: boolean): void => {
    if (checked) onChange({ medicalConditions: [], otherConditions: [] })
  }

  const addOther = (): void => {
    const trimmed = otherInput.trim()
    if (trimmed === '') {
      setOtherError('Type a condition first.')
      return
    }
    if (trimmed.length > OTHER_CONDITION_LIMITS.maxLength) {
      setOtherError(`Keep it under ${OTHER_CONDITION_LIMITS.maxLength} characters.`)
      return
    }
    if (value.otherConditions.some((item) => item.toLowerCase() === trimmed.toLowerCase())) {
      setOtherError('That condition is already in your list.')
      return
    }
    if (value.otherConditions.length >= OTHER_CONDITION_LIMITS.maxItems) {
      setOtherError(`Up to ${OTHER_CONDITION_LIMITS.maxItems} other conditions.`)
      return
    }
    setOtherError(null)
    setOtherInput('')
    onChange({ ...value, otherConditions: [...value.otherConditions, trimmed] })
  }

  return (
    <section className="space-y-3" aria-label="Medical history">
      <div className="space-y-1">
        <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-copper">
          Medical history (optional)
        </h3>
        <p className="text-xs text-muted-foreground">Saved only on this device. It is never uploaded.</p>
      </div>

      {/* Selected chips */}
      {noneSelected ? null : (
        <ul className="flex flex-wrap gap-1.5" aria-label="Selected conditions">
          {value.medicalConditions.map((id) => (
            <Chip
              key={id}
              label={MEDICAL_CONDITIONS.find((condition) => condition.id === id)?.label ?? id}
              onRemove={() => toggleCondition(id)}
            />
          ))}
          {value.otherConditions.map((item) => (
            <Chip
              key={`other-${item}`}
              label={item}
              onRemove={() =>
                onChange({ ...value, otherConditions: value.otherConditions.filter((entry) => entry !== item) })
              }
            />
          ))}
        </ul>
      )}

      {/* Search */}
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          id={`${fieldId}-search`}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search conditions…"
          className="h-9 pl-9"
        />
      </div>

      {/* Grouped lists */}
      <div className="rounded-xl border border-white/8 bg-surface-raised/40 px-3">
        <Accordion
          type="multiple"
          value={accordionValue}
          onValueChange={setOpenGroups}
          className="scroll-slim max-h-72 overflow-y-auto"
        >
          {visibleGroups.map((group) => {
            const groupConditions = CONDITIONS_BY_GROUP[group].filter(
              (condition) =>
                normalizedQuery === '' || condition.label.toLowerCase().includes(normalizedQuery),
            )
            const selectedCount = groupConditions.filter((condition) =>
              value.medicalConditions.includes(condition.id),
            ).length
            return (
              <AccordionItem key={group} value={group} className="border-white/8">
                <AccordionTrigger className="py-3 text-xs font-semibold text-foreground hover:no-underline">
                  <span className="flex items-center gap-2">
                    {MEDICAL_CONDITION_GROUP_LABELS[group]}
                    {selectedCount > 0 ? (
                      <Badge className="h-4.5 rounded-full border-transparent bg-copper/20 px-1.5 text-[10px] font-bold text-copper hover:bg-copper/20">
                        {selectedCount}
                      </Badge>
                    ) : null}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-3">
                  <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                    {groupConditions.map((condition) => (
                      <ConditionOption
                        key={condition.id}
                        condition={condition}
                        checked={value.medicalConditions.includes(condition.id)}
                        onToggle={() => toggleCondition(condition.id)}
                      />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )
          })}
          {visibleGroups.length === 0 ? (
            <p className="py-4 text-center text-xs text-muted-foreground">
              No conditions match “{query.trim()}”.
            </p>
          ) : null}
        </Accordion>
      </div>

      {/* None of the above */}
      <label
        className={cn(
          'flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-xs font-medium transition-colors',
          noneSelected
            ? 'border-copper/50 bg-copper/10 text-copper'
            : 'border-white/8 bg-surface-raised/50 text-muted-foreground hover:border-white/20 hover:text-foreground',
        )}
      >
        <Checkbox
          checked={noneSelected}
          onCheckedChange={(checked) => handleNoneToggle(checked === true)}
          aria-label="None of the above"
        />
        None of the above
      </label>

      {/* Other (free text) */}
      <div className="space-y-1.5">
        <Label htmlFor={`${fieldId}-other`}>Other</Label>
        <div className="flex gap-2">
          <Input
            id={`${fieldId}-other`}
            value={otherInput}
            onChange={(event) => {
              setOtherInput(event.target.value)
              if (otherError !== null) setOtherError(null)
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                addOther()
              }
            }}
            placeholder="Add a condition not listed"
            aria-invalid={otherError !== null}
            aria-describedby={otherError !== null ? `${fieldId}-other-error` : undefined}
          />
          <Button
            type="button"
            variant="outline"
            onClick={addOther}
            className="shrink-0 border-white/15 text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-4 w-4" aria-hidden="true" /> Add
          </Button>
        </div>
        {otherError !== null ? (
          <p id={`${fieldId}-other-error`} aria-live="polite" className="text-xs text-mode-pain">
            {otherError}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Up to {OTHER_CONDITION_LIMITS.maxItems} entries, {OTHER_CONDITION_LIMITS.maxLength} characters each.
          </p>
        )}
      </div>
    </section>
  )
}

/** One labelled condition checkbox row. */
function ConditionOption({
  condition,
  checked,
  onToggle,
}: {
  condition: MedicalCondition
  checked: boolean
  onToggle: () => void
}) {
  return (
    <label className="flex min-h-9 cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground has-[button:focus-visible]:outline has-[button:focus-visible]:outline-2 has-[button:focus-visible]:outline-copper">
      <Checkbox checked={checked} onCheckedChange={onToggle} aria-label={condition.label} />
      <span className="leading-snug">{condition.label}</span>
    </label>
  )
}

/** Removable selected-condition chip. */
function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <li className="inline-flex items-center gap-1 rounded-full border border-mode-info/30 bg-mode-info/10 py-0.5 pl-2.5 pr-1 text-[11px] font-medium text-mode-info">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label}`}
        className="rounded-full p-0.5 transition-colors hover:bg-mode-info/20 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-copper"
      >
        <X className="h-3 w-3" aria-hidden="true" />
      </button>
    </li>
  )
}
