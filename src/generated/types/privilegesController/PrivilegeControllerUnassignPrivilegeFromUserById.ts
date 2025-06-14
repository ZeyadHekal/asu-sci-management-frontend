/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

export const privilegeControllerUnassignPrivilegeFromUserByIdPathParamsPrivilegeCodeEnum = {
  MANAGE_SYSTEM: 'MANAGE_SYSTEM',
  MANAGE_STUDENTS: 'MANAGE_STUDENTS',
  MANAGE_LABS: 'MANAGE_LABS',
  LAB_ASSISTANT: 'LAB_ASSISTANT',
  STUDY_COURSE: 'STUDY_COURSE',
  TEACH_COURSE: 'TEACH_COURSE',
  ASSIST_IN_COURSE: 'ASSIST_IN_COURSE',
  LAB_MAINTENANCE: 'LAB_MAINTENANCE',
  REPORT_DEVICE: 'REPORT_DEVICE',
  MANAGE_COURSES: 'MANAGE_COURSES',
} as const

export type PrivilegeControllerUnassignPrivilegeFromUserByIdPathParamsPrivilegeCodeEnum =
  (typeof privilegeControllerUnassignPrivilegeFromUserByIdPathParamsPrivilegeCodeEnum)[keyof typeof privilegeControllerUnassignPrivilegeFromUserByIdPathParamsPrivilegeCodeEnum]

export type PrivilegeControllerUnassignPrivilegeFromUserByIdPathParams = {
  /**
   * @description User ID
   * @type string
   */
  userId: string
  /**
   * @description Privilege code to unassign
   * @type string
   */
  privilegeCode: PrivilegeControllerUnassignPrivilegeFromUserByIdPathParamsPrivilegeCodeEnum
}

export type PrivilegeControllerUnassignPrivilegeFromUserById200 = unknown

export type PrivilegeControllerUnassignPrivilegeFromUserByIdMutationResponse = PrivilegeControllerUnassignPrivilegeFromUserById200

export type PrivilegeControllerUnassignPrivilegeFromUserByIdMutation = {
  Response: PrivilegeControllerUnassignPrivilegeFromUserById200
  PathParams: PrivilegeControllerUnassignPrivilegeFromUserByIdPathParams
  Errors: any
}