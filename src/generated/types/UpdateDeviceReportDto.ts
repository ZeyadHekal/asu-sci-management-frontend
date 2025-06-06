/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

export const updateDeviceReportDtoStatusEnum = {
  REPORTED: 'REPORTED',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  CANCELLED: 'CANCELLED',
} as const

export type UpdateDeviceReportDtoStatusEnum = (typeof updateDeviceReportDtoStatusEnum)[keyof typeof updateDeviceReportDtoStatusEnum]

export type UpdateDeviceReportDto = {
  /**
   * @description Report description
   * @type string | undefined
   */
  description?: string | undefined
  /**
   * @description Report status
   * @default "REPORTED"
   * @type string | undefined
   */
  status?: UpdateDeviceReportDtoStatusEnum | undefined
  /**
   * @description Fix message
   * @type string | undefined
   */
  fixMessage?: string | undefined
  /**
   * @description Device ID
   * @type string | undefined
   */
  deviceId?: string | undefined
  /**
   * @description Software/App ID
   * @type string | undefined
   */
  appId?: string | undefined
  /**
   * @description Reporter ID
   * @type string | undefined
   */
  reporterId?: string | undefined
}