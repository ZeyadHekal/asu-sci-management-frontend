/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import { assistantListDtoSchema } from '../assistantListDtoSchema.ts'
import { z } from 'zod'

export const courseAccessControllerGetAvailableAssistantsPathParamsSchema = z.object({
  courseId: z.string().describe('Course ID'),
})

export type CourseAccessControllerGetAvailableAssistantsPathParamsSchema = z.infer<typeof courseAccessControllerGetAvailableAssistantsPathParamsSchema>

/**
 * @description Available assistants retrieved successfully
 */
export const courseAccessControllerGetAvailableAssistants200Schema = z.array(z.lazy(() => assistantListDtoSchema))

export type CourseAccessControllerGetAvailableAssistants200Schema = z.infer<typeof courseAccessControllerGetAvailableAssistants200Schema>

/**
 * @description Unauthorized
 */
export const courseAccessControllerGetAvailableAssistants401Schema = z.unknown()

export type CourseAccessControllerGetAvailableAssistants401Schema = z.infer<typeof courseAccessControllerGetAvailableAssistants401Schema>

/**
 * @description Forbidden - Insufficient privileges
 */
export const courseAccessControllerGetAvailableAssistants403Schema = z.unknown()

export type CourseAccessControllerGetAvailableAssistants403Schema = z.infer<typeof courseAccessControllerGetAvailableAssistants403Schema>

/**
 * @description Not Found - Course does not exist
 */
export const courseAccessControllerGetAvailableAssistants404Schema = z.unknown()

export type CourseAccessControllerGetAvailableAssistants404Schema = z.infer<typeof courseAccessControllerGetAvailableAssistants404Schema>

export const courseAccessControllerGetAvailableAssistantsQueryResponseSchema = z.lazy(() => courseAccessControllerGetAvailableAssistants200Schema)

export type CourseAccessControllerGetAvailableAssistantsQueryResponseSchema = z.infer<typeof courseAccessControllerGetAvailableAssistantsQueryResponseSchema>