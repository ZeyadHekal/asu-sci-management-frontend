/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import client from '../../../global/api/apiClient'
import type { RequestConfig, ResponseErrorConfig, ResponseConfig } from '../../../global/api/apiClient'
import type { QueryKey, QueryClient, UseSuspenseQueryOptions, UseSuspenseQueryResult } from '@tanstack/react-query'
import type {
  StaffRequestControllerFindOneQueryResponse,
  StaffRequestControllerFindOnePathParams,
  StaffRequestControllerFindOne401,
  StaffRequestControllerFindOne403,
  StaffRequestControllerFindOne404,
} from '../../types/staff-requestsController/StaffRequestControllerFindOne.ts'
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'

export const staffRequestControllerFindOneSuspenseQueryKey = (id: StaffRequestControllerFindOnePathParams['id']) =>
  [{ url: '/staff-requests/:id', params: { id: id } }] as const

export type StaffRequestControllerFindOneSuspenseQueryKey = ReturnType<typeof staffRequestControllerFindOneSuspenseQueryKey>

/**
 * @description Retrieve a staff request by its ID
 * @summary Get staff request by ID
 * {@link /staff-requests/:id}
 */
export async function staffRequestControllerFindOneSuspense(
  id: StaffRequestControllerFindOnePathParams['id'],
  config: Partial<RequestConfig> & { client?: typeof client } = {},
) {
  const { client: request = client, ...requestConfig } = config

  const res = await request<
    StaffRequestControllerFindOneQueryResponse,
    ResponseErrorConfig<StaffRequestControllerFindOne401 | StaffRequestControllerFindOne403 | StaffRequestControllerFindOne404>,
    unknown
  >({ method: 'GET', url: `/staff-requests/${id}`, ...requestConfig })
  return res
}

export function staffRequestControllerFindOneSuspenseQueryOptions(
  id: StaffRequestControllerFindOnePathParams['id'],
  config: Partial<RequestConfig> & { client?: typeof client } = {},
) {
  const queryKey = staffRequestControllerFindOneSuspenseQueryKey(id)
  return queryOptions<
    ResponseConfig<StaffRequestControllerFindOneQueryResponse>,
    ResponseErrorConfig<StaffRequestControllerFindOne401 | StaffRequestControllerFindOne403 | StaffRequestControllerFindOne404>,
    ResponseConfig<StaffRequestControllerFindOneQueryResponse>,
    typeof queryKey
  >({
    enabled: !!id,
    queryKey,
    queryFn: async ({ signal }) => {
      config.signal = signal
      return staffRequestControllerFindOneSuspense(id, config)
    },
  })
}

/**
 * @description Retrieve a staff request by its ID
 * @summary Get staff request by ID
 * {@link /staff-requests/:id}
 */
export function useStaffRequestControllerFindOneSuspense<
  TData = ResponseConfig<StaffRequestControllerFindOneQueryResponse>,
  TQueryKey extends QueryKey = StaffRequestControllerFindOneSuspenseQueryKey,
>(
  id: StaffRequestControllerFindOnePathParams['id'],
  options: {
    query?: Partial<
      UseSuspenseQueryOptions<
        ResponseConfig<StaffRequestControllerFindOneQueryResponse>,
        ResponseErrorConfig<StaffRequestControllerFindOne401 | StaffRequestControllerFindOne403 | StaffRequestControllerFindOne404>,
        TData,
        TQueryKey
      >
    > & { client?: QueryClient }
    client?: Partial<RequestConfig> & { client?: typeof client }
  } = {},
) {
  const { query: { client: queryClient, ...queryOptions } = {}, client: config = {} } = options ?? {}
  const queryKey = queryOptions?.queryKey ?? staffRequestControllerFindOneSuspenseQueryKey(id)

  const query = useSuspenseQuery(
    {
      ...(staffRequestControllerFindOneSuspenseQueryOptions(id, config) as unknown as UseSuspenseQueryOptions),
      queryKey,
      ...(queryOptions as unknown as Omit<UseSuspenseQueryOptions, 'queryKey'>),
    },
    queryClient,
  ) as UseSuspenseQueryResult<
    TData,
    ResponseErrorConfig<StaffRequestControllerFindOne401 | StaffRequestControllerFindOne403 | StaffRequestControllerFindOne404>
  > & { queryKey: TQueryKey }

  query.queryKey = queryKey as TQueryKey

  return query
}