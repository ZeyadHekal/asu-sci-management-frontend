/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

export const updateUserPrivilegesDtoPrivilegesEnum = {
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

export type UpdateUserPrivilegesDtoPrivilegesEnum = (typeof updateUserPrivilegesDtoPrivilegesEnum)[keyof typeof updateUserPrivilegesDtoPrivilegesEnum]

export type UpdateUserPrivilegesDto = {
  /**
   * @description Array of privilege codes to assign to the user
   * @type array
   */
  privileges: UpdateUserPrivilegesDtoPrivilegesEnum[]
}