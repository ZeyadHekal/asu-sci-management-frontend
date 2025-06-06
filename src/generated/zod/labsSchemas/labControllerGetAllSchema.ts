/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import { labListDtoSchema } from '../labListDtoSchema.ts'
import { z } from 'zod'

/**
 * @description Labs retrieved successfully
 */
export const labControllerGetAll200Schema = z.lazy(() => labListDtoSchema)

export type LabControllerGetAll200Schema = z.infer<typeof labControllerGetAll200Schema>

/**
 * @description Unauthorized
 */
export const labControllerGetAll401Schema = z.unknown()

export type LabControllerGetAll401Schema = z.infer<typeof labControllerGetAll401Schema>

/**
 * @description Forbidden - Insufficient privileges
 */
export const labControllerGetAll403Schema = z.unknown()

export type LabControllerGetAll403Schema = z.infer<typeof labControllerGetAll403Schema>

export const labControllerGetAllQueryResponseSchema = z.lazy(() => labControllerGetAll200Schema)

export type LabControllerGetAllQueryResponseSchema = z.infer<typeof labControllerGetAllQueryResponseSchema>