/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import { z } from 'zod'

export const fileControllerDeleteFilePathParamsSchema = z.object({
  id: z.number().describe('File ID'),
})

export type FileControllerDeleteFilePathParamsSchema = z.infer<typeof fileControllerDeleteFilePathParamsSchema>

export const fileControllerDeleteFile200Schema = z.unknown()

export type FileControllerDeleteFile200Schema = z.infer<typeof fileControllerDeleteFile200Schema>

export const fileControllerDeleteFileMutationResponseSchema = z.lazy(() => fileControllerDeleteFile200Schema)

export type FileControllerDeleteFileMutationResponseSchema = z.infer<typeof fileControllerDeleteFileMutationResponseSchema>