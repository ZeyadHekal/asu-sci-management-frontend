/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import { groupCreationSimulationDtoSchema } from '../groupCreationSimulationDtoSchema.ts'
import { z } from 'zod'

export const eventControllerSimulateGroupCreationPathParamsSchema = z.object({
  courseId: z.string(),
})

export type EventControllerSimulateGroupCreationPathParamsSchema = z.infer<typeof eventControllerSimulateGroupCreationPathParamsSchema>

/**
 * @description Group simulation data
 */
export const eventControllerSimulateGroupCreation200Schema = z.lazy(() => groupCreationSimulationDtoSchema)

export type EventControllerSimulateGroupCreation200Schema = z.infer<typeof eventControllerSimulateGroupCreation200Schema>

export const eventControllerSimulateGroupCreationMutationResponseSchema = z.lazy(() => eventControllerSimulateGroupCreation200Schema)

export type EventControllerSimulateGroupCreationMutationResponseSchema = z.infer<typeof eventControllerSimulateGroupCreationMutationResponseSchema>