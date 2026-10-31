'use client'

/**
 * The 5-step onboarding wizard (react-hook-form + zod, shared schemas in
 * `lib/validation/profileSchemas`). Each step validates before Next, Back
 * never loses data (all state lives in the one RHF form), Enter submits the
 * current step, and the final step saves the profile through
 * `completeOnboarding` before landing on the home page.
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FormProvider, useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'sonner'
import { ArrowLeft, ArrowRight, Loader2, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import type { DemoProfile } from '@/config/demoProfiles'
import {
  STEP_FIELDS,
  onboardingFormSchema,
  type OnboardingFormValues,
} from '@/lib/validation/profileSchemas'
import { useProfileStore } from '@/store/useProfileStore'
import { DEFAULT_PROFILE, type UserProfile } from '@/types/profile'
import { AboutStep } from '@/components/welcome/steps/AboutStep'
import { BodyStep } from '@/components/welcome/steps/BodyStep'
import { GoalsStep } from '@/components/welcome/steps/GoalsStep'
import { MedicalStep } from '@/components/welcome/steps/MedicalStep'
import { ReviewStep } from '@/components/welcome/steps/ReviewStep'

const STEP_TITLES = ['About you', 'Your body', 'Goals & food', 'Medical history', 'Review'] as const
const STEP_COUNT = STEP_TITLES.length

const DEFAULT_VALUES: OnboardingFormValues = {
  name: '',
  age: undefined,
  sex: undefined,
  unitSystem: 'metric',
  heightCm: undefined,
  weightKg: undefined,
  activityLevel: undefined,
  goal: undefined,
  paceKgPerWeek: 0.5,
  dietPreference: 'veg',
  excludedTags: [],
  trainingLevel: 'beginner',
  equipment: ['bodyweight'],
  trainingGoal: 'hypertrophy',
  medicalConditions: [],
  otherConditions: [],
  noneOfAbove: false,
}

/** Derive the wizard-only `noneOfAbove` flag for a demo pre-fill. */
function demoToFormValues(demo: DemoProfile): OnboardingFormValues {
  const hasConditions =
    demo.values.medicalConditions.length > 0 || demo.values.otherConditions.length > 0
  return { ...demo.values, noneOfAbove: !hasConditions }
}

export function OnboardingWizard() {
  const router = useRouter()
  const completeOnboarding = useProfileStore((state) => state.completeOnboarding)
  const [step, setStep] = useState(0)
  const [finishing, setFinishing] = useState(false)

  const form = useForm<OnboardingFormValues>({
    defaultValues: DEFAULT_VALUES,
    // The zod schema is strict (required fields); the form holds `undefined`
    // until each step is filled — one documented adapter cast.
    resolver: zodResolver(onboardingFormSchema) as unknown as Resolver<OnboardingFormValues>,
    mode: 'onTouched',
  })
  const { trigger, reset, getValues } = form

  /** Validate the current step, then advance (or finish on the last step). */
  const handleStepSubmit = async (): Promise<void> => {
    const fields = STEP_FIELDS[step]
    const stepValid = fields.length > 0 ? await trigger(fields, { shouldFocus: true }) : true
    if (!stepValid) return
    if (step < STEP_COUNT - 1) {
      setStep(step + 1)
      return
    }
    const allValid = await trigger()
    if (!allValid) return
    setFinishing(true)
    const values = getValues()
    const profile: UserProfile = {
      ...DEFAULT_PROFILE,
      name: values.name.trim(),
      age: values.age,
      sex: values.sex,
      heightCm: values.heightCm,
      weightKg: values.weightKg,
      activityLevel: values.activityLevel,
      goal: values.goal,
      paceKgPerWeek: values.paceKgPerWeek,
      unitSystem: values.unitSystem,
      dietPreference: values.dietPreference,
      excludedTags: values.excludedTags,
      trainingLevel: values.trainingLevel,
      equipment: values.equipment,
      trainingGoal: values.trainingGoal,
      medicalConditions: values.medicalConditions,
      otherConditions: values.otherConditions,
    }
    if (!completeOnboarding(profile)) {
      setFinishing(false)
      toast.error('Please complete every step before continuing.')
      return
    }
    toast.success(`Welcome to PhysioMap, ${profile.name}`)
    router.replace('/')
  }

  /** Quick-fill a demo profile (the user still walks the steps). */
  const applyDemo = (demo: DemoProfile): void => {
    reset(demoToFormValues(demo))
    setStep(0)
  }

  const isLastStep = step === STEP_COUNT - 1

  return (
    <FormProvider {...form}>
      <div className="mx-auto flex min-h-0 w-full max-w-lg flex-1 flex-col">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/8 bg-surface shadow-xl lg:max-h-[calc(100dvh-7rem)] lg:flex-none">
          {/* Sticky progress header */}
          <div className="shrink-0 border-b border-white/8 bg-surface px-5 py-4 sm:px-6">
            <div className="mb-2 flex items-baseline justify-between gap-3">
              <h2 className="font-heading text-base font-bold tracking-tight text-foreground">
                {STEP_TITLES[step]}
              </h2>
              <p className="text-xs font-medium text-muted-foreground" aria-live="polite">
                Step {step + 1} of {STEP_COUNT}
              </p>
            </div>
            <Progress
              value={((step + 1) / STEP_COUNT) * 100}
              aria-label={`Onboarding progress: step ${step + 1} of ${STEP_COUNT}`}
              className="h-1.5 bg-white/8"
            />
          </div>

          <form
            noValidate
            onSubmit={(event) => {
              event.preventDefault()
              void handleStepSubmit()
            }}
            className="flex min-h-0 flex-1 flex-col"
          >
            {/* Step content */}
            <div className="scroll-slim min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                >
                  {step === 0 ? (
                    <AboutStep onDemoFill={applyDemo} />
                  ) : step === 1 ? (
                    <BodyStep />
                  ) : step === 2 ? (
                    <GoalsStep />
                  ) : step === 3 ? (
                    <MedicalStep />
                  ) : (
                    <ReviewStep onEdit={(target) => setStep(target)} />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer navigation */}
            <div className="flex shrink-0 items-center justify-between gap-3 border-t border-white/8 bg-surface/95 px-5 py-4 sm:px-6">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep((current) => Math.max(0, current - 1))}
                disabled={step === 0}
                className="text-muted-foreground"
              >
                <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden="true" />
                Back
              </Button>
              <Button
                type="submit"
                disabled={finishing}
                className="bg-brand-blue px-6 text-white hover:bg-brand-blue/85"
              >
                {finishing ? (
                  <>
                    Entering…
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  </>
                ) : isLastStep ? (
                  <>
                    Enter PhysioMap
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-copper" aria-hidden="true" />
          Your details stay on this device. Nothing is uploaded.
        </p>
      </div>
    </FormProvider>
  )
}
