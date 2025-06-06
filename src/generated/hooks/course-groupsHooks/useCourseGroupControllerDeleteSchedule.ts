/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import client from '../../../global/api/apiClient'
import type { RequestConfig, ResponseConfig, ResponseErrorConfig } from '../../../global/api/apiClient'
import type { UseMutationOptions, QueryClient } from '@tanstack/react-query'
import type {
  CourseGroupControllerDeleteScheduleMutationResponse,
  CourseGroupControllerDeleteSchedulePathParams,
  CourseGroupControllerDeleteSchedule404,
} from '../../types/course-groupsController/CourseGroupControllerDeleteSchedule.ts'
import { useMutation } from '@tanstack/react-query'

export const courseGroupControllerDeleteScheduleMutationKey = () => [{ url: '/course-groups/schedules/{courseGroupId}/{assistantId}' }] as const

export type CourseGroupControllerDeleteScheduleMutationKey = ReturnType<typeof courseGroupControllerDeleteScheduleMutationKey>

/**
 * @description Delete a course group schedule
 * @summary Delete course group schedule
 * {@link /course-groups/schedules/:courseGroupId/:assistantId}
 */
export async function courseGroupControllerDeleteSchedule(
  courseGroupId: CourseGroupControllerDeleteSchedulePathParams['courseGroupId'],
  assistantId: CourseGroupControllerDeleteSchedulePathParams['assistantId'],
  config: Partial<RequestConfig> & { client?: typeof client } = {},
) {
  const { client: request = client, ...requestConfig } = config

  const res = await request<CourseGroupControllerDeleteScheduleMutationResponse, ResponseErrorConfig<CourseGroupControllerDeleteSchedule404>, unknown>({
    method: 'DELETE',
    url: `/course-groups/schedules/${courseGroupId}/${assistantId}`,
    ...requestConfig,
  })
  return res
}

/**
 * @description Delete a course group schedule
 * @summary Delete course group schedule
 * {@link /course-groups/schedules/:courseGroupId/:assistantId}
 */
export function useCourseGroupControllerDeleteSchedule<TContext>(
  options: {
    mutation?: UseMutationOptions<
      ResponseConfig<CourseGroupControllerDeleteScheduleMutationResponse>,
      ResponseErrorConfig<CourseGroupControllerDeleteSchedule404>,
      {
        courseGroupId: CourseGroupControllerDeleteSchedulePathParams['courseGroupId']
        assistantId: CourseGroupControllerDeleteSchedulePathParams['assistantId']
      },
      TContext
    > & { client?: QueryClient }
    client?: Partial<RequestConfig> & { client?: typeof client }
  } = {},
) {
  const { mutation: { client: queryClient, ...mutationOptions } = {}, client: config = {} } = options ?? {}
  const mutationKey = mutationOptions?.mutationKey ?? courseGroupControllerDeleteScheduleMutationKey()

  return useMutation<
    ResponseConfig<CourseGroupControllerDeleteScheduleMutationResponse>,
    ResponseErrorConfig<CourseGroupControllerDeleteSchedule404>,
    {
      courseGroupId: CourseGroupControllerDeleteSchedulePathParams['courseGroupId']
      assistantId: CourseGroupControllerDeleteSchedulePathParams['assistantId']
    },
    TContext
  >(
    {
      mutationFn: async ({ courseGroupId, assistantId }) => {
        return courseGroupControllerDeleteSchedule(courseGroupId, assistantId, config)
      },
      mutationKey,
      ...mutationOptions,
    },
    queryClient,
  )
}