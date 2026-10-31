/**
 * Curated, India-friendly food database for the meal planner.
 * Values are per the stated serving and are approximate. Add new foods by
 * appending one entry here — the planner picks them up automatically.
 */

import type { Food } from '@/types/nutrition'

export const FOODS: readonly Food[] = [
  // Breakfast completes
  { id: 'poha', name: 'Poha', servingLabel: '1 cup cooked', kcal: 250, protein: 5, carbs: 45, fat: 6, slots: ['B'], role: 'complete', diet: 'vegan', tags: [] },
  { id: 'vegetable-upma', name: 'Vegetable upma', servingLabel: '1 cup', kcal: 220, protein: 5, carbs: 35, fat: 7, slots: ['B'], role: 'complete', diet: 'vegan', tags: ['gluten'] },
  { id: 'oats-milk-banana', name: 'Oats with milk & banana', servingLabel: '1 bowl', kcal: 300, protein: 10, carbs: 50, fat: 6, slots: ['B'], role: 'complete', diet: 'veg', tags: ['dairy', 'gluten'] },
  { id: 'moong-dal-chilla', name: 'Moong dal chilla', servingLabel: '2 pcs', kcal: 220, protein: 12, carbs: 28, fat: 6, slots: ['B'], role: 'complete', diet: 'vegan', tags: [] },
  { id: 'idli-sambar', name: 'Idli with sambar', servingLabel: '3 pcs', kcal: 230, protein: 8, carbs: 45, fat: 2, slots: ['B'], role: 'complete', diet: 'vegan', tags: [] },
  { id: 'paneer-paratha', name: 'Paneer paratha', servingLabel: '1 pc', kcal: 300, protein: 10, carbs: 34, fat: 13, slots: ['B'], role: 'complete', diet: 'veg', tags: ['dairy', 'gluten'] },
  { id: 'egg-bhurji', name: 'Egg bhurji', servingLabel: '2 eggs', kcal: 190, protein: 13, carbs: 3, fat: 14, slots: ['B'], role: 'complete', diet: 'egg', tags: ['egg'] },
  { id: 'tofu-scramble', name: 'Tofu scramble', servingLabel: '150 g', kcal: 180, protein: 15, carbs: 5, fat: 11, slots: ['B'], role: 'complete', diet: 'vegan', tags: ['soy'] },
  { id: 'peanut-butter-toast', name: 'Peanut butter toast', servingLabel: '2 slices', kcal: 300, protein: 11, carbs: 32, fat: 15, slots: ['B'], role: 'complete', diet: 'vegan', tags: ['gluten', 'nuts'] },

  // Dual-slot protein / sides
  { id: 'boiled-eggs', name: 'Boiled eggs', servingLabel: '2 large', kcal: 156, protein: 13, carbs: 1, fat: 11, slots: ['B', 'S'], role: 'protein', diet: 'egg', tags: ['egg'] },
  { id: 'curd-fruit', name: 'Curd with fruit', servingLabel: '1 bowl', kcal: 140, protein: 7, carbs: 18, fat: 4, slots: ['B', 'S'], role: 'side', diet: 'veg', tags: ['dairy'] },

  // Lunch / dinner staples, proteins, completes and sides
  { id: 'roti', name: 'Roti', servingLabel: '1 medium', kcal: 100, protein: 3, carbs: 18, fat: 2, slots: ['LD'], role: 'staple', diet: 'vegan', tags: ['gluten'] },
  { id: 'steamed-rice', name: 'Steamed rice', servingLabel: '1 cup cooked', kcal: 205, protein: 4, carbs: 45, fat: 0.5, slots: ['LD'], role: 'staple', diet: 'vegan', tags: [] },
  { id: 'dal-tadka', name: 'Dal tadka', servingLabel: '1 katori', kcal: 160, protein: 9, carbs: 22, fat: 4, slots: ['LD'], role: 'protein', diet: 'vegan', tags: [] },
  { id: 'rajma', name: 'Rajma', servingLabel: '1 katori', kcal: 210, protein: 11, carbs: 32, fat: 4, slots: ['LD'], role: 'protein', diet: 'vegan', tags: [] },
  { id: 'chole', name: 'Chole', servingLabel: '1 katori', kcal: 240, protein: 11, carbs: 33, fat: 7, slots: ['LD'], role: 'protein', diet: 'vegan', tags: [] },
  { id: 'palak-paneer', name: 'Palak paneer', servingLabel: '1 katori', kcal: 280, protein: 14, carbs: 8, fat: 21, slots: ['LD'], role: 'protein', diet: 'veg', tags: ['dairy'] },
  { id: 'soya-chunks-curry', name: 'Soya chunks curry', servingLabel: '1 katori', kcal: 200, protein: 18, carbs: 14, fat: 8, slots: ['LD'], role: 'protein', diet: 'vegan', tags: ['soy'] },
  { id: 'tofu-stir-fry', name: 'Tofu stir-fry', servingLabel: '150 g', kcal: 190, protein: 16, carbs: 6, fat: 11, slots: ['LD'], role: 'protein', diet: 'vegan', tags: ['soy'] },
  { id: 'egg-curry', name: 'Egg curry', servingLabel: '2 eggs', kcal: 250, protein: 15, carbs: 8, fat: 18, slots: ['LD'], role: 'protein', diet: 'egg', tags: ['egg'] },
  { id: 'grilled-chicken-breast', name: 'Grilled chicken breast', servingLabel: '150 g', kcal: 235, protein: 45, carbs: 0, fat: 6, slots: ['LD'], role: 'protein', diet: 'nonveg', tags: [] },
  { id: 'chicken-curry', name: 'Chicken curry', servingLabel: '1 katori', kcal: 260, protein: 24, carbs: 6, fat: 15, slots: ['LD'], role: 'protein', diet: 'nonveg', tags: [] },
  { id: 'grilled-fish', name: 'Grilled fish', servingLabel: '150 g', kcal: 220, protein: 30, carbs: 2, fat: 10, slots: ['LD'], role: 'protein', diet: 'nonveg', tags: ['fish'] },
  { id: 'vegetable-pulao', name: 'Vegetable pulao', servingLabel: '1 cup', kcal: 250, protein: 5, carbs: 45, fat: 6, slots: ['LD'], role: 'complete', diet: 'vegan', tags: [] },
  { id: 'khichdi', name: 'Khichdi', servingLabel: '1 bowl', kcal: 230, protein: 9, carbs: 38, fat: 4, slots: ['LD'], role: 'complete', diet: 'vegan', tags: [] },
  { id: 'mixed-veg-sabzi', name: 'Mixed vegetable sabzi', servingLabel: '1 katori', kcal: 110, protein: 3, carbs: 14, fat: 5, slots: ['LD'], role: 'side', diet: 'vegan', tags: [] },
  { id: 'cucumber-tomato-salad', name: 'Cucumber-tomato salad', servingLabel: '1 bowl', kcal: 45, protein: 2, carbs: 8, fat: 0.3, slots: ['LD'], role: 'side', diet: 'vegan', tags: [] },

  // Snacks
  { id: 'roasted-chana', name: 'Roasted chana', servingLabel: '30 g', kcal: 110, protein: 6, carbs: 18, fat: 2, slots: ['S'], role: 'snack', diet: 'vegan', tags: [] },
  { id: 'banana', name: 'Banana', servingLabel: '1 medium', kcal: 105, protein: 1, carbs: 27, fat: 0.4, slots: ['S'], role: 'snack', diet: 'vegan', tags: [] },
  { id: 'apple', name: 'Apple', servingLabel: '1 medium', kcal: 95, protein: 0.5, carbs: 25, fat: 0.3, slots: ['S'], role: 'snack', diet: 'vegan', tags: [] },
  { id: 'almonds', name: 'Almonds', servingLabel: '23 g (handful)', kcal: 160, protein: 6, carbs: 6, fat: 14, slots: ['S'], role: 'snack', diet: 'vegan', tags: ['nuts'] },
  { id: 'roasted-peanuts', name: 'Roasted peanuts', servingLabel: '30 g', kcal: 175, protein: 7, carbs: 5, fat: 15, slots: ['S'], role: 'snack', diet: 'vegan', tags: ['nuts'] },
  { id: 'whey-shake', name: 'Whey protein shake', servingLabel: '1 scoop in water', kcal: 120, protein: 24, carbs: 3, fat: 1.5, slots: ['S'], role: 'snack', diet: 'veg', tags: ['dairy'] },
  { id: 'sprouts-salad', name: 'Sprouts salad', servingLabel: '1 bowl', kcal: 130, protein: 9, carbs: 22, fat: 1, slots: ['S'], role: 'snack', diet: 'vegan', tags: [] },
  { id: 'buttermilk', name: 'Buttermilk (chaas)', servingLabel: '1 glass', kcal: 40, protein: 2, carbs: 5, fat: 1, slots: ['S'], role: 'snack', diet: 'veg', tags: ['dairy'] },
  { id: 'milk', name: 'Milk', servingLabel: '250 ml', kcal: 150, protein: 8, carbs: 12, fat: 8, slots: ['S'], role: 'snack', diet: 'veg', tags: ['dairy'] },
  { id: 'roasted-makhana', name: 'Roasted makhana', servingLabel: '30 g', kcal: 105, protein: 3.5, carbs: 22, fat: 0.1, slots: ['S'], role: 'snack', diet: 'vegan', tags: [] },
  { id: 'sattu-drink', name: 'Sattu drink', servingLabel: '1 glass', kcal: 140, protein: 8, carbs: 24, fat: 2, slots: ['S'], role: 'snack', diet: 'vegan', tags: [] },
]

/** Fast id -> food lookup. */
export const FOOD_BY_ID: Record<string, Food> = Object.fromEntries(FOODS.map((food) => [food.id, food]))
