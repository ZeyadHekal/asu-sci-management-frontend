/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import client from '../../../global/api/apiClient'
import type { RequestConfig, ResponseErrorConfig, ResponseConfig } from '../../../global/api/apiClient'
import type { QueryKey, QueryClient, UseSuspenseQueryOptions, UseSuspenseQueryResult } from '@tanstack/react-query'
import type {
  DeviceControllerGetAllQueryResponse,
  DeviceControllerGetAll401,
  DeviceControllerGetAll403,
} from '../../types/devicesController/DeviceControllerGetAll.ts'
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'

export const deviceControllerGetAllSuspenseQueryKey = () => [{ url: '/devices' }] as const

export type DeviceControllerGetAllSuspenseQueryKey = ReturnType<typeof deviceControllerGetAllSuspenseQueryKey>

/**
 * @description Retrieve all devices
 * @summary Get all devices
 * {@link /devices}
 */
export async function deviceControllerGetAllSuspense(config: Partial<RequestConfig> & { client?: typeof client } = {}) {
  const { client: request = client, ...requestConfig } = config

  const res = await request<DeviceControllerGetAllQueryResponse, ResponseErrorConfig<DeviceControllerGetAll401 | DeviceControllerGetAll403>, unknown>({
    method: 'GET',
    url: `/devices`,
    ...requestConfig,
  })
  return res
}

export function deviceControllerGetAllSuspenseQueryOptions(config: Partial<RequestConfig> & { client?: typeof client } = {}) {
  const queryKey = deviceControllerGetAllSuspenseQueryKey()
  return queryOptions<
    ResponseConfig<DeviceControllerGetAllQueryResponse>,
    ResponseErrorConfig<DeviceControllerGetAll401 | DeviceControllerGetAll403>,
    ResponseConfig<DeviceControllerGetAllQueryResponse>,
    typeof queryKey
  >({
    queryKey,
    queryFn: async ({ signal }) => {
      config.signal = signal
      return deviceControllerGetAllSuspense(config)
    },
  })
}

/**
 * @description Retrieve all devices
 * @summary Get all devices
 * {@link /devices}
 */
export function useDeviceControllerGetAllSuspense<
  TData = ResponseConfig<DeviceControllerGetAllQueryResponse>,
  TQueryKey extends QueryKey = DeviceControllerGetAllSuspenseQueryKey,
>(
  options: {
    query?: Partial<
      UseSuspenseQueryOptions<
        ResponseConfig<DeviceControllerGetAllQueryResponse>,
        ResponseErrorConfig<DeviceControllerGetAll401 | DeviceControllerGetAll403>,
        TData,
        TQueryKey
      >
    > & { client?: QueryClient }
    client?: Partial<RequestConfig> & { client?: typeof client }
  } = {},
) {
  const { query: { client: queryClient, ...queryOptions } = {}, client: config = {} } = options ?? {}
  const queryKey = queryOptions?.queryKey ?? deviceControllerGetAllSuspenseQueryKey()

  const query = useSuspenseQuery(
    {
      ...(deviceControllerGetAllSuspenseQueryOptions(config) as unknown as UseSuspenseQueryOptions),
      queryKey,
      ...(queryOptions as unknown as Omit<UseSuspenseQueryOptions, 'queryKey'>),
    },
    queryClient,
  ) as UseSuspenseQueryResult<TData, ResponseErrorConfig<DeviceControllerGetAll401 | DeviceControllerGetAll403>> & { queryKey: TQueryKey }

  query.queryKey = queryKey as TQueryKey

  return query
}