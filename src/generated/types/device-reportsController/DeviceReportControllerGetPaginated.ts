/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

export const deviceReportControllerGetPaginatedQueryParamsSortOrderEnum = {
  asc: 'asc',
  desc: 'desc',
} as const

export type DeviceReportControllerGetPaginatedQueryParamsSortOrderEnum =
  (typeof deviceReportControllerGetPaginatedQueryParamsSortOrderEnum)[keyof typeof deviceReportControllerGetPaginatedQueryParamsSortOrderEnum]

export const deviceReportControllerGetPaginatedQueryParamsStatusEnum = {
  PENDING_REVIEW: 'PENDING_REVIEW',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  REJECTED: 'REJECTED',
} as const

export type DeviceReportControllerGetPaginatedQueryParamsStatusEnum =
  (typeof deviceReportControllerGetPaginatedQueryParamsStatusEnum)[keyof typeof deviceReportControllerGetPaginatedQueryParamsStatusEnum]

export type DeviceReportControllerGetPaginatedQueryParams = {
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
  sortOrder?: DeviceReportControllerGetPaginatedQueryParamsSortOrderEnum | undefined
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
  status?: DeviceReportControllerGetPaginatedQueryParamsStatusEnum | undefined
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
 * @description Paginated device reports retrieved successfully
 */
export type DeviceReportControllerGetPaginated200 = unknown

/**
 * @description Unauthorized
 */
export type DeviceReportControllerGetPaginated401 = unknown

/**
 * @description Forbidden - Insufficient privileges
 */
export type DeviceReportControllerGetPaginated403 = unknown

export type DeviceReportControllerGetPaginatedQueryResponse = DeviceReportControllerGetPaginated200

export type DeviceReportControllerGetPaginatedQuery = {
  Response: DeviceReportControllerGetPaginated200
  QueryParams: DeviceReportControllerGetPaginatedQueryParams
  Errors: DeviceReportControllerGetPaginated401 | DeviceReportControllerGetPaginated403
}