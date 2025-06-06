/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

export type CreateStudentDto = {
  /**
   * @type string
   */
  name: string
  /**
   * @description Username has to be 4 letters or more
   * @type string
   */
  username: string
  /**
   * @type string
   */
  password: string
  /**
   * @type number
   */
  seatNo: number
  /**
   * @type number
   */
  level: number
  /**
   * @type string
   */
  program: string
  /**
   * @description Student photo
   * @type string, binary
   */
  photo: Blob
}