/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import type { LabSessionDto } from '../LabSessionDto.ts'

export type LabSessionControllerGetByIdPathParams = {
  /**
   * @description Lab Session ID
   * @type string
   */
  lab_session_id: string
}

/**
 * @description Lab session retrieved successfully
 */
export type LabSessionControllerGetById200 = LabSessionDto

/**
 * @description Unauthorized
 */
export type LabSessionControllerGetById401 = unknown

/**
 * @description Forbidden - Insufficient privileges
 */
export type LabSessionControllerGetById403 = unknown

/**
 * @description Not Found - Lab session does not exist
 */
export type LabSessionControllerGetById404 = unknown

export type LabSessionControllerGetByIdQueryResponse = LabSessionControllerGetById200

export type LabSessionControllerGetByIdQuery = {
  Response: LabSessionControllerGetById200
  PathParams: LabSessionControllerGetByIdPathParams
  Errors: LabSessionControllerGetById401 | LabSessionControllerGetById403 | LabSessionControllerGetById404
}