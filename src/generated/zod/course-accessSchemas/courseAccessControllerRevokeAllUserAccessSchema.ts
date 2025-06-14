/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import { z } from 'zod'

export const courseAccessControllerRevokeAllUserAccessPathParamsSchema = z.object({
  userId: z.string().describe('User ID'),
  courseId: z.string().describe('Course ID'),
})

export type CourseAccessControllerRevokeAllUserAccessPathParamsSchema = z.infer<typeof courseAccessControllerRevokeAllUserAccessPathParamsSchema>

/**
 * @description All access permissions revoked successfully
 */
export const courseAccessControllerRevokeAllUserAccess204Schema = z.unknown()

export type CourseAccessControllerRevokeAllUserAccess204Schema = z.infer<typeof courseAccessControllerRevokeAllUserAccess204Schema>

/**
 * @description Unauthorized
 */
export const courseAccessControllerRevokeAllUserAccess401Schema = z.unknown()

export type CourseAccessControllerRevokeAllUserAccess401Schema = z.infer<typeof courseAccessControllerRevokeAllUserAccess401Schema>

/**
 * @description Forbidden - Insufficient privileges
 */
export const courseAccessControllerRevokeAllUserAccess403Schema = z.unknown()

export type CourseAccessControllerRevokeAllUserAccess403Schema = z.infer<typeof courseAccessControllerRevokeAllUserAccess403Schema>

/**
 * @description Not Found - User or course does not exist
 */
export const courseAccessControllerRevokeAllUserAccess404Schema = z.unknown()

export type CourseAccessControllerRevokeAllUserAccess404Schema = z.infer<typeof courseAccessControllerRevokeAllUserAccess404Schema>

export const courseAccessControllerRevokeAllUserAccessMutationResponseSchema = z.lazy(() => courseAccessControllerRevokeAllUserAccess204Schema)

export type CourseAccessControllerRevokeAllUserAccessMutationResponseSchema = z.infer<typeof courseAccessControllerRevokeAllUserAccessMutationResponseSchema>