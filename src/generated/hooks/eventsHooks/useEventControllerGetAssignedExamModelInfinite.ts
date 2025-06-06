/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import client from '../../../global/api/apiClient'
import type { RequestConfig, ResponseErrorConfig, ResponseConfig } from '../../../global/api/apiClient'
import type { InfiniteData, QueryKey, QueryClient, InfiniteQueryObserverOptions, UseInfiniteQueryResult } from '@tanstack/react-query'
import type {
  EventControllerGetAssignedExamModelQueryResponse,
  EventControllerGetAssignedExamModelPathParams,
} from '../../types/eventsController/EventControllerGetAssignedExamModel.ts'
import { infiniteQueryOptions, useInfiniteQuery } from '@tanstack/react-query'

export const eventControllerGetAssignedExamModelInfiniteQueryKey = (scheduleId: EventControllerGetAssignedExamModelPathParams['scheduleId']) =>
  [{ url: '/events/student/:scheduleId/exam-model', params: { scheduleId: scheduleId } }] as const

export type EventControllerGetAssignedExamModelInfiniteQueryKey = ReturnType<typeof eventControllerGetAssignedExamModelInfiniteQueryKey>

/**
 * @summary Get assigned exam model for student
 * {@link /events/student/:scheduleId/exam-model}
 */
export async function eventControllerGetAssignedExamModelInfinite(
  scheduleId: EventControllerGetAssignedExamModelPathParams['scheduleId'],
  config: Partial<RequestConfig> & { client?: typeof client } = {},
) {
  const { client: request = client, ...requestConfig } = config

  const res = await request<EventControllerGetAssignedExamModelQueryResponse, ResponseErrorConfig<Error>, unknown>({
    method: 'GET',
    url: `/events/student/${scheduleId}/exam-model`,
    ...requestConfig,
  })
  return res
}

export function eventControllerGetAssignedExamModelInfiniteQueryOptions(
  scheduleId: EventControllerGetAssignedExamModelPathParams['scheduleId'],
  config: Partial<RequestConfig> & { client?: typeof client } = {},
) {
  const queryKey = eventControllerGetAssignedExamModelInfiniteQueryKey(scheduleId)
  return infiniteQueryOptions<
    ResponseConfig<EventControllerGetAssignedExamModelQueryResponse>,
    ResponseErrorConfig<Error>,
    ResponseConfig<EventControllerGetAssignedExamModelQueryResponse>,
    typeof queryKey
  >({
    enabled: !!scheduleId,
    queryKey,
    queryFn: async ({ signal }) => {
      config.signal = signal
      return eventControllerGetAssignedExamModelInfinite(scheduleId, config)
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage['page'],
    getPreviousPageParam: (firstPage) => firstPage['page'],
  })
}

/**
 * @summary Get assigned exam model for student
 * {@link /events/student/:scheduleId/exam-model}
 */
export function useEventControllerGetAssignedExamModelInfinite<
  TData = InfiniteData<ResponseConfig<EventControllerGetAssignedExamModelQueryResponse>>,
  TQueryData = ResponseConfig<EventControllerGetAssignedExamModelQueryResponse>,
  TQueryKey extends QueryKey = EventControllerGetAssignedExamModelInfiniteQueryKey,
>(
  scheduleId: EventControllerGetAssignedExamModelPathParams['scheduleId'],
  options: {
    query?: Partial<
      InfiniteQueryObserverOptions<ResponseConfig<EventControllerGetAssignedExamModelQueryResponse>, ResponseErrorConfig<Error>, TData, TQueryData, TQueryKey>
    > & { client?: QueryClient }
    client?: Partial<RequestConfig> & { client?: typeof client }
  } = {},
) {
  const { query: { client: queryClient, ...queryOptions } = {}, client: config = {} } = options ?? {}
  const queryKey = queryOptions?.queryKey ?? eventControllerGetAssignedExamModelInfiniteQueryKey(scheduleId)

  const query = useInfiniteQuery(
    {
      ...(eventControllerGetAssignedExamModelInfiniteQueryOptions(scheduleId, config) as unknown as InfiniteQueryObserverOptions),
      queryKey,
      ...(queryOptions as unknown as Omit<InfiniteQueryObserverOptions, 'queryKey'>),
    },
    queryClient,
  ) as UseInfiniteQueryResult<TData, ResponseErrorConfig<Error>> & { queryKey: TQueryKey }

  query.queryKey = queryKey as TQueryKey

  return query
}