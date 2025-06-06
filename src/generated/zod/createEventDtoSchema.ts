/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import { z } from 'zod'

export const createEventDtoSchema = z.object({
  name: z.string(),
  duration: z.number(),
  isExam: z.boolean(),
  isInLab: z.boolean(),
  examFiles: z.string().optional(),
  degree: z.number(),
  autoStart: z.boolean().default(false),
  examModeStartMinutes: z.number().default(30),
  description: z.string().optional(),
  courseId: z.string(),
})

export type CreateEventDtoSchema = z.infer<typeof createEventDtoSchema>