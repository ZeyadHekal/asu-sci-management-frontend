/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

export type CreateCourseGroupDto = {
  /**
   * @type string
   */
  courseId: string
  /**
   * @type number
   */
  order: number
  /**
   * @description Lab ID - can be null if no lab assigned
   * @type string | undefined
   */
  labId?: string | undefined
  /**
   * @type boolean | undefined
   */
  isDefault?: boolean | undefined
  /**
   * @type number | undefined
   */
  capacity?: number | undefined
}