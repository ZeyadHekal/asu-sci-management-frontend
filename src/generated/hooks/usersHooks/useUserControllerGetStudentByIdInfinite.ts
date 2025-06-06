/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import client from '../../../global/api/apiClient'
import type { RequestConfig, ResponseErrorConfig, ResponseConfig } from '../../../global/api/apiClient'
import type { InfiniteData, QueryKey, QueryClient, InfiniteQueryObserverOptions, UseInfiniteQueryResult } from '@tanstack/react-query'
import type {
  UserControllerGetStudentByIdQueryResponse,
  UserControllerGetStudentByIdPathParams,
  UserControllerGetStudentById401,
  UserControllerGetStudentById403,
  UserControllerGetStudentById404,
} from '../../types/usersController/UserControllerGetStudentById.ts'
import { infiniteQueryOptions, useInfiniteQuery } from '@tanstack/react-query'

export const userControllerGetStudentByIdInfiniteQueryKey = (id: UserControllerGetStudentByIdPathParams['id']) =>
  [{ url: '/users/students/:id', params: { id: id } }] as const

export type UserControllerGetStudentByIdInfiniteQueryKey = ReturnType<typeof userControllerGetStudentByIdInfiniteQueryKey>

/**
 * @description Retrieve a student by their ID
 * @summary Get student by ID
 * {@link /users/students/:id}
 */
export async function userControllerGetStudentByIdInfinite(
  id: UserControllerGetStudentByIdPathParams['id'],
  config: Partial<RequestConfig> & { client?: typeof client } = {},
) {
  const { client: request = client, ...requestConfig } = config

  const res = await request<
    UserControllerGetStudentByIdQueryResponse,
    ResponseErrorConfig<UserControllerGetStudentById401 | UserControllerGetStudentById403 | UserControllerGetStudentById404>,
    unknown
  >({ method: 'GET', url: `/users/students/${id}`, ...requestConfig })
  return res
}

export function userControllerGetStudentByIdInfiniteQueryOptions(
  id: UserControllerGetStudentByIdPathParams['id'],
  config: Partial<RequestConfig> & { client?: typeof client } = {},
) {
  const queryKey = userControllerGetStudentByIdInfiniteQueryKey(id)
  return infiniteQueryOptions<
    ResponseConfig<UserControllerGetStudentByIdQueryResponse>,
    ResponseErrorConfig<UserControllerGetStudentById401 | UserControllerGetStudentById403 | UserControllerGetStudentById404>,
    ResponseConfig<UserControllerGetStudentByIdQueryResponse>,
    typeof queryKey
  >({
    enabled: !!id,
    queryKey,
    queryFn: async ({ signal }) => {
      config.signal = signal
      return userControllerGetStudentByIdInfinite(id, config)
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage['page'],
    getPreviousPageParam: (firstPage) => firstPage['page'],
  })
}

/**
 * @description Retrieve a student by their ID
 * @summary Get student by ID
 * {@link /users/students/:id}
 */
export function useUserControllerGetStudentByIdInfinite<
  TData = InfiniteData<ResponseConfig<UserControllerGetStudentByIdQueryResponse>>,
  TQueryData = ResponseConfig<UserControllerGetStudentByIdQueryResponse>,
  TQueryKey extends QueryKey = UserControllerGetStudentByIdInfiniteQueryKey,
>(
  id: UserControllerGetStudentByIdPathParams['id'],
  options: {
    query?: Partial<
      InfiniteQueryObserverOptions<
        ResponseConfig<UserControllerGetStudentByIdQueryResponse>,
        ResponseErrorConfig<UserControllerGetStudentById401 | UserControllerGetStudentById403 | UserControllerGetStudentById404>,
        TData,
        TQueryData,
        TQueryKey
      >
    > & { client?: QueryClient }
    client?: Partial<RequestConfig> & { client?: typeof client }
  } = {},
) {
  const { query: { client: queryClient, ...queryOptions } = {}, client: config = {} } = options ?? {}
  const queryKey = queryOptions?.queryKey ?? userControllerGetStudentByIdInfiniteQueryKey(id)

  const query = useInfiniteQuery(
    {
      ...(userControllerGetStudentByIdInfiniteQueryOptions(id, config) as unknown as InfiniteQueryObserverOptions),
      queryKey,
      ...(queryOptions as unknown as Omit<InfiniteQueryObserverOptions, 'queryKey'>),
    },
    queryClient,
  ) as UseInfiniteQueryResult<
    TData,
    ResponseErrorConfig<UserControllerGetStudentById401 | UserControllerGetStudentById403 | UserControllerGetStudentById404>
  > & { queryKey: TQueryKey }

  query.queryKey = queryKey as TQueryKey

  return query
}