/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import client from '../../../global/api/apiClient'
import type { RequestConfig, ResponseErrorConfig, ResponseConfig } from '../../../global/api/apiClient'
import type { QueryKey, QueryClient, QueryObserverOptions, UseQueryResult } from '@tanstack/react-query'
import type {
  DeviceControllerGetSoftwaresQueryResponse,
  DeviceControllerGetSoftwaresPathParams,
  DeviceControllerGetSoftwaresQueryParams,
  DeviceControllerGetSoftwares401,
  DeviceControllerGetSoftwares403,
  DeviceControllerGetSoftwares404,
} from '../../types/devicesController/DeviceControllerGetSoftwares.ts'
import { queryOptions, useQuery } from '@tanstack/react-query'

export const deviceControllerGetSoftwaresQueryKey = (
  device_id: DeviceControllerGetSoftwaresPathParams['device_id'],
  params?: DeviceControllerGetSoftwaresQueryParams,
) => [{ url: '/devices/:device_id/softwares', params: { device_id: device_id } }, ...(params ? [params] : [])] as const

export type DeviceControllerGetSoftwaresQueryKey = ReturnType<typeof deviceControllerGetSoftwaresQueryKey>

/**
 * @description Retrieve all software installed on a specific device
 * @summary Get device softwares
 * {@link /devices/:device_id/softwares}
 */
export async function deviceControllerGetSoftwares(
  device_id: DeviceControllerGetSoftwaresPathParams['device_id'],
  params?: DeviceControllerGetSoftwaresQueryParams,
  config: Partial<RequestConfig> & { client?: typeof client } = {},
) {
  const { client: request = client, ...requestConfig } = config

  const res = await request<
    DeviceControllerGetSoftwaresQueryResponse,
    ResponseErrorConfig<DeviceControllerGetSoftwares401 | DeviceControllerGetSoftwares403 | DeviceControllerGetSoftwares404>,
    unknown
  >({ method: 'GET', url: `/devices/${device_id}/softwares`, params, ...requestConfig })
  return res
}

export function deviceControllerGetSoftwaresQueryOptions(
  device_id: DeviceControllerGetSoftwaresPathParams['device_id'],
  params?: DeviceControllerGetSoftwaresQueryParams,
  config: Partial<RequestConfig> & { client?: typeof client } = {},
) {
  const queryKey = deviceControllerGetSoftwaresQueryKey(device_id, params)
  return queryOptions<
    ResponseConfig<DeviceControllerGetSoftwaresQueryResponse>,
    ResponseErrorConfig<DeviceControllerGetSoftwares401 | DeviceControllerGetSoftwares403 | DeviceControllerGetSoftwares404>,
    ResponseConfig<DeviceControllerGetSoftwaresQueryResponse>,
    typeof queryKey
  >({
    enabled: !!device_id,
    queryKey,
    queryFn: async ({ signal }) => {
      config.signal = signal
      return deviceControllerGetSoftwares(device_id, params, config)
    },
  })
}

/**
 * @description Retrieve all software installed on a specific device
 * @summary Get device softwares
 * {@link /devices/:device_id/softwares}
 */
export function useDeviceControllerGetSoftwares<
  TData = ResponseConfig<DeviceControllerGetSoftwaresQueryResponse>,
  TQueryData = ResponseConfig<DeviceControllerGetSoftwaresQueryResponse>,
  TQueryKey extends QueryKey = DeviceControllerGetSoftwaresQueryKey,
>(
  device_id: DeviceControllerGetSoftwaresPathParams['device_id'],
  params?: DeviceControllerGetSoftwaresQueryParams,
  options: {
    query?: Partial<
      QueryObserverOptions<
        ResponseConfig<DeviceControllerGetSoftwaresQueryResponse>,
        ResponseErrorConfig<DeviceControllerGetSoftwares401 | DeviceControllerGetSoftwares403 | DeviceControllerGetSoftwares404>,
        TData,
        TQueryData,
        TQueryKey
      >
    > & { client?: QueryClient }
    client?: Partial<RequestConfig> & { client?: typeof client }
  } = {},
) {
  const { query: { client: queryClient, ...queryOptions } = {}, client: config = {} } = options ?? {}
  const queryKey = queryOptions?.queryKey ?? deviceControllerGetSoftwaresQueryKey(device_id, params)

  const query = useQuery(
    {
      ...(deviceControllerGetSoftwaresQueryOptions(device_id, params, config) as unknown as QueryObserverOptions),
      queryKey,
      ...(queryOptions as unknown as Omit<QueryObserverOptions, 'queryKey'>),
    },
    queryClient,
  ) as UseQueryResult<TData, ResponseErrorConfig<DeviceControllerGetSoftwares401 | DeviceControllerGetSoftwares403 | DeviceControllerGetSoftwares404>> & {
    queryKey: TQueryKey
  }

  query.queryKey = queryKey as TQueryKey

  return query
}