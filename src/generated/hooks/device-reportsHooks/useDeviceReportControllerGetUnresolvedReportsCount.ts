/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import client from '../../../global/api/apiClient'
import type { RequestConfig, ResponseErrorConfig, ResponseConfig } from '../../../global/api/apiClient'
import type { QueryKey, QueryClient, QueryObserverOptions, UseQueryResult } from '@tanstack/react-query'
import type {
  DeviceReportControllerGetUnresolvedReportsCountQueryResponse,
  DeviceReportControllerGetUnresolvedReportsCountPathParams,
  DeviceReportControllerGetUnresolvedReportsCount401,
  DeviceReportControllerGetUnresolvedReportsCount403,
} from '../../types/device-reportsController/DeviceReportControllerGetUnresolvedReportsCount.ts'
import { queryOptions, useQuery } from '@tanstack/react-query'

export const deviceReportControllerGetUnresolvedReportsCountQueryKey = (device_id: DeviceReportControllerGetUnresolvedReportsCountPathParams['device_id']) =>
  [{ url: '/device-reports/device/:device_id/unresolved-count', params: { device_id: device_id } }] as const

export type DeviceReportControllerGetUnresolvedReportsCountQueryKey = ReturnType<typeof deviceReportControllerGetUnresolvedReportsCountQueryKey>

/**
 * @description Get count of unresolved reports for a specific device (Admin/Management)
 * @summary Get unresolved reports count for device
 * {@link /device-reports/device/:device_id/unresolved-count}
 */
export async function deviceReportControllerGetUnresolvedReportsCount(
  device_id: DeviceReportControllerGetUnresolvedReportsCountPathParams['device_id'],
  config: Partial<RequestConfig> & { client?: typeof client } = {},
) {
  const { client: request = client, ...requestConfig } = config

  const res = await request<
    DeviceReportControllerGetUnresolvedReportsCountQueryResponse,
    ResponseErrorConfig<DeviceReportControllerGetUnresolvedReportsCount401 | DeviceReportControllerGetUnresolvedReportsCount403>,
    unknown
  >({ method: 'GET', url: `/device-reports/device/${device_id}/unresolved-count`, ...requestConfig })
  return res
}

export function deviceReportControllerGetUnresolvedReportsCountQueryOptions(
  device_id: DeviceReportControllerGetUnresolvedReportsCountPathParams['device_id'],
  config: Partial<RequestConfig> & { client?: typeof client } = {},
) {
  const queryKey = deviceReportControllerGetUnresolvedReportsCountQueryKey(device_id)
  return queryOptions<
    ResponseConfig<DeviceReportControllerGetUnresolvedReportsCountQueryResponse>,
    ResponseErrorConfig<DeviceReportControllerGetUnresolvedReportsCount401 | DeviceReportControllerGetUnresolvedReportsCount403>,
    ResponseConfig<DeviceReportControllerGetUnresolvedReportsCountQueryResponse>,
    typeof queryKey
  >({
    enabled: !!device_id,
    queryKey,
    queryFn: async ({ signal }) => {
      config.signal = signal
      return deviceReportControllerGetUnresolvedReportsCount(device_id, config)
    },
  })
}

/**
 * @description Get count of unresolved reports for a specific device (Admin/Management)
 * @summary Get unresolved reports count for device
 * {@link /device-reports/device/:device_id/unresolved-count}
 */
export function useDeviceReportControllerGetUnresolvedReportsCount<
  TData = ResponseConfig<DeviceReportControllerGetUnresolvedReportsCountQueryResponse>,
  TQueryData = ResponseConfig<DeviceReportControllerGetUnresolvedReportsCountQueryResponse>,
  TQueryKey extends QueryKey = DeviceReportControllerGetUnresolvedReportsCountQueryKey,
>(
  device_id: DeviceReportControllerGetUnresolvedReportsCountPathParams['device_id'],
  options: {
    query?: Partial<
      QueryObserverOptions<
        ResponseConfig<DeviceReportControllerGetUnresolvedReportsCountQueryResponse>,
        ResponseErrorConfig<DeviceReportControllerGetUnresolvedReportsCount401 | DeviceReportControllerGetUnresolvedReportsCount403>,
        TData,
        TQueryData,
        TQueryKey
      >
    > & { client?: QueryClient }
    client?: Partial<RequestConfig> & { client?: typeof client }
  } = {},
) {
  const { query: { client: queryClient, ...queryOptions } = {}, client: config = {} } = options ?? {}
  const queryKey = queryOptions?.queryKey ?? deviceReportControllerGetUnresolvedReportsCountQueryKey(device_id)

  const query = useQuery(
    {
      ...(deviceReportControllerGetUnresolvedReportsCountQueryOptions(device_id, config) as unknown as QueryObserverOptions),
      queryKey,
      ...(queryOptions as unknown as Omit<QueryObserverOptions, 'queryKey'>),
    },
    queryClient,
  ) as UseQueryResult<TData, ResponseErrorConfig<DeviceReportControllerGetUnresolvedReportsCount401 | DeviceReportControllerGetUnresolvedReportsCount403>> & {
    queryKey: TQueryKey
  }

  query.queryKey = queryKey as TQueryKey

  return query
}