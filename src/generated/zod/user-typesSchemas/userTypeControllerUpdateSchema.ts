/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import { updateUserTypeDtoSchema } from '../updateUserTypeDtoSchema.ts'
import { userTypeDtoSchema } from '../userTypeDtoSchema.ts'
import { z } from 'zod'

export const userTypeControllerUpdatePathParamsSchema = z.object({
  id: z.string().describe('User Type ID'),
})

export type UserTypeControllerUpdatePathParamsSchema = z.infer<typeof userTypeControllerUpdatePathParamsSchema>

/**
 * @description User type updated successfully
 */
export const userTypeControllerUpdate200Schema = z.lazy(() => userTypeDtoSchema)

export type UserTypeControllerUpdate200Schema = z.infer<typeof userTypeControllerUpdate200Schema>

/**
 * @description Bad Request - Invalid data
 */
export const userTypeControllerUpdate400Schema = z.unknown()

export type UserTypeControllerUpdate400Schema = z.infer<typeof userTypeControllerUpdate400Schema>

/**
 * @description Unauthorized
 */
export const userTypeControllerUpdate401Schema = z.unknown()

export type UserTypeControllerUpdate401Schema = z.infer<typeof userTypeControllerUpdate401Schema>

/**
 * @description Forbidden - Insufficient privileges
 */
export const userTypeControllerUpdate403Schema = z.unknown()

export type UserTypeControllerUpdate403Schema = z.infer<typeof userTypeControllerUpdate403Schema>

/**
 * @description Not Found - User type does not exist
 */
export const userTypeControllerUpdate404Schema = z.unknown()

export type UserTypeControllerUpdate404Schema = z.infer<typeof userTypeControllerUpdate404Schema>

export const userTypeControllerUpdateMutationRequestSchema = z.lazy(() => updateUserTypeDtoSchema)

export type UserTypeControllerUpdateMutationRequestSchema = z.infer<typeof userTypeControllerUpdateMutationRequestSchema>

export const userTypeControllerUpdateMutationResponseSchema = z.lazy(() => userTypeControllerUpdate200Schema)

export type UserTypeControllerUpdateMutationResponseSchema = z.infer<typeof userTypeControllerUpdateMutationResponseSchema>