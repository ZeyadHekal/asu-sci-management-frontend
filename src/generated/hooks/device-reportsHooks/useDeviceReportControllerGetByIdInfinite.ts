/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import client from '../../../global/api/apiClient'
import type { RequestConfig, ResponseErrorConfig, ResponseConfig } from '../../../global/api/apiClient'
import type { InfiniteData, QueryKey, QueryClient, InfiniteQueryObserverOptions, UseInfiniteQueryResult } from '@tanstack/react-query'
import type {
  DeviceReportControllerGetByIdQueryResponse,
  DeviceReportControllerGetByIdPathParams,
  DeviceReportControllerGetById401,
  DeviceReportControllerGetById403,
  DeviceReportControllerGetById404,
} from '../../types/device-reportsController/DeviceReportControllerGetById.ts'
import { infiniteQueryOptions, useInfiniteQuery } from '@tanstack/react-query'

export const deviceReportControllerGetByIdInfiniteQueryKey = (device_report_id: DeviceReportControllerGetByIdPathParams['device_report_id']) =>
  [{ url: '/device-reports/:device_report_id', params: { device_report_id: device_report_id } }] as const

export type DeviceReportControllerGetByIdInfiniteQueryKey = ReturnType<typeof deviceReportControllerGetByIdInfiniteQueryKey>

/**
 * @description Retrieve a device report by its ID (Admin/Management)
 * @summary Get device report by ID
 * {@link /device-reports/:device_report_id}
 */
export async function deviceReportControllerGetByIdInfinite(
  device_report_id: DeviceReportControllerGetByIdPathParams['device_report_id'],
  config: Partial<RequestConfig> & { client?: typeof client } = {},
) {
  const { client: request = client, ...requestConfig } = config

  const res = await request<
    DeviceReportControllerGetByIdQueryResponse,
    ResponseErrorConfig<DeviceReportControllerGetById401 | DeviceReportControllerGetById403 | DeviceReportControllerGetById404>,
    unknown
  >({ method: 'GET', url: `/device-reports/${device_report_id}`, ...requestConfig })
  return res
}

export function deviceReportControllerGetByIdInfiniteQueryOptions(
  device_report_id: DeviceReportControllerGetByIdPathParams['device_report_id'],
  config: Partial<RequestConfig> & { client?: typeof client } = {},
) {
  const queryKey = deviceReportControllerGetByIdInfiniteQueryKey(device_report_id)
  return infiniteQueryOptions<
    ResponseConfig<DeviceReportControllerGetByIdQueryResponse>,
    ResponseErrorConfig<DeviceReportControllerGetById401 | DeviceReportControllerGetById403 | DeviceReportControllerGetById404>,
    ResponseConfig<DeviceReportControllerGetByIdQueryResponse>,
    typeof queryKey
  >({
    enabled: !!device_report_id,
    queryKey,
    queryFn: async ({ signal }) => {
      config.signal = signal
      return deviceReportControllerGetByIdInfinite(device_report_id, config)
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage['page'],
    getPreviousPageParam: (firstPage) => firstPage['page'],
  })
}

/**
 * @description Retrieve a device report by its ID (Admin/Management)
 * @summary Get device report by ID
 * {@link /device-reports/:device_report_id}
 */
export function useDeviceReportControllerGetByIdInfinite<
  TData = InfiniteData<ResponseConfig<DeviceReportControllerGetByIdQueryResponse>>,
  TQueryData = ResponseConfig<DeviceReportControllerGetByIdQueryResponse>,
  TQueryKey extends QueryKey = DeviceReportControllerGetByIdInfiniteQueryKey,
>(
  device_report_id: DeviceReportControllerGetByIdPathParams['device_report_id'],
  options: {
    query?: Partial<
      InfiniteQueryObserverOptions<
        ResponseConfig<DeviceReportControllerGetByIdQueryResponse>,
        ResponseErrorConfig<DeviceReportControllerGetById401 | DeviceReportControllerGetById403 | DeviceReportControllerGetById404>,
        TData,
        TQueryData,
        TQueryKey
      >
    > & { client?: QueryClient }
    client?: Partial<RequestConfig> & { client?: typeof client }
  } = {},
) {
  const { query: { client: queryClient, ...queryOptions } = {}, client: config = {} } = options ?? {}
  const queryKey = queryOptions?.queryKey ?? deviceReportControllerGetByIdInfiniteQueryKey(device_report_id)

  const query = useInfiniteQuery(
    {
      ...(deviceReportControllerGetByIdInfiniteQueryOptions(device_report_id, config) as unknown as InfiniteQueryObserverOptions),
      queryKey,
      ...(queryOptions as unknown as Omit<InfiniteQueryObserverOptions, 'queryKey'>),
    },
    queryClient,
  ) as UseInfiniteQueryResult<
    TData,
    ResponseErrorConfig<DeviceReportControllerGetById401 | DeviceReportControllerGetById403 | DeviceReportControllerGetById404>
  > & { queryKey: TQueryKey }

  query.queryKey = queryKey as TQueryKey

  return query
}