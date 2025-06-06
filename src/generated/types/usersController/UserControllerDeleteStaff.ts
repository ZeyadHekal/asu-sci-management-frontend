/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

export type UserControllerDeleteStaffPathParams = {
  /**
   * @description Staff ID
   * @type string
   */
  id: string
}

/**
 * @description Staff deleted successfully
 */
export type UserControllerDeleteStaff204 = unknown

/**
 * @description Bad Request - User is not a staff member
 */
export type UserControllerDeleteStaff400 = unknown

/**
 * @description Unauthorized
 */
export type UserControllerDeleteStaff401 = unknown

/**
 * @description Forbidden - Insufficient privileges
 */
export type UserControllerDeleteStaff403 = unknown

/**
 * @description Not Found - Staff does not exist
 */
export type UserControllerDeleteStaff404 = unknown

export type UserControllerDeleteStaffMutationResponse = UserControllerDeleteStaff204

export type UserControllerDeleteStaffMutation = {
  Response: UserControllerDeleteStaff204
  PathParams: UserControllerDeleteStaffPathParams
  Errors: UserControllerDeleteStaff400 | UserControllerDeleteStaff401 | UserControllerDeleteStaff403 | UserControllerDeleteStaff404
}