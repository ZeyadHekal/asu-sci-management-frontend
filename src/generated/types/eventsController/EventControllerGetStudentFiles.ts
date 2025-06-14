/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import type { StudentFileDto } from '../StudentFileDto.ts'

export type EventControllerGetStudentFilesPathParams = {
  /**
   * @description Event Schedule ID
   * @type string
   */
  scheduleId: string
}

/**
 * @description Files retrieved successfully
 */
export type EventControllerGetStudentFiles200 = StudentFileDto[]

export type EventControllerGetStudentFilesQueryResponse = EventControllerGetStudentFiles200

export type EventControllerGetStudentFilesQuery = {
  Response: EventControllerGetStudentFiles200
  PathParams: EventControllerGetStudentFilesPathParams
  Errors: any
}