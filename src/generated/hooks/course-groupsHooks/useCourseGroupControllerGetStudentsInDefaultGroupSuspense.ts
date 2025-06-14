/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import client from '../../../global/api/apiClient'
import type { RequestConfig, ResponseErrorConfig, ResponseConfig } from '../../../global/api/apiClient'
import type { QueryKey, QueryClient, UseSuspenseQueryOptions, UseSuspenseQueryResult } from '@tanstack/react-query'
import type {
  CourseGroupControllerGetStudentsInDefaultGroupQueryResponse,
  CourseGroupControllerGetStudentsInDefaultGroupPathParams,
} from '../../types/course-groupsController/CourseGroupControllerGetStudentsInDefaultGroup.ts'
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'

export const courseGroupControllerGetStudentsInDefaultGroupSuspenseQueryKey = (
  courseId: CourseGroupControllerGetStudentsInDefaultGroupPathParams['courseId'],
) => [{ url: '/course-groups/course/:courseId/default-group-students', params: { courseId: courseId } }] as const

export type CourseGroupControllerGetStudentsInDefaultGroupSuspenseQueryKey = ReturnType<typeof courseGroupControllerGetStudentsInDefaultGroupSuspenseQueryKey>

/**
 * @description Get the count of students assigned to the default group of a course
 * @summary Get number of students in default group
 * {@link /course-groups/course/:courseId/default-group-students}
 */
export async function courseGroupControllerGetStudentsInDefaultGroupSuspense(
  courseId: CourseGroupControllerGetStudentsInDefaultGroupPathParams['courseId'],
  config: Partial<RequestConfig> & { client?: typeof client } = {},
) {
  const { client: request = client, ...requestConfig } = config

  const res = await request<CourseGroupControllerGetStudentsInDefaultGroupQueryResponse, ResponseErrorConfig<Error>, unknown>({
    method: 'GET',
    url: `/course-groups/course/${courseId}/default-group-students`,
    ...requestConfig,
  })
  return res
}

export function courseGroupControllerGetStudentsInDefaultGroupSuspenseQueryOptions(
  courseId: CourseGroupControllerGetStudentsInDefaultGroupPathParams['courseId'],
  config: Partial<RequestConfig> & { client?: typeof client } = {},
) {
  const queryKey = courseGroupControllerGetStudentsInDefaultGroupSuspenseQueryKey(courseId)
  return queryOptions<
    ResponseConfig<CourseGroupControllerGetStudentsInDefaultGroupQueryResponse>,
    ResponseErrorConfig<Error>,
    ResponseConfig<CourseGroupControllerGetStudentsInDefaultGroupQueryResponse>,
    typeof queryKey
  >({
    enabled: !!courseId,
    queryKey,
    queryFn: async ({ signal }) => {
      config.signal = signal
      return courseGroupControllerGetStudentsInDefaultGroupSuspense(courseId, config)
    },
  })
}

/**
 * @description Get the count of students assigned to the default group of a course
 * @summary Get number of students in default group
 * {@link /course-groups/course/:courseId/default-group-students}
 */
export function useCourseGroupControllerGetStudentsInDefaultGroupSuspense<
  TData = ResponseConfig<CourseGroupControllerGetStudentsInDefaultGroupQueryResponse>,
  TQueryKey extends QueryKey = CourseGroupControllerGetStudentsInDefaultGroupSuspenseQueryKey,
>(
  courseId: CourseGroupControllerGetStudentsInDefaultGroupPathParams['courseId'],
  options: {
    query?: Partial<
      UseSuspenseQueryOptions<ResponseConfig<CourseGroupControllerGetStudentsInDefaultGroupQueryResponse>, ResponseErrorConfig<Error>, TData, TQueryKey>
    > & { client?: QueryClient }
    client?: Partial<RequestConfig> & { client?: typeof client }
  } = {},
) {
  const { query: { client: queryClient, ...queryOptions } = {}, client: config = {} } = options ?? {}
  const queryKey = queryOptions?.queryKey ?? courseGroupControllerGetStudentsInDefaultGroupSuspenseQueryKey(courseId)

  const query = useSuspenseQuery(
    {
      ...(courseGroupControllerGetStudentsInDefaultGroupSuspenseQueryOptions(courseId, config) as unknown as UseSuspenseQueryOptions),
      queryKey,
      ...(queryOptions as unknown as Omit<UseSuspenseQueryOptions, 'queryKey'>),
    },
    queryClient,
  ) as UseSuspenseQueryResult<TData, ResponseErrorConfig<Error>> & { queryKey: TQueryKey }

  query.queryKey = queryKey as TQueryKey

  return query
}