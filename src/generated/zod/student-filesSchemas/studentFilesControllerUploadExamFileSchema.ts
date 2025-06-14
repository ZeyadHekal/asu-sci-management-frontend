/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import { studentsFilesSchema } from '../studentsFilesSchema.ts'
import { z } from 'zod'

export const studentFilesControllerUploadExamFilePathParamsSchema = z.object({
  studentId: z.string().describe('Student ID'),
  courseId: z.string().describe('Course ID'),
  eventId: z.string().describe('Event ID'),
})

export type StudentFilesControllerUploadExamFilePathParamsSchema = z.infer<typeof studentFilesControllerUploadExamFilePathParamsSchema>

/**
 * @description File uploaded successfully
 */
export const studentFilesControllerUploadExamFile201Schema = z.lazy(() => studentsFilesSchema)

export type StudentFilesControllerUploadExamFile201Schema = z.infer<typeof studentFilesControllerUploadExamFile201Schema>

export const studentFilesControllerUploadExamFileMutationResponseSchema = z.lazy(() => studentFilesControllerUploadExamFile201Schema)

export type StudentFilesControllerUploadExamFileMutationResponseSchema = z.infer<typeof studentFilesControllerUploadExamFileMutationResponseSchema>