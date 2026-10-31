/**
 * Sensation-specific guidance tips, with region-specific variants where the
 * same sensation reads differently by body part.
 */

import type { RegionId } from '@/config/regions'
import type { Sensation } from '@/types/pain'

export interface SensationGuidanceEntry {
  tip: string
  regionVariants?: Partial<Record<RegionId, string>>
}

export const SENSATION_GUIDANCE: Record<Sensation, SensationGuidanceEntry> = {
  'dull-ache': {
    tip: 'A dull ache usually reflects overloaded or tired muscles — ease the load rather than stopping all movement.',
    regionVariants: {
      knees: 'A dull ache in the knees is usually load-related — cutting stair and squat depth for a few days typically calms it.',
      'lower-back': 'A dull, achy back usually responds to staying gently active rather than total rest.',
    },
  },
  sharp: {
    tip: 'Sharp pain is a signal to offload: move gently, stay inside the pain-free range and build back gradually.',
    regionVariants: {
      'lower-back': 'Sharp back pain when bending usually means easing off bending and lifting for a few days — keep walking.',
      shoulders: 'Sharp catches in the shoulder usually mean backing off overhead and loaded reaches for now.',
    },
  },
  burning: {
    tip: 'Burning sensations can be linked to nerve irritation — easing the positions that trigger it matters more than stretching harder.',
    regionVariants: {
      chest: 'Burning in the chest is worth a medical check before assuming it is muscular.',
      forearms: 'Burning in the forearms often eases when sustained typing grips are broken up with regular stretch breaks.',
    },
  },
  'tingling-numbness': {
    tip: 'Tingling or numbness often eases when sustained postures are broken up — change position every 20–30 minutes.',
    regionVariants: {
      neck: 'Neck-related tingling often fades when the screen comes up to eye level and the head stops sitting forward.',
      'lower-back': 'Back-related tingling into the leg often eases with short, frequent walks instead of long sitting.',
    },
  },
  stiffness: {
    tip: 'Stiffness that loosens as you move usually responds to gentle, frequent movement rather than rest.',
    regionVariants: {
      knees: 'Knee stiffness usually settles faster with regular gentle bending and straightening through the day.',
      neck: 'Neck stiffness usually responds to slow, frequent rotations within comfort.',
    },
  },
  throbbing: {
    tip: 'Throbbing often goes with inflammation — ease the intensity for a few days and consider the cold guidance in the Remedies tab after activity.',
  },
}
