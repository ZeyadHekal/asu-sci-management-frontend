/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import { doctorDtoSchema } from '../doctorDtoSchema.ts'
import { z } from 'zod'

/**
 * @description Doctors retrieved successfully
 */
export const userControllerGetAllDoctors200Schema = z.array(z.lazy(() => doctorDtoSchema))

export type UserControllerGetAllDoctors200Schema = z.infer<typeof userControllerGetAllDoctors200Schema>

/**
 * @description Unauthorized
 */
export const userControllerGetAllDoctors401Schema = z.unknown()

export type UserControllerGetAllDoctors401Schema = z.infer<typeof userControllerGetAllDoctors401Schema>

/**
 * @description Forbidden - Insufficient privileges
 */
export const userControllerGetAllDoctors403Schema = z.unknown()

export type UserControllerGetAllDoctors403Schema = z.infer<typeof userControllerGetAllDoctors403Schema>

export const userControllerGetAllDoctorsQueryResponseSchema = z.lazy(() => userControllerGetAllDoctors200Schema)

export type UserControllerGetAllDoctorsQueryResponseSchema = z.infer<typeof userControllerGetAllDoctorsQueryResponseSchema>