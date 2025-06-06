/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import type { EventScheduleDto } from '../EventScheduleDto.ts'

export type EventScheduleControllerGetByIdPathParams = {
  /**
   * @description Event Schedule ID
   * @type string
   */
  event_schedule_id: string
}

/**
 * @description Event schedule retrieved successfully
 */
export type EventScheduleControllerGetById200 = EventScheduleDto

/**
 * @description Unauthorized
 */
export type EventScheduleControllerGetById401 = unknown

/**
 * @description Forbidden - Insufficient privileges
 */
export type EventScheduleControllerGetById403 = unknown

/**
 * @description Not Found - Event schedule does not exist
 */
export type EventScheduleControllerGetById404 = unknown

export type EventScheduleControllerGetByIdQueryResponse = EventScheduleControllerGetById200

export type EventScheduleControllerGetByIdQuery = {
  Response: EventScheduleControllerGetById200
  PathParams: EventScheduleControllerGetByIdPathParams
  Errors: EventScheduleControllerGetById401 | EventScheduleControllerGetById403 | EventScheduleControllerGetById404
}