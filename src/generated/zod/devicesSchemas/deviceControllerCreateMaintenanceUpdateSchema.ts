/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import { maintenanceUpdateDtoSchema } from '../maintenanceUpdateDtoSchema.ts'
import { z } from 'zod'

export const deviceControllerCreateMaintenanceUpdatePathParamsSchema = z.object({
  device_id: z.string().describe('Device ID'),
})

export type DeviceControllerCreateMaintenanceUpdatePathParamsSchema = z.infer<typeof deviceControllerCreateMaintenanceUpdatePathParamsSchema>

/**
 * @description Maintenance update created successfully
 */
export const deviceControllerCreateMaintenanceUpdate201Schema = z.unknown()

export type DeviceControllerCreateMaintenanceUpdate201Schema = z.infer<typeof deviceControllerCreateMaintenanceUpdate201Schema>

/**
 * @description Bad Request - Invalid data
 */
export const deviceControllerCreateMaintenanceUpdate400Schema = z.unknown()

export type DeviceControllerCreateMaintenanceUpdate400Schema = z.infer<typeof deviceControllerCreateMaintenanceUpdate400Schema>

/**
 * @description Unauthorized
 */
export const deviceControllerCreateMaintenanceUpdate401Schema = z.unknown()

export type DeviceControllerCreateMaintenanceUpdate401Schema = z.infer<typeof deviceControllerCreateMaintenanceUpdate401Schema>

/**
 * @description Forbidden - Insufficient privileges
 */
export const deviceControllerCreateMaintenanceUpdate403Schema = z.unknown()

export type DeviceControllerCreateMaintenanceUpdate403Schema = z.infer<typeof deviceControllerCreateMaintenanceUpdate403Schema>

/**
 * @description Not Found - Device does not exist
 */
export const deviceControllerCreateMaintenanceUpdate404Schema = z.unknown()

export type DeviceControllerCreateMaintenanceUpdate404Schema = z.infer<typeof deviceControllerCreateMaintenanceUpdate404Schema>

export const deviceControllerCreateMaintenanceUpdateMutationRequestSchema = z.lazy(() => maintenanceUpdateDtoSchema)

export type DeviceControllerCreateMaintenanceUpdateMutationRequestSchema = z.infer<typeof deviceControllerCreateMaintenanceUpdateMutationRequestSchema>

export const deviceControllerCreateMaintenanceUpdateMutationResponseSchema = z.lazy(() => deviceControllerCreateMaintenanceUpdate201Schema)

export type DeviceControllerCreateMaintenanceUpdateMutationResponseSchema = z.infer<typeof deviceControllerCreateMaintenanceUpdateMutationResponseSchema>