import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { healthProfileSchema } from '@/config/healthSchemas'
import { calculateBmiResult } from '@/lib/health/bmi'
import { calculateEnergyResults } from '@/lib/health/energy'
import { calculateMacroTargets } from '@/lib/health/macros'
import { calculateWaterTarget } from '@/lib/health/water'

/**
 * POST /api/nutrition/calculate — BMI / BMR / TDEE / calorie + macro targets
 * and the water goal for a profile. Shares the exact same pure functions the
 * client-side Calculators tab uses.
 */
export async function POST(request: NextRequest) {
  try {
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: { code: 'invalid-json', message: 'Request body must be valid JSON.' } },
        { status: 400 },
      )
    }

    const parsed = healthProfileSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: 'invalid-input',
            message: parsed.error.issues.map((issue) => issue.message).join(' '),
          },
        },
        { status: 400 },
      )
    }

    const profile = parsed.data
    const energy = calculateEnergyResults(profile)
    const macros = calculateMacroTargets(energy.targetKcal, profile.weightKg, profile.goal)

    return NextResponse.json({
      bmi: calculateBmiResult(profile.weightKg, profile.heightCm),
      energy,
      macros,
      waterMl: calculateWaterTarget(profile.weightKg, profile.activityLevel),
    })
  } catch {
    return NextResponse.json(
      { error: { code: 'internal-error', message: 'Calculation failed unexpectedly.' } },
      { status: 500 },
    )
  }
}
