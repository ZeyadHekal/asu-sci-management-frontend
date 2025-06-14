/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import { availableCourseDtoSchema } from '../availableCourseDtoSchema.ts'
import { z } from 'zod'

/**
 * @description Return available courses.
 */
export const studentCourseControllerGetAvailableCourses200Schema = z.array(z.lazy(() => availableCourseDtoSchema))

export type StudentCourseControllerGetAvailableCourses200Schema = z.infer<typeof studentCourseControllerGetAvailableCourses200Schema>

export const studentCourseControllerGetAvailableCoursesQueryResponseSchema = z.lazy(() => studentCourseControllerGetAvailableCourses200Schema)

export type StudentCourseControllerGetAvailableCoursesQueryResponseSchema = z.infer<typeof studentCourseControllerGetAvailableCoursesQueryResponseSchema>