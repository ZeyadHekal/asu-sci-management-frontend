/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import { userDtoSchema } from './userDtoSchema.ts'
import { z } from 'zod'

export const labListDtoSchema = z.object({
  name: z.string(),
  location: z.string(),
  supervisorId: z.string(),
  id: z.string(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
  deviceCount: z.number(),
  supervisor: z.lazy(() => userDtoSchema),
  status: z.enum(['Available', 'In Use', 'Under Maintenance']),
})

export type LabListDtoSchema = z.infer<typeof labListDtoSchema>