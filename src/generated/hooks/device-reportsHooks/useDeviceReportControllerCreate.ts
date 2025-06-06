/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import client from '../../../global/api/apiClient'
import type { RequestConfig, ResponseConfig, ResponseErrorConfig } from '../../../global/api/apiClient'
import type { UseMutationOptions, QueryClient } from '@tanstack/react-query'
import type {
  DeviceReportControllerCreateMutationRequest,
  DeviceReportControllerCreateMutationResponse,
  DeviceReportControllerCreate400,
  DeviceReportControllerCreate401,
  DeviceReportControllerCreate403,
} from '../../types/device-reportsController/DeviceReportControllerCreate.ts'
import { useMutation } from '@tanstack/react-query'

export const deviceReportControllerCreateMutationKey = () => [{ url: '/device-reports' }] as const

export type DeviceReportControllerCreateMutationKey = ReturnType<typeof deviceReportControllerCreateMutationKey>

/**
 * @description Create a new device report (Students)
 * @summary Create device report
 * {@link /device-reports}
 */
export async function deviceReportControllerCreate(
  data: DeviceReportControllerCreateMutationRequest,
  config: Partial<RequestConfig<DeviceReportControllerCreateMutationRequest>> & { client?: typeof client } = {},
) {
  const { client: request = client, ...requestConfig } = config

  const res = await request<
    DeviceReportControllerCreateMutationResponse,
    ResponseErrorConfig<DeviceReportControllerCreate400 | DeviceReportControllerCreate401 | DeviceReportControllerCreate403>,
    DeviceReportControllerCreateMutationRequest
  >({ method: 'POST', url: `/device-reports`, data, ...requestConfig })
  return res
}

/**
 * @description Create a new device report (Students)
 * @summary Create device report
 * {@link /device-reports}
 */
export function useDeviceReportControllerCreate<TContext>(
  options: {
    mutation?: UseMutationOptions<
      ResponseConfig<DeviceReportControllerCreateMutationResponse>,
      ResponseErrorConfig<DeviceReportControllerCreate400 | DeviceReportControllerCreate401 | DeviceReportControllerCreate403>,
      { data: DeviceReportControllerCreateMutationRequest },
      TContext
    > & { client?: QueryClient }
    client?: Partial<RequestConfig<DeviceReportControllerCreateMutationRequest>> & { client?: typeof client }
  } = {},
) {
  const { mutation: { client: queryClient, ...mutationOptions } = {}, client: config = {} } = options ?? {}
  const mutationKey = mutationOptions?.mutationKey ?? deviceReportControllerCreateMutationKey()

  return useMutation<
    ResponseConfig<DeviceReportControllerCreateMutationResponse>,
    ResponseErrorConfig<DeviceReportControllerCreate400 | DeviceReportControllerCreate401 | DeviceReportControllerCreate403>,
    { data: DeviceReportControllerCreateMutationRequest },
    TContext
  >(
    {
      mutationFn: async ({ data }) => {
        return deviceReportControllerCreate(data, config)
      },
      mutationKey,
      ...mutationOptions,
    },
    queryClient,
  )
}