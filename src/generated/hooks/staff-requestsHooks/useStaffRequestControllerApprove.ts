/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import client from '../../../global/api/apiClient'
import type { RequestConfig, ResponseConfig, ResponseErrorConfig } from '../../../global/api/apiClient'
import type { UseMutationOptions, QueryClient } from '@tanstack/react-query'
import type {
  StaffRequestControllerApproveMutationRequest,
  StaffRequestControllerApproveMutationResponse,
  StaffRequestControllerApprovePathParams,
  StaffRequestControllerApprove400,
  StaffRequestControllerApprove401,
  StaffRequestControllerApprove403,
  StaffRequestControllerApprove404,
} from '../../types/staff-requestsController/StaffRequestControllerApprove.ts'
import { useMutation } from '@tanstack/react-query'

export const staffRequestControllerApproveMutationKey = () => [{ url: '/staff-requests/{id}/approve' }] as const

export type StaffRequestControllerApproveMutationKey = ReturnType<typeof staffRequestControllerApproveMutationKey>

/**
 * @description Approve a pending staff request
 * @summary Approve staff request
 * {@link /staff-requests/:id/approve}
 */
export async function staffRequestControllerApprove(
  id: StaffRequestControllerApprovePathParams['id'],
  data: StaffRequestControllerApproveMutationRequest,
  config: Partial<RequestConfig<StaffRequestControllerApproveMutationRequest>> & { client?: typeof client } = {},
) {
  const { client: request = client, ...requestConfig } = config

  const res = await request<
    StaffRequestControllerApproveMutationResponse,
    ResponseErrorConfig<
      StaffRequestControllerApprove400 | StaffRequestControllerApprove401 | StaffRequestControllerApprove403 | StaffRequestControllerApprove404
    >,
    StaffRequestControllerApproveMutationRequest
  >({ method: 'PUT', url: `/staff-requests/${id}/approve`, data, ...requestConfig })
  return res
}

/**
 * @description Approve a pending staff request
 * @summary Approve staff request
 * {@link /staff-requests/:id/approve}
 */
export function useStaffRequestControllerApprove<TContext>(
  options: {
    mutation?: UseMutationOptions<
      ResponseConfig<StaffRequestControllerApproveMutationResponse>,
      ResponseErrorConfig<
        StaffRequestControllerApprove400 | StaffRequestControllerApprove401 | StaffRequestControllerApprove403 | StaffRequestControllerApprove404
      >,
      { id: StaffRequestControllerApprovePathParams['id']; data: StaffRequestControllerApproveMutationRequest },
      TContext
    > & { client?: QueryClient }
    client?: Partial<RequestConfig<StaffRequestControllerApproveMutationRequest>> & { client?: typeof client }
  } = {},
) {
  const { mutation: { client: queryClient, ...mutationOptions } = {}, client: config = {} } = options ?? {}
  const mutationKey = mutationOptions?.mutationKey ?? staffRequestControllerApproveMutationKey()

  return useMutation<
    ResponseConfig<StaffRequestControllerApproveMutationResponse>,
    ResponseErrorConfig<
      StaffRequestControllerApprove400 | StaffRequestControllerApprove401 | StaffRequestControllerApprove403 | StaffRequestControllerApprove404
    >,
    { id: StaffRequestControllerApprovePathParams['id']; data: StaffRequestControllerApproveMutationRequest },
    TContext
  >(
    {
      mutationFn: async ({ id, data }) => {
        return staffRequestControllerApprove(id, data, config)
      },
      mutationKey,
      ...mutationOptions,
    },
    queryClient,
  )
}