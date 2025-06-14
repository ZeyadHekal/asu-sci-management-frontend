/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

export type CourseGroupControllerCalculateLabCapacityForCoursePathParams = {
  /**
   * @type string
   */
  labId: string
  /**
   * @type string
   */
  courseId: string
}

/**
 * @description Return lab capacity for the course.
 */
export type CourseGroupControllerCalculateLabCapacityForCourse200 = unknown

export type CourseGroupControllerCalculateLabCapacityForCourseQueryResponse = CourseGroupControllerCalculateLabCapacityForCourse200

export type CourseGroupControllerCalculateLabCapacityForCourseQuery = {
  Response: CourseGroupControllerCalculateLabCapacityForCourse200
  PathParams: CourseGroupControllerCalculateLabCapacityForCoursePathParams
  Errors: any
}