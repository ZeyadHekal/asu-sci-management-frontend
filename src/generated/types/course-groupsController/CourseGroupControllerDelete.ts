/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import type { DeleteDto } from '../DeleteDto.ts'

export type CourseGroupControllerDeletePathParams = {
  /**
   * @type string
   */
  id: string
}

/**
 * @description Course group deleted successfully.
 */
export type CourseGroupControllerDelete200 = DeleteDto

/**
 * @description Course group not found.
 */
export type CourseGroupControllerDelete404 = unknown

export type CourseGroupControllerDeleteMutationResponse = CourseGroupControllerDelete200

export type CourseGroupControllerDeleteMutation = {
  Response: CourseGroupControllerDelete200
  PathParams: CourseGroupControllerDeletePathParams
  Errors: CourseGroupControllerDelete404
}