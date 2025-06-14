/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import { z } from 'zod'

export const courseGroupControllerGetAvailableGroupsForMovePathParamsSchema = z.object({
  groupId: z.string(),
  studentId: z.string(),
})

export type CourseGroupControllerGetAvailableGroupsForMovePathParamsSchema = z.infer<typeof courseGroupControllerGetAvailableGroupsForMovePathParamsSchema>

/**
 * @description Available groups retrieved successfully
 */
export const courseGroupControllerGetAvailableGroupsForMove200Schema = z.unknown()

export type CourseGroupControllerGetAvailableGroupsForMove200Schema = z.infer<typeof courseGroupControllerGetAvailableGroupsForMove200Schema>

export const courseGroupControllerGetAvailableGroupsForMoveQueryResponseSchema = z.lazy(() => courseGroupControllerGetAvailableGroupsForMove200Schema)

export type CourseGroupControllerGetAvailableGroupsForMoveQueryResponseSchema = z.infer<
  typeof courseGroupControllerGetAvailableGroupsForMoveQueryResponseSchema
>