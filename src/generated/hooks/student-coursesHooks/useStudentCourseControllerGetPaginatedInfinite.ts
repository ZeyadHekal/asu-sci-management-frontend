/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import client from '../../../global/api/apiClient'
import type { RequestConfig, ResponseErrorConfig, ResponseConfig } from '../../../global/api/apiClient'
import type { InfiniteData, QueryKey, QueryClient, InfiniteQueryObserverOptions, UseInfiniteQueryResult } from '@tanstack/react-query'
import type {
  StudentCourseControllerGetPaginatedQueryResponse,
  StudentCourseControllerGetPaginatedQueryParams,
} from '../../types/student-coursesController/StudentCourseControllerGetPaginated.ts'
import { infiniteQueryOptions, useInfiniteQuery } from '@tanstack/react-query'

export const studentCourseControllerGetPaginatedInfiniteQueryKey = (params?: StudentCourseControllerGetPaginatedQueryParams) =>
  [{ url: '/student-courses' }, ...(params ? [params] : [])] as const

export type StudentCourseControllerGetPaginatedInfiniteQueryKey = ReturnType<typeof studentCourseControllerGetPaginatedInfiniteQueryKey>

/**
 * @summary Get all student-courses
 * {@link /student-courses}
 */
export async function studentCourseControllerGetPaginatedInfinite(
  params?: StudentCourseControllerGetPaginatedQueryParams,
  config: Partial<RequestConfig> & { client?: typeof client } = {},
) {
  const { client: request = client, ...requestConfig } = config

  const res = await request<StudentCourseControllerGetPaginatedQueryResponse, ResponseErrorConfig<Error>, unknown>({
    method: 'GET',
    url: `/student-courses`,
    params,
    ...requestConfig,
  })
  return res
}

export function studentCourseControllerGetPaginatedInfiniteQueryOptions(
  params?: StudentCourseControllerGetPaginatedQueryParams,
  config: Partial<RequestConfig> & { client?: typeof client } = {},
) {
  const queryKey = studentCourseControllerGetPaginatedInfiniteQueryKey(params)
  return infiniteQueryOptions<
    ResponseConfig<StudentCourseControllerGetPaginatedQueryResponse>,
    ResponseErrorConfig<Error>,
    ResponseConfig<StudentCourseControllerGetPaginatedQueryResponse>,
    typeof queryKey,
    number
  >({
    queryKey,
    queryFn: async ({ signal, pageParam }) => {
      config.signal = signal

      if (params) {
        params['limit'] = pageParam as unknown as StudentCourseControllerGetPaginatedQueryParams['limit']
      }
      return studentCourseControllerGetPaginatedInfinite(params, config)
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage['page'],
    getPreviousPageParam: (firstPage) => firstPage['page'],
  })
}

/**
 * @summary Get all student-courses
 * {@link /student-courses}
 */
export function useStudentCourseControllerGetPaginatedInfinite<
  TData = InfiniteData<ResponseConfig<StudentCourseControllerGetPaginatedQueryResponse>>,
  TQueryData = ResponseConfig<StudentCourseControllerGetPaginatedQueryResponse>,
  TQueryKey extends QueryKey = StudentCourseControllerGetPaginatedInfiniteQueryKey,
>(
  params?: StudentCourseControllerGetPaginatedQueryParams,
  options: {
    query?: Partial<
      InfiniteQueryObserverOptions<ResponseConfig<StudentCourseControllerGetPaginatedQueryResponse>, ResponseErrorConfig<Error>, TData, TQueryData, TQueryKey>
    > & { client?: QueryClient }
    client?: Partial<RequestConfig> & { client?: typeof client }
  } = {},
) {
  const { query: { client: queryClient, ...queryOptions } = {}, client: config = {} } = options ?? {}
  const queryKey = queryOptions?.queryKey ?? studentCourseControllerGetPaginatedInfiniteQueryKey(params)

  const query = useInfiniteQuery(
    {
      ...(studentCourseControllerGetPaginatedInfiniteQueryOptions(params, config) as unknown as InfiniteQueryObserverOptions),
      queryKey,
      ...(queryOptions as unknown as Omit<InfiniteQueryObserverOptions, 'queryKey'>),
    },
    queryClient,
  ) as UseInfiniteQueryResult<TData, ResponseErrorConfig<Error>> & { queryKey: TQueryKey }

  query.queryKey = queryKey as TQueryKey

  return query
}