/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import client from '../../../global/api/apiClient'
import type { RequestConfig, ResponseErrorConfig, ResponseConfig } from '../../../global/api/apiClient'
import type { QueryKey, QueryClient, QueryObserverOptions, UseQueryResult } from '@tanstack/react-query'
import type {
  CourseGroupControllerGetGroupDetailsQueryResponse,
  CourseGroupControllerGetGroupDetailsPathParams,
} from '../../types/course-groupsController/CourseGroupControllerGetGroupDetails.ts'
import { queryOptions, useQuery } from '@tanstack/react-query'

export const courseGroupControllerGetGroupDetailsQueryKey = (groupId: CourseGroupControllerGetGroupDetailsPathParams['groupId']) =>
  [{ url: '/course-groups/:groupId/details', params: { groupId: groupId } }] as const

export type CourseGroupControllerGetGroupDetailsQueryKey = ReturnType<typeof courseGroupControllerGetGroupDetailsQueryKey>

/**
 * @summary Get group details with students
 * {@link /course-groups/:groupId/details}
 */
export async function courseGroupControllerGetGroupDetails(
  groupId: CourseGroupControllerGetGroupDetailsPathParams['groupId'],
  config: Partial<RequestConfig> & { client?: typeof client } = {},
) {
  const { client: request = client, ...requestConfig } = config

  const res = await request<CourseGroupControllerGetGroupDetailsQueryResponse, ResponseErrorConfig<Error>, unknown>({
    method: 'GET',
    url: `/course-groups/${groupId}/details`,
    ...requestConfig,
  })
  return res
}

export function courseGroupControllerGetGroupDetailsQueryOptions(
  groupId: CourseGroupControllerGetGroupDetailsPathParams['groupId'],
  config: Partial<RequestConfig> & { client?: typeof client } = {},
) {
  const queryKey = courseGroupControllerGetGroupDetailsQueryKey(groupId)
  return queryOptions<
    ResponseConfig<CourseGroupControllerGetGroupDetailsQueryResponse>,
    ResponseErrorConfig<Error>,
    ResponseConfig<CourseGroupControllerGetGroupDetailsQueryResponse>,
    typeof queryKey
  >({
    enabled: !!groupId,
    queryKey,
    queryFn: async ({ signal }) => {
      config.signal = signal
      return courseGroupControllerGetGroupDetails(groupId, config)
    },
  })
}

/**
 * @summary Get group details with students
 * {@link /course-groups/:groupId/details}
 */
export function useCourseGroupControllerGetGroupDetails<
  TData = ResponseConfig<CourseGroupControllerGetGroupDetailsQueryResponse>,
  TQueryData = ResponseConfig<CourseGroupControllerGetGroupDetailsQueryResponse>,
  TQueryKey extends QueryKey = CourseGroupControllerGetGroupDetailsQueryKey,
>(
  groupId: CourseGroupControllerGetGroupDetailsPathParams['groupId'],
  options: {
    query?: Partial<
      QueryObserverOptions<ResponseConfig<CourseGroupControllerGetGroupDetailsQueryResponse>, ResponseErrorConfig<Error>, TData, TQueryData, TQueryKey>
    > & { client?: QueryClient }
    client?: Partial<RequestConfig> & { client?: typeof client }
  } = {},
) {
  const { query: { client: queryClient, ...queryOptions } = {}, client: config = {} } = options ?? {}
  const queryKey = queryOptions?.queryKey ?? courseGroupControllerGetGroupDetailsQueryKey(groupId)

  const query = useQuery(
    {
      ...(courseGroupControllerGetGroupDetailsQueryOptions(groupId, config) as unknown as QueryObserverOptions),
      queryKey,
      ...(queryOptions as unknown as Omit<QueryObserverOptions, 'queryKey'>),
    },
    queryClient,
  ) as UseQueryResult<TData, ResponseErrorConfig<Error>> & { queryKey: TQueryKey }

  query.queryKey = queryKey as TQueryKey

  return query
}