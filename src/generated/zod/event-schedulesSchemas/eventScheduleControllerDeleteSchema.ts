/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import { deleteDtoSchema } from '../deleteDtoSchema.ts'
import { z } from 'zod'

export const eventScheduleControllerDeletePathParamsSchema = z.object({
  event_schedule_ids: z.string().describe('Comma-separated event schedule IDs'),
})

export type EventScheduleControllerDeletePathParamsSchema = z.infer<typeof eventScheduleControllerDeletePathParamsSchema>

/**
 * @description Event schedules deleted successfully
 */
export const eventScheduleControllerDelete200Schema = z.lazy(() => deleteDtoSchema)

export type EventScheduleControllerDelete200Schema = z.infer<typeof eventScheduleControllerDelete200Schema>

/**
 * @description Unauthorized
 */
export const eventScheduleControllerDelete401Schema = z.unknown()

export type EventScheduleControllerDelete401Schema = z.infer<typeof eventScheduleControllerDelete401Schema>

/**
 * @description Forbidden - Insufficient privileges
 */
export const eventScheduleControllerDelete403Schema = z.unknown()

export type EventScheduleControllerDelete403Schema = z.infer<typeof eventScheduleControllerDelete403Schema>

/**
 * @description Not Found - One or more event schedules do not exist
 */
export const eventScheduleControllerDelete404Schema = z.unknown()

export type EventScheduleControllerDelete404Schema = z.infer<typeof eventScheduleControllerDelete404Schema>

export const eventScheduleControllerDeleteMutationResponseSchema = z.lazy(() => eventScheduleControllerDelete200Schema)

export type EventScheduleControllerDeleteMutationResponseSchema = z.infer<typeof eventScheduleControllerDeleteMutationResponseSchema>