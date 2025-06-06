/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

export type StudentCourseControllerRemoveStudentFromCoursePathParams = {
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
 * @description Student successfully removed from course.
 */
export type StudentCourseControllerRemoveStudentFromCourse200 = unknown

/**
 * @description Enrollment not found.
 */
export type StudentCourseControllerRemoveStudentFromCourse404 = unknown

export type StudentCourseControllerRemoveStudentFromCourseMutationResponse = StudentCourseControllerRemoveStudentFromCourse200

export type StudentCourseControllerRemoveStudentFromCourseMutation = {
  Response: StudentCourseControllerRemoveStudentFromCourse200
  PathParams: StudentCourseControllerRemoveStudentFromCoursePathParams
  Errors: StudentCourseControllerRemoveStudentFromCourse404
}