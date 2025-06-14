/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import { z } from 'zod'

export const approveStaffRequestDtoSchema = z.object({
  name: z.string().describe('Name of the staff member'),
  username: z.string().describe('Username for the staff member'),
  title: z.string().describe('Title/Position of the staff member'),
  department: z.string().describe('Department of the staff member'),
  userTypeId: z.string().describe('User type ID to assign to the approved staff member'),
})

export type ApproveStaffRequestDtoSchema = z.infer<typeof approveStaffRequestDtoSchema>