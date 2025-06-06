/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import client from '../../../global/api/apiClient'
import type { RequestConfig, ResponseErrorConfig, ResponseConfig } from '../../../global/api/apiClient'
import type { InfiniteData, QueryKey, QueryClient, InfiniteQueryObserverOptions, UseInfiniteQueryResult } from '@tanstack/react-query'
import type {
  CourseControllerGetByIdQueryResponse,
  CourseControllerGetByIdPathParams,
  CourseControllerGetById401,
  CourseControllerGetById403,
  CourseControllerGetById404,
} from '../../types/coursesController/CourseControllerGetById.ts'
import { infiniteQueryOptions, useInfiniteQuery } from '@tanstack/react-query'

export const courseControllerGetByIdInfiniteQueryKey = (course_id: CourseControllerGetByIdPathParams['course_id']) =>
  [{ url: '/courses/:course_id', params: { course_id: course_id } }] as const

export type CourseControllerGetByIdInfiniteQueryKey = ReturnType<typeof courseControllerGetByIdInfiniteQueryKey>

/**
 * @description Retrieve a course by its ID
 * @summary Get course by ID
 * {@link /courses/:course_id}
 */
export async function courseControllerGetByIdInfinite(
  course_id: CourseControllerGetByIdPathParams['course_id'],
  config: Partial<RequestConfig> & { client?: typeof client } = {},
) {
  const { client: request = client, ...requestConfig } = config

  const res = await request<
    CourseControllerGetByIdQueryResponse,
    ResponseErrorConfig<CourseControllerGetById401 | CourseControllerGetById403 | CourseControllerGetById404>,
    unknown
  >({ method: 'GET', url: `/courses/${course_id}`, ...requestConfig })
  return res
}

export function courseControllerGetByIdInfiniteQueryOptions(
  course_id: CourseControllerGetByIdPathParams['course_id'],
  config: Partial<RequestConfig> & { client?: typeof client } = {},
) {
  const queryKey = courseControllerGetByIdInfiniteQueryKey(course_id)
  return infiniteQueryOptions<
    ResponseConfig<CourseControllerGetByIdQueryResponse>,
    ResponseErrorConfig<CourseControllerGetById401 | CourseControllerGetById403 | CourseControllerGetById404>,
    ResponseConfig<CourseControllerGetByIdQueryResponse>,
    typeof queryKey
  >({
    enabled: !!course_id,
    queryKey,
    queryFn: async ({ signal }) => {
      config.signal = signal
      return courseControllerGetByIdInfinite(course_id, config)
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage['page'],
    getPreviousPageParam: (firstPage) => firstPage['page'],
  })
}

/**
 * @description Retrieve a course by its ID
 * @summary Get course by ID
 * {@link /courses/:course_id}
 */
export function useCourseControllerGetByIdInfinite<
  TData = InfiniteData<ResponseConfig<CourseControllerGetByIdQueryResponse>>,
  TQueryData = ResponseConfig<CourseControllerGetByIdQueryResponse>,
  TQueryKey extends QueryKey = CourseControllerGetByIdInfiniteQueryKey,
>(
  course_id: CourseControllerGetByIdPathParams['course_id'],
  options: {
    query?: Partial<
      InfiniteQueryObserverOptions<
        ResponseConfig<CourseControllerGetByIdQueryResponse>,
        ResponseErrorConfig<CourseControllerGetById401 | CourseControllerGetById403 | CourseControllerGetById404>,
        TData,
        TQueryData,
        TQueryKey
      >
    > & { client?: QueryClient }
    client?: Partial<RequestConfig> & { client?: typeof client }
  } = {},
) {
  const { query: { client: queryClient, ...queryOptions } = {}, client: config = {} } = options ?? {}
  const queryKey = queryOptions?.queryKey ?? courseControllerGetByIdInfiniteQueryKey(course_id)

  const query = useInfiniteQuery(
    {
      ...(courseControllerGetByIdInfiniteQueryOptions(course_id, config) as unknown as InfiniteQueryObserverOptions),
      queryKey,
      ...(queryOptions as unknown as Omit<InfiniteQueryObserverOptions, 'queryKey'>),
    },
    queryClient,
  ) as UseInfiniteQueryResult<TData, ResponseErrorConfig<CourseControllerGetById401 | CourseControllerGetById403 | CourseControllerGetById404>> & {
    queryKey: TQueryKey
  }

  query.queryKey = queryKey as TQueryKey

  return query
}