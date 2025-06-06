/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import { eventScheduleDtoSchema } from './eventScheduleDtoSchema.ts'
import { z } from 'zod'

export const eventSchedulePagedDtoSchema = z.object({
  items: z.lazy(() => eventScheduleDtoSchema),
  total: z.number(),
})

export type EventSchedulePagedDtoSchema = z.infer<typeof eventSchedulePagedDtoSchema>