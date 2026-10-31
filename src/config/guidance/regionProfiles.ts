/**
 * Guidance profile for every body region: plain-language area name, which
 * specialist to see, and the region's safe/avoid movement lines used by the
 * pain guidance composer. Content tone: "can be linked to / worth getting
 * checked" — never diagnostic, never medicine names.
 */

import type { RegionId } from '@/config/regions'

export interface RegionGuidanceProfile {
  /** Plain-language name of the area, e.g. "lower back". */
  areaName: string
  /** Who to see for a non-urgent assessment, e.g. "spine specialist or physiotherapist". */
  specialist: string
  /** One safe-movement line for the region (goes in "Do now"). */
  safeMovement: string
  /** One avoid line for the region (goes in "Avoid"). */
  avoidMovement: string
  /** What usually loads this area — used as the movement tip when no aggravators were reported. */
  commonLoadingFactors: string
  /** Region-specific warning signs (goes in "Watch for"). */
  urgentSigns: string
}

export const REGION_GUIDANCE_PROFILES: Record<RegionId, RegionGuidanceProfile> = {
  head: {
    areaName: 'head',
    specialist: 'doctor or urgent-care clinician',
    safeMovement: 'Rest in a quiet environment, hydrate, and avoid strenuous activity while symptoms are present.',
    avoidMovement: 'Avoid forceful neck manipulation and driving if dizziness, visual changes, or confusion are present.',
    commonLoadingFactors: 'Dehydration, poor sleep, screen strain, stress, and jaw clenching can contribute to head discomfort.',
    urgentSigns: 'A sudden severe headache, weakness, confusion, fainting, vision loss, fever with a stiff neck, or head injury needs urgent care.',
  },
  neck: {
    areaName: 'neck',
    specialist: 'doctor or spine specialist',
    safeMovement: 'Keep the neck moving gently within comfort — slow chin tucks and shoulder rolls are usually safe.',
    avoidMovement: 'Avoid neck cracking, forceful manipulation and heavy overhead lifting.',
    commonLoadingFactors: 'Forward-head screen posture, long phone use with the neck bent and sleeping on too many pillows are the usual loads here.',
    urgentSigns: 'New arm numbness or weakness, or dizziness and balance problems, needs same-day assessment.',
  },
  traps: {
    areaName: 'upper traps and neck–shoulder area',
    specialist: 'physiotherapist',
    safeMovement: 'Gentle ear-to-shoulder stretches and brief heat can calm overworked traps.',
    avoidMovement: 'Avoid shrugging heavy bags on the same shoulder and long phone-to-ear calls.',
    commonLoadingFactors: 'Stress, desk posture with rounded shoulders and carrying bags on one side load this area.',
    urgentSigns: 'Tingling or weakness travelling down the arm with this pain deserves a prompt check.',
  },
  shoulders: {
    areaName: 'shoulder',
    specialist: 'physiotherapist or orthopaedic doctor',
    safeMovement: 'Keep the arm moving below shoulder height — pendulum swings and wall slides are usually well tolerated.',
    avoidMovement: 'Avoid heavy overhead pressing, pull-ups and throwing until the pain settles.',
    commonLoadingFactors: 'Overhead lifting, throwing sports and sleeping directly on the painful side are the usual culprits.',
    urgentSigns: 'Sudden weakness when lifting the arm, or pain with fever after an injury, needs an examination.',
  },
  chest: {
    areaName: 'chest',
    specialist: 'cardiologist or emergency care',
    safeMovement: 'Once a heart cause has been ruled out, easy walking and breathing exercises are usually safe.',
    avoidMovement: 'Avoid heavy pressing and hard effort until a clinician has cleared the cause.',
    commonLoadingFactors: 'Heavy bench pressing and loaded pushing commonly strain the chest muscles.',
    urgentSigns: 'Pressure, tightness or pain spreading to the arm, jaw or back — with breathlessness or sweating — needs emergency care now.',
  },
  biceps: {
    areaName: 'biceps and front of the upper arm',
    specialist: 'physiotherapist or orthopaedic doctor',
    safeMovement: 'Keep the elbow bending lightly with very low loads; avoid full stretch under weight.',
    avoidMovement: 'Avoid heavy curls, chin-ups and catching falling objects with straight arms.',
    commonLoadingFactors: 'Heavy curling and suddenly catching a falling load stress the biceps tendon.',
    urgentSigns: 'A sudden pop with bruising or a visible lump in the muscle needs an orthopaedic assessment.',
  },
  triceps: {
    areaName: 'triceps and back of the upper arm',
    specialist: 'physiotherapist',
    safeMovement: 'Light push-downs and gentle overhead stretches are usually comfortable.',
    avoidMovement: 'Avoid heavy pressing, dips and throwing movements until it settles.',
    commonLoadingFactors: 'Dips, heavy pressing and overhead throwing load the triceps most.',
    urgentSigns: 'A sudden tear with bruising after a heavy press deserves a prompt assessment.',
  },
  forearms: {
    areaName: 'forearms',
    specialist: 'physiotherapist',
    safeMovement: 'Frequent short breaks with wrist flexor and extensor stretches usually help desk-related forearm pain.',
    avoidMovement: 'Avoid tight grips, heavy gripping and long unbroken typing sessions.',
    commonLoadingFactors: 'Typing, mouse use, gripping tools and phone scrolling are the usual loads.',
    urgentSigns: 'Numbness or tingling into the fingers that wakes you at night deserves an assessment.',
  },
  elbows: {
    areaName: 'elbow',
    specialist: 'physiotherapist or orthopaedic doctor',
    safeMovement: 'Keep the wrist and forearm moving; isometrics in a comfortable position can ease tennis-elbow-type pain.',
    avoidMovement: 'Avoid the aggravating grip or racket motion and lifting with the palm turned down.',
    commonLoadingFactors: 'Racket sports, repetitive gripping and typing with a locked wrist load the elbow tendons.',
    urgentSigns: 'Locking, giving way or severe swelling after a fall needs an examination.',
  },
  'upper-back': {
    areaName: 'upper back',
    specialist: 'physiotherapist',
    safeMovement: 'Gentle thoracic rotations, cat-cow and shoulder-blade squeezes usually feel safe and helpful.',
    avoidMovement: 'Avoid heavy rounded-back lifting and long slumped periods at a desk.',
    commonLoadingFactors: 'Long desk slumping, heavy carrying and weak upper-back muscles are the usual factors.',
    urgentSigns: 'Pain with breathlessness, fever or night pain that wakes you deserves a prompt check.',
  },
  abs: {
    areaName: 'stomach and abdominal muscles',
    specialist: 'doctor or physiotherapist',
    safeMovement: 'Gentle walking and hip mobility are usually fine while the area recovers.',
    avoidMovement: 'Avoid heavy crunches, sit-ups and loaded twisting until it settles.',
    commonLoadingFactors: 'Explosive lifting, coughing and sneezing fits, and ab training load these muscles.',
    urgentSigns: 'Fever, vomiting, blood in stool or a stiff stomach with worsening pain needs same-day medical care.',
  },
  obliques: {
    areaName: 'side and flank area',
    specialist: 'doctor or physiotherapist',
    safeMovement: 'Keep twisting gentle and within comfort; side planks can come back gradually.',
    avoidMovement: 'Avoid loaded rotation, heavy side-bends and intense twisting sport for now.',
    commonLoadingFactors: 'Twisting lifts, racquet swings and side-bends load the obliques.',
    urgentSigns: 'One-sided flank pain with urinary changes, fever or nausea deserves a medical check.',
  },
  'lower-back': {
    areaName: 'lower back',
    specialist: 'spine specialist or physiotherapist',
    safeMovement: 'Keep moving within comfort — short walks, gentle cat-cow and hip mobility help most backs.',
    avoidMovement: 'Avoid heavy rounded-back lifting and long unbroken sitting.',
    commonLoadingFactors: 'Prolonged sitting, lifting with a rounded back and weak hip muscles are the usual drivers.',
    urgentSigns: 'Loss of bladder or bowel control, saddle numbness or new leg weakness needs emergency assessment today.',
  },
  glutes: {
    areaName: 'glutes',
    specialist: 'physiotherapist',
    safeMovement: 'Gentle glute stretches, walking and hip mobility work are usually well tolerated.',
    avoidMovement: 'Avoid long sitting on hard surfaces and heavy single-leg lifting until it settles.',
    commonLoadingFactors: 'Long sitting, stair climbing and uphill running load the glutes.',
    urgentSigns: 'Numbness around the saddle area or new leg weakness needs prompt assessment.',
  },
  hips: {
    areaName: 'hip',
    specialist: 'physiotherapist or orthopaedic doctor',
    safeMovement: 'Keep the hip moving gently — hip circles and easy bridges are usually safe.',
    avoidMovement: 'Avoid deep squats, aggressive stretching and loading the hip at its end range for now.',
    commonLoadingFactors: 'Deep squats, long sitting on low seats and running on hard surfaces commonly aggravate hips.',
    urgentSigns: 'Inability to stand or walk after a fall, or pain with fever, needs an examination.',
  },
  quads: {
    areaName: 'quads and front of the thigh',
    specialist: 'physiotherapist',
    safeMovement: 'Gentle quad stretches and light cycling keep the muscle moving without overloading it.',
    avoidMovement: 'Avoid sprinting, deep knee bends and heavy leg pressing until it settles.',
    commonLoadingFactors: 'Sprinting, squatting and stairs load the quads most.',
    urgentSigns: 'A sudden tear with a lump, or inability to straighten the knee, deserves prompt assessment.',
  },
  hamstrings: {
    areaName: 'hamstrings and back of the thigh',
    specialist: 'physiotherapist',
    safeMovement: 'Easy walking and gentle hamstring stretches within comfort support healing.',
    avoidMovement: 'Avoid sprinting, deep forward folds and heavy Romanian deadlifts for now.',
    commonLoadingFactors: 'Sprinting, sudden acceleration and kicking movements strain the hamstrings.',
    urgentSigns: 'A popping tear with bruising or a heavy limp needs an early assessment.',
  },
  knees: {
    areaName: 'knee',
    specialist: 'physiotherapist or orthopaedic doctor',
    safeMovement: 'Keep the knee gently moving — heel slides, quad sets and easy cycling are usually safe.',
    avoidMovement: 'Avoid deep squats, hard running and twisting pivots on a planted foot.',
    commonLoadingFactors: 'Stairs, deep squats, running and twisting sports load the knees most.',
    urgentSigns: 'Locking, giving way, or being unable to bear weight after an injury needs an examination — an X-ray may be needed.',
  },
  calves: {
    areaName: 'calf',
    specialist: 'doctor or physiotherapist',
    safeMovement: 'Gentle walking and easy calf stretches off a step are usually comfortable.',
    avoidMovement: 'Avoid sprinting, hill runs and hopping until the pain fully settles.',
    commonLoadingFactors: 'Running, jumping and sudden changes of direction load the calves.',
    urgentSigns: 'A swollen, red, warm calf — or sudden severe pain with inability to push off — needs urgent assessment.',
  },
  'ankles-feet': {
    areaName: 'ankles and feet',
    specialist: 'physiotherapist or orthopaedic doctor',
    safeMovement: 'Easy ankle circles and partial-weight walking keep the area recovering.',
    avoidMovement: 'Avoid running, jumping and uneven ground until the pain and swelling settle.',
    commonLoadingFactors: 'Running, jumping and standing all day on hard floors load the ankles and feet.',
    urgentSigns: 'Inability to bear weight, or a deformed or badly swollen joint after a twist, needs an examination.',
  },
}
