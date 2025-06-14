/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import { z } from 'zod'

export const modelAssignmentRequestSchema = z.object({
  examModelId: z.string().describe('Exam model ID'),
  studentIds: z.array(z.string()).describe('Array of student IDs'),
})

export type ModelAssignmentRequestSchema = z.infer<typeof modelAssignmentRequestSchema>