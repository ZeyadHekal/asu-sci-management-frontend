/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import { z } from 'zod'

export const createCourseAccessDtoSchema = z.object({
  userId: z.string(),
  courseId: z.string(),
  section: z.enum(['grades', 'events', 'content', 'groups']),
  canView: z.boolean().default(false),
  canEdit: z.boolean().default(false),
  canDelete: z.boolean().default(false),
})

export type CreateCourseAccessDtoSchema = z.infer<typeof createCourseAccessDtoSchema>