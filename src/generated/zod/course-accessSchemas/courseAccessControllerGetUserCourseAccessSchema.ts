/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import { courseAccessPermissionDtoSchema } from '../courseAccessPermissionDtoSchema.ts'
import { z } from 'zod'

export const courseAccessControllerGetUserCourseAccessPathParamsSchema = z.object({
  userId: z.string().describe('User ID'),
  courseId: z.string().describe('Course ID'),
})

export type CourseAccessControllerGetUserCourseAccessPathParamsSchema = z.infer<typeof courseAccessControllerGetUserCourseAccessPathParamsSchema>

/**
 * @description User course access retrieved successfully
 */
export const courseAccessControllerGetUserCourseAccess200Schema = z.array(z.lazy(() => courseAccessPermissionDtoSchema))

export type CourseAccessControllerGetUserCourseAccess200Schema = z.infer<typeof courseAccessControllerGetUserCourseAccess200Schema>

/**
 * @description Unauthorized
 */
export const courseAccessControllerGetUserCourseAccess401Schema = z.unknown()

export type CourseAccessControllerGetUserCourseAccess401Schema = z.infer<typeof courseAccessControllerGetUserCourseAccess401Schema>

/**
 * @description Forbidden - Insufficient privileges
 */
export const courseAccessControllerGetUserCourseAccess403Schema = z.unknown()

export type CourseAccessControllerGetUserCourseAccess403Schema = z.infer<typeof courseAccessControllerGetUserCourseAccess403Schema>

export const courseAccessControllerGetUserCourseAccessQueryResponseSchema = z.lazy(() => courseAccessControllerGetUserCourseAccess200Schema)

export type CourseAccessControllerGetUserCourseAccessQueryResponseSchema = z.infer<typeof courseAccessControllerGetUserCourseAccessQueryResponseSchema>