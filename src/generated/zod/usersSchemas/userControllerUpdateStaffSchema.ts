/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import { staffDtoSchema } from '../staffDtoSchema.ts'
import { updateStaffDtoSchema } from '../updateStaffDtoSchema.ts'
import { z } from 'zod'

export const userControllerUpdateStaffPathParamsSchema = z.object({
  id: z.string().describe('Staff ID'),
})

export type UserControllerUpdateStaffPathParamsSchema = z.infer<typeof userControllerUpdateStaffPathParamsSchema>

/**
 * @description Staff updated successfully
 */
export const userControllerUpdateStaff200Schema = z.lazy(() => staffDtoSchema)

export type UserControllerUpdateStaff200Schema = z.infer<typeof userControllerUpdateStaff200Schema>

/**
 * @description Bad Request - Invalid data or username already in use
 */
export const userControllerUpdateStaff400Schema = z.unknown()

export type UserControllerUpdateStaff400Schema = z.infer<typeof userControllerUpdateStaff400Schema>

/**
 * @description Unauthorized
 */
export const userControllerUpdateStaff401Schema = z.unknown()

export type UserControllerUpdateStaff401Schema = z.infer<typeof userControllerUpdateStaff401Schema>

/**
 * @description Forbidden - Insufficient privileges
 */
export const userControllerUpdateStaff403Schema = z.unknown()

export type UserControllerUpdateStaff403Schema = z.infer<typeof userControllerUpdateStaff403Schema>

/**
 * @description Not Found - Staff does not exist
 */
export const userControllerUpdateStaff404Schema = z.unknown()

export type UserControllerUpdateStaff404Schema = z.infer<typeof userControllerUpdateStaff404Schema>

export const userControllerUpdateStaffMutationRequestSchema = z.lazy(() => updateStaffDtoSchema)

export type UserControllerUpdateStaffMutationRequestSchema = z.infer<typeof userControllerUpdateStaffMutationRequestSchema>

export const userControllerUpdateStaffMutationResponseSchema = z.lazy(() => userControllerUpdateStaff200Schema)

export type UserControllerUpdateStaffMutationResponseSchema = z.infer<typeof userControllerUpdateStaffMutationResponseSchema>