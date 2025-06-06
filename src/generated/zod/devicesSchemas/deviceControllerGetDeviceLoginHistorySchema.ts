/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import { z } from 'zod'

export const deviceControllerGetDeviceLoginHistoryPathParamsSchema = z.object({
  device_id: z.string().describe('Device ID'),
})

export type DeviceControllerGetDeviceLoginHistoryPathParamsSchema = z.infer<typeof deviceControllerGetDeviceLoginHistoryPathParamsSchema>

/**
 * @description Device login history retrieved successfully
 */
export const deviceControllerGetDeviceLoginHistory200Schema = z.unknown()

export type DeviceControllerGetDeviceLoginHistory200Schema = z.infer<typeof deviceControllerGetDeviceLoginHistory200Schema>

/**
 * @description Unauthorized
 */
export const deviceControllerGetDeviceLoginHistory401Schema = z.unknown()

export type DeviceControllerGetDeviceLoginHistory401Schema = z.infer<typeof deviceControllerGetDeviceLoginHistory401Schema>

/**
 * @description Forbidden - Insufficient privileges
 */
export const deviceControllerGetDeviceLoginHistory403Schema = z.unknown()

export type DeviceControllerGetDeviceLoginHistory403Schema = z.infer<typeof deviceControllerGetDeviceLoginHistory403Schema>

/**
 * @description Not Found - Device does not exist
 */
export const deviceControllerGetDeviceLoginHistory404Schema = z.unknown()

export type DeviceControllerGetDeviceLoginHistory404Schema = z.infer<typeof deviceControllerGetDeviceLoginHistory404Schema>

export const deviceControllerGetDeviceLoginHistoryQueryResponseSchema = z.lazy(() => deviceControllerGetDeviceLoginHistory200Schema)

export type DeviceControllerGetDeviceLoginHistoryQueryResponseSchema = z.infer<typeof deviceControllerGetDeviceLoginHistoryQueryResponseSchema>