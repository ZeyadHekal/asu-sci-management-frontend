/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import client from '../../../global/api/apiClient'
import type { RequestConfig, ResponseErrorConfig, ResponseConfig } from '../../../global/api/apiClient'
import type { QueryKey, QueryClient, QueryObserverOptions, UseQueryResult } from '@tanstack/react-query'
import type { LabControllerGetAllQueryResponse, LabControllerGetAll401, LabControllerGetAll403 } from '../../types/labsController/LabControllerGetAll.ts'
import { queryOptions, useQuery } from '@tanstack/react-query'

export const labControllerGetAllQueryKey = () => [{ url: '/labs' }] as const

export type LabControllerGetAllQueryKey = ReturnType<typeof labControllerGetAllQueryKey>

/**
 * @description Retrieve all labs
 * @summary Get all labs
 * {@link /labs}
 */
export async function labControllerGetAll(config: Partial<RequestConfig> & { client?: typeof client } = {}) {
  const { client: request = client, ...requestConfig } = config

  const res = await request<LabControllerGetAllQueryResponse, ResponseErrorConfig<LabControllerGetAll401 | LabControllerGetAll403>, unknown>({
    method: 'GET',
    url: `/labs`,
    ...requestConfig,
  })
  return res
}

export function labControllerGetAllQueryOptions(config: Partial<RequestConfig> & { client?: typeof client } = {}) {
  const queryKey = labControllerGetAllQueryKey()
  return queryOptions<
    ResponseConfig<LabControllerGetAllQueryResponse>,
    ResponseErrorConfig<LabControllerGetAll401 | LabControllerGetAll403>,
    ResponseConfig<LabControllerGetAllQueryResponse>,
    typeof queryKey
  >({
    queryKey,
    queryFn: async ({ signal }) => {
      config.signal = signal
      return labControllerGetAll(config)
    },
  })
}

/**
 * @description Retrieve all labs
 * @summary Get all labs
 * {@link /labs}
 */
export function useLabControllerGetAll<
  TData = ResponseConfig<LabControllerGetAllQueryResponse>,
  TQueryData = ResponseConfig<LabControllerGetAllQueryResponse>,
  TQueryKey extends QueryKey = LabControllerGetAllQueryKey,
>(
  options: {
    query?: Partial<
      QueryObserverOptions<
        ResponseConfig<LabControllerGetAllQueryResponse>,
        ResponseErrorConfig<LabControllerGetAll401 | LabControllerGetAll403>,
        TData,
        TQueryData,
        TQueryKey
      >
    > & { client?: QueryClient }
    client?: Partial<RequestConfig> & { client?: typeof client }
  } = {},
) {
  const { query: { client: queryClient, ...queryOptions } = {}, client: config = {} } = options ?? {}
  const queryKey = queryOptions?.queryKey ?? labControllerGetAllQueryKey()

  const query = useQuery(
    {
      ...(labControllerGetAllQueryOptions(config) as unknown as QueryObserverOptions),
      queryKey,
      ...(queryOptions as unknown as Omit<QueryObserverOptions, 'queryKey'>),
    },
    queryClient,
  ) as UseQueryResult<TData, ResponseErrorConfig<LabControllerGetAll401 | LabControllerGetAll403>> & { queryKey: TQueryKey }

  query.queryKey = queryKey as TQueryKey

  return query
}