/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import { z } from 'zod'

export const markUploadResponseDtoSchema = z.object({
  message: z.string(),
  processedStudents: z.number(),
  errors: z.array(z.string()),
})

export type MarkUploadResponseDtoSchema = z.infer<typeof markUploadResponseDtoSchema>