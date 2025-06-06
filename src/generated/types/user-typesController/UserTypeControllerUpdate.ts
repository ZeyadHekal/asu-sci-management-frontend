/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import type { UpdateUserTypeDto } from '../UpdateUserTypeDto.ts'
import type { UserTypeDto } from '../UserTypeDto.ts'

export type UserTypeControllerUpdatePathParams = {
  /**
   * @description User Type ID
   * @type string
   */
  id: string
}

/**
 * @description User type updated successfully
 */
export type UserTypeControllerUpdate200 = UserTypeDto

/**
 * @description Bad Request - Invalid data
 */
export type UserTypeControllerUpdate400 = unknown

/**
 * @description Unauthorized
 */
export type UserTypeControllerUpdate401 = unknown

/**
 * @description Forbidden - Insufficient privileges
 */
export type UserTypeControllerUpdate403 = unknown

/**
 * @description Not Found - User type does not exist
 */
export type UserTypeControllerUpdate404 = unknown

export type UserTypeControllerUpdateMutationRequest = UpdateUserTypeDto

export type UserTypeControllerUpdateMutationResponse = UserTypeControllerUpdate200

export type UserTypeControllerUpdateMutation = {
  Response: UserTypeControllerUpdate200
  Request: UserTypeControllerUpdateMutationRequest
  PathParams: UserTypeControllerUpdatePathParams
  Errors: UserTypeControllerUpdate400 | UserTypeControllerUpdate401 | UserTypeControllerUpdate403 | UserTypeControllerUpdate404
}