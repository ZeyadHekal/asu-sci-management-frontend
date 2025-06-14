/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import { deviceReportDtoSchema } from '../deviceReportDtoSchema.ts'
import { z } from 'zod'

export const deviceReportControllerRejectReportPathParamsSchema = z.object({
  reportId: z.string().describe('Device Report ID'),
})

export type DeviceReportControllerRejectReportPathParamsSchema = z.infer<typeof deviceReportControllerRejectReportPathParamsSchema>

/**
 * @description Device report rejected successfully
 */
export const deviceReportControllerRejectReport200Schema = z.lazy(() => deviceReportDtoSchema)

export type DeviceReportControllerRejectReport200Schema = z.infer<typeof deviceReportControllerRejectReport200Schema>

/**
 * @description Bad Request - Invalid data
 */
export const deviceReportControllerRejectReport400Schema = z.unknown()

export type DeviceReportControllerRejectReport400Schema = z.infer<typeof deviceReportControllerRejectReport400Schema>

/**
 * @description Unauthorized
 */
export const deviceReportControllerRejectReport401Schema = z.unknown()

export type DeviceReportControllerRejectReport401Schema = z.infer<typeof deviceReportControllerRejectReport401Schema>

/**
 * @description Forbidden - Insufficient privileges
 */
export const deviceReportControllerRejectReport403Schema = z.unknown()

export type DeviceReportControllerRejectReport403Schema = z.infer<typeof deviceReportControllerRejectReport403Schema>

/**
 * @description Not Found - Device report does not exist
 */
export const deviceReportControllerRejectReport404Schema = z.unknown()

export type DeviceReportControllerRejectReport404Schema = z.infer<typeof deviceReportControllerRejectReport404Schema>

export const deviceReportControllerRejectReportMutationResponseSchema = z.lazy(() => deviceReportControllerRejectReport200Schema)

export type DeviceReportControllerRejectReportMutationResponseSchema = z.infer<typeof deviceReportControllerRejectReportMutationResponseSchema>