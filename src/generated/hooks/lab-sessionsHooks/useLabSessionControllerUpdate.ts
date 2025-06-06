/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import client from '../../../global/api/apiClient'
import type { RequestConfig, ResponseConfig, ResponseErrorConfig } from '../../../global/api/apiClient'
import type { UseMutationOptions, QueryClient } from '@tanstack/react-query'
import type {
  LabSessionControllerUpdateMutationRequest,
  LabSessionControllerUpdateMutationResponse,
  LabSessionControllerUpdatePathParams,
  LabSessionControllerUpdate400,
  LabSessionControllerUpdate401,
  LabSessionControllerUpdate403,
  LabSessionControllerUpdate404,
} from '../../types/lab-sessionsController/LabSessionControllerUpdate.ts'
import { useMutation } from '@tanstack/react-query'

export const labSessionControllerUpdateMutationKey = () => [{ url: '/lab-session/{lab_session_id}' }] as const

export type LabSessionControllerUpdateMutationKey = ReturnType<typeof labSessionControllerUpdateMutationKey>

/**
 * @description Update an existing lab session by ID
 * @summary Update lab session
 * {@link /lab-session/:lab_session_id}
 */
export async function labSessionControllerUpdate(
  lab_session_id: LabSessionControllerUpdatePathParams['lab_session_id'],
  data?: LabSessionControllerUpdateMutationRequest,
  config: Partial<RequestConfig<LabSessionControllerUpdateMutationRequest>> & { client?: typeof client } = {},
) {
  const { client: request = client, ...requestConfig } = config

  const res = await request<
    LabSessionControllerUpdateMutationResponse,
    ResponseErrorConfig<LabSessionControllerUpdate400 | LabSessionControllerUpdate401 | LabSessionControllerUpdate403 | LabSessionControllerUpdate404>,
    LabSessionControllerUpdateMutationRequest
  >({ method: 'PATCH', url: `/lab-session/${lab_session_id}`, data, ...requestConfig })
  return res
}

/**
 * @description Update an existing lab session by ID
 * @summary Update lab session
 * {@link /lab-session/:lab_session_id}
 */
export function useLabSessionControllerUpdate<TContext>(
  options: {
    mutation?: UseMutationOptions<
      ResponseConfig<LabSessionControllerUpdateMutationResponse>,
      ResponseErrorConfig<LabSessionControllerUpdate400 | LabSessionControllerUpdate401 | LabSessionControllerUpdate403 | LabSessionControllerUpdate404>,
      { lab_session_id: LabSessionControllerUpdatePathParams['lab_session_id']; data?: LabSessionControllerUpdateMutationRequest },
      TContext
    > & { client?: QueryClient }
    client?: Partial<RequestConfig<LabSessionControllerUpdateMutationRequest>> & { client?: typeof client }
  } = {},
) {
  const { mutation: { client: queryClient, ...mutationOptions } = {}, client: config = {} } = options ?? {}
  const mutationKey = mutationOptions?.mutationKey ?? labSessionControllerUpdateMutationKey()

  return useMutation<
    ResponseConfig<LabSessionControllerUpdateMutationResponse>,
    ResponseErrorConfig<LabSessionControllerUpdate400 | LabSessionControllerUpdate401 | LabSessionControllerUpdate403 | LabSessionControllerUpdate404>,
    { lab_session_id: LabSessionControllerUpdatePathParams['lab_session_id']; data?: LabSessionControllerUpdateMutationRequest },
    TContext
  >(
    {
      mutationFn: async ({ lab_session_id, data }) => {
        return labSessionControllerUpdate(lab_session_id, data, config)
      },
      mutationKey,
      ...mutationOptions,
    },
    queryClient,
  )
}