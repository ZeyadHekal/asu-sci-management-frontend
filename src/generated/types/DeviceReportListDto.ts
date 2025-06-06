/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

export const deviceReportListDtoStatusEnum = {
  REPORTED: 'REPORTED',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  CANCELLED: 'CANCELLED',
} as const

export type DeviceReportListDtoStatusEnum = (typeof deviceReportListDtoStatusEnum)[keyof typeof deviceReportListDtoStatusEnum]

export type DeviceReportListDto = {
  /**
   * @description Report description
   * @type string
   */
  description: string
  /**
   * @description Report status
   * @default "REPORTED"
   * @type string
   */
  status: DeviceReportListDtoStatusEnum
  /**
   * @description Fix message
   * @type string | undefined
   */
  fixMessage?: string | undefined
  /**
   * @description Device ID
   * @type string
   */
  deviceId: string
  /**
   * @description Software/App ID
   * @type string
   */
  appId: string
  /**
   * @description Reporter ID
   * @type string | undefined
   */
  reporterId?: string | undefined
  /**
   * @description Report ID
   * @type string
   */
  id: string
  /**
   * @description Created at
   * @type string, date-time
   */
  created_at: Date
  /**
   * @description Updated at
   * @type string, date-time
   */
  updated_at: Date
  /**
   * @description Device name
   * @type string | undefined
   */
  deviceName?: string | undefined
  /**
   * @description Software name
   * @type string | undefined
   */
  softwareName?: string | undefined
  /**
   * @description Reporter name
   * @type string | undefined
   */
  reporterName?: string | undefined
}