/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import type { CourseDto } from '../CourseDto.ts'

export type CourseControllerGetByIdPathParams = {
  /**
   * @description Course ID
   * @type string
   */
  course_id: string
}

/**
 * @description Course retrieved successfully
 */
export type CourseControllerGetById200 = CourseDto

/**
 * @description Unauthorized
 */
export type CourseControllerGetById401 = unknown

/**
 * @description Forbidden - Insufficient privileges
 */
export type CourseControllerGetById403 = unknown

/**
 * @description Not Found - Course does not exist
 */
export type CourseControllerGetById404 = unknown

export type CourseControllerGetByIdQueryResponse = CourseControllerGetById200

export type CourseControllerGetByIdQuery = {
  Response: CourseControllerGetById200
  PathParams: CourseControllerGetByIdPathParams
  Errors: CourseControllerGetById401 | CourseControllerGetById403 | CourseControllerGetById404
}