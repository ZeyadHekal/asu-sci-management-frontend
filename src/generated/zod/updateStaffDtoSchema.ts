/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import { z } from 'zod'

export const updateStaffDtoSchema = z.object({
  name: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  title: z.string().optional(),
  department: z.string().optional(),
  userTypeId: z.string().describe('User type ID to change staff type').optional(),
})

export type UpdateStaffDtoSchema = z.infer<typeof updateStaffDtoSchema>