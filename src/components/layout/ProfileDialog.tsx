'use client'

/**
 * Profile & preferences dialog — persisted via useProfileStore (Message 2
 * builds nutrition on it). The form is a child that mounts fresh when the
 * dialog opens (no state-sync effects), and renders a stable skeleton until
 * the app is hydrated so persisted state can never cause a mismatch.
 */

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { EQUIPMENT_LABELS, LEVEL_LABELS, TRAINING_GOAL_LABELS, UNIT_SYSTEM_LABELS } from '@/config/labels'
import { EQUIPMENT_OPTIONS, LEVEL_OPTIONS, TRAINING_GOAL_OPTIONS } from '@/config/profileOptions'
import { useHydrated } from '@/hooks/useHydrated'
import { useProfileStore } from '@/store/useProfileStore'
import type { Equipment, Level, TrainingGoal, UnitSystem, UserProfile } from '@/types'

export function ProfileDialog({ children }: { children: React.ReactNode }) {
  const hydrated = useHydrated()
  const profile = useProfileStore((state) => state.profile)
  const setProfile = useProfileStore((state) => state.setProfile)
  const [open, setOpen] = useState(false)

  const handleSave = (draft: UserProfile): void => {
    setProfile(draft)
    toast.success('Preferences saved')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto border-white/10 bg-surface sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading">Profile &amp; preferences</DialogTitle>
          <DialogDescription>
            Used to pre-fill Build filters. The Health &amp; Nutrition Suite (coming next) will build on these too.
          </DialogDescription>
        </DialogHeader>

        {hydrated ? (
          <ProfileForm key="profile-form" initialProfile={profile} onSave={handleSave} onCancel={() => setOpen(false)} />
        ) : (
          <div className="space-y-3 py-6" aria-busy="true">
            <Skeleton className="h-9 w-full bg-white/8" />
            <Skeleton className="h-9 w-full bg-white/8" />
            <Skeleton className="h-20 w-full bg-white/8" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

/** Form body — mounts fresh each open so `initialProfile` needs no effects. */
function ProfileForm({
  initialProfile,
  onSave,
  onCancel,
}: {
  initialProfile: UserProfile
  onSave: (draft: UserProfile) => void
  onCancel: () => void
}) {
  const [draft, setDraft] = useState<UserProfile>(initialProfile)

  const update = (patch: Partial<UserProfile>): void => setDraft((current) => ({ ...current, ...patch }))

  const toggleEquipment = (item: Equipment): void => {
    const equipment = draft.equipment.includes(item)
      ? draft.equipment.filter((value) => value !== item)
      : [...draft.equipment, item]
    update({ equipment: equipment.length > 0 ? equipment : ['bodyweight'] })
  }

  return (
    <div className="space-y-5">
      <section className="space-y-3" aria-label="Training preferences">
        <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-copper">Training</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="pref-level">Experience level</Label>
            <Select value={draft.trainingLevel} onValueChange={(value) => update({ trainingLevel: value as Level })}>
              <SelectTrigger id="pref-level" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEVEL_OPTIONS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {LEVEL_LABELS[level]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pref-goal">Training goal</Label>
            <Select value={draft.trainingGoal} onValueChange={(value) => update({ trainingGoal: value as TrainingGoal })}>
              <SelectTrigger id="pref-goal" className="w-full">
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
        </div>
        <div className="space-y-2">
          <Label>Available equipment</Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {EQUIPMENT_OPTIONS.map((item) => (
              <label
                key={item}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/8 bg-surface-raised px-2.5 py-2 text-xs text-muted-foreground transition-colors duration-150 hover:border-white/20 hover:text-foreground"
              >
                <Checkbox
                  checked={draft.equipment.includes(item)}
                  onCheckedChange={() => toggleEquipment(item)}
                  aria-label={EQUIPMENT_LABELS[item]}
                />
                {EQUIPMENT_LABELS[item]}
              </label>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-3" aria-label="Body stats">
        <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-copper">Body stats</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="pref-age">Age</Label>
            <Input
              id="pref-age"
              type="number"
              min={10}
              max={100}
              value={draft.age ?? ''}
              onChange={(event) => update({ age: event.target.value ? Number(event.target.value) : undefined })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pref-units">Units</Label>
            <Select value={draft.unitSystem} onValueChange={(value) => update({ unitSystem: value as UnitSystem })}>
              <SelectTrigger id="pref-units" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="metric">{UNIT_SYSTEM_LABELS.metric}</SelectItem>
                <SelectItem value="imperial">{UNIT_SYSTEM_LABELS.imperial}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pref-height">Height (cm)</Label>
            <Input
              id="pref-height"
              type="number"
              min={100}
              max={230}
              value={draft.heightCm ?? ''}
              onChange={(event) => update({ heightCm: event.target.value ? Number(event.target.value) : undefined })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pref-weight">Weight (kg)</Label>
            <Input
              id="pref-weight"
              type="number"
              min={25}
              max={300}
              value={draft.weightKg ?? ''}
              onChange={(event) => update({ weightKg: event.target.value ? Number(event.target.value) : undefined })}
            />
          </div>
        </div>
      </section>

      <div className="flex justify-end gap-2 pt-1">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSave(draft)} className="bg-brand-blue text-white hover:bg-brand-blue/85">
          Save preferences
        </Button>
      </div>
    </div>
  )
}
