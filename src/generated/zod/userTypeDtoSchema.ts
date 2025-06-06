/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import { z } from 'zod'

export const userTypeDtoSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  isDeletable: z.boolean().default(true),
  id: z.string(),
})

export type UserTypeDtoSchema = z.infer<typeof userTypeDtoSchema>