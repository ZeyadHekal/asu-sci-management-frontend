/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import type { GroupCalculationResultDto } from '../GroupCalculationResultDto.ts'

export type EventControllerCalculateGroupsPathParams = {
  /**
   * @description Event ID
   * @type string
   */
  id: string
}

/**
 * @description Group calculation completed
 */
export type EventControllerCalculateGroups200 = GroupCalculationResultDto

export type EventControllerCalculateGroupsQueryResponse = EventControllerCalculateGroups200

export type EventControllerCalculateGroupsQuery = {
  Response: EventControllerCalculateGroups200
  PathParams: EventControllerCalculateGroupsPathParams
  Errors: any
}