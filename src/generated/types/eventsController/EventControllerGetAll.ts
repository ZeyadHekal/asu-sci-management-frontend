/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import type { EventListDto } from '../EventListDto.ts'

/**
 * @description Events retrieved successfully
 */
export type EventControllerGetAll200 = EventListDto

/**
 * @description Unauthorized
 */
export type EventControllerGetAll401 = unknown

/**
 * @description Forbidden - Insufficient privileges
 */
export type EventControllerGetAll403 = unknown

export type EventControllerGetAllQueryResponse = EventControllerGetAll200

export type EventControllerGetAllQuery = {
  Response: EventControllerGetAll200
  Errors: EventControllerGetAll401 | EventControllerGetAll403
}