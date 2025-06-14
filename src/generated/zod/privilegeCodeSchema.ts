/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import { z } from 'zod'

export const privilegeCodeSchema = z.enum([
  'MANAGE_SYSTEM',
  'MANAGE_STUDENTS',
  'MANAGE_LABS',
  'LAB_ASSISTANT',
  'STUDY_COURSE',
  'TEACH_COURSE',
  'ASSIST_IN_COURSE',
  'LAB_MAINTENANCE',
  'REPORT_DEVICE',
  'MANAGE_COURSES',
])

export type PrivilegeCodeSchema = z.infer<typeof privilegeCodeSchema>