/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import { z } from 'zod'

export const eventControllerDownloadSubmissionsPathParamsSchema = z.object({
  scheduleId: z.string().describe('Event Schedule ID'),
})

export type EventControllerDownloadSubmissionsPathParamsSchema = z.infer<typeof eventControllerDownloadSubmissionsPathParamsSchema>

/**
 * @description Compressed archive file with all submissions
 */
export const eventControllerDownloadSubmissions200Schema = z.unknown()

export type EventControllerDownloadSubmissions200Schema = z.infer<typeof eventControllerDownloadSubmissions200Schema>

export const eventControllerDownloadSubmissionsQueryResponseSchema = z.lazy(() => eventControllerDownloadSubmissions200Schema)

export type EventControllerDownloadSubmissionsQueryResponseSchema = z.infer<typeof eventControllerDownloadSubmissionsQueryResponseSchema>