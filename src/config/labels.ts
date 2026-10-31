/**
 * Human-readable labels for enum-ish types used across the UI.
 * `Record<Union, string>` guarantees completeness at compile time.
 */

import type { RegionGroup } from '@/config/regions'
import type { Equipment, Level, ReliefKind, TrainingGoal } from '@/types/exercise'
import type {
  ActivityLevel,
  DietPreference,
  DietTag,
  Sex,
  UnitSystem,
  WeightGoal,
} from '@/types/profile'

export const REGION_GROUP_LABELS: Record<RegionGroup, string> = {
  'head-neck': 'Head & Neck',
  'upper-body': 'Upper Body',
  core: 'Core',
  'lower-body': 'Lower Body',
}

export const REGION_GROUP_ORDER: readonly RegionGroup[] = ['head-neck', 'upper-body', 'core', 'lower-body']

export const LEVEL_LABELS: Record<Level, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
}

export const EQUIPMENT_LABELS: Record<Equipment, string> = {
  bodyweight: 'Bodyweight',
  dumbbells: 'Dumbbells',
  barbell: 'Barbell',
  machine: 'Machine',
  cable: 'Cable',
  bands: 'Bands',
}

export const RELIEF_KIND_LABELS: Record<ReliefKind, string> = {
  stretch: 'Stretch',
  mobility: 'Mobility',
  strengthen: 'Strengthen',
  release: 'Release',
}

export const TRAINING_GOAL_LABELS: Record<TrainingGoal, string> = {
  hypertrophy: 'Hypertrophy',
  strength: 'Strength',
  endurance: 'Endurance',
}

export const SEX_LABELS: Record<Sex, string> = {
  male: 'Male',
  female: 'Female',
}

export const ACTIVITY_LEVEL_LABELS: Record<ActivityLevel, string> = {
  sedentary: 'Sedentary',
  light: 'Lightly active',
  moderate: 'Moderately active',
  active: 'Active',
  athlete: 'Athlete',
}

export const WEIGHT_GOAL_LABELS: Record<WeightGoal, string> = {
  lose: 'Lose weight',
  maintain: 'Maintain',
  gain: 'Gain muscle',
}

export const DIET_PREFERENCE_LABELS: Record<DietPreference, string> = {
  veg: 'Vegetarian',
  eggetarian: 'Eggetarian',
  nonveg: 'Non-vegetarian',
  vegan: 'Vegan',
}

export const DIET_TAG_LABELS: Record<DietTag, string> = {
  dairy: 'Dairy',
  gluten: 'Gluten',
  nuts: 'Nuts',
  egg: 'Egg',
  soy: 'Soy',
  fish: 'Fish',
}

export const UNIT_SYSTEM_LABELS: Record<UnitSystem, string> = {
  metric: 'Metric (kg · cm)',
  imperial: 'Imperial (lb · ft)',
}
