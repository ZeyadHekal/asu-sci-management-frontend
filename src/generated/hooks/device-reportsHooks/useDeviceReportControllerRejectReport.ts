/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import client from '../../../global/api/apiClient'
import type { RequestConfig, ResponseConfig, ResponseErrorConfig } from '../../../global/api/apiClient'
import type { UseMutationOptions, QueryClient } from '@tanstack/react-query'
import type {
  DeviceReportControllerRejectReportMutationResponse,
  DeviceReportControllerRejectReportPathParams,
  DeviceReportControllerRejectReport400,
  DeviceReportControllerRejectReport401,
  DeviceReportControllerRejectReport403,
  DeviceReportControllerRejectReport404,
} from '../../types/device-reportsController/DeviceReportControllerRejectReport.ts'
import { useMutation } from '@tanstack/react-query'

export const deviceReportControllerRejectReportMutationKey = () => [{ url: '/device-reports/{reportId}/reject' }] as const

export type DeviceReportControllerRejectReportMutationKey = ReturnType<typeof deviceReportControllerRejectReportMutationKey>

/**
 * @description Reject a device report and provide a reason (Admin/Management)
 * @summary Reject device report
 * {@link /device-reports/:reportId/reject}
 */
export async function deviceReportControllerRejectReport(
  reportId: DeviceReportControllerRejectReportPathParams['reportId'],
  config: Partial<RequestConfig> & { client?: typeof client } = {},
) {
  const { client: request = client, ...requestConfig } = config

  const res = await request<
    DeviceReportControllerRejectReportMutationResponse,
    ResponseErrorConfig<
      | DeviceReportControllerRejectReport400
      | DeviceReportControllerRejectReport401
      | DeviceReportControllerRejectReport403
      | DeviceReportControllerRejectReport404
    >,
    unknown
  >({ method: 'POST', url: `/device-reports/${reportId}/reject`, ...requestConfig })
  return res
}

/**
 * @description Reject a device report and provide a reason (Admin/Management)
 * @summary Reject device report
 * {@link /device-reports/:reportId/reject}
 */
export function useDeviceReportControllerRejectReport<TContext>(
  options: {
    mutation?: UseMutationOptions<
      ResponseConfig<DeviceReportControllerRejectReportMutationResponse>,
      ResponseErrorConfig<
        | DeviceReportControllerRejectReport400
        | DeviceReportControllerRejectReport401
        | DeviceReportControllerRejectReport403
        | DeviceReportControllerRejectReport404
      >,
      { reportId: DeviceReportControllerRejectReportPathParams['reportId'] },
      TContext
    > & { client?: QueryClient }
    client?: Partial<RequestConfig> & { client?: typeof client }
  } = {},
) {
  const { mutation: { client: queryClient, ...mutationOptions } = {}, client: config = {} } = options ?? {}
  const mutationKey = mutationOptions?.mutationKey ?? deviceReportControllerRejectReportMutationKey()

  return useMutation<
    ResponseConfig<DeviceReportControllerRejectReportMutationResponse>,
    ResponseErrorConfig<
      | DeviceReportControllerRejectReport400
      | DeviceReportControllerRejectReport401
      | DeviceReportControllerRejectReport403
      | DeviceReportControllerRejectReport404
    >,
    { reportId: DeviceReportControllerRejectReportPathParams['reportId'] },
    TContext
  >(
    {
      mutationFn: async ({ reportId }) => {
        return deviceReportControllerRejectReport(reportId, config)
      },
      mutationKey,
      ...mutationOptions,
    },
    queryClient,
  )
}