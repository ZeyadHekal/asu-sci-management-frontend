/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import client from '../../../global/api/apiClient'
import type { RequestConfig, ResponseConfig, ResponseErrorConfig } from '../../../global/api/apiClient'
import type { UseMutationOptions, QueryClient } from '@tanstack/react-query'
import type { AuthControllerLogoutMutationResponse, AuthControllerLogout401 } from '../../types/authenticationController/AuthControllerLogout.ts'
import { useMutation } from '@tanstack/react-query'

export const authControllerLogoutMutationKey = () => [{ url: '/auth/logout' }] as const

export type AuthControllerLogoutMutationKey = ReturnType<typeof authControllerLogoutMutationKey>

/**
 * @description Logout user and update session tracking
 * @summary User logout
 * {@link /auth/logout}
 */
export async function authControllerLogout(config: Partial<RequestConfig> & { client?: typeof client } = {}) {
  const { client: request = client, ...requestConfig } = config

  const res = await request<AuthControllerLogoutMutationResponse, ResponseErrorConfig<AuthControllerLogout401>, unknown>({
    method: 'POST',
    url: `/auth/logout`,
    ...requestConfig,
  })
  return res
}

/**
 * @description Logout user and update session tracking
 * @summary User logout
 * {@link /auth/logout}
 */
export function useAuthControllerLogout<TContext>(
  options: {
    mutation?: UseMutationOptions<ResponseConfig<AuthControllerLogoutMutationResponse>, ResponseErrorConfig<AuthControllerLogout401>, void, TContext> & {
      client?: QueryClient
    }
    client?: Partial<RequestConfig> & { client?: typeof client }
  } = {},
) {
  const { mutation: { client: queryClient, ...mutationOptions } = {}, client: config = {} } = options ?? {}
  const mutationKey = mutationOptions?.mutationKey ?? authControllerLogoutMutationKey()

  return useMutation<ResponseConfig<AuthControllerLogoutMutationResponse>, ResponseErrorConfig<AuthControllerLogout401>, void, TContext>(
    {
      mutationFn: async () => {
        return authControllerLogout(config)
      },
      mutationKey,
      ...mutationOptions,
    },
    queryClient,
  )
}