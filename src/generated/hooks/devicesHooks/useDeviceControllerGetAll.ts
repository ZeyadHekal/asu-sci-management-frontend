/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import client from '../../../global/api/apiClient'
import type { RequestConfig, ResponseErrorConfig, ResponseConfig } from '../../../global/api/apiClient'
import type { QueryKey, QueryClient, QueryObserverOptions, UseQueryResult } from '@tanstack/react-query'
import type {
  DeviceControllerGetAllQueryResponse,
  DeviceControllerGetAll401,
  DeviceControllerGetAll403,
} from '../../types/devicesController/DeviceControllerGetAll.ts'
import { queryOptions, useQuery } from '@tanstack/react-query'

export const deviceControllerGetAllQueryKey = () => [{ url: '/devices' }] as const

export type DeviceControllerGetAllQueryKey = ReturnType<typeof deviceControllerGetAllQueryKey>

/**
 * @description Retrieve all devices
 * @summary Get all devices
 * {@link /devices}
 */
export async function deviceControllerGetAll(config: Partial<RequestConfig> & { client?: typeof client } = {}) {
  const { client: request = client, ...requestConfig } = config

  const res = await request<DeviceControllerGetAllQueryResponse, ResponseErrorConfig<DeviceControllerGetAll401 | DeviceControllerGetAll403>, unknown>({
    method: 'GET',
    url: `/devices`,
    ...requestConfig,
  })
  return res
}

export function deviceControllerGetAllQueryOptions(config: Partial<RequestConfig> & { client?: typeof client } = {}) {
  const queryKey = deviceControllerGetAllQueryKey()
  return queryOptions<
    ResponseConfig<DeviceControllerGetAllQueryResponse>,
    ResponseErrorConfig<DeviceControllerGetAll401 | DeviceControllerGetAll403>,
    ResponseConfig<DeviceControllerGetAllQueryResponse>,
    typeof queryKey
  >({
    queryKey,
    queryFn: async ({ signal }) => {
      config.signal = signal
      return deviceControllerGetAll(config)
    },
  })
}

/**
 * @description Retrieve all devices
 * @summary Get all devices
 * {@link /devices}
 */
export function useDeviceControllerGetAll<
  TData = ResponseConfig<DeviceControllerGetAllQueryResponse>,
  TQueryData = ResponseConfig<DeviceControllerGetAllQueryResponse>,
  TQueryKey extends QueryKey = DeviceControllerGetAllQueryKey,
>(
  options: {
    query?: Partial<
      QueryObserverOptions<
        ResponseConfig<DeviceControllerGetAllQueryResponse>,
        ResponseErrorConfig<DeviceControllerGetAll401 | DeviceControllerGetAll403>,
        TData,
        TQueryData,
        TQueryKey
      >
    > & { client?: QueryClient }
    client?: Partial<RequestConfig> & { client?: typeof client }
  } = {},
) {
  const { query: { client: queryClient, ...queryOptions } = {}, client: config = {} } = options ?? {}
  const queryKey = queryOptions?.queryKey ?? deviceControllerGetAllQueryKey()

  const query = useQuery(
    {
      ...(deviceControllerGetAllQueryOptions(config) as unknown as QueryObserverOptions),
      queryKey,
      ...(queryOptions as unknown as Omit<QueryObserverOptions, 'queryKey'>),
    },
    queryClient,
  ) as UseQueryResult<TData, ResponseErrorConfig<DeviceControllerGetAll401 | DeviceControllerGetAll403>> & { queryKey: TQueryKey }

  query.queryKey = queryKey as TQueryKey

  return query
}