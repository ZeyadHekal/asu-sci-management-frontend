/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import { createStaffDtoSchema } from '../createStaffDtoSchema.ts'
import { staffDtoSchema } from '../staffDtoSchema.ts'
import { z } from 'zod'

export const userControllerCreateStaffPathParamsSchema = z.object({
  userTypeId: z.string().describe('User Type ID'),
})

export type UserControllerCreateStaffPathParamsSchema = z.infer<typeof userControllerCreateStaffPathParamsSchema>

/**
 * @description Staff created successfully
 */
export const userControllerCreateStaff201Schema = z.lazy(() => staffDtoSchema)

export type UserControllerCreateStaff201Schema = z.infer<typeof userControllerCreateStaff201Schema>

/**
 * @description Bad Request - Invalid data
 */
export const userControllerCreateStaff400Schema = z.unknown()

export type UserControllerCreateStaff400Schema = z.infer<typeof userControllerCreateStaff400Schema>

/**
 * @description Unauthorized
 */
export const userControllerCreateStaff401Schema = z.unknown()

export type UserControllerCreateStaff401Schema = z.infer<typeof userControllerCreateStaff401Schema>

/**
 * @description Forbidden - Insufficient privileges
 */
export const userControllerCreateStaff403Schema = z.unknown()

export type UserControllerCreateStaff403Schema = z.infer<typeof userControllerCreateStaff403Schema>

export const userControllerCreateStaffMutationRequestSchema = z.lazy(() => createStaffDtoSchema)

export type UserControllerCreateStaffMutationRequestSchema = z.infer<typeof userControllerCreateStaffMutationRequestSchema>

export const userControllerCreateStaffMutationResponseSchema = z.lazy(() => userControllerCreateStaff201Schema)

export type UserControllerCreateStaffMutationResponseSchema = z.infer<typeof userControllerCreateStaffMutationResponseSchema>