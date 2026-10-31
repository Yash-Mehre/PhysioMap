/**
 * Specific guidance lines per red flag, with region-specific variants where
 * the same flag means something different by body part. Wording stays
 * non-diagnostic ("can be linked to", "worth getting checked").
 */

import type { RegionId } from '@/config/regions'
import type { RedFlagKey } from '@/types/pain'

export interface RedFlagGuidanceLine {
  /** Immediate action for "Do now". */
  doNow: string
  /** What NOT to do for "Avoid". */
  avoid: string
  /** What would make it worse for "Watch for". */
  watchFor: string
}

export interface RedFlagGuidanceEntry extends RedFlagGuidanceLine {
  /** Overrides for regions where the flag means something different. */
  regionVariants?: Partial<Record<RegionId, RedFlagGuidanceLine>>
}

export const RED_FLAG_GUIDANCE: Record<RedFlagKey, RedFlagGuidanceEntry> = {
  'chest-pressure': {
    doNow: 'Call your local emergency number (112 in India) now if the pressure spreads to your arm, jaw or back, or comes with breathlessness or sweating.',
    avoid: "Don't drive yourself or wait to see if it passes.",
    watchFor: 'Spreading pressure, a cold sweat, nausea or a racing heartbeat.',
    regionVariants: {
      chest: {
        doNow: 'Call your local emergency number (112 in India) now — chest pressure with breathlessness or sweating is an emergency even if it feels muscular.',
        avoid: "Don't drive yourself or wait to see if it passes.",
        watchFor: 'Pressure spreading to the arm, jaw or back, cold sweat or nausea.',
      },
      shoulders: {
        doNow: 'Call your local emergency number (112 in India) now — arm or shoulder pain with chest pressure can be heart-related.',
        avoid: "Don't drive yourself, and don't try to stretch or massage it away.",
        watchFor: 'Pain spreading to the jaw, back or other arm, or breathlessness and sweating.',
      },
      neck: {
        doNow: 'Call your local emergency number (112 in India) now — neck or jaw pain with chest pressure can be heart-related.',
        avoid: "Don't drive yourself or wait to see if it passes.",
        watchFor: 'Pressure spreading to the arm or chest, breathlessness or sweating.',
      },
      biceps: {
        doNow: 'Call your local emergency number (112 in India) now — arm pain with chest pressure can be heart-related.',
        avoid: "Don't drive yourself or wait to see if it passes.",
        watchFor: 'Pressure spreading to the chest, jaw or other arm, or breathlessness.',
      },
    },
  },
  'bladder-bowel': {
    doNow: 'Losing control of your bladder or bowel with pain needs emergency assessment today.',
    avoid: "Don't wait for it to settle.",
    watchFor: 'Numbness in the saddle area or new leg weakness.',
    regionVariants: {
      'lower-back': {
        doNow: 'Losing control of your bladder or bowel with back pain needs emergency assessment today. Go to the nearest emergency department; this can be linked to pressure on nerves in the lower spine.',
        avoid: "Don't wait for it to settle, drive yourself if your legs feel weak or numb, or try stretching it out.",
        watchFor: 'Saddle numbness, worsening leg weakness or difficulty walking.',
      },
    },
  },
  'cannot-bear-weight': {
    doNow: "Keep weight off the area and get it examined today — an X-ray may be needed.",
    avoid: "Don't try to walk it off.",
    watchFor: 'Deformity, severe swelling or a joint that keeps giving way.',
    regionVariants: {
      knees: {
        doNow: "Don't try to walk it off. Keep weight off the knee, elevate it and get it examined — an X-ray may be needed.",
        avoid: "Avoid re-testing it by walking; use support to move around.",
        watchFor: 'Locking, deformity or rapid swelling.',
      },
      'ankles-feet': {
        doNow: "Don't try to walk it off. Keep weight off the foot, elevate it and get it examined — an X-ray may be needed.",
        avoid: "Avoid hopping on it or testing it; use support to move.",
        watchFor: 'Deformity, rapid swelling or bruising around the joint.',
      },
      hips: {
        doNow: "Keep weight off the leg and get examined today — after a fall, a hip X-ray is often needed.",
        avoid: "Don't try to walk it off or push through the pain.",
        watchFor: 'A shortened or turned-out leg, or pain with any attempt to stand.',
      },
    },
  },
  'swelling-redness-warmth': {
    doNow: 'A hot, swollen, red area deserves an assessment within a day or two — sooner if it spreads or you feel unwell.',
    avoid: "Don't massage, heat or firmly compress the area.",
    watchFor: 'Spreading redness, fever or increasing pain.',
    regionVariants: {
      calves: {
        doNow: 'A swollen, red, warm calf can be linked to a blood clot. Get seen urgently.',
        avoid: "Don't massage, foam-roll or stretch the calf.",
        watchFor: 'Increasing calf pain or new breathlessness — treat breathlessness as an emergency.',
      },
      'ankles-feet': {
        doNow: 'A swollen, red, warm ankle or foot can be linked to a clot or a joint infection. Get seen urgently.',
        avoid: "Don't massage or foam-roll the area.",
        watchFor: 'Spreading redness, fever or pain spreading up the calf.',
      },
    },
  },
  'recent-injury': {
    doNow: 'Get the injury examined if the pain is strong, worsening, or not clearly improving within 2–3 days.',
    avoid: "Don't train through it or test it with heavy loads.",
    watchFor: 'Swelling that does not settle, bruising that spreads, or pain that spikes at night.',
    regionVariants: {
      knees: {
        doNow: 'Get the knee examined — with a recent injury plus swelling, an X-ray may be needed.',
        avoid: "Don't run or pivot on it before it has been examined.",
        watchFor: 'Locking, giving way or rapid swelling.',
      },
      'ankles-feet': {
        doNow: 'Get the ankle or foot examined — with a recent injury plus swelling, an X-ray may be needed.',
        avoid: "Don't run or jump on it before it has been examined.",
        watchFor: 'Deformity, bruising that spreads or inability to bear weight.',
      },
    },
  },
  'numbness-weakness': {
    doNow: 'Numbness or tingling with weakness deserves an assessment within 24 hours.',
    avoid: 'Avoid intense stretching or loading the area until it has been assessed.',
    watchFor: 'Weakness spreading, dropping objects, or tripping more than usual.',
    regionVariants: {
      neck: {
        doNow: 'Arm numbness or weakness with neck pain should be assessed within 24 hours by a doctor or spine specialist.',
        avoid: 'Avoid neck cracking, forceful manipulation and heavy overhead lifting.',
        watchFor: 'Weakness spreading further down the arm, or changes in grip.',
      },
      'lower-back': {
        doNow: 'Leg numbness or weakness with back pain should be assessed within 24 hours by a doctor or spine specialist.',
        avoid: 'Avoid heavy lifting and repeated forward bending until it has been assessed.',
        watchFor: 'Weakness spreading down the leg, foot-drop or tripping.',
      },
    },
  },
  fever: {
    doNow: 'Pain with fever deserves a same-day medical assessment — it can be linked to infection.',
    avoid: "Don't apply heat or self-treat the area; keep it unloaded and supported.",
    watchFor: 'A rising temperature, chills, or spreading redness and swelling.',
    regionVariants: {
      knees: {
        doNow: 'A hot, painful knee with fever needs same-day assessment — a joint infection is worth ruling out.',
        avoid: "Don't wrap it tightly or push fluid through the joint.",
        watchFor: 'Rapid swelling, chills or being unable to bend the knee.',
      },
      chest: {
        doNow: 'Chest pain with fever and any breathlessness needs same-day assessment.',
        avoid: "Don't train or push through it while feverish.",
        watchFor: 'Breathlessness at rest, coughing up blood or worsening fever.',
      },
      'upper-back': {
        doNow: 'Upper-back pain with fever and any breathlessness needs same-day assessment.',
        avoid: "Don't train or push through it while feverish.",
        watchFor: 'Breathlessness at rest or worsening fever.',
      },
    },
  },
  'night-pain-rest': {
    doNow: "Pain that wakes you or persists at complete rest deserves a clinician's assessment soon.",
    avoid: "Don't rely on rest alone, and don't train through night pain.",
    watchFor: 'Night pain that intensifies, unplanned weight loss or drenching night sweats.',
  },
}

/** Seriousness order — emergency flags first; used to sort red-flag lines. */
export const RED_FLAG_SERIOUSNESS_ORDER: readonly RedFlagKey[] = [
  'chest-pressure',
  'bladder-bowel',
  'cannot-bear-weight',
  'swelling-redness-warmth',
  'numbness-weakness',
  'fever',
  'night-pain-rest',
  'recent-injury',
]
