/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import client from '../../../global/api/apiClient'
import type { RequestConfig, ResponseErrorConfig, ResponseConfig } from '../../../global/api/apiClient'
import type { QueryKey, QueryClient, UseSuspenseQueryOptions, UseSuspenseQueryResult } from '@tanstack/react-query'
import type {
  ExamModelControllerGetExamModelsForEventQueryResponse,
  ExamModelControllerGetExamModelsForEventPathParams,
} from '../../types/exam-modelsController/ExamModelControllerGetExamModelsForEvent.ts'
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'

export const examModelControllerGetExamModelsForEventSuspenseQueryKey = (eventId: ExamModelControllerGetExamModelsForEventPathParams['eventId']) =>
  [{ url: '/exam-models/event/:eventId', params: { eventId: eventId } }] as const

export type ExamModelControllerGetExamModelsForEventSuspenseQueryKey = ReturnType<typeof examModelControllerGetExamModelsForEventSuspenseQueryKey>

/**
 * @summary Get all exam models for an event
 * {@link /exam-models/event/:eventId}
 */
export async function examModelControllerGetExamModelsForEventSuspense(
  eventId: ExamModelControllerGetExamModelsForEventPathParams['eventId'],
  config: Partial<RequestConfig> & { client?: typeof client } = {},
) {
  const { client: request = client, ...requestConfig } = config

  const res = await request<ExamModelControllerGetExamModelsForEventQueryResponse, ResponseErrorConfig<Error>, unknown>({
    method: 'GET',
    url: `/exam-models/event/${eventId}`,
    ...requestConfig,
  })
  return res
}

export function examModelControllerGetExamModelsForEventSuspenseQueryOptions(
  eventId: ExamModelControllerGetExamModelsForEventPathParams['eventId'],
  config: Partial<RequestConfig> & { client?: typeof client } = {},
) {
  const queryKey = examModelControllerGetExamModelsForEventSuspenseQueryKey(eventId)
  return queryOptions<
    ResponseConfig<ExamModelControllerGetExamModelsForEventQueryResponse>,
    ResponseErrorConfig<Error>,
    ResponseConfig<ExamModelControllerGetExamModelsForEventQueryResponse>,
    typeof queryKey
  >({
    enabled: !!eventId,
    queryKey,
    queryFn: async ({ signal }) => {
      config.signal = signal
      return examModelControllerGetExamModelsForEventSuspense(eventId, config)
    },
  })
}

/**
 * @summary Get all exam models for an event
 * {@link /exam-models/event/:eventId}
 */
export function useExamModelControllerGetExamModelsForEventSuspense<
  TData = ResponseConfig<ExamModelControllerGetExamModelsForEventQueryResponse>,
  TQueryKey extends QueryKey = ExamModelControllerGetExamModelsForEventSuspenseQueryKey,
>(
  eventId: ExamModelControllerGetExamModelsForEventPathParams['eventId'],
  options: {
    query?: Partial<
      UseSuspenseQueryOptions<ResponseConfig<ExamModelControllerGetExamModelsForEventQueryResponse>, ResponseErrorConfig<Error>, TData, TQueryKey>
    > & { client?: QueryClient }
    client?: Partial<RequestConfig> & { client?: typeof client }
  } = {},
) {
  const { query: { client: queryClient, ...queryOptions } = {}, client: config = {} } = options ?? {}
  const queryKey = queryOptions?.queryKey ?? examModelControllerGetExamModelsForEventSuspenseQueryKey(eventId)

  const query = useSuspenseQuery(
    {
      ...(examModelControllerGetExamModelsForEventSuspenseQueryOptions(eventId, config) as unknown as UseSuspenseQueryOptions),
      queryKey,
      ...(queryOptions as unknown as Omit<UseSuspenseQueryOptions, 'queryKey'>),
    },
    queryClient,
  ) as UseSuspenseQueryResult<TData, ResponseErrorConfig<Error>> & { queryKey: TQueryKey }

  query.queryKey = queryKey as TQueryKey

  return query
}