/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import client from '../../../global/api/apiClient'
import type { RequestConfig, ResponseErrorConfig, ResponseConfig } from '../../../global/api/apiClient'
import type { InfiniteData, QueryKey, QueryClient, InfiniteQueryObserverOptions, UseInfiniteQueryResult } from '@tanstack/react-query'
import type {
  StaffRequestControllerFindAllQueryResponse,
  StaffRequestControllerFindAllQueryParams,
  StaffRequestControllerFindAll401,
  StaffRequestControllerFindAll403,
} from '../../types/staff-requestsController/StaffRequestControllerFindAll.ts'
import { infiniteQueryOptions, useInfiniteQuery } from '@tanstack/react-query'

export const staffRequestControllerFindAllInfiniteQueryKey = (params?: StaffRequestControllerFindAllQueryParams) =>
  [{ url: '/staff-requests' }, ...(params ? [params] : [])] as const

export type StaffRequestControllerFindAllInfiniteQueryKey = ReturnType<typeof staffRequestControllerFindAllInfiniteQueryKey>

/**
 * @description Retrieve all staff requests with pagination
 * @summary Get all staff requests
 * {@link /staff-requests}
 */
export async function staffRequestControllerFindAllInfinite(
  params?: StaffRequestControllerFindAllQueryParams,
  config: Partial<RequestConfig> & { client?: typeof client } = {},
) {
  const { client: request = client, ...requestConfig } = config

  const res = await request<
    StaffRequestControllerFindAllQueryResponse,
    ResponseErrorConfig<StaffRequestControllerFindAll401 | StaffRequestControllerFindAll403>,
    unknown
  >({ method: 'GET', url: `/staff-requests`, params, ...requestConfig })
  return res
}

export function staffRequestControllerFindAllInfiniteQueryOptions(
  params?: StaffRequestControllerFindAllQueryParams,
  config: Partial<RequestConfig> & { client?: typeof client } = {},
) {
  const queryKey = staffRequestControllerFindAllInfiniteQueryKey(params)
  return infiniteQueryOptions<
    ResponseConfig<StaffRequestControllerFindAllQueryResponse>,
    ResponseErrorConfig<StaffRequestControllerFindAll401 | StaffRequestControllerFindAll403>,
    ResponseConfig<StaffRequestControllerFindAllQueryResponse>,
    typeof queryKey,
    number
  >({
    queryKey,
    queryFn: async ({ signal, pageParam }) => {
      config.signal = signal

      if (params) {
        params['limit'] = pageParam as unknown as StaffRequestControllerFindAllQueryParams['limit']
      }
      return staffRequestControllerFindAllInfinite(params, config)
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage['page'],
    getPreviousPageParam: (firstPage) => firstPage['page'],
  })
}

/**
 * @description Retrieve all staff requests with pagination
 * @summary Get all staff requests
 * {@link /staff-requests}
 */
export function useStaffRequestControllerFindAllInfinite<
  TData = InfiniteData<ResponseConfig<StaffRequestControllerFindAllQueryResponse>>,
  TQueryData = ResponseConfig<StaffRequestControllerFindAllQueryResponse>,
  TQueryKey extends QueryKey = StaffRequestControllerFindAllInfiniteQueryKey,
>(
  params?: StaffRequestControllerFindAllQueryParams,
  options: {
    query?: Partial<
      InfiniteQueryObserverOptions<
        ResponseConfig<StaffRequestControllerFindAllQueryResponse>,
        ResponseErrorConfig<StaffRequestControllerFindAll401 | StaffRequestControllerFindAll403>,
        TData,
        TQueryData,
        TQueryKey
      >
    > & { client?: QueryClient }
    client?: Partial<RequestConfig> & { client?: typeof client }
  } = {},
) {
  const { query: { client: queryClient, ...queryOptions } = {}, client: config = {} } = options ?? {}
  const queryKey = queryOptions?.queryKey ?? staffRequestControllerFindAllInfiniteQueryKey(params)

  const query = useInfiniteQuery(
    {
      ...(staffRequestControllerFindAllInfiniteQueryOptions(params, config) as unknown as InfiniteQueryObserverOptions),
      queryKey,
      ...(queryOptions as unknown as Omit<InfiniteQueryObserverOptions, 'queryKey'>),
    },
    queryClient,
  ) as UseInfiniteQueryResult<TData, ResponseErrorConfig<StaffRequestControllerFindAll401 | StaffRequestControllerFindAll403>> & { queryKey: TQueryKey }

  query.queryKey = queryKey as TQueryKey

  return query
}