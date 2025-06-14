/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

export const deviceReportControllerGetMyAssignedReportsQueryParamsSortOrderEnum = {
  asc: 'asc',
  desc: 'desc',
} as const

export type DeviceReportControllerGetMyAssignedReportsQueryParamsSortOrderEnum =
  (typeof deviceReportControllerGetMyAssignedReportsQueryParamsSortOrderEnum)[keyof typeof deviceReportControllerGetMyAssignedReportsQueryParamsSortOrderEnum]

export const deviceReportControllerGetMyAssignedReportsQueryParamsStatusEnum = {
  PENDING_REVIEW: 'PENDING_REVIEW',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  REJECTED: 'REJECTED',
} as const

export type DeviceReportControllerGetMyAssignedReportsQueryParamsStatusEnum =
  (typeof deviceReportControllerGetMyAssignedReportsQueryParamsStatusEnum)[keyof typeof deviceReportControllerGetMyAssignedReportsQueryParamsStatusEnum]

export type DeviceReportControllerGetMyAssignedReportsQueryParams = {
  /**
   * @default 10
   * @type number | undefined
   */
  limit?: number | undefined
  /**
   * @default 0
   * @type number | undefined
   */
  page?: number | undefined
  /**
   * @default "created_at"
   * @type string | undefined
   */
  sortBy?: string | undefined
  /**
   * @default "desc"
   * @type string | undefined
   */
  sortOrder?: DeviceReportControllerGetMyAssignedReportsQueryParamsSortOrderEnum | undefined
  /**
   * @type array | undefined
   */
  ids?: string[] | undefined
  /**
   * @description Filter by device ID
   * @type string | undefined
   */
  deviceId?: string | undefined
  /**
   * @description Filter by lab ID
   * @type string | undefined
   */
  labId?: string | undefined
  /**
   * @description Filter by reporter ID
   * @type string | undefined
   */
  reporterId?: string | undefined
  /**
   * @description Filter by status
   * @type string | undefined
   */
  status?: DeviceReportControllerGetMyAssignedReportsQueryParamsStatusEnum | undefined
  /**
   * @description Filter by software ID
   * @type string | undefined
   */
  appId?: string | undefined
  /**
   * @description Search across device names, descriptions, and reporter names
   * @type string | undefined
   */
  search?: string | undefined
  /**
   * @description Filter by date from (YYYY-MM-DD)
   * @type string | undefined
   */
  dateFrom?: string | undefined
  /**
   * @description Filter by date to (YYYY-MM-DD)
   * @type string | undefined
   */
  dateTo?: string | undefined
}

/**
 * @description My assigned reports retrieved successfully
 */
export type DeviceReportControllerGetMyAssignedReports200 = unknown

/**
 * @description Unauthorized
 */
export type DeviceReportControllerGetMyAssignedReports401 = unknown

/**
 * @description Forbidden - Insufficient privileges
 */
export type DeviceReportControllerGetMyAssignedReports403 = unknown

export type DeviceReportControllerGetMyAssignedReportsQueryResponse = DeviceReportControllerGetMyAssignedReports200

export type DeviceReportControllerGetMyAssignedReportsQuery = {
  Response: DeviceReportControllerGetMyAssignedReports200
  QueryParams: DeviceReportControllerGetMyAssignedReportsQueryParams
  Errors: DeviceReportControllerGetMyAssignedReports401 | DeviceReportControllerGetMyAssignedReports403
}