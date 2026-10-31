/**
 * Aggravator guidance tips: one general line per aggravator plus
 * region-specific overrides for the common region × aggravator combinations.
 * The composer prefers a region variant whenever one exists.
 */

import type { RegionId } from '@/config/regions'
import type { Aggravator } from '@/types/pain'

export interface AggravatorGuidanceEntry {
  tip: string
  regionVariants?: Partial<Record<RegionId, string>>
}

export const AGGRAVATOR_GUIDANCE: Record<Aggravator, AggravatorGuidanceEntry> = {
  'prolonged-sitting': {
    tip: 'Break up sitting every 30–45 minutes with a short stand or walk — even 60 seconds helps.',
    regionVariants: {
      'lower-back': 'Stand and reset your lower back every 30 minutes — sit with a small towel roll behind the low back and both feet flat.',
      neck: 'Set the top of your screen at eye level and take a 60-second posture reset every 30 minutes of sitting.',
      hips: 'Stand and take the hips through a few easy circles every 30–45 minutes of sitting.',
      knees: 'Fully straighten the knees and do 10 gentle quad squeezes after every long sitting spell.',
    },
  },
  lifting: {
    tip: 'Lift with the load close to your body and the working joints in a strong, neutral position.',
    regionVariants: {
      'lower-back': 'Hinge from the hips with a flat back, keep the load close to your body, and avoid heavy lifting first thing in the morning.',
      shoulders: 'Keep weights close and below shoulder height; drive with the legs rather than the arms.',
      knees: 'Keep the load close, heels down, and push through the whole foot when lifting.',
    },
  },
  exercise: {
    tip: 'Reduce the intensity by half for a few sessions and rebuild only while the pain stays at its current level or better.',
  },
  bending: {
    tip: 'Limit deep, repeated bending; when you must bend, hinge at the hips rather than rounding through the spine.',
    regionVariants: {
      'lower-back': 'Swap deep bending for hip hinging with a flat back, and brace lightly before you lift.',
    },
  },
  'sleeping-position': {
    tip: 'Try a neutral sleep position and a pillow setup that keeps the area supported overnight.',
    regionVariants: {
      neck: 'Sleep on your back or side with one pillow that keeps the neck in line with the spine — avoid sleeping on your stomach.',
      shoulders: 'Avoid sleeping directly on the painful shoulder; hug a pillow to support the arm when lying on your side.',
      'lower-back': 'Side-sleep with a pillow between the knees, or lie on your back with a pillow under them.',
    },
  },
  'typing-phone-use': {
    tip: 'Keep wrists floating and supported, and take a 30-second hand break every 20–30 minutes.',
    regionVariants: {
      neck: 'Raise the screen to eye level and bring the phone up instead of bending your neck; try chin tucks 5 times every hour.',
      forearms: 'Keep the wrists neutral, lighten your grip on the mouse and stretch the forearms during breaks.',
      elbows: 'Avoid a locked wrist; keep the elbow softly bent and supported while typing.',
      shoulders: 'Keep the keyboard close so the shoulders stay relaxed — not shrugged or rounded forward.',
    },
  },
  stairs: {
    tip: 'Use the handrail and take stairs one at a time until this settles.',
    regionVariants: {
      knees: 'Use the handrail and lead with the stronger leg on the way up; step with the stronger leg last on the way down.',
      hips: 'Step up with the stronger leg first, lean slightly forward from the hips, and use the rail.',
      quads: 'Use the rail and turn slightly sideways on steep stairs to reduce the load on the front of the thigh.',
    },
  },
  morning: {
    tip: 'Warm the area up gently before the first demands of the day.',
    regionVariants: {
      'lower-back': 'Before getting out of bed, pull each knee gently to the chest a few times, then log-roll to sit up.',
      'ankles-feet': 'Circle the ankles and point-flex the feet 10 times before standing up.',
      knees: 'Do 20 gentle heel slides before getting out of bed to warm the knee up.',
    },
  },
}
