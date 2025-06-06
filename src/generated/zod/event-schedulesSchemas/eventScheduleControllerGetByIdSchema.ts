/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import { eventScheduleDtoSchema } from '../eventScheduleDtoSchema.ts'
import { z } from 'zod'

export const eventScheduleControllerGetByIdPathParamsSchema = z.object({
  event_schedule_id: z.string().describe('Event Schedule ID'),
})

export type EventScheduleControllerGetByIdPathParamsSchema = z.infer<typeof eventScheduleControllerGetByIdPathParamsSchema>

/**
 * @description Event schedule retrieved successfully
 */
export const eventScheduleControllerGetById200Schema = z.lazy(() => eventScheduleDtoSchema)

export type EventScheduleControllerGetById200Schema = z.infer<typeof eventScheduleControllerGetById200Schema>

/**
 * @description Unauthorized
 */
export const eventScheduleControllerGetById401Schema = z.unknown()

export type EventScheduleControllerGetById401Schema = z.infer<typeof eventScheduleControllerGetById401Schema>

/**
 * @description Forbidden - Insufficient privileges
 */
export const eventScheduleControllerGetById403Schema = z.unknown()

export type EventScheduleControllerGetById403Schema = z.infer<typeof eventScheduleControllerGetById403Schema>

/**
 * @description Not Found - Event schedule does not exist
 */
export const eventScheduleControllerGetById404Schema = z.unknown()

export type EventScheduleControllerGetById404Schema = z.infer<typeof eventScheduleControllerGetById404Schema>

export const eventScheduleControllerGetByIdQueryResponseSchema = z.lazy(() => eventScheduleControllerGetById200Schema)

export type EventScheduleControllerGetByIdQueryResponseSchema = z.infer<typeof eventScheduleControllerGetByIdQueryResponseSchema>