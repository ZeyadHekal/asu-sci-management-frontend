/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

/**
 * @description Total unresolved reports count retrieved successfully
 */
export type DeviceReportControllerGetTotalUnresolvedReportsCount200 = unknown

/**
 * @description Unauthorized
 */
export type DeviceReportControllerGetTotalUnresolvedReportsCount401 = unknown

/**
 * @description Forbidden - Insufficient privileges
 */
export type DeviceReportControllerGetTotalUnresolvedReportsCount403 = unknown

export type DeviceReportControllerGetTotalUnresolvedReportsCountQueryResponse = DeviceReportControllerGetTotalUnresolvedReportsCount200

export type DeviceReportControllerGetTotalUnresolvedReportsCountQuery = {
  Response: DeviceReportControllerGetTotalUnresolvedReportsCount200
  Errors: DeviceReportControllerGetTotalUnresolvedReportsCount401 | DeviceReportControllerGetTotalUnresolvedReportsCount403
}