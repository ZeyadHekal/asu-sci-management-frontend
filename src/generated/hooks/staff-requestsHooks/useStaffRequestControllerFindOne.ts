/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import client from '../../../global/api/apiClient'
import type { RequestConfig, ResponseErrorConfig, ResponseConfig } from '../../../global/api/apiClient'
import type { QueryKey, QueryClient, QueryObserverOptions, UseQueryResult } from '@tanstack/react-query'
import type {
  StaffRequestControllerFindOneQueryResponse,
  StaffRequestControllerFindOnePathParams,
  StaffRequestControllerFindOne401,
  StaffRequestControllerFindOne403,
  StaffRequestControllerFindOne404,
} from '../../types/staff-requestsController/StaffRequestControllerFindOne.ts'
import { queryOptions, useQuery } from '@tanstack/react-query'

export const staffRequestControllerFindOneQueryKey = (id: StaffRequestControllerFindOnePathParams['id']) =>
  [{ url: '/staff-requests/:id', params: { id: id } }] as const

export type StaffRequestControllerFindOneQueryKey = ReturnType<typeof staffRequestControllerFindOneQueryKey>

/**
 * @description Retrieve a staff request by its ID
 * @summary Get staff request by ID
 * {@link /staff-requests/:id}
 */
export async function staffRequestControllerFindOne(
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

export function staffRequestControllerFindOneQueryOptions(
  id: StaffRequestControllerFindOnePathParams['id'],
  config: Partial<RequestConfig> & { client?: typeof client } = {},
) {
  const queryKey = staffRequestControllerFindOneQueryKey(id)
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
      return staffRequestControllerFindOne(id, config)
    },
  })
}

/**
 * @description Retrieve a staff request by its ID
 * @summary Get staff request by ID
 * {@link /staff-requests/:id}
 */
export function useStaffRequestControllerFindOne<
  TData = ResponseConfig<StaffRequestControllerFindOneQueryResponse>,
  TQueryData = ResponseConfig<StaffRequestControllerFindOneQueryResponse>,
  TQueryKey extends QueryKey = StaffRequestControllerFindOneQueryKey,
>(
  id: StaffRequestControllerFindOnePathParams['id'],
  options: {
    query?: Partial<
      QueryObserverOptions<
        ResponseConfig<StaffRequestControllerFindOneQueryResponse>,
        ResponseErrorConfig<StaffRequestControllerFindOne401 | StaffRequestControllerFindOne403 | StaffRequestControllerFindOne404>,
        TData,
        TQueryData,
        TQueryKey
      >
    > & { client?: QueryClient }
    client?: Partial<RequestConfig> & { client?: typeof client }
  } = {},
) {
  const { query: { client: queryClient, ...queryOptions } = {}, client: config = {} } = options ?? {}
  const queryKey = queryOptions?.queryKey ?? staffRequestControllerFindOneQueryKey(id)

  const query = useQuery(
    {
      ...(staffRequestControllerFindOneQueryOptions(id, config) as unknown as QueryObserverOptions),
      queryKey,
      ...(queryOptions as unknown as Omit<QueryObserverOptions, 'queryKey'>),
    },
    queryClient,
  ) as UseQueryResult<TData, ResponseErrorConfig<StaffRequestControllerFindOne401 | StaffRequestControllerFindOne403 | StaffRequestControllerFindOne404>> & {
    queryKey: TQueryKey
  }

  query.queryKey = queryKey as TQueryKey

  return query
}