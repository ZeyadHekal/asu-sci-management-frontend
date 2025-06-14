/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import type { StudentsFiles } from '../StudentsFiles.ts'

export type StudentFilesControllerUploadExamFilePathParams = {
  /**
   * @description Student ID
   * @type string
   */
  studentId: string
  /**
   * @description Course ID
   * @type string
   */
  courseId: string
  /**
   * @description Event ID
   * @type string
   */
  eventId: string
}

/**
 * @description File uploaded successfully
 */
export type StudentFilesControllerUploadExamFile201 = StudentsFiles

export type StudentFilesControllerUploadExamFileMutationResponse = StudentFilesControllerUploadExamFile201

export type StudentFilesControllerUploadExamFileMutation = {
  Response: StudentFilesControllerUploadExamFile201
  PathParams: StudentFilesControllerUploadExamFilePathParams
  Errors: any
}