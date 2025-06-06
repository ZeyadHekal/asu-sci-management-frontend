/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import client from '../../../global/api/apiClient'
import type { RequestConfig, ResponseErrorConfig, ResponseConfig } from '../../../global/api/apiClient'
import type { QueryKey, QueryClient, UseSuspenseQueryOptions, UseSuspenseQueryResult } from '@tanstack/react-query'
import type {
  UserTypeControllerFindAllWithPrivilegesQueryResponse,
  UserTypeControllerFindAllWithPrivilegesQueryParams,
  UserTypeControllerFindAllWithPrivileges401,
  UserTypeControllerFindAllWithPrivileges403,
} from '../../types/user-typesController/UserTypeControllerFindAllWithPrivileges.ts'
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'

export const userTypeControllerFindAllWithPrivilegesSuspenseQueryKey = (params: UserTypeControllerFindAllWithPrivilegesQueryParams) =>
  [{ url: '/user-types/with-privileges' }, ...(params ? [params] : [])] as const

export type UserTypeControllerFindAllWithPrivilegesSuspenseQueryKey = ReturnType<typeof userTypeControllerFindAllWithPrivilegesSuspenseQueryKey>

/**
 * @description Retrieve all user types with their associated privileges, with search and pagination
 * @summary Get all user types with privileges
 * {@link /user-types/with-privileges}
 */
export async function userTypeControllerFindAllWithPrivilegesSuspense(
  params: UserTypeControllerFindAllWithPrivilegesQueryParams,
  config: Partial<RequestConfig> & { client?: typeof client } = {},
) {
  const { client: request = client, ...requestConfig } = config

  const res = await request<
    UserTypeControllerFindAllWithPrivilegesQueryResponse,
    ResponseErrorConfig<UserTypeControllerFindAllWithPrivileges401 | UserTypeControllerFindAllWithPrivileges403>,
    unknown
  >({ method: 'GET', url: `/user-types/with-privileges`, params, ...requestConfig })
  return res
}

export function userTypeControllerFindAllWithPrivilegesSuspenseQueryOptions(
  params: UserTypeControllerFindAllWithPrivilegesQueryParams,
  config: Partial<RequestConfig> & { client?: typeof client } = {},
) {
  const queryKey = userTypeControllerFindAllWithPrivilegesSuspenseQueryKey(params)
  return queryOptions<
    ResponseConfig<UserTypeControllerFindAllWithPrivilegesQueryResponse>,
    ResponseErrorConfig<UserTypeControllerFindAllWithPrivileges401 | UserTypeControllerFindAllWithPrivileges403>,
    ResponseConfig<UserTypeControllerFindAllWithPrivilegesQueryResponse>,
    typeof queryKey
  >({
    enabled: !!params,
    queryKey,
    queryFn: async ({ signal }) => {
      config.signal = signal
      return userTypeControllerFindAllWithPrivilegesSuspense(params, config)
    },
  })
}

/**
 * @description Retrieve all user types with their associated privileges, with search and pagination
 * @summary Get all user types with privileges
 * {@link /user-types/with-privileges}
 */
export function useUserTypeControllerFindAllWithPrivilegesSuspense<
  TData = ResponseConfig<UserTypeControllerFindAllWithPrivilegesQueryResponse>,
  TQueryKey extends QueryKey = UserTypeControllerFindAllWithPrivilegesSuspenseQueryKey,
>(
  params: UserTypeControllerFindAllWithPrivilegesQueryParams,
  options: {
    query?: Partial<
      UseSuspenseQueryOptions<
        ResponseConfig<UserTypeControllerFindAllWithPrivilegesQueryResponse>,
        ResponseErrorConfig<UserTypeControllerFindAllWithPrivileges401 | UserTypeControllerFindAllWithPrivileges403>,
        TData,
        TQueryKey
      >
    > & { client?: QueryClient }
    client?: Partial<RequestConfig> & { client?: typeof client }
  } = {},
) {
  const { query: { client: queryClient, ...queryOptions } = {}, client: config = {} } = options ?? {}
  const queryKey = queryOptions?.queryKey ?? userTypeControllerFindAllWithPrivilegesSuspenseQueryKey(params)

  const query = useSuspenseQuery(
    {
      ...(userTypeControllerFindAllWithPrivilegesSuspenseQueryOptions(params, config) as unknown as UseSuspenseQueryOptions),
      queryKey,
      ...(queryOptions as unknown as Omit<UseSuspenseQueryOptions, 'queryKey'>),
    },
    queryClient,
  ) as UseSuspenseQueryResult<TData, ResponseErrorConfig<UserTypeControllerFindAllWithPrivileges401 | UserTypeControllerFindAllWithPrivileges403>> & {
    queryKey: TQueryKey
  }

  query.queryKey = queryKey as TQueryKey

  return query
}