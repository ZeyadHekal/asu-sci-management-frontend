/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import { courseDetailDtoSchema } from '../courseDetailDtoSchema.ts'
import { createCourseDtoSchema } from '../createCourseDtoSchema.ts'
import { z } from 'zod'

/**
 * @description Course created successfully
 */
export const courseControllerCreate201Schema = z.lazy(() => courseDetailDtoSchema)

export type CourseControllerCreate201Schema = z.infer<typeof courseControllerCreate201Schema>

/**
 * @description Bad Request - Invalid data
 */
export const courseControllerCreate400Schema = z.unknown()

export type CourseControllerCreate400Schema = z.infer<typeof courseControllerCreate400Schema>

/**
 * @description Unauthorized
 */
export const courseControllerCreate401Schema = z.unknown()

export type CourseControllerCreate401Schema = z.infer<typeof courseControllerCreate401Schema>

/**
 * @description Forbidden - Insufficient privileges
 */
export const courseControllerCreate403Schema = z.unknown()

export type CourseControllerCreate403Schema = z.infer<typeof courseControllerCreate403Schema>

export const courseControllerCreateMutationRequestSchema = z.lazy(() => createCourseDtoSchema)

export type CourseControllerCreateMutationRequestSchema = z.infer<typeof courseControllerCreateMutationRequestSchema>

export const courseControllerCreateMutationResponseSchema = z.lazy(() => courseControllerCreate201Schema)

export type CourseControllerCreateMutationResponseSchema = z.infer<typeof courseControllerCreateMutationResponseSchema>