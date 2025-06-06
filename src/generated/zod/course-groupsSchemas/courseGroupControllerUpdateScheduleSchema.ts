/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import { updateCourseGroupScheduleDtoSchema } from '../updateCourseGroupScheduleDtoSchema.ts'
import { z } from 'zod'

export const courseGroupControllerUpdateSchedulePathParamsSchema = z.object({
  courseGroupId: z.string(),
  assistantId: z.string(),
})

export type CourseGroupControllerUpdateSchedulePathParamsSchema = z.infer<typeof courseGroupControllerUpdateSchedulePathParamsSchema>

/**
 * @description Schedule updated successfully.
 */
export const courseGroupControllerUpdateSchedule200Schema = z.unknown()

export type CourseGroupControllerUpdateSchedule200Schema = z.infer<typeof courseGroupControllerUpdateSchedule200Schema>

/**
 * @description Schedule not found.
 */
export const courseGroupControllerUpdateSchedule404Schema = z.unknown()

export type CourseGroupControllerUpdateSchedule404Schema = z.infer<typeof courseGroupControllerUpdateSchedule404Schema>

export const courseGroupControllerUpdateScheduleMutationRequestSchema = z.lazy(() => updateCourseGroupScheduleDtoSchema)

export type CourseGroupControllerUpdateScheduleMutationRequestSchema = z.infer<typeof courseGroupControllerUpdateScheduleMutationRequestSchema>

export const courseGroupControllerUpdateScheduleMutationResponseSchema = z.lazy(() => courseGroupControllerUpdateSchedule200Schema)

export type CourseGroupControllerUpdateScheduleMutationResponseSchema = z.infer<typeof courseGroupControllerUpdateScheduleMutationResponseSchema>