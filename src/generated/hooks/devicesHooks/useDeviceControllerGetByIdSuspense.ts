/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import client from '../../../global/api/apiClient'
import type { RequestConfig, ResponseErrorConfig, ResponseConfig } from '../../../global/api/apiClient'
import type { QueryKey, QueryClient, UseSuspenseQueryOptions, UseSuspenseQueryResult } from '@tanstack/react-query'
import type {
  DeviceControllerGetByIdQueryResponse,
  DeviceControllerGetByIdPathParams,
  DeviceControllerGetById401,
  DeviceControllerGetById403,
  DeviceControllerGetById404,
} from '../../types/devicesController/DeviceControllerGetById.ts'
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'

export const deviceControllerGetByIdSuspenseQueryKey = (device_id: DeviceControllerGetByIdPathParams['device_id']) =>
  [{ url: '/devices/:device_id', params: { device_id: device_id } }] as const

export type DeviceControllerGetByIdSuspenseQueryKey = ReturnType<typeof deviceControllerGetByIdSuspenseQueryKey>

/**
 * @description Retrieve a device by its ID
 * @summary Get device by ID
 * {@link /devices/:device_id}
 */
export async function deviceControllerGetByIdSuspense(
  device_id: DeviceControllerGetByIdPathParams['device_id'],
  config: Partial<RequestConfig> & { client?: typeof client } = {},
) {
  const { client: request = client, ...requestConfig } = config

  const res = await request<
    DeviceControllerGetByIdQueryResponse,
    ResponseErrorConfig<DeviceControllerGetById401 | DeviceControllerGetById403 | DeviceControllerGetById404>,
    unknown
  >({ method: 'GET', url: `/devices/${device_id}`, ...requestConfig })
  return res
}

export function deviceControllerGetByIdSuspenseQueryOptions(
  device_id: DeviceControllerGetByIdPathParams['device_id'],
  config: Partial<RequestConfig> & { client?: typeof client } = {},
) {
  const queryKey = deviceControllerGetByIdSuspenseQueryKey(device_id)
  return queryOptions<
    ResponseConfig<DeviceControllerGetByIdQueryResponse>,
    ResponseErrorConfig<DeviceControllerGetById401 | DeviceControllerGetById403 | DeviceControllerGetById404>,
    ResponseConfig<DeviceControllerGetByIdQueryResponse>,
    typeof queryKey
  >({
    enabled: !!device_id,
    queryKey,
    queryFn: async ({ signal }) => {
      config.signal = signal
      return deviceControllerGetByIdSuspense(device_id, config)
    },
  })
}

/**
 * @description Retrieve a device by its ID
 * @summary Get device by ID
 * {@link /devices/:device_id}
 */
export function useDeviceControllerGetByIdSuspense<
  TData = ResponseConfig<DeviceControllerGetByIdQueryResponse>,
  TQueryKey extends QueryKey = DeviceControllerGetByIdSuspenseQueryKey,
>(
  device_id: DeviceControllerGetByIdPathParams['device_id'],
  options: {
    query?: Partial<
      UseSuspenseQueryOptions<
        ResponseConfig<DeviceControllerGetByIdQueryResponse>,
        ResponseErrorConfig<DeviceControllerGetById401 | DeviceControllerGetById403 | DeviceControllerGetById404>,
        TData,
        TQueryKey
      >
    > & { client?: QueryClient }
    client?: Partial<RequestConfig> & { client?: typeof client }
  } = {},
) {
  const { query: { client: queryClient, ...queryOptions } = {}, client: config = {} } = options ?? {}
  const queryKey = queryOptions?.queryKey ?? deviceControllerGetByIdSuspenseQueryKey(device_id)

  const query = useSuspenseQuery(
    {
      ...(deviceControllerGetByIdSuspenseQueryOptions(device_id, config) as unknown as UseSuspenseQueryOptions),
      queryKey,
      ...(queryOptions as unknown as Omit<UseSuspenseQueryOptions, 'queryKey'>),
    },
    queryClient,
  ) as UseSuspenseQueryResult<TData, ResponseErrorConfig<DeviceControllerGetById401 | DeviceControllerGetById403 | DeviceControllerGetById404>> & {
    queryKey: TQueryKey
  }

  query.queryKey = queryKey as TQueryKey

  return query
}