/**
 * Typed content for every landing page section. ALL landing copy lives here —
 * section components import from this file and never hardcode strings.
 */

import type { AppMode } from '@/types'

// ---------------------------------------------------------------------------
// Shared shapes
// ---------------------------------------------------------------------------

/** Eyebrow + heading (and optional sub) pattern used by every section. */
export interface SectionIntro {
  eyebrow: string
  heading: string
  sub?: string
}

export type ProblemId = 'posture' | 'progress' | 'explain-pain'

export interface LandingProblem {
  id: ProblemId
  title: string
  description: string
}

export interface LandingStep {
  id: 'tap' | 'explore' | 'act'
  label: string
  description: string
}

export interface LandingModeCard {
  id: AppMode
  name: string
  href: string
  bullets: readonly string[]
}

export type SuiteCardId = 'calculators' | 'planner' | 'hydration' | 'summary'

export interface LandingSuiteCard {
  id: SuiteCardId
  title: string
  description: string
  href: string
  /** Whether the card renders the sample macro donut preview. */
  withDonut: boolean
}

export type PersonaId = 'athletes' | 'desk-workers' | 'fitness-enthusiasts' | 'rehab-patients'

export interface LandingPersona {
  id: PersonaId
  title: string
  description: string
  href: string
}

export type FutureItemId = 'ai-pose' | 'ar' | 'wearables'

export interface LandingFutureItem {
  id: FutureItemId
  title: string
  description: string
}

export type EngineLayerId = 'react' | 'webgl' | 'apis'

export interface EngineLayer {
  id: EngineLayerId
  name: string
  description: string
}

export interface HeaderNavLink {
  id: string
  label: string
  href: string
}

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

export const HEADER_NAV: readonly HeaderNavLink[] = [
  { id: 'problem', label: 'Problem', href: '#problem' },
  { id: 'solution', label: 'Solution', href: '#solution' },
  { id: 'modes', label: 'Modes', href: '#modes' },
  { id: 'suite', label: 'Suite', href: '#suite' },
  { id: 'engine', label: 'Engine', href: '#engine' },
  { id: 'team', label: 'Team', href: '#team' },
]

export const HEADER_CTA = {
  label: 'Launch PhysioMap',
  href: '/explore',
  mobileMenuLabel: 'Menu',
  mobileMenuDescription: 'Landing page sections and the launch link.',
} as const

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------

export const HERO_CONTENT = {
  eyebrow: 'ZINNOVATIO HACKATHON · TEAM PSYCHO-CODERZ',
  titleLine1: 'PhysioMap:',
  titleLine2: 'See Your Body. Fix Your Body.',
  subtitle: 'An intuitive, visual 3D health assistant in the browser.',
  primaryCta: 'Launch PhysioMap',
  primaryCtaHref: '/explore',
  secondaryCta: 'See how it works',
  secondaryCtaHref: '#problem',
  hint: 'Tap a muscle',
} as const

// ---------------------------------------------------------------------------
// Problem
// ---------------------------------------------------------------------------

export const PROBLEM_INTRO: SectionIntro = {
  eyebrow: 'THE PROBLEM',
  heading: "Most people can't see what's going wrong in their bodies",
}

export const LANDING_PROBLEMS = [
  {
    id: 'posture',
    title: 'Posture slips unnoticed',
    description: 'Long desk hours become pain before people spot the problem.',
  },
  {
    id: 'progress',
    title: 'Fitness stays flat',
    description: 'Text and video lists lack a visual model of muscles.',
  },
  {
    id: 'explain-pain',
    title: 'Pain is hard to explain',
    description: 'Musculoskeletal pain is difficult to locate, name, and act on.',
  },
] as const satisfies readonly LandingProblem[]

// ---------------------------------------------------------------------------
// Solution
// ---------------------------------------------------------------------------

export const SOLUTION_INTRO: SectionIntro = {
  eyebrow: 'THE SOLUTION',
  heading: 'PhysioMap turns your body into an interactive 3D guide',
  sub: 'An intuitive, visual 3D health assistant in the browser.',
}

export const SOLUTION_STEPS = [
  { id: 'tap', label: 'Tap', description: 'Choose a body part.' },
  { id: 'explore', label: 'Explore', description: 'Train, relieve, or learn.' },
  { id: 'act', label: 'Act', description: 'Follow focused guidance.' },
] as const satisfies readonly LandingStep[]

export const SOLUTION_CLOSING_LINE = 'One avatar connects fitness, recovery, and education.'

// ---------------------------------------------------------------------------
// Modes
// ---------------------------------------------------------------------------

export const MODES_INTRO: SectionIntro = {
  eyebrow: 'THREE MODES',
  heading: 'One 3D avatar, three modes',
}

export const LANDING_MODE_CARDS = [
  {
    id: 'build',
    name: 'Build Mode',
    href: '/explore?mode=build&region=chest',
    bullets: ['Muscle hypertrophy', 'Targeted workouts', 'Biomechanics'],
  },
  {
    id: 'pain',
    name: 'Pain Mode',
    href: '/explore?mode=pain&region=lower-back',
    bullets: ['Symptom mapping', 'Relief exercises', 'Ergonomics', 'Remedies'],
  },
  {
    id: 'info',
    name: 'Info Mode',
    href: '/explore?mode=info&region=shoulders',
    bullets: ['Interactive anatomy education', 'Injury prevention'],
  },
] as const satisfies readonly LandingModeCard[]

export const MODES_TRY_LABEL = 'Try it'
export const MODES_PAIN_NOTE = 'Pain Mode offers guidance, not a clinical diagnosis.'

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

export const SUITE_INTRO: SectionIntro = {
  eyebrow: 'BEYOND THE AVATAR',
  heading: 'A complete health and nutrition suite',
}

export const SUITE_CARDS = [
  {
    id: 'calculators',
    title: 'Calculate',
    description: 'BMI, TDEE, and daily calorie needs.',
    href: '/health?tab=calculators',
    withDonut: false,
  },
  {
    id: 'planner',
    title: 'Plan meals',
    description: 'Personalized meal plans and macro charts.',
    href: '/health?tab=planner',
    withDonut: true,
  },
  {
    id: 'hydration',
    title: 'Track hydration',
    description: 'Keep daily water intake visible.',
    href: '/health?tab=hydration',
    withDonut: false,
  },
  {
    id: 'summary',
    title: 'Take it with you',
    description: 'Downloadable health summaries.',
    href: '/health?tab=summary',
    withDonut: false,
  },
] as const satisfies readonly LandingSuiteCard[]

export const SUITE_SAMPLE_CHIP = 'Sample'

// ---------------------------------------------------------------------------
// Engine
// ---------------------------------------------------------------------------

export const ENGINE_INTRO: SectionIntro = {
  eyebrow: 'THE ENGINE',
  heading: 'Built on WebGL for real-time 3D in any browser',
}

export const ENGINE_LAYERS = [
  {
    id: 'react',
    name: 'React',
    description: 'A fast, modular interface for exploring the body and switching modes.',
  },
  {
    id: 'webgl',
    name: 'Three.js / WebGL',
    description: 'The interactive anatomical avatar, rendered in real time in the browser.',
  },
  {
    id: 'apis',
    name: 'Health API integrations',
    description: 'Exercise and nutrition data supporting the guidance.',
  },
] as const satisfies readonly EngineLayer[]

export const ENGINE_FLOW_NODES = [
  'Interface (React + Next.js)',
  '3D Engine (Three.js / WebGL)',
  'Services & API routes',
  'Health data providers',
] as const

export const ENGINE_VIEW_SOURCES_LABEL = 'View data sources'
export const ENGINE_CAPTION =
  'The curated local dataset is always active; live external adapters are optional and off by default.'

// ---------------------------------------------------------------------------
// Personas
// ---------------------------------------------------------------------------

export const PERSONAS_INTRO: SectionIntro = {
  eyebrow: "WHO IT'S FOR",
  heading: 'Built for anyone who lives in a body',
}

export const LANDING_PERSONAS = [
  {
    id: 'athletes',
    title: 'Athletes',
    description: 'Targeted training and injury prevention.',
    href: '/explore?mode=build&region=hamstrings',
  },
  {
    id: 'desk-workers',
    title: 'Desk workers',
    description: 'Posture and ergonomics relief.',
    href: '/explore?mode=pain&region=lower-back',
  },
  {
    id: 'fitness-enthusiasts',
    title: 'Fitness enthusiasts',
    description: 'Visual muscle-building guidance.',
    href: '/explore?mode=build&region=chest',
  },
  {
    id: 'rehab-patients',
    title: 'Rehab patients',
    description: 'Guided, understandable recovery.',
    href: '/explore?mode=pain&region=knees',
  },
] as const satisfies readonly LandingPersona[]

export const PERSONAS_CAPTION = 'Every persona starts from the same 3D body map.'

// ---------------------------------------------------------------------------
// Future
// ---------------------------------------------------------------------------

export const FUTURE_INTRO: SectionIntro = {
  eyebrow: 'FUTURE DIRECTION',
  heading: 'Next: smarter, immersive, connected',
}

export const LANDING_FUTURE_ITEMS = [
  {
    id: 'ai-pose',
    title: 'AI pose detection',
    description: 'Real-time form correction.',
  },
  {
    id: 'ar',
    title: 'AR integration',
    description: 'Overlay the avatar on your body.',
  },
  {
    id: 'wearables',
    title: 'Wearable device sync',
    description: 'Connect live health data.',
  },
] as const satisfies readonly LandingFutureItem[]

export const FUTURE_BADGE_LABEL = 'Planned'
export const FUTURE_CAPTION = 'Planned capabilities. Not part of the current build.'

// ---------------------------------------------------------------------------
// Team
// ---------------------------------------------------------------------------

export const TEAM_INTRO: SectionIntro = {
  eyebrow: 'TEAM PSYCHO-CODERZ',
  heading: 'Five builders, one shared vision',
}

export const TEAM_LEADER_LABEL = 'Team Leader'
export const TEAM_CAPTION = 'A shared vision for visual, understandable health guidance.'

// ---------------------------------------------------------------------------
// Closing CTA
// ---------------------------------------------------------------------------

export const CLOSING_CONTENT = {
  heading: 'Thank you.',
  subtitle: 'PhysioMap by Team Psycho-Coderz · Zinnovatio Hackathon',
  cta: 'Launch PhysioMap',
  ctaHref: '/explore',
} as const
