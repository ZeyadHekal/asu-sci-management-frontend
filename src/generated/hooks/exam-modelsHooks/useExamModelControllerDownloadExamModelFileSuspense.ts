/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import client from '../../../global/api/apiClient'
import type { RequestConfig, ResponseErrorConfig, ResponseConfig } from '../../../global/api/apiClient'
import type { QueryKey, QueryClient, UseSuspenseQueryOptions, UseSuspenseQueryResult } from '@tanstack/react-query'
import type {
  ExamModelControllerDownloadExamModelFileQueryResponse,
  ExamModelControllerDownloadExamModelFilePathParams,
} from '../../types/exam-modelsController/ExamModelControllerDownloadExamModelFile.ts'
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'

export const examModelControllerDownloadExamModelFileSuspenseQueryKey = (
  modelId: ExamModelControllerDownloadExamModelFilePathParams['modelId'],
  fileId: ExamModelControllerDownloadExamModelFilePathParams['fileId'],
) => [{ url: '/exam-models/:modelId/file/:fileId/download', params: { modelId: modelId, fileId: fileId } }] as const

export type ExamModelControllerDownloadExamModelFileSuspenseQueryKey = ReturnType<typeof examModelControllerDownloadExamModelFileSuspenseQueryKey>

/**
 * @summary Get presigned URL for specific exam model file
 * {@link /exam-models/:modelId/file/:fileId/download}
 */
export async function examModelControllerDownloadExamModelFileSuspense(
  modelId: ExamModelControllerDownloadExamModelFilePathParams['modelId'],
  fileId: ExamModelControllerDownloadExamModelFilePathParams['fileId'],
  config: Partial<RequestConfig> & { client?: typeof client } = {},
) {
  const { client: request = client, ...requestConfig } = config

  const res = await request<ExamModelControllerDownloadExamModelFileQueryResponse, ResponseErrorConfig<Error>, unknown>({
    method: 'GET',
    url: `/exam-models/${modelId}/file/${fileId}/download`,
    ...requestConfig,
  })
  return res
}

export function examModelControllerDownloadExamModelFileSuspenseQueryOptions(
  modelId: ExamModelControllerDownloadExamModelFilePathParams['modelId'],
  fileId: ExamModelControllerDownloadExamModelFilePathParams['fileId'],
  config: Partial<RequestConfig> & { client?: typeof client } = {},
) {
  const queryKey = examModelControllerDownloadExamModelFileSuspenseQueryKey(modelId, fileId)
  return queryOptions<
    ResponseConfig<ExamModelControllerDownloadExamModelFileQueryResponse>,
    ResponseErrorConfig<Error>,
    ResponseConfig<ExamModelControllerDownloadExamModelFileQueryResponse>,
    typeof queryKey
  >({
    enabled: !!(modelId && fileId),
    queryKey,
    queryFn: async ({ signal }) => {
      config.signal = signal
      return examModelControllerDownloadExamModelFileSuspense(modelId, fileId, config)
    },
  })
}

/**
 * @summary Get presigned URL for specific exam model file
 * {@link /exam-models/:modelId/file/:fileId/download}
 */
export function useExamModelControllerDownloadExamModelFileSuspense<
  TData = ResponseConfig<ExamModelControllerDownloadExamModelFileQueryResponse>,
  TQueryKey extends QueryKey = ExamModelControllerDownloadExamModelFileSuspenseQueryKey,
>(
  modelId: ExamModelControllerDownloadExamModelFilePathParams['modelId'],
  fileId: ExamModelControllerDownloadExamModelFilePathParams['fileId'],
  options: {
    query?: Partial<
      UseSuspenseQueryOptions<ResponseConfig<ExamModelControllerDownloadExamModelFileQueryResponse>, ResponseErrorConfig<Error>, TData, TQueryKey>
    > & { client?: QueryClient }
    client?: Partial<RequestConfig> & { client?: typeof client }
  } = {},
) {
  const { query: { client: queryClient, ...queryOptions } = {}, client: config = {} } = options ?? {}
  const queryKey = queryOptions?.queryKey ?? examModelControllerDownloadExamModelFileSuspenseQueryKey(modelId, fileId)

  const query = useSuspenseQuery(
    {
      ...(examModelControllerDownloadExamModelFileSuspenseQueryOptions(modelId, fileId, config) as unknown as UseSuspenseQueryOptions),
      queryKey,
      ...(queryOptions as unknown as Omit<UseSuspenseQueryOptions, 'queryKey'>),
    },
    queryClient,
  ) as UseSuspenseQueryResult<TData, ResponseErrorConfig<Error>> & { queryKey: TQueryKey }

  query.queryKey = queryKey as TQueryKey

  return query
}