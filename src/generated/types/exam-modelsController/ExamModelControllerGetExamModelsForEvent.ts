/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import type { ExamModelDto } from '../ExamModelDto.ts'

export type ExamModelControllerGetExamModelsForEventPathParams = {
  /**
   * @description Event ID
   * @type string
   */
  eventId: string
}

/**
 * @description Exam models retrieved successfully
 */
export type ExamModelControllerGetExamModelsForEvent200 = ExamModelDto[]

export type ExamModelControllerGetExamModelsForEventQueryResponse = ExamModelControllerGetExamModelsForEvent200

export type ExamModelControllerGetExamModelsForEventQuery = {
  Response: ExamModelControllerGetExamModelsForEvent200
  PathParams: ExamModelControllerGetExamModelsForEventPathParams
  Errors: any
}