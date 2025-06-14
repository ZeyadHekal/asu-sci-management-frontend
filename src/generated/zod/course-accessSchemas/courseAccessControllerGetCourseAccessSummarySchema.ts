/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import { courseAccessSummaryDtoSchema } from '../courseAccessSummaryDtoSchema.ts'
import { z } from 'zod'

export const courseAccessControllerGetCourseAccessSummaryPathParamsSchema = z.object({
  courseId: z.string().describe('Course ID'),
})

export type CourseAccessControllerGetCourseAccessSummaryPathParamsSchema = z.infer<typeof courseAccessControllerGetCourseAccessSummaryPathParamsSchema>

/**
 * @description Course access summary retrieved successfully
 */
export const courseAccessControllerGetCourseAccessSummary200Schema = z.lazy(() => courseAccessSummaryDtoSchema)

export type CourseAccessControllerGetCourseAccessSummary200Schema = z.infer<typeof courseAccessControllerGetCourseAccessSummary200Schema>

/**
 * @description Unauthorized
 */
export const courseAccessControllerGetCourseAccessSummary401Schema = z.unknown()

export type CourseAccessControllerGetCourseAccessSummary401Schema = z.infer<typeof courseAccessControllerGetCourseAccessSummary401Schema>

/**
 * @description Forbidden - Insufficient privileges
 */
export const courseAccessControllerGetCourseAccessSummary403Schema = z.unknown()

export type CourseAccessControllerGetCourseAccessSummary403Schema = z.infer<typeof courseAccessControllerGetCourseAccessSummary403Schema>

/**
 * @description Not Found - Course does not exist
 */
export const courseAccessControllerGetCourseAccessSummary404Schema = z.unknown()

export type CourseAccessControllerGetCourseAccessSummary404Schema = z.infer<typeof courseAccessControllerGetCourseAccessSummary404Schema>

export const courseAccessControllerGetCourseAccessSummaryQueryResponseSchema = z.lazy(() => courseAccessControllerGetCourseAccessSummary200Schema)

export type CourseAccessControllerGetCourseAccessSummaryQueryResponseSchema = z.infer<typeof courseAccessControllerGetCourseAccessSummaryQueryResponseSchema>