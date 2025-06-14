/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import client from '../../../global/api/apiClient'
import type { RequestConfig, ResponseConfig, ResponseErrorConfig } from '../../../global/api/apiClient'
import type { UseMutationOptions, QueryClient } from '@tanstack/react-query'
import type {
  CourseAccessControllerGrantCourseAccessMutationRequest,
  CourseAccessControllerGrantCourseAccessMutationResponse,
  CourseAccessControllerGrantCourseAccess400,
  CourseAccessControllerGrantCourseAccess401,
  CourseAccessControllerGrantCourseAccess403,
  CourseAccessControllerGrantCourseAccess404,
} from '../../types/course-accessController/CourseAccessControllerGrantCourseAccess.ts'
import { useMutation } from '@tanstack/react-query'

export const courseAccessControllerGrantCourseAccessMutationKey = () => [{ url: '/course-access/permissions' }] as const

export type CourseAccessControllerGrantCourseAccessMutationKey = ReturnType<typeof courseAccessControllerGrantCourseAccessMutationKey>

/**
 * @description Grant access permission to an assistant for a specific course section
 * @summary Grant course access permission
 * {@link /course-access/permissions}
 */
export async function courseAccessControllerGrantCourseAccess(
  data: CourseAccessControllerGrantCourseAccessMutationRequest,
  config: Partial<RequestConfig<CourseAccessControllerGrantCourseAccessMutationRequest>> & { client?: typeof client } = {},
) {
  const { client: request = client, ...requestConfig } = config

  const res = await request<
    CourseAccessControllerGrantCourseAccessMutationResponse,
    ResponseErrorConfig<
      | CourseAccessControllerGrantCourseAccess400
      | CourseAccessControllerGrantCourseAccess401
      | CourseAccessControllerGrantCourseAccess403
      | CourseAccessControllerGrantCourseAccess404
    >,
    CourseAccessControllerGrantCourseAccessMutationRequest
  >({ method: 'POST', url: `/course-access/permissions`, data, ...requestConfig })
  return res
}

/**
 * @description Grant access permission to an assistant for a specific course section
 * @summary Grant course access permission
 * {@link /course-access/permissions}
 */
export function useCourseAccessControllerGrantCourseAccess<TContext>(
  options: {
    mutation?: UseMutationOptions<
      ResponseConfig<CourseAccessControllerGrantCourseAccessMutationResponse>,
      ResponseErrorConfig<
        | CourseAccessControllerGrantCourseAccess400
        | CourseAccessControllerGrantCourseAccess401
        | CourseAccessControllerGrantCourseAccess403
        | CourseAccessControllerGrantCourseAccess404
      >,
      { data: CourseAccessControllerGrantCourseAccessMutationRequest },
      TContext
    > & { client?: QueryClient }
    client?: Partial<RequestConfig<CourseAccessControllerGrantCourseAccessMutationRequest>> & { client?: typeof client }
  } = {},
) {
  const { mutation: { client: queryClient, ...mutationOptions } = {}, client: config = {} } = options ?? {}
  const mutationKey = mutationOptions?.mutationKey ?? courseAccessControllerGrantCourseAccessMutationKey()

  return useMutation<
    ResponseConfig<CourseAccessControllerGrantCourseAccessMutationResponse>,
    ResponseErrorConfig<
      | CourseAccessControllerGrantCourseAccess400
      | CourseAccessControllerGrantCourseAccess401
      | CourseAccessControllerGrantCourseAccess403
      | CourseAccessControllerGrantCourseAccess404
    >,
    { data: CourseAccessControllerGrantCourseAccessMutationRequest },
    TContext
  >(
    {
      mutationFn: async ({ data }) => {
        return courseAccessControllerGrantCourseAccess(data, config)
      },
      mutationKey,
      ...mutationOptions,
    },
    queryClient,
  )
}