/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import { deleteDtoSchema } from '../deleteDtoSchema.ts'
import { z } from 'zod'

export const deviceControllerRemoveSoftwarePathParamsSchema = z.object({
  device_id: z.string().describe('Device ID'),
  softwareId: z.string().describe('Software ID'),
})

export type DeviceControllerRemoveSoftwarePathParamsSchema = z.infer<typeof deviceControllerRemoveSoftwarePathParamsSchema>

/**
 * @description Software removed successfully
 */
export const deviceControllerRemoveSoftware200Schema = z.lazy(() => deleteDtoSchema)

export type DeviceControllerRemoveSoftware200Schema = z.infer<typeof deviceControllerRemoveSoftware200Schema>

/**
 * @description Unauthorized
 */
export const deviceControllerRemoveSoftware401Schema = z.unknown()

export type DeviceControllerRemoveSoftware401Schema = z.infer<typeof deviceControllerRemoveSoftware401Schema>

/**
 * @description Forbidden - Insufficient privileges
 */
export const deviceControllerRemoveSoftware403Schema = z.unknown()

export type DeviceControllerRemoveSoftware403Schema = z.infer<typeof deviceControllerRemoveSoftware403Schema>

/**
 * @description Not Found - Device or software does not exist
 */
export const deviceControllerRemoveSoftware404Schema = z.unknown()

export type DeviceControllerRemoveSoftware404Schema = z.infer<typeof deviceControllerRemoveSoftware404Schema>

export const deviceControllerRemoveSoftwareMutationResponseSchema = z.lazy(() => deviceControllerRemoveSoftware200Schema)

export type DeviceControllerRemoveSoftwareMutationResponseSchema = z.infer<typeof deviceControllerRemoveSoftwareMutationResponseSchema>