/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import type { LabListDto } from '../LabListDto.ts'

/**
 * @description Labs retrieved successfully
 */
export type LabControllerGetAll200 = LabListDto

/**
 * @description Unauthorized
 */
export type LabControllerGetAll401 = unknown

/**
 * @description Forbidden - Insufficient privileges
 */
export type LabControllerGetAll403 = unknown

export type LabControllerGetAllQueryResponse = LabControllerGetAll200

export type LabControllerGetAllQuery = {
  Response: LabControllerGetAll200
  Errors: LabControllerGetAll401 | LabControllerGetAll403
}