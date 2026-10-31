import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { mealPlanRequestSchema } from '@/config/healthSchemas'
import { generateMealPlan } from '@/lib/nutrition/mealPlanner'

/** POST /api/nutrition/meal-plan — generate a deterministic meal plan. */
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

    const parsed = mealPlanRequestSchema.safeParse(body)
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

    const plan = generateMealPlan(parsed.data)
    return NextResponse.json(plan)
  } catch {
    return NextResponse.json(
      { error: { code: 'internal-error', message: 'Meal plan generation failed unexpectedly.' } },
      { status: 500 },
    )
  }
}
