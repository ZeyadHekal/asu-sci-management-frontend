/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import { z } from 'zod'

export const uploadedFileDtoSchema = z.object({
  id: z.string(),
  originalName: z.string(),
  size: z.number(),
  mimeType: z.string(),
})

export type UploadedFileDtoSchema = z.infer<typeof uploadedFileDtoSchema>