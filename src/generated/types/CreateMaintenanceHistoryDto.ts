/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

export const createMaintenanceHistoryDtoMaintenanceTypeEnum = {
  HARDWARE_REPAIR: 'HARDWARE_REPAIR',
  SOFTWARE_UPDATE: 'SOFTWARE_UPDATE',
  CLEANING: 'CLEANING',
  REPLACEMENT: 'REPLACEMENT',
  INSPECTION: 'INSPECTION',
  CALIBRATION: 'CALIBRATION',
  OTHER: 'OTHER',
  USER_REPORT: 'USER_REPORT',
} as const

export type CreateMaintenanceHistoryDtoMaintenanceTypeEnum =
  (typeof createMaintenanceHistoryDtoMaintenanceTypeEnum)[keyof typeof createMaintenanceHistoryDtoMaintenanceTypeEnum]

export const createMaintenanceHistoryDtoStatusEnum = {
  SCHEDULED: 'SCHEDULED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  FAILED: 'FAILED',
} as const

export type CreateMaintenanceHistoryDtoStatusEnum = (typeof createMaintenanceHistoryDtoStatusEnum)[keyof typeof createMaintenanceHistoryDtoStatusEnum]

export type CreateMaintenanceHistoryDto = {
  /**
   * @description Device ID
   * @type string
   */
  deviceId: string
  /**
   * @description Related report ID
   * @type string | undefined
   */
  relatedReportId?: string | undefined
  /**
   * @description Type of maintenance
   * @type string
   */
  maintenanceType: CreateMaintenanceHistoryDtoMaintenanceTypeEnum
  /**
   * @description Maintenance status
   * @default "SCHEDULED"
   * @type string
   */
  status: CreateMaintenanceHistoryDtoStatusEnum
  /**
   * @description Maintenance description
   * @type string
   */
  description: string
  /**
   * @description Resolution notes
   * @type string | undefined
   */
  resolutionNotes?: string | undefined
  /**
   * @description Completion date
   * @type string | undefined, date-time
   */
  completedAt?: Date | undefined
  /**
   * @description Involved personnel names
   * @type string | undefined
   */
  involvedPersonnel?: string | undefined
  /**
   * @description Software ID for software-related maintenance
   * @type string | undefined
   */
  softwareId?: string | undefined
  /**
   * @description Software status after maintenance (true = has issue, false = no issue)
   * @type boolean | undefined
   */
  softwareHasIssue?: boolean | undefined
  /**
   * @description Device status after maintenance (true = has issue, false = no issue)
   * @type boolean | undefined
   */
  deviceHasIssue?: boolean | undefined
}