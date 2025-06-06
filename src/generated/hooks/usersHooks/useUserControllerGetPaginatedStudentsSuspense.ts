/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import client from '../../../global/api/apiClient'
import type { RequestConfig, ResponseErrorConfig, ResponseConfig } from '../../../global/api/apiClient'
import type { QueryKey, QueryClient, UseSuspenseQueryOptions, UseSuspenseQueryResult } from '@tanstack/react-query'
import type {
  UserControllerGetPaginatedStudentsQueryResponse,
  UserControllerGetPaginatedStudentsQueryParams,
  UserControllerGetPaginatedStudents401,
  UserControllerGetPaginatedStudents403,
} from '../../types/usersController/UserControllerGetPaginatedStudents.ts'
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'

export const userControllerGetPaginatedStudentsSuspenseQueryKey = (params?: UserControllerGetPaginatedStudentsQueryParams) =>
  [{ url: '/users/students/paginated' }, ...(params ? [params] : [])] as const

export type UserControllerGetPaginatedStudentsSuspenseQueryKey = ReturnType<typeof userControllerGetPaginatedStudentsSuspenseQueryKey>

/**
 * @description Retrieve students with pagination
 * @summary Get paginated students
 * {@link /users/students/paginated}
 */
export async function userControllerGetPaginatedStudentsSuspense(
  params?: UserControllerGetPaginatedStudentsQueryParams,
  config: Partial<RequestConfig> & { client?: typeof client } = {},
) {
  const { client: request = client, ...requestConfig } = config

  const res = await request<
    UserControllerGetPaginatedStudentsQueryResponse,
    ResponseErrorConfig<UserControllerGetPaginatedStudents401 | UserControllerGetPaginatedStudents403>,
    unknown
  >({ method: 'GET', url: `/users/students/paginated`, params, ...requestConfig })
  return res
}

export function userControllerGetPaginatedStudentsSuspenseQueryOptions(
  params?: UserControllerGetPaginatedStudentsQueryParams,
  config: Partial<RequestConfig> & { client?: typeof client } = {},
) {
  const queryKey = userControllerGetPaginatedStudentsSuspenseQueryKey(params)
  return queryOptions<
    ResponseConfig<UserControllerGetPaginatedStudentsQueryResponse>,
    ResponseErrorConfig<UserControllerGetPaginatedStudents401 | UserControllerGetPaginatedStudents403>,
    ResponseConfig<UserControllerGetPaginatedStudentsQueryResponse>,
    typeof queryKey
  >({
    queryKey,
    queryFn: async ({ signal }) => {
      config.signal = signal
      return userControllerGetPaginatedStudentsSuspense(params, config)
    },
  })
}

/**
 * @description Retrieve students with pagination
 * @summary Get paginated students
 * {@link /users/students/paginated}
 */
export function useUserControllerGetPaginatedStudentsSuspense<
  TData = ResponseConfig<UserControllerGetPaginatedStudentsQueryResponse>,
  TQueryKey extends QueryKey = UserControllerGetPaginatedStudentsSuspenseQueryKey,
>(
  params?: UserControllerGetPaginatedStudentsQueryParams,
  options: {
    query?: Partial<
      UseSuspenseQueryOptions<
        ResponseConfig<UserControllerGetPaginatedStudentsQueryResponse>,
        ResponseErrorConfig<UserControllerGetPaginatedStudents401 | UserControllerGetPaginatedStudents403>,
        TData,
        TQueryKey
      >
    > & { client?: QueryClient }
    client?: Partial<RequestConfig> & { client?: typeof client }
  } = {},
) {
  const { query: { client: queryClient, ...queryOptions } = {}, client: config = {} } = options ?? {}
  const queryKey = queryOptions?.queryKey ?? userControllerGetPaginatedStudentsSuspenseQueryKey(params)

  const query = useSuspenseQuery(
    {
      ...(userControllerGetPaginatedStudentsSuspenseQueryOptions(params, config) as unknown as UseSuspenseQueryOptions),
      queryKey,
      ...(queryOptions as unknown as Omit<UseSuspenseQueryOptions, 'queryKey'>),
    },
    queryClient,
  ) as UseSuspenseQueryResult<TData, ResponseErrorConfig<UserControllerGetPaginatedStudents401 | UserControllerGetPaginatedStudents403>> & {
    queryKey: TQueryKey
  }

  query.queryKey = queryKey as TQueryKey

  return query
}