/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import { z } from 'zod'

export const courseGroupControllerGetStudentsInDefaultGroupPathParamsSchema = z.object({
  courseId: z.string(),
})

export type CourseGroupControllerGetStudentsInDefaultGroupPathParamsSchema = z.infer<typeof courseGroupControllerGetStudentsInDefaultGroupPathParamsSchema>

/**
 * @description Return the number of students in default group.
 */
export const courseGroupControllerGetStudentsInDefaultGroup200Schema = z.unknown()

export type CourseGroupControllerGetStudentsInDefaultGroup200Schema = z.infer<typeof courseGroupControllerGetStudentsInDefaultGroup200Schema>

export const courseGroupControllerGetStudentsInDefaultGroupQueryResponseSchema = z.lazy(() => courseGroupControllerGetStudentsInDefaultGroup200Schema)

export type CourseGroupControllerGetStudentsInDefaultGroupQueryResponseSchema = z.infer<
  typeof courseGroupControllerGetStudentsInDefaultGroupQueryResponseSchema
>