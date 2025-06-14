/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import { courseGroupScheduleTableDtoSchema } from '../courseGroupScheduleTableDtoSchema.ts'
import { z } from 'zod'

export const courseGroupControllerGetAssistantGroupsPathParamsSchema = z.object({
  assistantId: z.string(),
  courseId: z.string(),
})

export type CourseGroupControllerGetAssistantGroupsPathParamsSchema = z.infer<typeof courseGroupControllerGetAssistantGroupsPathParamsSchema>

/**
 * @description Return assistant assigned groups.
 */
export const courseGroupControllerGetAssistantGroups200Schema = z.array(z.lazy(() => courseGroupScheduleTableDtoSchema))

export type CourseGroupControllerGetAssistantGroups200Schema = z.infer<typeof courseGroupControllerGetAssistantGroups200Schema>

export const courseGroupControllerGetAssistantGroupsQueryResponseSchema = z.lazy(() => courseGroupControllerGetAssistantGroups200Schema)

export type CourseGroupControllerGetAssistantGroupsQueryResponseSchema = z.infer<typeof courseGroupControllerGetAssistantGroupsQueryResponseSchema>