/** Site-level constants: branding, navigation, disclaimers. */

export const SITE = {
  name: 'PhysioMap',
  tagline: 'See Your Body. Fix Your Body.',
  pitch: 'PhysioMap turns your body into an interactive 3D guide.',
  description:
    'Tap a body part on a 3D muscular avatar to explore targeted training, pain relief guidance and interactive anatomy — all in one place.',
  team: 'Team Psycho-Coderz',
  event: 'Zinnovatio Hackathon',
  disclaimerLong:
    'PhysioMap offers educational guidance, not medical diagnosis or treatment. Guidance is general and may not apply to your condition — never ignore severe, worsening or urgent symptoms. In an emergency, contact local emergency services immediately.',
  steps: [
    { id: 'tap', label: 'Tap', description: 'Select any muscle or joint on the 3D body map.' },
    { id: 'explore', label: 'Explore', description: 'Switch between Build, Pain and Info modes on the same body part.' },
    { id: 'act', label: 'Act', description: 'Follow focused workouts, relief sessions or anatomy lessons.' },
  ],
} as const

export const SITE_NAV = [
  { href: '/explore', label: 'Explore' },
  { href: '/health', label: 'Health Suite' },
] as const
