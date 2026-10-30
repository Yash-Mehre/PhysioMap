'use client'

/**
 * Shared profile form — the single source of truth for editing the persisted
 * UserProfile. Used by the Health Suite Profile tab (full) and the header
 * ProfileDialog. Values are ALWAYS stored metric internally; imperial inputs
 * (ft + in / lb) convert on change and show the metric equivalent as helper
 * text. Validation runs inline through `healthProfileSchema` (zod) so the
 * Save action can never persist an out-of-range profile.
 *
 * Mount pattern: parent mounts this fresh with a `key` and passes
 * `initialProfile` — no state-sync effects.
 */

import { useId, useState } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DIET_OPTIONS,
  DIET_TAG_OPTIONS,
  GOAL_OPTIONS,
  PACE_OPTIONS,
  SEX_OPTIONS,
  UNIT_SYSTEM_OPTIONS,
  healthProfileSchema,
} from '@/config/healthSchemas'
import {
  ACTIVITY_LEVEL_LABELS,
  DIET_PREFERENCE_LABELS,
  DIET_TAG_LABELS,
  EQUIPMENT_LABELS,
  LEVEL_LABELS,
  SEX_LABELS,
  TRAINING_GOAL_LABELS,
  WEIGHT_GOAL_LABELS,
} from '@/config/labels'
import { ACTIVITY_DESCRIPTIONS, ACTIVITY_LEVEL_ORDER } from '@/config/nutrition'
import { EQUIPMENT_OPTIONS, LEVEL_OPTIONS, TRAINING_GOAL_OPTIONS } from '@/config/profileOptions'
import { cmToFtIn, ftInToCm, kgToLb, lbToKg } from '@/lib/health/units'
import type {
  ActivityLevel,
  DietPreference,
  DietTag,
  Equipment,
  Level,
  PaceKgPerWeek,
  Sex,
  TrainingGoal,
  UnitSystem,
  UserProfile,
  WeightGoal,
} from '@/types'

/** Fields of `healthProfileSchema` that the form validates inline. */
type ValidatableField =
  | 'age'
  | 'sex'
  | 'heightCm'
  | 'weightKg'
  | 'activityLevel'
  | 'goal'
  | 'paceKgPerWeek'

const VALIDATABLE_FIELDS: readonly ValidatableField[] = [
  'age',
  'sex',
  'heightCm',
  'weightKg',
  'activityLevel',
  'goal',
  'paceKgPerWeek',
]

type FieldErrors = Partial<Record<ValidatableField, string>>

interface HealthFieldValues {
  age?: number
  sex?: Sex
  heightCm?: number
  weightKg?: number
  activityLevel?: ActivityLevel
  goal?: WeightGoal
  paceKgPerWeek?: PaceKgPerWeek
}

/** Map a zod failure to "first message per field", keyed by field name. */
function validateFields(values: HealthFieldValues): FieldErrors {
  const parsed = healthProfileSchema.safeParse(values)
  if (parsed.success) return {}
  const errors: FieldErrors = {}
  for (const issue of parsed.error.issues) {
    const key = issue.path[0]
    if (typeof key !== 'string') continue
    const field = VALIDATABLE_FIELDS.find((candidate) => candidate === key)
    if (field !== undefined && errors[field] === undefined) {
      errors[field] = issue.message
    }
  }
  return errors
}

/** Parse a numeric input string; blank or non-finite becomes undefined. */
function parseNumberInput(value: string): number | undefined {
  const trimmed = value.trim()
  if (trimmed === '') return undefined
  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : undefined
}

/** Feet + inches input strings → centimetres (1 decimal); undefined when both blank. */
function imperialToCm(feetStr: string, inchesStr: string): number | undefined {
  if (feetStr.trim() === '' && inchesStr.trim() === '') return undefined
  const feet = feetStr.trim() === '' ? 0 : Number(feetStr)
  const inches = inchesStr.trim() === '' ? 0 : Number(inchesStr)
  if (!Number.isFinite(feet) || !Number.isFinite(inches)) return undefined
  return Math.round(ftInToCm(feet, inches) * 10) / 10
}

/** Pounds input string → kilograms (1 decimal); undefined when blank. */
function poundsToKg(lbStr: string): number | undefined {
  const lb = parseNumberInput(lbStr)
  return lb === undefined ? undefined : Math.round(lbToKg(lb) * 10) / 10
}

/** Inline validation message for a field (first zod issue only). */
function FieldError({ id, message }: { id: string; message: string | undefined }) {
  if (message === undefined) return null
  return (
    <p id={id} aria-live="polite" className="text-xs text-mode-pain">
      {message}
    </p>
  )
}

export interface ProfileFormProps {
  /** Profile snapshot at mount time — the form never syncs back to it. */
  initialProfile: UserProfile
  /** Called with the complete profile when the (valid) form is submitted. */
  onSave: (profile: UserProfile) => void
  /** Optional cancel callback; renders a Cancel button when provided. */
  onCancel?: () => void
  /** Hides the Training section (kept for compact embeds). */
  compact?: boolean
}

export function ProfileForm({ initialProfile, onSave, onCancel, compact = false }: ProfileFormProps) {
  const formId = useId()
  const [ageStr, setAgeStr] = useState(initialProfile.age !== undefined ? String(initialProfile.age) : '')
  const [sex, setSex] = useState<Sex | undefined>(initialProfile.sex)
  const [unitSystem, setUnitSystem] = useState<UnitSystem>(initialProfile.unitSystem)
  const [heightCmStr, setHeightCmStr] = useState(
    initialProfile.heightCm !== undefined ? String(initialProfile.heightCm) : '',
  )
  const [weightKgStr, setWeightKgStr] = useState(
    initialProfile.weightKg !== undefined ? String(initialProfile.weightKg) : '',
  )
  const [heightFtStr, setHeightFtStr] = useState(() =>
    initialProfile.heightCm !== undefined ? String(cmToFtIn(initialProfile.heightCm).feet) : '',
  )
  const [heightInStr, setHeightInStr] = useState(() =>
    initialProfile.heightCm !== undefined ? String(cmToFtIn(initialProfile.heightCm).inches) : '',
  )
  const [weightLbStr, setWeightLbStr] = useState(() =>
    initialProfile.weightKg !== undefined ? String(Math.round(kgToLb(initialProfile.weightKg))) : '',
  )
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | undefined>(initialProfile.activityLevel)
  const [goal, setGoal] = useState<WeightGoal | undefined>(initialProfile.goal)
  const [pace, setPace] = useState<PaceKgPerWeek>(initialProfile.paceKgPerWeek ?? 0.5)
  const [dietPreference, setDietPreference] = useState<DietPreference>(initialProfile.dietPreference)
  const [excludedTags, setExcludedTags] = useState<DietTag[]>(initialProfile.excludedTags)
  const [trainingLevel, setTrainingLevel] = useState<Level>(initialProfile.trainingLevel)
  const [trainingGoal, setTrainingGoal] = useState<TrainingGoal>(initialProfile.trainingGoal)
  const [equipment, setEquipment] = useState<Equipment[]>(initialProfile.equipment)

  // Always-metric values (imperial inputs convert through the helpers above).
  const age = parseNumberInput(ageStr)
  const heightCm = unitSystem === 'metric' ? parseNumberInput(heightCmStr) : imperialToCm(heightFtStr, heightInStr)
  const weightKg = unitSystem === 'metric' ? parseNumberInput(weightKgStr) : poundsToKg(weightLbStr)

  const errors = validateFields({ age, sex, heightCm, weightKg, activityLevel, goal, paceKgPerWeek: pace })
  const isValid = Object.keys(errors).length === 0

  const draft: UserProfile = {
    ...initialProfile,
    age,
    sex,
    heightCm,
    weightKg,
    activityLevel,
    goal,
    paceKgPerWeek: pace,
    unitSystem,
    dietPreference,
    excludedTags,
    trainingLevel,
    trainingGoal,
    equipment,
  }

  const handleSexChange = (value: string): void => {
    const next = SEX_OPTIONS.find((option) => option === value)
    if (next !== undefined) setSex(next)
  }

  const handleActivityChange = (value: string): void => {
    const next = ACTIVITY_LEVEL_ORDER.find((option) => option === value)
    if (next !== undefined) setActivityLevel(next)
  }

  const handleGoalChange = (value: string): void => {
    const next = GOAL_OPTIONS.find((option) => option === value)
    if (next !== undefined) setGoal(next)
  }

  const handlePaceChange = (value: string): void => {
    const next = PACE_OPTIONS.find((option) => String(option) === value)
    if (next !== undefined) setPace(next)
  }

  const handleDietChange = (value: string): void => {
    const next = DIET_OPTIONS.find((option) => option === value)
    if (next !== undefined) setDietPreference(next)
  }

  const handleTrainingLevelChange = (value: string): void => {
    const next = LEVEL_OPTIONS.find((option) => option === value)
    if (next !== undefined) setTrainingLevel(next)
  }

  const handleTrainingGoalChange = (value: string): void => {
    const next = TRAINING_GOAL_OPTIONS.find((option) => option === value)
    if (next !== undefined) setTrainingGoal(next)
  }

  /** Toggle units, converting the visible buffers in both directions. */
  const handleUnitChange = (next: UnitSystem): void => {
    if (next === unitSystem) return
    if (next === 'imperial') {
      const cm = parseNumberInput(heightCmStr)
      if (cm !== undefined) {
        const split = cmToFtIn(cm)
        setHeightFtStr(String(split.feet))
        setHeightInStr(String(split.inches))
      } else {
        setHeightFtStr('')
        setHeightInStr('')
      }
      const kg = parseNumberInput(weightKgStr)
      setWeightLbStr(kg !== undefined ? String(Math.round(kgToLb(kg))) : '')
    } else {
      const cm = imperialToCm(heightFtStr, heightInStr)
      setHeightCmStr(cm !== undefined ? String(cm) : '')
      const kg = poundsToKg(weightLbStr)
      setWeightKgStr(kg !== undefined ? String(kg) : '')
    }
    setUnitSystem(next)
  }

  const toggleTag = (tag: DietTag): void => {
    setExcludedTags((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag],
    )
  }

  const toggleEquipment = (item: Equipment): void => {
    setEquipment((current) => {
      const next = current.includes(item) ? current.filter((value) => value !== item) : [...current, item]
      return next.length > 0 ? next : ['bodyweight']
    })
  }

  const heightHint =
    unitSystem === 'imperial' && heightCm !== undefined ? `≈ ${heightCm} cm` : undefined
  const weightHint =
    unitSystem === 'imperial' && weightKg !== undefined ? `≈ ${weightKg} kg` : undefined
  const heightMessage = errors.heightCm ?? heightHint
  const weightMessage = errors.weightKg ?? weightHint

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        if (isValid) onSave(draft)
      }}
      className="space-y-5"
    >
      {/* ---------------------------------------------------------- Body stats */}
      <section className="space-y-3" aria-label="Body stats">
        <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-copper">Body stats</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor={`${formId}-age`}>Age</Label>
            <Input
              id={`${formId}-age`}
              type="number"
              inputMode="numeric"
              min={10}
              max={100}
              value={ageStr}
              onChange={(event) => setAgeStr(event.target.value)}
              aria-invalid={errors.age !== undefined}
              aria-describedby={errors.age !== undefined ? `${formId}-age-error` : undefined}
            />
            <FieldError id={`${formId}-age-error`} message={errors.age} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${formId}-sex`}>Sex</Label>
            <Select value={sex} onValueChange={handleSexChange}>
              <SelectTrigger
                id={`${formId}-sex`}
                className="w-full"
                aria-invalid={errors.sex !== undefined}
                aria-describedby={errors.sex !== undefined ? `${formId}-sex-error` : undefined}
              >
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {SEX_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {SEX_LABELS[option]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError id={`${formId}-sex-error`} message={errors.sex} />
          </div>
          <div className="col-span-2 space-y-1.5">
            <span id={`${formId}-units-label`} className="block text-sm font-medium leading-none">
              Units
            </span>
            <div
              role="group"
              aria-labelledby={`${formId}-units-label`}
              className="grid w-full grid-cols-2 gap-1 rounded-lg border border-white/8 bg-surface-raised p-1"
            >
              {UNIT_SYSTEM_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={unitSystem === option}
                  onClick={() => handleUnitChange(option)}
                  className={cn(
                    'min-h-9 rounded-md px-3 text-xs font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60',
                    unitSystem === option
                      ? 'bg-brand-blue text-white'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {option === 'metric' ? 'Metric (cm · kg)' : 'Imperial (ft · lb)'}
                </button>
              ))}
            </div>
          </div>
          {unitSystem === 'metric' ? (
            <>
              <div className="space-y-1.5">
                <Label htmlFor={`${formId}-height-cm`}>Height (cm)</Label>
                <Input
                  id={`${formId}-height-cm`}
                  type="number"
                  min={100}
                  max={250}
                  step="any"
                  value={heightCmStr}
                  onChange={(event) => setHeightCmStr(event.target.value)}
                  aria-invalid={errors.heightCm !== undefined}
                  aria-describedby={heightMessage !== undefined ? `${formId}-height-error` : undefined}
                />
                <FieldError id={`${formId}-height-error`} message={errors.heightCm} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`${formId}-weight-kg`}>Weight (kg)</Label>
                <Input
                  id={`${formId}-weight-kg`}
                  type="number"
                  min={25}
                  max={300}
                  step="any"
                  value={weightKgStr}
                  onChange={(event) => setWeightKgStr(event.target.value)}
                  aria-invalid={errors.weightKg !== undefined}
                  aria-describedby={weightMessage !== undefined ? `${formId}-weight-error` : undefined}
                />
                <FieldError id={`${formId}-weight-error`} message={errors.weightKg} />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label htmlFor={`${formId}-height-ft`}>Height (ft)</Label>
                <Input
                  id={`${formId}-height-ft`}
                  type="number"
                  inputMode="numeric"
                  min={3}
                  max={8}
                  value={heightFtStr}
                  onChange={(event) => setHeightFtStr(event.target.value)}
                  aria-invalid={errors.heightCm !== undefined}
                  aria-describedby={heightMessage !== undefined ? `${formId}-height-error` : undefined}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`${formId}-height-in`}>Height (in)</Label>
                <Input
                  id={`${formId}-height-in`}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={11}
                  value={heightInStr}
                  onChange={(event) => setHeightInStr(event.target.value)}
                  aria-invalid={errors.heightCm !== undefined}
                  aria-describedby={heightMessage !== undefined ? `${formId}-height-error` : undefined}
                />
              </div>
              {heightMessage !== undefined && (
                <p
                  id={`${formId}-height-error`}
                  aria-live="polite"
                  className={cn(
                    'col-span-2 text-xs',
                    errors.heightCm !== undefined ? 'text-mode-pain' : 'text-muted-foreground',
                  )}
                >
                  {heightMessage}
                </p>
              )}
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor={`${formId}-weight-lb`}>Weight (lb)</Label>
                <Input
                  id={`${formId}-weight-lb`}
                  type="number"
                  min={55}
                  max={660}
                  step="any"
                  value={weightLbStr}
                  onChange={(event) => setWeightLbStr(event.target.value)}
                  aria-invalid={errors.weightKg !== undefined}
                  aria-describedby={weightMessage !== undefined ? `${formId}-weight-error` : undefined}
                />
                {weightMessage !== undefined && (
                  <p
                    id={`${formId}-weight-error`}
                    aria-live="polite"
                    className={cn(
                      'text-xs',
                      errors.weightKg !== undefined ? 'text-mode-pain' : 'text-muted-foreground',
                    )}
                  >
                    {weightMessage}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* --------------------------------------------------- Activity & goal */}
      <section className="space-y-3" aria-label="Activity and goal">
        <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-copper">Activity &amp; goal</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 space-y-1.5">
            <Label htmlFor={`${formId}-activity`}>Activity level</Label>
            <Select value={activityLevel} onValueChange={handleActivityChange}>
              <SelectTrigger
                id={`${formId}-activity`}
                className="w-full"
                aria-invalid={errors.activityLevel !== undefined}
                aria-describedby={errors.activityLevel !== undefined ? `${formId}-activity-error` : undefined}
              >
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_LEVEL_ORDER.map((option) => (
                  <SelectItem key={option} value={option}>
                    {ACTIVITY_LEVEL_LABELS[option]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {activityLevel !== undefined ? (
              <p className="text-xs text-muted-foreground">{ACTIVITY_DESCRIPTIONS[activityLevel]}</p>
            ) : (
              <FieldError id={`${formId}-activity-error`} message={errors.activityLevel} />
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${formId}-goal`}>Goal</Label>
            <Select value={goal} onValueChange={handleGoalChange}>
              <SelectTrigger
                id={`${formId}-goal`}
                className="w-full"
                aria-invalid={errors.goal !== undefined}
                aria-describedby={errors.goal !== undefined ? `${formId}-goal-error` : undefined}
              >
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {GOAL_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {WEIGHT_GOAL_LABELS[option]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError id={`${formId}-goal-error`} message={errors.goal} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${formId}-pace`}>Weekly pace</Label>
            <Select
              value={String(pace)}
              onValueChange={handlePaceChange}
              disabled={goal === 'maintain'}
            >
              <SelectTrigger id={`${formId}-pace`} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PACE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option} kg / week
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {goal === 'maintain' ? 'Pace applies when losing or gaining' : 'How fast to move toward your goal'}
            </p>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- Diet */}
      <section className="space-y-3" aria-label="Diet">
        <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-copper">Diet</h3>
        <div className="space-y-1.5">
          <Label htmlFor={`${formId}-diet`}>Diet preference</Label>
          <Select value={dietPreference} onValueChange={handleDietChange}>
            <SelectTrigger id={`${formId}-diet`} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DIET_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {DIET_PREFERENCE_LABELS[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <span id={`${formId}-exclusions-label`} className="block text-sm font-medium leading-none">
            Foods to exclude
          </span>
          <div role="group" aria-labelledby={`${formId}-exclusions-label`} className="flex flex-wrap gap-2">
            {DIET_TAG_OPTIONS.map((tag) => {
              const active = excludedTags.includes(tag)
              return (
                <button
                  key={tag}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    'inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3.5 text-xs font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60',
                    active
                      ? 'border-copper/60 bg-copper/15 text-copper'
                      : 'border-white/10 bg-surface-raised text-muted-foreground hover:border-white/25 hover:text-foreground',
                  )}
                >
                  {active && <Check className="h-3 w-3" aria-hidden="true" />}
                  {DIET_TAG_LABELS[tag]}
                </button>
              )
            })}
          </div>
          <p className="text-xs text-muted-foreground">Meal plans skip anything you mark here.</p>
        </div>
      </section>

      {/* ------------------------------------------------------------ Training */}
      {!compact && (
        <section className="space-y-3" aria-label="Training preferences">
          <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-copper">Training</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor={`${formId}-level`}>Experience level</Label>
              <Select value={trainingLevel} onValueChange={handleTrainingLevelChange}>
                <SelectTrigger id={`${formId}-level`} className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEVEL_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {LEVEL_LABELS[option]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`${formId}-training-goal`}>Training goal</Label>
              <Select value={trainingGoal} onValueChange={handleTrainingGoalChange}>
                <SelectTrigger id={`${formId}-training-goal`} className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRAINING_GOAL_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {TRAINING_GOAL_LABELS[option]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <span id={`${formId}-equipment-label`} className="block text-sm font-medium leading-none">
              Available equipment
            </span>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {EQUIPMENT_OPTIONS.map((item) => (
                <label
                  key={item}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/8 bg-surface-raised px-2.5 py-2.5 text-xs text-muted-foreground transition-colors duration-150 hover:border-white/20 hover:text-foreground has-[button:focus-visible]:border-copper/50"
                >
                  <Checkbox
                    checked={equipment.includes(item)}
                    onCheckedChange={() => toggleEquipment(item)}
                    aria-label={EQUIPMENT_LABELS[item]}
                  />
                  {EQUIPMENT_LABELS[item]}
                </label>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* -------------------------------------------------------------- Footer */}
      <div className="flex items-center justify-end gap-2 pt-1">
        {onCancel !== undefined && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={!isValid}
          className="bg-brand-blue text-white hover:bg-brand-blue/85"
        >
          Save profile
        </Button>
      </div>
    </form>
  )
}
