/**
 * Central color constants and mode metadata.
 * UI components consume these via CSS variables (globals.css) or direct imports
 * when a literal is needed (e.g. three.js materials). Keep this file data-only.
 */

import type { AppMode, Level, PainUrgency } from '@/types'

export const COLORS = {
  background: '#0B0F17',
  surface: '#121826',
  surfaceRaised: '#1A2233',
  borderSubtle: 'rgba(255,255,255,0.08)',
  text: '#F4F6FA',
  textMuted: '#9AA6BC',
  brandBlue: '#2F63E0',
  warmPeach: '#F3B38A',
  copper: '#D9A066',
  muscleRed: '#C0332B',
  green: '#58B584',
} as const

export const MODE_COLORS: Record<AppMode, string> = {
  build: '#3B74F2',
  pain: '#F26B4E',
  info: '#F3B38A',
}

export interface ModeDefinition {
  id: AppMode
  label: string
  tagline: string
  description: string
  color: string
}

export const MODES: readonly ModeDefinition[] = [
  {
    id: 'build',
    label: 'Build',
    tagline: 'Hypertrophy · Workouts · Biomechanics',
    description: 'Targeted muscle-building with set schemes, form cues and progressive overload.',
    color: MODE_COLORS.build,
  },
  {
    id: 'pain',
    label: 'Pain',
    tagline: 'Symptoms · Relief · Ergonomics',
    description: 'Map symptoms, follow guided relief sessions and fix your desk setup.',
    color: MODE_COLORS.pain,
  },
  {
    id: 'info',
    label: 'Info',
    tagline: 'Anatomy · Prevention · Quiz',
    description: 'Interactive anatomy education, injury prevention and a find-the-muscle quiz.',
    color: MODE_COLORS.info,
  },
]

/** Severity heat colors for the pain log avatar overlay (1-3 amber, 4-6 orange, 7-10 red). */
export const HEAT_COLORS = {
  mild: '#E8A94A',
  moderate: '#F07A3A',
  severe: '#E5484D',
} as const

export const LEVEL_COLORS: Record<Level, string> = {
  beginner: '#58B584',
  intermediate: '#E8A94A',
  advanced: '#E5484D',
}

export const URGENCY_COLORS: Record<PainUrgency, string> = {
  'self-care': '#58B584',
  monitor: '#E8A94A',
  'see-clinician': '#F07A3A',
  urgent: '#E5484D',
}

/** Colors used exclusively by the 3D avatar materials. */
export const AVATAR_COLORS = {
  muscle: '#B3261E',
  underlayMuscle: '#4A1511',
  underlayGrey: '#2A2F3A',
  tendon: '#D8B8A0',
  keyLight: '#FFDDB8',
  rimLight: '#2F63E0',
  fillLight: '#8FA3C8',
  hemiSky: '#3A4A6B',
  hemiGround: '#1A0E0C',
  ground: '#0E1420',
} as const
