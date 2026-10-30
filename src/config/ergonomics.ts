/** Global desk-worker ergonomics checklist used by the Pain → Ergonomics tab. */

export interface DeskChecklistItem {
  id: string
  label: string
  detail: string
}

export const DESK_CHECKLIST: readonly DeskChecklistItem[] = [
  {
    id: 'screen-eye-level',
    label: 'Screen at eye level',
    detail: 'Top of the monitor roughly at eye height so the head stacks neutrally.',
  },
  {
    id: 'elbows-90',
    label: 'Elbows at ~90°',
    detail: 'Shoulders relaxed, elbows bent about 90° and close to the body while typing.',
  },
  {
    id: 'feet-flat',
    label: 'Feet flat on the floor',
    detail: 'Feet supported and thighs roughly parallel to the floor.',
  },
  {
    id: 'lumbar-support',
    label: 'Lumbar support',
    detail: 'Lower back lightly supported so the natural inward curve is maintained.',
  },
  {
    id: 'rule-20-20-20',
    label: '20-20-20 eye rule',
    detail: 'Every 20 minutes, look at something 20 feet (~6 m) away for 20 seconds.',
  },
  {
    id: 'move-every-45',
    label: 'Stand & move every 30–45 min',
    detail: 'Short movement breaks beat long static stretches for reducing stiffness.',
  },
] as const
