/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

export const deviceReportControllerExportReportsXlsxQueryParamsSortOrderEnum = {
  asc: 'asc',
  desc: 'desc',
} as const

export type DeviceReportControllerExportReportsXlsxQueryParamsSortOrderEnum =
  (typeof deviceReportControllerExportReportsXlsxQueryParamsSortOrderEnum)[keyof typeof deviceReportControllerExportReportsXlsxQueryParamsSortOrderEnum]

export const deviceReportControllerExportReportsXlsxQueryParamsStatusEnum = {
  PENDING_REVIEW: 'PENDING_REVIEW',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  REJECTED: 'REJECTED',
} as const

export type DeviceReportControllerExportReportsXlsxQueryParamsStatusEnum =
  (typeof deviceReportControllerExportReportsXlsxQueryParamsStatusEnum)[keyof typeof deviceReportControllerExportReportsXlsxQueryParamsStatusEnum]

export type DeviceReportControllerExportReportsXlsxQueryParams = {
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
  sortOrder?: DeviceReportControllerExportReportsXlsxQueryParamsSortOrderEnum | undefined
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
  status?: DeviceReportControllerExportReportsXlsxQueryParamsStatusEnum | undefined
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
 * @description Excel export successful
 */
export type DeviceReportControllerExportReportsXlsx200 = unknown

/**
 * @description Unauthorized
 */
export type DeviceReportControllerExportReportsXlsx401 = unknown

/**
 * @description Forbidden - Insufficient privileges
 */
export type DeviceReportControllerExportReportsXlsx403 = unknown

export type DeviceReportControllerExportReportsXlsxQueryResponse = DeviceReportControllerExportReportsXlsx200

export type DeviceReportControllerExportReportsXlsxQuery = {
  Response: DeviceReportControllerExportReportsXlsx200
  QueryParams: DeviceReportControllerExportReportsXlsxQueryParams
  Errors: DeviceReportControllerExportReportsXlsx401 | DeviceReportControllerExportReportsXlsx403
}