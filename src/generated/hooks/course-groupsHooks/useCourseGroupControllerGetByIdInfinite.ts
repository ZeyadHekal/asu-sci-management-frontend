/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import client from '../../../global/api/apiClient'
import type { RequestConfig, ResponseErrorConfig, ResponseConfig } from '../../../global/api/apiClient'
import type { InfiniteData, QueryKey, QueryClient, InfiniteQueryObserverOptions, UseInfiniteQueryResult } from '@tanstack/react-query'
import type {
  CourseGroupControllerGetByIdQueryResponse,
  CourseGroupControllerGetByIdPathParams,
  CourseGroupControllerGetById404,
} from '../../types/course-groupsController/CourseGroupControllerGetById.ts'
import { infiniteQueryOptions, useInfiniteQuery } from '@tanstack/react-query'

export const courseGroupControllerGetByIdInfiniteQueryKey = (id: CourseGroupControllerGetByIdPathParams['id']) =>
  [{ url: '/course-groups/:id', params: { id: id } }] as const

export type CourseGroupControllerGetByIdInfiniteQueryKey = ReturnType<typeof courseGroupControllerGetByIdInfiniteQueryKey>

/**
 * @summary Get a course-group by ID
 * {@link /course-groups/:id}
 */
export async function courseGroupControllerGetByIdInfinite(
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

export function courseGroupControllerGetByIdInfiniteQueryOptions(
  id: CourseGroupControllerGetByIdPathParams['id'],
  config: Partial<RequestConfig> & { client?: typeof client } = {},
) {
  const queryKey = courseGroupControllerGetByIdInfiniteQueryKey(id)
  return infiniteQueryOptions<
    ResponseConfig<CourseGroupControllerGetByIdQueryResponse>,
    ResponseErrorConfig<CourseGroupControllerGetById404>,
    ResponseConfig<CourseGroupControllerGetByIdQueryResponse>,
    typeof queryKey
  >({
    enabled: !!id,
    queryKey,
    queryFn: async ({ signal }) => {
      config.signal = signal
      return courseGroupControllerGetByIdInfinite(id, config)
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage['page'],
    getPreviousPageParam: (firstPage) => firstPage['page'],
  })
}

/**
 * @summary Get a course-group by ID
 * {@link /course-groups/:id}
 */
export function useCourseGroupControllerGetByIdInfinite<
  TData = InfiniteData<ResponseConfig<CourseGroupControllerGetByIdQueryResponse>>,
  TQueryData = ResponseConfig<CourseGroupControllerGetByIdQueryResponse>,
  TQueryKey extends QueryKey = CourseGroupControllerGetByIdInfiniteQueryKey,
>(
  id: CourseGroupControllerGetByIdPathParams['id'],
  options: {
    query?: Partial<
      InfiniteQueryObserverOptions<
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
  const queryKey = queryOptions?.queryKey ?? courseGroupControllerGetByIdInfiniteQueryKey(id)

  const query = useInfiniteQuery(
    {
      ...(courseGroupControllerGetByIdInfiniteQueryOptions(id, config) as unknown as InfiniteQueryObserverOptions),
      queryKey,
      ...(queryOptions as unknown as Omit<InfiniteQueryObserverOptions, 'queryKey'>),
    },
    queryClient,
  ) as UseInfiniteQueryResult<TData, ResponseErrorConfig<CourseGroupControllerGetById404>> & { queryKey: TQueryKey }

  query.queryKey = queryKey as TQueryKey

  return query
}