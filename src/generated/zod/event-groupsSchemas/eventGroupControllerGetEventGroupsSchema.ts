/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import { eventGroupDtoSchema } from '../eventGroupDtoSchema.ts'
import { z } from 'zod'

export const eventGroupControllerGetEventGroupsPathParamsSchema = z.object({
  eventId: z.string().describe('Event ID'),
})

export type EventGroupControllerGetEventGroupsPathParamsSchema = z.infer<typeof eventGroupControllerGetEventGroupsPathParamsSchema>

/**
 * @description Event groups retrieved successfully
 */
export const eventGroupControllerGetEventGroups200Schema = z.array(z.lazy(() => eventGroupDtoSchema))

export type EventGroupControllerGetEventGroups200Schema = z.infer<typeof eventGroupControllerGetEventGroups200Schema>

export const eventGroupControllerGetEventGroupsQueryResponseSchema = z.lazy(() => eventGroupControllerGetEventGroups200Schema)

export type EventGroupControllerGetEventGroupsQueryResponseSchema = z.infer<typeof eventGroupControllerGetEventGroupsQueryResponseSchema>