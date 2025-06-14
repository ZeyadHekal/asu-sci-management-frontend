/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import { courseAccessPermissionDtoSchema } from '../courseAccessPermissionDtoSchema.ts'
import { createCourseAccessDtoSchema } from '../createCourseAccessDtoSchema.ts'
import { z } from 'zod'

/**
 * @description Access permission granted successfully
 */
export const courseAccessControllerGrantCourseAccess201Schema = z.lazy(() => courseAccessPermissionDtoSchema)

export type CourseAccessControllerGrantCourseAccess201Schema = z.infer<typeof courseAccessControllerGrantCourseAccess201Schema>

/**
 * @description Bad Request - Invalid data or user does not have ASSIST_IN_COURSE privilege
 */
export const courseAccessControllerGrantCourseAccess400Schema = z.unknown()

export type CourseAccessControllerGrantCourseAccess400Schema = z.infer<typeof courseAccessControllerGrantCourseAccess400Schema>

/**
 * @description Unauthorized
 */
export const courseAccessControllerGrantCourseAccess401Schema = z.unknown()

export type CourseAccessControllerGrantCourseAccess401Schema = z.infer<typeof courseAccessControllerGrantCourseAccess401Schema>

/**
 * @description Forbidden - Insufficient privileges
 */
export const courseAccessControllerGrantCourseAccess403Schema = z.unknown()

export type CourseAccessControllerGrantCourseAccess403Schema = z.infer<typeof courseAccessControllerGrantCourseAccess403Schema>

/**
 * @description Not Found - Course or user does not exist
 */
export const courseAccessControllerGrantCourseAccess404Schema = z.unknown()

export type CourseAccessControllerGrantCourseAccess404Schema = z.infer<typeof courseAccessControllerGrantCourseAccess404Schema>

export const courseAccessControllerGrantCourseAccessMutationRequestSchema = z.lazy(() => createCourseAccessDtoSchema)

export type CourseAccessControllerGrantCourseAccessMutationRequestSchema = z.infer<typeof courseAccessControllerGrantCourseAccessMutationRequestSchema>

export const courseAccessControllerGrantCourseAccessMutationResponseSchema = z.lazy(() => courseAccessControllerGrantCourseAccess201Schema)

export type CourseAccessControllerGrantCourseAccessMutationResponseSchema = z.infer<typeof courseAccessControllerGrantCourseAccessMutationResponseSchema>