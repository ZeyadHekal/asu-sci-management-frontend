/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import client from '../../../global/api/apiClient'
import type { RequestConfig, ResponseErrorConfig, ResponseConfig } from '../../../global/api/apiClient'
import type { InfiniteData, QueryKey, QueryClient, InfiniteQueryObserverOptions, UseInfiniteQueryResult } from '@tanstack/react-query'
import type {
  EventControllerDownloadSubmissionsQueryResponse,
  EventControllerDownloadSubmissionsPathParams,
} from '../../types/eventsController/EventControllerDownloadSubmissions.ts'
import { infiniteQueryOptions, useInfiniteQuery } from '@tanstack/react-query'

export const eventControllerDownloadSubmissionsInfiniteQueryKey = (scheduleId: EventControllerDownloadSubmissionsPathParams['scheduleId']) =>
  [{ url: '/events/:scheduleId/download-submissions', params: { scheduleId: scheduleId } }] as const

export type EventControllerDownloadSubmissionsInfiniteQueryKey = ReturnType<typeof eventControllerDownloadSubmissionsInfiniteQueryKey>

/**
 * @summary Download all student submissions as ZIP file
 * {@link /events/:scheduleId/download-submissions}
 */
export async function eventControllerDownloadSubmissionsInfinite(
  scheduleId: EventControllerDownloadSubmissionsPathParams['scheduleId'],
  config: Partial<RequestConfig> & { client?: typeof client } = {},
) {
  const { client: request = client, ...requestConfig } = config

  const res = await request<EventControllerDownloadSubmissionsQueryResponse, ResponseErrorConfig<Error>, unknown>({
    method: 'GET',
    url: `/events/${scheduleId}/download-submissions`,
    ...requestConfig,
  })
  return res
}

export function eventControllerDownloadSubmissionsInfiniteQueryOptions(
  scheduleId: EventControllerDownloadSubmissionsPathParams['scheduleId'],
  config: Partial<RequestConfig> & { client?: typeof client } = {},
) {
  const queryKey = eventControllerDownloadSubmissionsInfiniteQueryKey(scheduleId)
  return infiniteQueryOptions<
    ResponseConfig<EventControllerDownloadSubmissionsQueryResponse>,
    ResponseErrorConfig<Error>,
    ResponseConfig<EventControllerDownloadSubmissionsQueryResponse>,
    typeof queryKey
  >({
    enabled: !!scheduleId,
    queryKey,
    queryFn: async ({ signal }) => {
      config.signal = signal
      return eventControllerDownloadSubmissionsInfinite(scheduleId, config)
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage['page'],
    getPreviousPageParam: (firstPage) => firstPage['page'],
  })
}

/**
 * @summary Download all student submissions as ZIP file
 * {@link /events/:scheduleId/download-submissions}
 */
export function useEventControllerDownloadSubmissionsInfinite<
  TData = InfiniteData<ResponseConfig<EventControllerDownloadSubmissionsQueryResponse>>,
  TQueryData = ResponseConfig<EventControllerDownloadSubmissionsQueryResponse>,
  TQueryKey extends QueryKey = EventControllerDownloadSubmissionsInfiniteQueryKey,
>(
  scheduleId: EventControllerDownloadSubmissionsPathParams['scheduleId'],
  options: {
    query?: Partial<
      InfiniteQueryObserverOptions<ResponseConfig<EventControllerDownloadSubmissionsQueryResponse>, ResponseErrorConfig<Error>, TData, TQueryData, TQueryKey>
    > & { client?: QueryClient }
    client?: Partial<RequestConfig> & { client?: typeof client }
  } = {},
) {
  const { query: { client: queryClient, ...queryOptions } = {}, client: config = {} } = options ?? {}
  const queryKey = queryOptions?.queryKey ?? eventControllerDownloadSubmissionsInfiniteQueryKey(scheduleId)

  const query = useInfiniteQuery(
    {
      ...(eventControllerDownloadSubmissionsInfiniteQueryOptions(scheduleId, config) as unknown as InfiniteQueryObserverOptions),
      queryKey,
      ...(queryOptions as unknown as Omit<InfiniteQueryObserverOptions, 'queryKey'>),
    },
    queryClient,
  ) as UseInfiniteQueryResult<TData, ResponseErrorConfig<Error>> & { queryKey: TQueryKey }

  query.queryKey = queryKey as TQueryKey

  return query
}