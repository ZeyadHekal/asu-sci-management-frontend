/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import type { RejectStaffRequestDto } from '../RejectStaffRequestDto.ts'
import type { StaffRequestDto } from '../StaffRequestDto.ts'

export type StaffRequestControllerRejectPathParams = {
  /**
   * @type string
   */
  id: string
}

/**
 * @description Staff request rejected successfully
 */
export type StaffRequestControllerReject200 = StaffRequestDto

/**
 * @description Bad Request - Request is not pending or no reason provided
 */
export type StaffRequestControllerReject400 = unknown

/**
 * @description Unauthorized
 */
export type StaffRequestControllerReject401 = unknown

/**
 * @description Forbidden - Insufficient privileges
 */
export type StaffRequestControllerReject403 = unknown

/**
 * @description Not Found - Staff request does not exist
 */
export type StaffRequestControllerReject404 = unknown

export type StaffRequestControllerRejectMutationRequest = RejectStaffRequestDto

export type StaffRequestControllerRejectMutationResponse = StaffRequestControllerReject200

export type StaffRequestControllerRejectMutation = {
  Response: StaffRequestControllerReject200
  Request: StaffRequestControllerRejectMutationRequest
  PathParams: StaffRequestControllerRejectPathParams
  Errors: StaffRequestControllerReject400 | StaffRequestControllerReject401 | StaffRequestControllerReject403 | StaffRequestControllerReject404
}