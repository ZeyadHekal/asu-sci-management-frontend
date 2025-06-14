/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import client from '../../../global/api/apiClient'
import type { RequestConfig, ResponseErrorConfig, ResponseConfig } from '../../../global/api/apiClient'
import type { QueryKey, QueryClient, UseSuspenseQueryOptions, UseSuspenseQueryResult } from '@tanstack/react-query'
import type {
  EventControllerExportCourseEventsQueryResponse,
  EventControllerExportCourseEventsPathParams,
} from '../../types/eventsController/EventControllerExportCourseEvents.ts'
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'

export const eventControllerExportCourseEventsSuspenseQueryKey = (courseId: EventControllerExportCourseEventsPathParams['courseId']) =>
  [{ url: '/events/course/:courseId/export', params: { courseId: courseId } }] as const

export type EventControllerExportCourseEventsSuspenseQueryKey = ReturnType<typeof eventControllerExportCourseEventsSuspenseQueryKey>

/**
 * @description Export events for a specific course as Excel file
 * @summary Export course events
 * {@link /events/course/:courseId/export}
 */
export async function eventControllerExportCourseEventsSuspense(
  courseId: EventControllerExportCourseEventsPathParams['courseId'],
  config: Partial<RequestConfig> & { client?: typeof client } = {},
) {
  const { client: request = client, ...requestConfig } = config

  const res = await request<EventControllerExportCourseEventsQueryResponse, ResponseErrorConfig<Error>, unknown>({
    method: 'GET',
    url: `/events/course/${courseId}/export`,
    ...requestConfig,
  })
  return res
}

export function eventControllerExportCourseEventsSuspenseQueryOptions(
  courseId: EventControllerExportCourseEventsPathParams['courseId'],
  config: Partial<RequestConfig> & { client?: typeof client } = {},
) {
  const queryKey = eventControllerExportCourseEventsSuspenseQueryKey(courseId)
  return queryOptions<
    ResponseConfig<EventControllerExportCourseEventsQueryResponse>,
    ResponseErrorConfig<Error>,
    ResponseConfig<EventControllerExportCourseEventsQueryResponse>,
    typeof queryKey
  >({
    enabled: !!courseId,
    queryKey,
    queryFn: async ({ signal }) => {
      config.signal = signal
      return eventControllerExportCourseEventsSuspense(courseId, config)
    },
  })
}

/**
 * @description Export events for a specific course as Excel file
 * @summary Export course events
 * {@link /events/course/:courseId/export}
 */
export function useEventControllerExportCourseEventsSuspense<
  TData = ResponseConfig<EventControllerExportCourseEventsQueryResponse>,
  TQueryKey extends QueryKey = EventControllerExportCourseEventsSuspenseQueryKey,
>(
  courseId: EventControllerExportCourseEventsPathParams['courseId'],
  options: {
    query?: Partial<UseSuspenseQueryOptions<ResponseConfig<EventControllerExportCourseEventsQueryResponse>, ResponseErrorConfig<Error>, TData, TQueryKey>> & {
      client?: QueryClient
    }
    client?: Partial<RequestConfig> & { client?: typeof client }
  } = {},
) {
  const { query: { client: queryClient, ...queryOptions } = {}, client: config = {} } = options ?? {}
  const queryKey = queryOptions?.queryKey ?? eventControllerExportCourseEventsSuspenseQueryKey(courseId)

  const query = useSuspenseQuery(
    {
      ...(eventControllerExportCourseEventsSuspenseQueryOptions(courseId, config) as unknown as UseSuspenseQueryOptions),
      queryKey,
      ...(queryOptions as unknown as Omit<UseSuspenseQueryOptions, 'queryKey'>),
    },
    queryClient,
  ) as UseSuspenseQueryResult<TData, ResponseErrorConfig<Error>> & { queryKey: TQueryKey }

  query.queryKey = queryKey as TQueryKey

  return query
}