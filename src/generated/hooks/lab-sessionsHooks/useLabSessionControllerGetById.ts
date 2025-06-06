/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import client from '../../../global/api/apiClient'
import type { RequestConfig, ResponseErrorConfig, ResponseConfig } from '../../../global/api/apiClient'
import type { QueryKey, QueryClient, QueryObserverOptions, UseQueryResult } from '@tanstack/react-query'
import type {
  LabSessionControllerGetByIdQueryResponse,
  LabSessionControllerGetByIdPathParams,
  LabSessionControllerGetById401,
  LabSessionControllerGetById403,
  LabSessionControllerGetById404,
} from '../../types/lab-sessionsController/LabSessionControllerGetById.ts'
import { queryOptions, useQuery } from '@tanstack/react-query'

export const labSessionControllerGetByIdQueryKey = (lab_session_id: LabSessionControllerGetByIdPathParams['lab_session_id']) =>
  [{ url: '/lab-session/:lab_session_id', params: { lab_session_id: lab_session_id } }] as const

export type LabSessionControllerGetByIdQueryKey = ReturnType<typeof labSessionControllerGetByIdQueryKey>

/**
 * @description Retrieve a lab session by its ID
 * @summary Get lab session by ID
 * {@link /lab-session/:lab_session_id}
 */
export async function labSessionControllerGetById(
  lab_session_id: LabSessionControllerGetByIdPathParams['lab_session_id'],
  config: Partial<RequestConfig> & { client?: typeof client } = {},
) {
  const { client: request = client, ...requestConfig } = config

  const res = await request<
    LabSessionControllerGetByIdQueryResponse,
    ResponseErrorConfig<LabSessionControllerGetById401 | LabSessionControllerGetById403 | LabSessionControllerGetById404>,
    unknown
  >({ method: 'GET', url: `/lab-session/${lab_session_id}`, ...requestConfig })
  return res
}

export function labSessionControllerGetByIdQueryOptions(
  lab_session_id: LabSessionControllerGetByIdPathParams['lab_session_id'],
  config: Partial<RequestConfig> & { client?: typeof client } = {},
) {
  const queryKey = labSessionControllerGetByIdQueryKey(lab_session_id)
  return queryOptions<
    ResponseConfig<LabSessionControllerGetByIdQueryResponse>,
    ResponseErrorConfig<LabSessionControllerGetById401 | LabSessionControllerGetById403 | LabSessionControllerGetById404>,
    ResponseConfig<LabSessionControllerGetByIdQueryResponse>,
    typeof queryKey
  >({
    enabled: !!lab_session_id,
    queryKey,
    queryFn: async ({ signal }) => {
      config.signal = signal
      return labSessionControllerGetById(lab_session_id, config)
    },
  })
}

/**
 * @description Retrieve a lab session by its ID
 * @summary Get lab session by ID
 * {@link /lab-session/:lab_session_id}
 */
export function useLabSessionControllerGetById<
  TData = ResponseConfig<LabSessionControllerGetByIdQueryResponse>,
  TQueryData = ResponseConfig<LabSessionControllerGetByIdQueryResponse>,
  TQueryKey extends QueryKey = LabSessionControllerGetByIdQueryKey,
>(
  lab_session_id: LabSessionControllerGetByIdPathParams['lab_session_id'],
  options: {
    query?: Partial<
      QueryObserverOptions<
        ResponseConfig<LabSessionControllerGetByIdQueryResponse>,
        ResponseErrorConfig<LabSessionControllerGetById401 | LabSessionControllerGetById403 | LabSessionControllerGetById404>,
        TData,
        TQueryData,
        TQueryKey
      >
    > & { client?: QueryClient }
    client?: Partial<RequestConfig> & { client?: typeof client }
  } = {},
) {
  const { query: { client: queryClient, ...queryOptions } = {}, client: config = {} } = options ?? {}
  const queryKey = queryOptions?.queryKey ?? labSessionControllerGetByIdQueryKey(lab_session_id)

  const query = useQuery(
    {
      ...(labSessionControllerGetByIdQueryOptions(lab_session_id, config) as unknown as QueryObserverOptions),
      queryKey,
      ...(queryOptions as unknown as Omit<QueryObserverOptions, 'queryKey'>),
    },
    queryClient,
  ) as UseQueryResult<TData, ResponseErrorConfig<LabSessionControllerGetById401 | LabSessionControllerGetById403 | LabSessionControllerGetById404>> & {
    queryKey: TQueryKey
  }

  query.queryKey = queryKey as TQueryKey

  return query
}