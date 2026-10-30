/**
 * Active exercise data provider. Swap or decorate here (e.g. an external API
 * adapter) without touching API routes, services or UI.
 */

import { localProvider } from '@/lib/providers/localProvider'
import type { ExerciseDataProvider } from '@/lib/providers/types'

export const dataProvider: ExerciseDataProvider = localProvider
