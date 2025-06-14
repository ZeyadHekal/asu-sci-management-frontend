/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import { z } from 'zod'

export const maintenanceHistoryListDtoSchema = z.object({
  deviceId: z.string().describe('Device ID'),
  relatedReportId: z.string().describe('Related report ID').optional(),
  maintenanceType: z
    .enum(['HARDWARE_REPAIR', 'SOFTWARE_UPDATE', 'CLEANING', 'REPLACEMENT', 'INSPECTION', 'CALIBRATION', 'OTHER', 'USER_REPORT'])
    .describe('Type of maintenance'),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'FAILED']).default('SCHEDULED').describe('Maintenance status'),
  description: z.string().describe('Maintenance description'),
  resolutionNotes: z.string().describe('Resolution notes').optional(),
  completedAt: z.string().datetime({ offset: true }).describe('Completion date').optional(),
  involvedPersonnel: z.string().describe('Involved personnel names').optional(),
  softwareId: z.string().describe('Software ID for software-related maintenance').optional(),
  softwareHasIssue: z.boolean().describe('Software status after maintenance (true = has issue, false = no issue)').optional(),
  deviceHasIssue: z.boolean().describe('Device status after maintenance (true = has issue, false = no issue)').optional(),
  id: z.string().describe('Maintenance history ID'),
  created_at: z.string().datetime({ offset: true }).describe('Created at'),
  updated_at: z.string().datetime({ offset: true }).describe('Updated at'),
  deviceName: z.string().describe('Device name').optional(),
  relatedReportDescription: z.string().describe('Related report description').optional(),
})

export type MaintenanceHistoryListDtoSchema = z.infer<typeof maintenanceHistoryListDtoSchema>