/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import { createDeviceReportDtoSchema } from '../createDeviceReportDtoSchema.ts'
import { deviceReportDtoSchema } from '../deviceReportDtoSchema.ts'
import { z } from 'zod'

/**
 * @description Device report created successfully
 */
export const deviceReportControllerCreate201Schema = z.lazy(() => deviceReportDtoSchema)

export type DeviceReportControllerCreate201Schema = z.infer<typeof deviceReportControllerCreate201Schema>

/**
 * @description Bad Request - Invalid data
 */
export const deviceReportControllerCreate400Schema = z.unknown()

export type DeviceReportControllerCreate400Schema = z.infer<typeof deviceReportControllerCreate400Schema>

/**
 * @description Unauthorized
 */
export const deviceReportControllerCreate401Schema = z.unknown()

export type DeviceReportControllerCreate401Schema = z.infer<typeof deviceReportControllerCreate401Schema>

/**
 * @description Forbidden - Insufficient privileges
 */
export const deviceReportControllerCreate403Schema = z.unknown()

export type DeviceReportControllerCreate403Schema = z.infer<typeof deviceReportControllerCreate403Schema>

export const deviceReportControllerCreateMutationRequestSchema = z.lazy(() => createDeviceReportDtoSchema)

export type DeviceReportControllerCreateMutationRequestSchema = z.infer<typeof deviceReportControllerCreateMutationRequestSchema>

export const deviceReportControllerCreateMutationResponseSchema = z.lazy(() => deviceReportControllerCreate201Schema)

export type DeviceReportControllerCreateMutationResponseSchema = z.infer<typeof deviceReportControllerCreateMutationResponseSchema>