/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import { deleteDtoSchema } from '../deleteDtoSchema.ts'
import { z } from 'zod'

export const userTypeControllerDeletePathParamsSchema = z.object({
  ids: z.string().describe('Comma-separated user type IDs'),
})

export type UserTypeControllerDeletePathParamsSchema = z.infer<typeof userTypeControllerDeletePathParamsSchema>

/**
 * @description User types deleted successfully
 */
export const userTypeControllerDelete200Schema = z.lazy(() => deleteDtoSchema)

export type UserTypeControllerDelete200Schema = z.infer<typeof userTypeControllerDelete200Schema>

/**
 * @description Bad Request - Cannot delete non-deletable user types
 */
export const userTypeControllerDelete400Schema = z.unknown()

export type UserTypeControllerDelete400Schema = z.infer<typeof userTypeControllerDelete400Schema>

/**
 * @description Unauthorized
 */
export const userTypeControllerDelete401Schema = z.unknown()

export type UserTypeControllerDelete401Schema = z.infer<typeof userTypeControllerDelete401Schema>

/**
 * @description Forbidden - Insufficient privileges
 */
export const userTypeControllerDelete403Schema = z.unknown()

export type UserTypeControllerDelete403Schema = z.infer<typeof userTypeControllerDelete403Schema>

/**
 * @description Not Found - One or more user types do not exist
 */
export const userTypeControllerDelete404Schema = z.unknown()

export type UserTypeControllerDelete404Schema = z.infer<typeof userTypeControllerDelete404Schema>

export const userTypeControllerDeleteMutationResponseSchema = z.lazy(() => userTypeControllerDelete200Schema)

export type UserTypeControllerDeleteMutationResponseSchema = z.infer<typeof userTypeControllerDeleteMutationResponseSchema>