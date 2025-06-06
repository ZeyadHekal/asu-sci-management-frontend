/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import type { StudentCourseDto } from '../StudentCourseDto.ts'
import type { UpdateEnrollmentDto } from '../UpdateEnrollmentDto.ts'

export type StudentCourseControllerUpdateEnrollmentPathParams = {
  /**
   * @type string
   */
  studentId: string
  /**
   * @type string
   */
  courseId: string
}

/**
 * @description Enrollment updated successfully.
 */
export type StudentCourseControllerUpdateEnrollment200 = StudentCourseDto

/**
 * @description Enrollment not found.
 */
export type StudentCourseControllerUpdateEnrollment404 = unknown

export type StudentCourseControllerUpdateEnrollmentMutationRequest = UpdateEnrollmentDto

export type StudentCourseControllerUpdateEnrollmentMutationResponse = StudentCourseControllerUpdateEnrollment200

export type StudentCourseControllerUpdateEnrollmentMutation = {
  Response: StudentCourseControllerUpdateEnrollment200
  Request: StudentCourseControllerUpdateEnrollmentMutationRequest
  PathParams: StudentCourseControllerUpdateEnrollmentPathParams
  Errors: StudentCourseControllerUpdateEnrollment404
}