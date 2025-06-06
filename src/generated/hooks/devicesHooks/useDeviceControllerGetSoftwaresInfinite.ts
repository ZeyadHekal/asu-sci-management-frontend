/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import client from '../../../global/api/apiClient'
import type { RequestConfig, ResponseErrorConfig, ResponseConfig } from '../../../global/api/apiClient'
import type { InfiniteData, QueryKey, QueryClient, InfiniteQueryObserverOptions, UseInfiniteQueryResult } from '@tanstack/react-query'
import type {
  DeviceControllerGetSoftwaresQueryResponse,
  DeviceControllerGetSoftwaresPathParams,
  DeviceControllerGetSoftwaresQueryParams,
  DeviceControllerGetSoftwares401,
  DeviceControllerGetSoftwares403,
  DeviceControllerGetSoftwares404,
} from '../../types/devicesController/DeviceControllerGetSoftwares.ts'
import { infiniteQueryOptions, useInfiniteQuery } from '@tanstack/react-query'

export const deviceControllerGetSoftwaresInfiniteQueryKey = (
  device_id: DeviceControllerGetSoftwaresPathParams['device_id'],
  params?: DeviceControllerGetSoftwaresQueryParams,
) => [{ url: '/devices/:device_id/softwares', params: { device_id: device_id } }, ...(params ? [params] : [])] as const

export type DeviceControllerGetSoftwaresInfiniteQueryKey = ReturnType<typeof deviceControllerGetSoftwaresInfiniteQueryKey>

/**
 * @description Retrieve all software installed on a specific device
 * @summary Get device softwares
 * {@link /devices/:device_id/softwares}
 */
export async function deviceControllerGetSoftwaresInfinite(
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

export function deviceControllerGetSoftwaresInfiniteQueryOptions(
  device_id: DeviceControllerGetSoftwaresPathParams['device_id'],
  params?: DeviceControllerGetSoftwaresQueryParams,
  config: Partial<RequestConfig> & { client?: typeof client } = {},
) {
  const queryKey = deviceControllerGetSoftwaresInfiniteQueryKey(device_id, params)
  return infiniteQueryOptions<
    ResponseConfig<DeviceControllerGetSoftwaresQueryResponse>,
    ResponseErrorConfig<DeviceControllerGetSoftwares401 | DeviceControllerGetSoftwares403 | DeviceControllerGetSoftwares404>,
    ResponseConfig<DeviceControllerGetSoftwaresQueryResponse>,
    typeof queryKey,
    number
  >({
    enabled: !!device_id,
    queryKey,
    queryFn: async ({ signal, pageParam }) => {
      config.signal = signal

      if (params) {
        params['limit'] = pageParam as unknown as DeviceControllerGetSoftwaresQueryParams['limit']
      }
      return deviceControllerGetSoftwaresInfinite(device_id, params, config)
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage['page'],
    getPreviousPageParam: (firstPage) => firstPage['page'],
  })
}

/**
 * @description Retrieve all software installed on a specific device
 * @summary Get device softwares
 * {@link /devices/:device_id/softwares}
 */
export function useDeviceControllerGetSoftwaresInfinite<
  TData = InfiniteData<ResponseConfig<DeviceControllerGetSoftwaresQueryResponse>>,
  TQueryData = ResponseConfig<DeviceControllerGetSoftwaresQueryResponse>,
  TQueryKey extends QueryKey = DeviceControllerGetSoftwaresInfiniteQueryKey,
>(
  device_id: DeviceControllerGetSoftwaresPathParams['device_id'],
  params?: DeviceControllerGetSoftwaresQueryParams,
  options: {
    query?: Partial<
      InfiniteQueryObserverOptions<
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
  const queryKey = queryOptions?.queryKey ?? deviceControllerGetSoftwaresInfiniteQueryKey(device_id, params)

  const query = useInfiniteQuery(
    {
      ...(deviceControllerGetSoftwaresInfiniteQueryOptions(device_id, params, config) as unknown as InfiniteQueryObserverOptions),
      queryKey,
      ...(queryOptions as unknown as Omit<InfiniteQueryObserverOptions, 'queryKey'>),
    },
    queryClient,
  ) as UseInfiniteQueryResult<
    TData,
    ResponseErrorConfig<DeviceControllerGetSoftwares401 | DeviceControllerGetSoftwares403 | DeviceControllerGetSoftwares404>
  > & { queryKey: TQueryKey }

  query.queryKey = queryKey as TQueryKey

  return query
}