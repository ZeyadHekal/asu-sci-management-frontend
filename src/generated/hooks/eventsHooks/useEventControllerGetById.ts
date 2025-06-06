/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import client from '../../../global/api/apiClient'
import type { RequestConfig, ResponseErrorConfig, ResponseConfig } from '../../../global/api/apiClient'
import type { QueryKey, QueryClient, QueryObserverOptions, UseQueryResult } from '@tanstack/react-query'
import type {
  EventControllerGetByIdQueryResponse,
  EventControllerGetByIdPathParams,
  EventControllerGetById401,
  EventControllerGetById403,
  EventControllerGetById404,
} from '../../types/eventsController/EventControllerGetById.ts'
import { queryOptions, useQuery } from '@tanstack/react-query'

export const eventControllerGetByIdQueryKey = (event_id: EventControllerGetByIdPathParams['event_id']) =>
  [{ url: '/events/:event_id', params: { event_id: event_id } }] as const

export type EventControllerGetByIdQueryKey = ReturnType<typeof eventControllerGetByIdQueryKey>

/**
 * @description Retrieve an event by its ID
 * @summary Get event by ID
 * {@link /events/:event_id}
 */
export async function eventControllerGetById(
  event_id: EventControllerGetByIdPathParams['event_id'],
  config: Partial<RequestConfig> & { client?: typeof client } = {},
) {
  const { client: request = client, ...requestConfig } = config

  const res = await request<
    EventControllerGetByIdQueryResponse,
    ResponseErrorConfig<EventControllerGetById401 | EventControllerGetById403 | EventControllerGetById404>,
    unknown
  >({ method: 'GET', url: `/events/${event_id}`, ...requestConfig })
  return res
}

export function eventControllerGetByIdQueryOptions(
  event_id: EventControllerGetByIdPathParams['event_id'],
  config: Partial<RequestConfig> & { client?: typeof client } = {},
) {
  const queryKey = eventControllerGetByIdQueryKey(event_id)
  return queryOptions<
    ResponseConfig<EventControllerGetByIdQueryResponse>,
    ResponseErrorConfig<EventControllerGetById401 | EventControllerGetById403 | EventControllerGetById404>,
    ResponseConfig<EventControllerGetByIdQueryResponse>,
    typeof queryKey
  >({
    enabled: !!event_id,
    queryKey,
    queryFn: async ({ signal }) => {
      config.signal = signal
      return eventControllerGetById(event_id, config)
    },
  })
}

/**
 * @description Retrieve an event by its ID
 * @summary Get event by ID
 * {@link /events/:event_id}
 */
export function useEventControllerGetById<
  TData = ResponseConfig<EventControllerGetByIdQueryResponse>,
  TQueryData = ResponseConfig<EventControllerGetByIdQueryResponse>,
  TQueryKey extends QueryKey = EventControllerGetByIdQueryKey,
>(
  event_id: EventControllerGetByIdPathParams['event_id'],
  options: {
    query?: Partial<
      QueryObserverOptions<
        ResponseConfig<EventControllerGetByIdQueryResponse>,
        ResponseErrorConfig<EventControllerGetById401 | EventControllerGetById403 | EventControllerGetById404>,
        TData,
        TQueryData,
        TQueryKey
      >
    > & { client?: QueryClient }
    client?: Partial<RequestConfig> & { client?: typeof client }
  } = {},
) {
  const { query: { client: queryClient, ...queryOptions } = {}, client: config = {} } = options ?? {}
  const queryKey = queryOptions?.queryKey ?? eventControllerGetByIdQueryKey(event_id)

  const query = useQuery(
    {
      ...(eventControllerGetByIdQueryOptions(event_id, config) as unknown as QueryObserverOptions),
      queryKey,
      ...(queryOptions as unknown as Omit<QueryObserverOptions, 'queryKey'>),
    },
    queryClient,
  ) as UseQueryResult<TData, ResponseErrorConfig<EventControllerGetById401 | EventControllerGetById403 | EventControllerGetById404>> & { queryKey: TQueryKey }

  query.queryKey = queryKey as TQueryKey

  return query
}