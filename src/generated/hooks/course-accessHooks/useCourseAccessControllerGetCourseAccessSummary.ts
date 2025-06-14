/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import client from '../../../global/api/apiClient'
import type { RequestConfig, ResponseErrorConfig, ResponseConfig } from '../../../global/api/apiClient'
import type { QueryKey, QueryClient, QueryObserverOptions, UseQueryResult } from '@tanstack/react-query'
import type {
  CourseAccessControllerGetCourseAccessSummaryQueryResponse,
  CourseAccessControllerGetCourseAccessSummaryPathParams,
  CourseAccessControllerGetCourseAccessSummary401,
  CourseAccessControllerGetCourseAccessSummary403,
  CourseAccessControllerGetCourseAccessSummary404,
} from '../../types/course-accessController/CourseAccessControllerGetCourseAccessSummary.ts'
import { queryOptions, useQuery } from '@tanstack/react-query'

export const courseAccessControllerGetCourseAccessSummaryQueryKey = (courseId: CourseAccessControllerGetCourseAccessSummaryPathParams['courseId']) =>
  [{ url: '/course-access/courses/:courseId/summary', params: { courseId: courseId } }] as const

export type CourseAccessControllerGetCourseAccessSummaryQueryKey = ReturnType<typeof courseAccessControllerGetCourseAccessSummaryQueryKey>

/**
 * @description Get a summary of all user access permissions for a specific course
 * @summary Get course access summary
 * {@link /course-access/courses/:courseId/summary}
 */
export async function courseAccessControllerGetCourseAccessSummary(
  courseId: CourseAccessControllerGetCourseAccessSummaryPathParams['courseId'],
  config: Partial<RequestConfig> & { client?: typeof client } = {},
) {
  const { client: request = client, ...requestConfig } = config

  const res = await request<
    CourseAccessControllerGetCourseAccessSummaryQueryResponse,
    ResponseErrorConfig<
      CourseAccessControllerGetCourseAccessSummary401 | CourseAccessControllerGetCourseAccessSummary403 | CourseAccessControllerGetCourseAccessSummary404
    >,
    unknown
  >({ method: 'GET', url: `/course-access/courses/${courseId}/summary`, ...requestConfig })
  return res
}

export function courseAccessControllerGetCourseAccessSummaryQueryOptions(
  courseId: CourseAccessControllerGetCourseAccessSummaryPathParams['courseId'],
  config: Partial<RequestConfig> & { client?: typeof client } = {},
) {
  const queryKey = courseAccessControllerGetCourseAccessSummaryQueryKey(courseId)
  return queryOptions<
    ResponseConfig<CourseAccessControllerGetCourseAccessSummaryQueryResponse>,
    ResponseErrorConfig<
      CourseAccessControllerGetCourseAccessSummary401 | CourseAccessControllerGetCourseAccessSummary403 | CourseAccessControllerGetCourseAccessSummary404
    >,
    ResponseConfig<CourseAccessControllerGetCourseAccessSummaryQueryResponse>,
    typeof queryKey
  >({
    enabled: !!courseId,
    queryKey,
    queryFn: async ({ signal }) => {
      config.signal = signal
      return courseAccessControllerGetCourseAccessSummary(courseId, config)
    },
  })
}

/**
 * @description Get a summary of all user access permissions for a specific course
 * @summary Get course access summary
 * {@link /course-access/courses/:courseId/summary}
 */
export function useCourseAccessControllerGetCourseAccessSummary<
  TData = ResponseConfig<CourseAccessControllerGetCourseAccessSummaryQueryResponse>,
  TQueryData = ResponseConfig<CourseAccessControllerGetCourseAccessSummaryQueryResponse>,
  TQueryKey extends QueryKey = CourseAccessControllerGetCourseAccessSummaryQueryKey,
>(
  courseId: CourseAccessControllerGetCourseAccessSummaryPathParams['courseId'],
  options: {
    query?: Partial<
      QueryObserverOptions<
        ResponseConfig<CourseAccessControllerGetCourseAccessSummaryQueryResponse>,
        ResponseErrorConfig<
          CourseAccessControllerGetCourseAccessSummary401 | CourseAccessControllerGetCourseAccessSummary403 | CourseAccessControllerGetCourseAccessSummary404
        >,
        TData,
        TQueryData,
        TQueryKey
      >
    > & { client?: QueryClient }
    client?: Partial<RequestConfig> & { client?: typeof client }
  } = {},
) {
  const { query: { client: queryClient, ...queryOptions } = {}, client: config = {} } = options ?? {}
  const queryKey = queryOptions?.queryKey ?? courseAccessControllerGetCourseAccessSummaryQueryKey(courseId)

  const query = useQuery(
    {
      ...(courseAccessControllerGetCourseAccessSummaryQueryOptions(courseId, config) as unknown as QueryObserverOptions),
      queryKey,
      ...(queryOptions as unknown as Omit<QueryObserverOptions, 'queryKey'>),
    },
    queryClient,
  ) as UseQueryResult<
    TData,
    ResponseErrorConfig<
      CourseAccessControllerGetCourseAccessSummary401 | CourseAccessControllerGetCourseAccessSummary403 | CourseAccessControllerGetCourseAccessSummary404
    >
  > & { queryKey: TQueryKey }

  query.queryKey = queryKey as TQueryKey

  return query
}