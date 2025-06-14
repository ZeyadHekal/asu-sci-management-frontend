/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

export type ExamModelControllerGetExamModelFilesPathParams = {
  /**
   * @description Exam Model ID
   * @type string
   */
  modelId: string
}

/**
 * @description Exam model files retrieved successfully
 */
export type ExamModelControllerGetExamModelFiles200 = {
  /**
   * @type string | undefined
   */
  fileName?: string | undefined
  /**
   * @type string | undefined
   */
  downloadUrl?: string | undefined
  /**
   * @type number | undefined
   */
  fileSize?: number | undefined
}[]

export type ExamModelControllerGetExamModelFilesQueryResponse = ExamModelControllerGetExamModelFiles200

export type ExamModelControllerGetExamModelFilesQuery = {
  Response: ExamModelControllerGetExamModelFiles200
  PathParams: ExamModelControllerGetExamModelFilesPathParams
  Errors: any
}