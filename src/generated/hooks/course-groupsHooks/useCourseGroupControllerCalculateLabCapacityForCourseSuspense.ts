/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import client from '../../../global/api/apiClient'
import type { RequestConfig, ResponseErrorConfig, ResponseConfig } from '../../../global/api/apiClient'
import type { QueryKey, QueryClient, UseSuspenseQueryOptions, UseSuspenseQueryResult } from '@tanstack/react-query'
import type {
  CourseGroupControllerCalculateLabCapacityForCourseQueryResponse,
  CourseGroupControllerCalculateLabCapacityForCoursePathParams,
} from '../../types/course-groupsController/CourseGroupControllerCalculateLabCapacityForCourse.ts'
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'

export const courseGroupControllerCalculateLabCapacityForCourseSuspenseQueryKey = (
  labId: CourseGroupControllerCalculateLabCapacityForCoursePathParams['labId'],
  courseId: CourseGroupControllerCalculateLabCapacityForCoursePathParams['courseId'],
) => [{ url: '/course-groups/lab/:labId/course/:courseId/capacity', params: { labId: labId, courseId: courseId } }] as const

export type CourseGroupControllerCalculateLabCapacityForCourseSuspenseQueryKey = ReturnType<
  typeof courseGroupControllerCalculateLabCapacityForCourseSuspenseQueryKey
>

/**
 * @description Calculate how many students can be accommodated in a lab for a specific course based on software requirements
 * @summary Calculate lab capacity for a course
 * {@link /course-groups/lab/:labId/course/:courseId/capacity}
 */
export async function courseGroupControllerCalculateLabCapacityForCourseSuspense(
  labId: CourseGroupControllerCalculateLabCapacityForCoursePathParams['labId'],
  courseId: CourseGroupControllerCalculateLabCapacityForCoursePathParams['courseId'],
  config: Partial<RequestConfig> & { client?: typeof client } = {},
) {
  const { client: request = client, ...requestConfig } = config

  const res = await request<CourseGroupControllerCalculateLabCapacityForCourseQueryResponse, ResponseErrorConfig<Error>, unknown>({
    method: 'GET',
    url: `/course-groups/lab/${labId}/course/${courseId}/capacity`,
    ...requestConfig,
  })
  return res
}

export function courseGroupControllerCalculateLabCapacityForCourseSuspenseQueryOptions(
  labId: CourseGroupControllerCalculateLabCapacityForCoursePathParams['labId'],
  courseId: CourseGroupControllerCalculateLabCapacityForCoursePathParams['courseId'],
  config: Partial<RequestConfig> & { client?: typeof client } = {},
) {
  const queryKey = courseGroupControllerCalculateLabCapacityForCourseSuspenseQueryKey(labId, courseId)
  return queryOptions<
    ResponseConfig<CourseGroupControllerCalculateLabCapacityForCourseQueryResponse>,
    ResponseErrorConfig<Error>,
    ResponseConfig<CourseGroupControllerCalculateLabCapacityForCourseQueryResponse>,
    typeof queryKey
  >({
    enabled: !!(labId && courseId),
    queryKey,
    queryFn: async ({ signal }) => {
      config.signal = signal
      return courseGroupControllerCalculateLabCapacityForCourseSuspense(labId, courseId, config)
    },
  })
}

/**
 * @description Calculate how many students can be accommodated in a lab for a specific course based on software requirements
 * @summary Calculate lab capacity for a course
 * {@link /course-groups/lab/:labId/course/:courseId/capacity}
 */
export function useCourseGroupControllerCalculateLabCapacityForCourseSuspense<
  TData = ResponseConfig<CourseGroupControllerCalculateLabCapacityForCourseQueryResponse>,
  TQueryKey extends QueryKey = CourseGroupControllerCalculateLabCapacityForCourseSuspenseQueryKey,
>(
  labId: CourseGroupControllerCalculateLabCapacityForCoursePathParams['labId'],
  courseId: CourseGroupControllerCalculateLabCapacityForCoursePathParams['courseId'],
  options: {
    query?: Partial<
      UseSuspenseQueryOptions<ResponseConfig<CourseGroupControllerCalculateLabCapacityForCourseQueryResponse>, ResponseErrorConfig<Error>, TData, TQueryKey>
    > & { client?: QueryClient }
    client?: Partial<RequestConfig> & { client?: typeof client }
  } = {},
) {
  const { query: { client: queryClient, ...queryOptions } = {}, client: config = {} } = options ?? {}
  const queryKey = queryOptions?.queryKey ?? courseGroupControllerCalculateLabCapacityForCourseSuspenseQueryKey(labId, courseId)

  const query = useSuspenseQuery(
    {
      ...(courseGroupControllerCalculateLabCapacityForCourseSuspenseQueryOptions(labId, courseId, config) as unknown as UseSuspenseQueryOptions),
      queryKey,
      ...(queryOptions as unknown as Omit<UseSuspenseQueryOptions, 'queryKey'>),
    },
    queryClient,
  ) as UseSuspenseQueryResult<TData, ResponseErrorConfig<Error>> & { queryKey: TQueryKey }

  query.queryKey = queryKey as TQueryKey

  return query
}