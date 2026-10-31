/**
 * Quick-fill demo profiles for the /welcome wizard — built for live
 * presentations. A chip pre-fills the whole form with realistic values; the
 * presenter still walks through the steps and presses Next. Values are always
 * metric (the wizard converts for display via the unit toggle).
 */

import type { OnboardingFormValues } from '@/lib/validation/profileSchemas'

export interface DemoProfile {
  id: string
  label: string
  values: Omit<OnboardingFormValues, 'noneOfAbove'>
}

const BASE_VALUES: Omit<OnboardingFormValues, 'noneOfAbove'> = {
  name: 'Demo User',
  age: 30,
  sex: 'male',
  unitSystem: 'metric',
  heightCm: 175,
  weightKg: 75,
  activityLevel: 'moderate',
  goal: 'maintain',
  paceKgPerWeek: 0.5,
  dietPreference: 'veg',
  excludedTags: [],
  trainingLevel: 'beginner',
  equipment: ['bodyweight'],
  trainingGoal: 'hypertrophy',
  medicalConditions: [],
  otherConditions: [],
}

export const DEMO_PROFILES: readonly DemoProfile[] = [
  {
    id: 'healthy-athlete',
    label: 'Healthy athlete',
    values: {
      ...BASE_VALUES,
      name: 'Demo Athlete',
      age: 28,
      heightCm: 178,
      weightKg: 74,
      activityLevel: 'athlete',
      goal: 'gain',
      paceKgPerWeek: 0.25,
      dietPreference: 'nonveg',
      trainingLevel: 'advanced',
      equipment: ['bodyweight', 'dumbbells', 'barbell'],
      trainingGoal: 'strength',
    },
  },
  {
    id: 'desk-worker',
    label: 'Desk worker (neck & back)',
    values: {
      ...BASE_VALUES,
      name: 'Demo Desk Worker',
      age: 34,
      sex: 'female',
      heightCm: 163,
      weightKg: 68,
      activityLevel: 'light',
      goal: 'lose',
      paceKgPerWeek: 0.5,
      dietPreference: 'veg',
      trainingLevel: 'beginner',
      equipment: ['bodyweight'],
      trainingGoal: 'hypertrophy',
      medicalConditions: ['cervical-spondylosis', 'lumbar-spondylosis'],
    },
  },
  {
    id: 'hypertension',
    label: 'Hypertension',
    values: {
      ...BASE_VALUES,
      name: 'Demo Hypertension',
      age: 52,
      heightCm: 172,
      weightKg: 84,
      activityLevel: 'light',
      goal: 'lose',
      paceKgPerWeek: 0.5,
      dietPreference: 'nonveg',
      trainingLevel: 'beginner',
      equipment: ['bodyweight'],
      trainingGoal: 'hypertrophy',
      medicalConditions: ['high-blood-pressure'],
    },
  },
  {
    id: 'type-2-diabetes',
    label: 'Type 2 diabetes',
    values: {
      ...BASE_VALUES,
      name: 'Demo Diabetes',
      age: 47,
      sex: 'female',
      heightCm: 160,
      weightKg: 78,
      activityLevel: 'light',
      goal: 'lose',
      paceKgPerWeek: 0.5,
      dietPreference: 'veg',
      trainingLevel: 'beginner',
      equipment: ['bodyweight', 'bands'],
      trainingGoal: 'endurance',
      medicalConditions: ['type-2-diabetes'],
    },
  },
  {
    id: 'knee-osteoarthritis',
    label: 'Knee osteoarthritis',
    values: {
      ...BASE_VALUES,
      name: 'Demo Osteoarthritis',
      age: 61,
      heightCm: 170,
      weightKg: 82,
      activityLevel: 'sedentary',
      goal: 'lose',
      paceKgPerWeek: 0.25,
      dietPreference: 'eggetarian',
      trainingLevel: 'beginner',
      equipment: ['bodyweight'],
      trainingGoal: 'strength',
      medicalConditions: ['osteoarthritis'],
    },
  },
  {
    id: 'heart-condition',
    label: 'Heart condition',
    values: {
      ...BASE_VALUES,
      name: 'Demo Heart',
      age: 58,
      heightCm: 174,
      weightKg: 80,
      activityLevel: 'light',
      goal: 'maintain',
      paceKgPerWeek: 0.5,
      dietPreference: 'veg',
      trainingLevel: 'beginner',
      equipment: ['bodyweight'],
      trainingGoal: 'endurance',
      medicalConditions: ['coronary-artery-disease', 'high-blood-pressure'],
    },
  },
]
