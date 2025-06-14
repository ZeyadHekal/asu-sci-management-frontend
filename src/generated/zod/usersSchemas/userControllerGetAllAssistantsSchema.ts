/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import { staffDtoSchema } from '../staffDtoSchema.ts'
import { z } from 'zod'

/**
 * @description Lab assistants retrieved successfully
 */
export const userControllerGetAllAssistants200Schema = z.array(z.lazy(() => staffDtoSchema))

export type UserControllerGetAllAssistants200Schema = z.infer<typeof userControllerGetAllAssistants200Schema>

/**
 * @description Unauthorized
 */
export const userControllerGetAllAssistants401Schema = z.unknown()

export type UserControllerGetAllAssistants401Schema = z.infer<typeof userControllerGetAllAssistants401Schema>

/**
 * @description Forbidden - Insufficient privileges
 */
export const userControllerGetAllAssistants403Schema = z.unknown()

export type UserControllerGetAllAssistants403Schema = z.infer<typeof userControllerGetAllAssistants403Schema>

export const userControllerGetAllAssistantsQueryResponseSchema = z.lazy(() => userControllerGetAllAssistants200Schema)

export type UserControllerGetAllAssistantsQueryResponseSchema = z.infer<typeof userControllerGetAllAssistantsQueryResponseSchema>