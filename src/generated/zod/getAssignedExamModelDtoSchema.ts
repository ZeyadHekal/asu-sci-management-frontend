/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import { z } from 'zod'

export const getAssignedExamModelDtoSchema = z.object({
  examModel: z.string(),
  examModelUrl: z.string(),
})

export type GetAssignedExamModelDtoSchema = z.infer<typeof getAssignedExamModelDtoSchema>