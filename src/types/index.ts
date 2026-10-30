/** Shared type barrel — import everything from `@/types`. */

export type {
  AnatomyInfo,
  AppMode,
  BodySide,
  InjuryInfo,
  Region,
  RegionContent,
  RegionGroup,
  RegionId,
} from '@/types/region'
export type {
  BuildInfo,
  Equipment,
  Exercise,
  HypertrophyGuide,
  Level,
  ReliefExercise,
  ReliefKind,
  TrainingGoal,
} from '@/types/exercise'
export type {
  Aggravator,
  ErgonomicTip,
  PainAssociation,
  PainAssessmentInput,
  PainAssessmentResult,
  PainDuration,
  PainInfo,
  PainLogEntry,
  PainOnset,
  PainUrgency,
  RedFlagKey,
  Remedy,
  ScoredAssociation,
  Sensation,
} from '@/types/pain'
export type {
  ActivityLevel,
  DietPreference,
  DietTag,
  PaceKgPerWeek,
  Sex,
  UnitSystem,
  UserProfile,
  WeightGoal,
} from '@/types/profile'
export { DEFAULT_PROFILE } from '@/types/profile'
export type { QuizKind, QuizPhase, QuizQuestion, QuizStatus } from '@/types/quiz'
export type {
  AvatarCanvasProps,
  RegionVisualState,
} from '@/types/avatar'
export { createNeutralRegionStyles } from '@/types/avatar'
