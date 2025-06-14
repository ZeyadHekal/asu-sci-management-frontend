/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import client from '../../../global/api/apiClient'
import type { RequestConfig, ResponseErrorConfig, ResponseConfig } from '../../../global/api/apiClient'
import type { QueryKey, QueryClient, UseSuspenseQueryOptions, UseSuspenseQueryResult } from '@tanstack/react-query'
import type {
  MaintenanceHistoryControllerGetPaginatedQueryResponse,
  MaintenanceHistoryControllerGetPaginatedQueryParams,
  MaintenanceHistoryControllerGetPaginated401,
  MaintenanceHistoryControllerGetPaginated403,
} from '../../types/device-maintenance-historyController/MaintenanceHistoryControllerGetPaginated.ts'
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'

export const maintenanceHistoryControllerGetPaginatedSuspenseQueryKey = (params?: MaintenanceHistoryControllerGetPaginatedQueryParams) =>
  [{ url: '/device-maintenance-history/paginated' }, ...(params ? [params] : [])] as const

export type MaintenanceHistoryControllerGetPaginatedSuspenseQueryKey = ReturnType<typeof maintenanceHistoryControllerGetPaginatedSuspenseQueryKey>

/**
 * @description Retrieve maintenance history with pagination
 * @summary Get paginated maintenance history
 * {@link /device-maintenance-history/paginated}
 */
export async function maintenanceHistoryControllerGetPaginatedSuspense(
  params?: MaintenanceHistoryControllerGetPaginatedQueryParams,
  config: Partial<RequestConfig> & { client?: typeof client } = {},
) {
  const { client: request = client, ...requestConfig } = config

  const res = await request<
    MaintenanceHistoryControllerGetPaginatedQueryResponse,
    ResponseErrorConfig<MaintenanceHistoryControllerGetPaginated401 | MaintenanceHistoryControllerGetPaginated403>,
    unknown
  >({ method: 'GET', url: `/device-maintenance-history/paginated`, params, ...requestConfig })
  return res
}

export function maintenanceHistoryControllerGetPaginatedSuspenseQueryOptions(
  params?: MaintenanceHistoryControllerGetPaginatedQueryParams,
  config: Partial<RequestConfig> & { client?: typeof client } = {},
) {
  const queryKey = maintenanceHistoryControllerGetPaginatedSuspenseQueryKey(params)
  return queryOptions<
    ResponseConfig<MaintenanceHistoryControllerGetPaginatedQueryResponse>,
    ResponseErrorConfig<MaintenanceHistoryControllerGetPaginated401 | MaintenanceHistoryControllerGetPaginated403>,
    ResponseConfig<MaintenanceHistoryControllerGetPaginatedQueryResponse>,
    typeof queryKey
  >({
    queryKey,
    queryFn: async ({ signal }) => {
      config.signal = signal
      return maintenanceHistoryControllerGetPaginatedSuspense(params, config)
    },
  })
}

/**
 * @description Retrieve maintenance history with pagination
 * @summary Get paginated maintenance history
 * {@link /device-maintenance-history/paginated}
 */
export function useMaintenanceHistoryControllerGetPaginatedSuspense<
  TData = ResponseConfig<MaintenanceHistoryControllerGetPaginatedQueryResponse>,
  TQueryKey extends QueryKey = MaintenanceHistoryControllerGetPaginatedSuspenseQueryKey,
>(
  params?: MaintenanceHistoryControllerGetPaginatedQueryParams,
  options: {
    query?: Partial<
      UseSuspenseQueryOptions<
        ResponseConfig<MaintenanceHistoryControllerGetPaginatedQueryResponse>,
        ResponseErrorConfig<MaintenanceHistoryControllerGetPaginated401 | MaintenanceHistoryControllerGetPaginated403>,
        TData,
        TQueryKey
      >
    > & { client?: QueryClient }
    client?: Partial<RequestConfig> & { client?: typeof client }
  } = {},
) {
  const { query: { client: queryClient, ...queryOptions } = {}, client: config = {} } = options ?? {}
  const queryKey = queryOptions?.queryKey ?? maintenanceHistoryControllerGetPaginatedSuspenseQueryKey(params)

  const query = useSuspenseQuery(
    {
      ...(maintenanceHistoryControllerGetPaginatedSuspenseQueryOptions(params, config) as unknown as UseSuspenseQueryOptions),
      queryKey,
      ...(queryOptions as unknown as Omit<UseSuspenseQueryOptions, 'queryKey'>),
    },
    queryClient,
  ) as UseSuspenseQueryResult<TData, ResponseErrorConfig<MaintenanceHistoryControllerGetPaginated401 | MaintenanceHistoryControllerGetPaginated403>> & {
    queryKey: TQueryKey
  }

  query.queryKey = queryKey as TQueryKey

  return query
}