/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

export type SessionStudentDto = {
  /**
   * @description Student ID
   * @type string
   */
  studentId: string
  /**
   * @description Student name
   * @type string
   */
  studentName: string
  /**
   * @description Student username
   * @type string
   */
  username: string
  /**
   * @description Student email
   * @type string
   */
  email: string
  /**
   * @description Whether student is currently present
   * @type boolean
   */
  isPresent: boolean
  /**
   * @description Device assigned to student (if any)
   * @type object
   */
  assignedDevice: object
  /**
   * @description Session attendance points
   * @type number
   */
  attendancePoints: number
  /**
   * @description Extra points awarded
   * @type number
   */
  extraPoints: number
}