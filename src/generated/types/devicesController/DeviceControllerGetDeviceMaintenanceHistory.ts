/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

export type DeviceControllerGetDeviceMaintenanceHistoryPathParams = {
  /**
   * @description Device ID
   * @type string
   */
  device_id: string
}

/**
 * @description Device maintenance history retrieved successfully
 */
export type DeviceControllerGetDeviceMaintenanceHistory200 = unknown

/**
 * @description Unauthorized
 */
export type DeviceControllerGetDeviceMaintenanceHistory401 = unknown

/**
 * @description Forbidden - Insufficient privileges
 */
export type DeviceControllerGetDeviceMaintenanceHistory403 = unknown

/**
 * @description Not Found - Device does not exist
 */
export type DeviceControllerGetDeviceMaintenanceHistory404 = unknown

export type DeviceControllerGetDeviceMaintenanceHistoryQueryResponse = DeviceControllerGetDeviceMaintenanceHistory200

export type DeviceControllerGetDeviceMaintenanceHistoryQuery = {
  Response: DeviceControllerGetDeviceMaintenanceHistory200
  PathParams: DeviceControllerGetDeviceMaintenanceHistoryPathParams
  Errors: DeviceControllerGetDeviceMaintenanceHistory401 | DeviceControllerGetDeviceMaintenanceHistory403 | DeviceControllerGetDeviceMaintenanceHistory404
}