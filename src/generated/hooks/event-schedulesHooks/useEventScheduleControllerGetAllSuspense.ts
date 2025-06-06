/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import client from '../../../global/api/apiClient'
import type { RequestConfig, ResponseErrorConfig, ResponseConfig } from '../../../global/api/apiClient'
import type { QueryKey, QueryClient, UseSuspenseQueryOptions, UseSuspenseQueryResult } from '@tanstack/react-query'
import type {
  EventScheduleControllerGetAllQueryResponse,
  EventScheduleControllerGetAll401,
  EventScheduleControllerGetAll403,
} from '../../types/event-schedulesController/EventScheduleControllerGetAll.ts'
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'

export const eventScheduleControllerGetAllSuspenseQueryKey = () => [{ url: '/event-schedules' }] as const

export type EventScheduleControllerGetAllSuspenseQueryKey = ReturnType<typeof eventScheduleControllerGetAllSuspenseQueryKey>

/**
 * @description Retrieve all event schedules
 * @summary Get all event schedules
 * {@link /event-schedules}
 */
export async function eventScheduleControllerGetAllSuspense(config: Partial<RequestConfig> & { client?: typeof client } = {}) {
  const { client: request = client, ...requestConfig } = config

  const res = await request<
    EventScheduleControllerGetAllQueryResponse,
    ResponseErrorConfig<EventScheduleControllerGetAll401 | EventScheduleControllerGetAll403>,
    unknown
  >({ method: 'GET', url: `/event-schedules`, ...requestConfig })
  return res
}

export function eventScheduleControllerGetAllSuspenseQueryOptions(config: Partial<RequestConfig> & { client?: typeof client } = {}) {
  const queryKey = eventScheduleControllerGetAllSuspenseQueryKey()
  return queryOptions<
    ResponseConfig<EventScheduleControllerGetAllQueryResponse>,
    ResponseErrorConfig<EventScheduleControllerGetAll401 | EventScheduleControllerGetAll403>,
    ResponseConfig<EventScheduleControllerGetAllQueryResponse>,
    typeof queryKey
  >({
    queryKey,
    queryFn: async ({ signal }) => {
      config.signal = signal
      return eventScheduleControllerGetAllSuspense(config)
    },
  })
}

/**
 * @description Retrieve all event schedules
 * @summary Get all event schedules
 * {@link /event-schedules}
 */
export function useEventScheduleControllerGetAllSuspense<
  TData = ResponseConfig<EventScheduleControllerGetAllQueryResponse>,
  TQueryKey extends QueryKey = EventScheduleControllerGetAllSuspenseQueryKey,
>(
  options: {
    query?: Partial<
      UseSuspenseQueryOptions<
        ResponseConfig<EventScheduleControllerGetAllQueryResponse>,
        ResponseErrorConfig<EventScheduleControllerGetAll401 | EventScheduleControllerGetAll403>,
        TData,
        TQueryKey
      >
    > & { client?: QueryClient }
    client?: Partial<RequestConfig> & { client?: typeof client }
  } = {},
) {
  const { query: { client: queryClient, ...queryOptions } = {}, client: config = {} } = options ?? {}
  const queryKey = queryOptions?.queryKey ?? eventScheduleControllerGetAllSuspenseQueryKey()

  const query = useSuspenseQuery(
    {
      ...(eventScheduleControllerGetAllSuspenseQueryOptions(config) as unknown as UseSuspenseQueryOptions),
      queryKey,
      ...(queryOptions as unknown as Omit<UseSuspenseQueryOptions, 'queryKey'>),
    },
    queryClient,
  ) as UseSuspenseQueryResult<TData, ResponseErrorConfig<EventScheduleControllerGetAll401 | EventScheduleControllerGetAll403>> & { queryKey: TQueryKey }

  query.queryKey = queryKey as TQueryKey

  return query
}