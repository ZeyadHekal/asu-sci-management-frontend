/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import client from '../../../global/api/apiClient'
import type { RequestConfig, ResponseErrorConfig, ResponseConfig } from '../../../global/api/apiClient'
import type { QueryKey, QueryClient, QueryObserverOptions, UseQueryResult } from '@tanstack/react-query'
import type {
  CourseGroupControllerGetByIdQueryResponse,
  CourseGroupControllerGetByIdPathParams,
  CourseGroupControllerGetById404,
} from '../../types/course-groupsController/CourseGroupControllerGetById.ts'
import { queryOptions, useQuery } from '@tanstack/react-query'

export const courseGroupControllerGetByIdQueryKey = (id: CourseGroupControllerGetByIdPathParams['id']) =>
  [{ url: '/course-groups/:id', params: { id: id } }] as const

export type CourseGroupControllerGetByIdQueryKey = ReturnType<typeof courseGroupControllerGetByIdQueryKey>

/**
 * @summary Get a course-group by ID
 * {@link /course-groups/:id}
 */
export async function courseGroupControllerGetById(
  id: CourseGroupControllerGetByIdPathParams['id'],
  config: Partial<RequestConfig> & { client?: typeof client } = {},
) {
  const { client: request = client, ...requestConfig } = config

  const res = await request<CourseGroupControllerGetByIdQueryResponse, ResponseErrorConfig<CourseGroupControllerGetById404>, unknown>({
    method: 'GET',
    url: `/course-groups/${id}`,
    ...requestConfig,
  })
  return res
}

export function courseGroupControllerGetByIdQueryOptions(
  id: CourseGroupControllerGetByIdPathParams['id'],
  config: Partial<RequestConfig> & { client?: typeof client } = {},
) {
  const queryKey = courseGroupControllerGetByIdQueryKey(id)
  return queryOptions<
    ResponseConfig<CourseGroupControllerGetByIdQueryResponse>,
    ResponseErrorConfig<CourseGroupControllerGetById404>,
    ResponseConfig<CourseGroupControllerGetByIdQueryResponse>,
    typeof queryKey
  >({
    enabled: !!id,
    queryKey,
    queryFn: async ({ signal }) => {
      config.signal = signal
      return courseGroupControllerGetById(id, config)
    },
  })
}

/**
 * @summary Get a course-group by ID
 * {@link /course-groups/:id}
 */
export function useCourseGroupControllerGetById<
  TData = ResponseConfig<CourseGroupControllerGetByIdQueryResponse>,
  TQueryData = ResponseConfig<CourseGroupControllerGetByIdQueryResponse>,
  TQueryKey extends QueryKey = CourseGroupControllerGetByIdQueryKey,
>(
  id: CourseGroupControllerGetByIdPathParams['id'],
  options: {
    query?: Partial<
      QueryObserverOptions<
        ResponseConfig<CourseGroupControllerGetByIdQueryResponse>,
        ResponseErrorConfig<CourseGroupControllerGetById404>,
        TData,
        TQueryData,
        TQueryKey
      >
    > & { client?: QueryClient }
    client?: Partial<RequestConfig> & { client?: typeof client }
  } = {},
) {
  const { query: { client: queryClient, ...queryOptions } = {}, client: config = {} } = options ?? {}
  const queryKey = queryOptions?.queryKey ?? courseGroupControllerGetByIdQueryKey(id)

  const query = useQuery(
    {
      ...(courseGroupControllerGetByIdQueryOptions(id, config) as unknown as QueryObserverOptions),
      queryKey,
      ...(queryOptions as unknown as Omit<QueryObserverOptions, 'queryKey'>),
    },
    queryClient,
  ) as UseQueryResult<TData, ResponseErrorConfig<CourseGroupControllerGetById404>> & { queryKey: TQueryKey }

  query.queryKey = queryKey as TQueryKey

  return query
}