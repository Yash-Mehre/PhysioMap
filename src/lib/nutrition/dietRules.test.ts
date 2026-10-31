import { describe, expect, it } from 'vitest'
import { FOODS } from '@/data/foods'
import { filterAllowedFoods, isFoodAllowed } from '@/lib/nutrition/dietRules'

describe('isFoodAllowed', () => {
  it('accepts foods at or below the user diet tier', () => {
    // vegan food, vegan user
    expect(isFoodAllowed(FOODS[0], 'vegan', [])).toBe(true)
    // veg food (oats with milk), vegan user → rejected
    const oats = FOODS.find((food) => food.id === 'oats-milk-banana')
    expect(oats).toBeDefined()
    expect(isFoodAllowed(oats!, 'vegan', [])).toBe(false)
    expect(isFoodAllowed(oats!, 'veg', [])).toBe(true)
    // egg food, eggetarian user
    const bhurji = FOODS.find((food) => food.id === 'egg-bhurji')
    expect(isFoodAllowed(bhurji!, 'eggetarian', [])).toBe(true)
    expect(isFoodAllowed(bhurji!, 'veg', [])).toBe(false)
    // non-veg food, only non-veg users
    const chicken = FOODS.find((food) => food.id === 'grilled-chicken-breast')
    expect(isFoodAllowed(chicken!, 'nonveg', [])).toBe(true)
    expect(isFoodAllowed(chicken!, 'eggetarian', [])).toBe(false)
  })

  it('removes foods whose tags intersect the exclusions', () => {
    const paneer = FOODS.find((food) => food.id === 'palak-paneer')
    expect(isFoodAllowed(paneer!, 'nonveg', ['dairy'])).toBe(false)
    expect(isFoodAllowed(paneer!, 'nonveg', ['gluten'])).toBe(true)

    const peanuts = FOODS.find((food) => food.id === 'roasted-peanuts')
    expect(isFoodAllowed(peanuts!, 'vegan', ['nuts'])).toBe(false)
  })
})

describe('filterAllowedFoods', () => {
  it('returns a strictly smaller list for vegan + exclusions', () => {
    const vegan = filterAllowedFoods(FOODS, 'vegan', [])
    expect(vegan.length).toBeGreaterThan(0)
    expect(vegan.length).toBeLessThan(FOODS.length)
    expect(vegan.every((food) => food.diet === 'vegan')).toBe(true)

    const veganNoNuts = filterAllowedFoods(FOODS, 'vegan', ['nuts'])
    expect(veganNoNuts.length).toBeLessThan(vegan.length)
    expect(veganNoNuts.some((food) => food.tags.includes('nuts'))).toBe(false)
  })

  it('lets non-veg users see everything untagged by their exclusions', () => {
    const all = filterAllowedFoods(FOODS, 'nonveg', [])
    expect(all).toHaveLength(FOODS.length)
  })
})
