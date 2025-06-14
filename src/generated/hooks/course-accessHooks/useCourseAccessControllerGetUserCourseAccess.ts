/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import client from '../../../global/api/apiClient'
import type { RequestConfig, ResponseErrorConfig, ResponseConfig } from '../../../global/api/apiClient'
import type { QueryKey, QueryClient, QueryObserverOptions, UseQueryResult } from '@tanstack/react-query'
import type {
  CourseAccessControllerGetUserCourseAccessQueryResponse,
  CourseAccessControllerGetUserCourseAccessPathParams,
  CourseAccessControllerGetUserCourseAccess401,
  CourseAccessControllerGetUserCourseAccess403,
} from '../../types/course-accessController/CourseAccessControllerGetUserCourseAccess.ts'
import { queryOptions, useQuery } from '@tanstack/react-query'

export const courseAccessControllerGetUserCourseAccessQueryKey = (
  userId: CourseAccessControllerGetUserCourseAccessPathParams['userId'],
  courseId: CourseAccessControllerGetUserCourseAccessPathParams['courseId'],
) => [{ url: '/course-access/users/:userId/courses/:courseId', params: { userId: userId, courseId: courseId } }] as const

export type CourseAccessControllerGetUserCourseAccessQueryKey = ReturnType<typeof courseAccessControllerGetUserCourseAccessQueryKey>

/**
 * @description Get all access permissions for a specific user in a course
 * @summary Get user course access
 * {@link /course-access/users/:userId/courses/:courseId}
 */
export async function courseAccessControllerGetUserCourseAccess(
  userId: CourseAccessControllerGetUserCourseAccessPathParams['userId'],
  courseId: CourseAccessControllerGetUserCourseAccessPathParams['courseId'],
  config: Partial<RequestConfig> & { client?: typeof client } = {},
) {
  const { client: request = client, ...requestConfig } = config

  const res = await request<
    CourseAccessControllerGetUserCourseAccessQueryResponse,
    ResponseErrorConfig<CourseAccessControllerGetUserCourseAccess401 | CourseAccessControllerGetUserCourseAccess403>,
    unknown
  >({ method: 'GET', url: `/course-access/users/${userId}/courses/${courseId}`, ...requestConfig })
  return res
}

export function courseAccessControllerGetUserCourseAccessQueryOptions(
  userId: CourseAccessControllerGetUserCourseAccessPathParams['userId'],
  courseId: CourseAccessControllerGetUserCourseAccessPathParams['courseId'],
  config: Partial<RequestConfig> & { client?: typeof client } = {},
) {
  const queryKey = courseAccessControllerGetUserCourseAccessQueryKey(userId, courseId)
  return queryOptions<
    ResponseConfig<CourseAccessControllerGetUserCourseAccessQueryResponse>,
    ResponseErrorConfig<CourseAccessControllerGetUserCourseAccess401 | CourseAccessControllerGetUserCourseAccess403>,
    ResponseConfig<CourseAccessControllerGetUserCourseAccessQueryResponse>,
    typeof queryKey
  >({
    enabled: !!(userId && courseId),
    queryKey,
    queryFn: async ({ signal }) => {
      config.signal = signal
      return courseAccessControllerGetUserCourseAccess(userId, courseId, config)
    },
  })
}

/**
 * @description Get all access permissions for a specific user in a course
 * @summary Get user course access
 * {@link /course-access/users/:userId/courses/:courseId}
 */
export function useCourseAccessControllerGetUserCourseAccess<
  TData = ResponseConfig<CourseAccessControllerGetUserCourseAccessQueryResponse>,
  TQueryData = ResponseConfig<CourseAccessControllerGetUserCourseAccessQueryResponse>,
  TQueryKey extends QueryKey = CourseAccessControllerGetUserCourseAccessQueryKey,
>(
  userId: CourseAccessControllerGetUserCourseAccessPathParams['userId'],
  courseId: CourseAccessControllerGetUserCourseAccessPathParams['courseId'],
  options: {
    query?: Partial<
      QueryObserverOptions<
        ResponseConfig<CourseAccessControllerGetUserCourseAccessQueryResponse>,
        ResponseErrorConfig<CourseAccessControllerGetUserCourseAccess401 | CourseAccessControllerGetUserCourseAccess403>,
        TData,
        TQueryData,
        TQueryKey
      >
    > & { client?: QueryClient }
    client?: Partial<RequestConfig> & { client?: typeof client }
  } = {},
) {
  const { query: { client: queryClient, ...queryOptions } = {}, client: config = {} } = options ?? {}
  const queryKey = queryOptions?.queryKey ?? courseAccessControllerGetUserCourseAccessQueryKey(userId, courseId)

  const query = useQuery(
    {
      ...(courseAccessControllerGetUserCourseAccessQueryOptions(userId, courseId, config) as unknown as QueryObserverOptions),
      queryKey,
      ...(queryOptions as unknown as Omit<QueryObserverOptions, 'queryKey'>),
    },
    queryClient,
  ) as UseQueryResult<TData, ResponseErrorConfig<CourseAccessControllerGetUserCourseAccess401 | CourseAccessControllerGetUserCourseAccess403>> & {
    queryKey: TQueryKey
  }

  query.queryKey = queryKey as TQueryKey

  return query
}