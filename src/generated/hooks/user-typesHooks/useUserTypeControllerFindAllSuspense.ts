/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import client from '../../../global/api/apiClient'
import type { RequestConfig, ResponseErrorConfig, ResponseConfig } from '../../../global/api/apiClient'
import type { QueryKey, QueryClient, UseSuspenseQueryOptions, UseSuspenseQueryResult } from '@tanstack/react-query'
import type {
  UserTypeControllerFindAllQueryResponse,
  UserTypeControllerFindAll401,
  UserTypeControllerFindAll403,
} from '../../types/user-typesController/UserTypeControllerFindAll.ts'
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'

export const userTypeControllerFindAllSuspenseQueryKey = () => [{ url: '/user-types' }] as const

export type UserTypeControllerFindAllSuspenseQueryKey = ReturnType<typeof userTypeControllerFindAllSuspenseQueryKey>

/**
 * @description Retrieve all user types
 * @summary Get all user types
 * {@link /user-types}
 */
export async function userTypeControllerFindAllSuspense(config: Partial<RequestConfig> & { client?: typeof client } = {}) {
  const { client: request = client, ...requestConfig } = config

  const res = await request<UserTypeControllerFindAllQueryResponse, ResponseErrorConfig<UserTypeControllerFindAll401 | UserTypeControllerFindAll403>, unknown>({
    method: 'GET',
    url: `/user-types`,
    ...requestConfig,
  })
  return res
}

export function userTypeControllerFindAllSuspenseQueryOptions(config: Partial<RequestConfig> & { client?: typeof client } = {}) {
  const queryKey = userTypeControllerFindAllSuspenseQueryKey()
  return queryOptions<
    ResponseConfig<UserTypeControllerFindAllQueryResponse>,
    ResponseErrorConfig<UserTypeControllerFindAll401 | UserTypeControllerFindAll403>,
    ResponseConfig<UserTypeControllerFindAllQueryResponse>,
    typeof queryKey
  >({
    queryKey,
    queryFn: async ({ signal }) => {
      config.signal = signal
      return userTypeControllerFindAllSuspense(config)
    },
  })
}

/**
 * @description Retrieve all user types
 * @summary Get all user types
 * {@link /user-types}
 */
export function useUserTypeControllerFindAllSuspense<
  TData = ResponseConfig<UserTypeControllerFindAllQueryResponse>,
  TQueryKey extends QueryKey = UserTypeControllerFindAllSuspenseQueryKey,
>(
  options: {
    query?: Partial<
      UseSuspenseQueryOptions<
        ResponseConfig<UserTypeControllerFindAllQueryResponse>,
        ResponseErrorConfig<UserTypeControllerFindAll401 | UserTypeControllerFindAll403>,
        TData,
        TQueryKey
      >
    > & { client?: QueryClient }
    client?: Partial<RequestConfig> & { client?: typeof client }
  } = {},
) {
  const { query: { client: queryClient, ...queryOptions } = {}, client: config = {} } = options ?? {}
  const queryKey = queryOptions?.queryKey ?? userTypeControllerFindAllSuspenseQueryKey()

  const query = useSuspenseQuery(
    {
      ...(userTypeControllerFindAllSuspenseQueryOptions(config) as unknown as UseSuspenseQueryOptions),
      queryKey,
      ...(queryOptions as unknown as Omit<UseSuspenseQueryOptions, 'queryKey'>),
    },
    queryClient,
  ) as UseSuspenseQueryResult<TData, ResponseErrorConfig<UserTypeControllerFindAll401 | UserTypeControllerFindAll403>> & { queryKey: TQueryKey }

  query.queryKey = queryKey as TQueryKey

  return query
}