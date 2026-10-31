/** Local, in-memory implementation of the exercise data provider. */

import { REGIONS } from '@/config/regions'
import { regionContentById } from '@/data/regions'
import type { ExerciseDataProvider } from '@/lib/providers/types'

export const localProvider: ExerciseDataProvider = {
  getRegions() {
    return REGIONS
  },
  getRegionContent(id) {
    return regionContentById[id]
  },
}
