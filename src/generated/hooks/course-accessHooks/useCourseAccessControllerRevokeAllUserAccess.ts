/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import client from '../../../global/api/apiClient'
import type { RequestConfig, ResponseConfig, ResponseErrorConfig } from '../../../global/api/apiClient'
import type { UseMutationOptions, QueryClient } from '@tanstack/react-query'
import type {
  CourseAccessControllerRevokeAllUserAccessMutationResponse,
  CourseAccessControllerRevokeAllUserAccessPathParams,
  CourseAccessControllerRevokeAllUserAccess401,
  CourseAccessControllerRevokeAllUserAccess403,
  CourseAccessControllerRevokeAllUserAccess404,
} from '../../types/course-accessController/CourseAccessControllerRevokeAllUserAccess.ts'
import { useMutation } from '@tanstack/react-query'

export const courseAccessControllerRevokeAllUserAccessMutationKey = () => [{ url: '/course-access/permissions/{userId}/{courseId}/all' }] as const

export type CourseAccessControllerRevokeAllUserAccessMutationKey = ReturnType<typeof courseAccessControllerRevokeAllUserAccessMutationKey>

/**
 * @description Revoke all access permissions from an assistant for a course
 * @summary Revoke all permissions for user
 * {@link /course-access/permissions/:userId/:courseId/all}
 */
export async function courseAccessControllerRevokeAllUserAccess(
  userId: CourseAccessControllerRevokeAllUserAccessPathParams['userId'],
  courseId: CourseAccessControllerRevokeAllUserAccessPathParams['courseId'],
  config: Partial<RequestConfig> & { client?: typeof client } = {},
) {
  const { client: request = client, ...requestConfig } = config

  const res = await request<
    CourseAccessControllerRevokeAllUserAccessMutationResponse,
    ResponseErrorConfig<
      CourseAccessControllerRevokeAllUserAccess401 | CourseAccessControllerRevokeAllUserAccess403 | CourseAccessControllerRevokeAllUserAccess404
    >,
    unknown
  >({ method: 'DELETE', url: `/course-access/permissions/${userId}/${courseId}/all`, ...requestConfig })
  return res
}

/**
 * @description Revoke all access permissions from an assistant for a course
 * @summary Revoke all permissions for user
 * {@link /course-access/permissions/:userId/:courseId/all}
 */
export function useCourseAccessControllerRevokeAllUserAccess<TContext>(
  options: {
    mutation?: UseMutationOptions<
      ResponseConfig<CourseAccessControllerRevokeAllUserAccessMutationResponse>,
      ResponseErrorConfig<
        CourseAccessControllerRevokeAllUserAccess401 | CourseAccessControllerRevokeAllUserAccess403 | CourseAccessControllerRevokeAllUserAccess404
      >,
      { userId: CourseAccessControllerRevokeAllUserAccessPathParams['userId']; courseId: CourseAccessControllerRevokeAllUserAccessPathParams['courseId'] },
      TContext
    > & { client?: QueryClient }
    client?: Partial<RequestConfig> & { client?: typeof client }
  } = {},
) {
  const { mutation: { client: queryClient, ...mutationOptions } = {}, client: config = {} } = options ?? {}
  const mutationKey = mutationOptions?.mutationKey ?? courseAccessControllerRevokeAllUserAccessMutationKey()

  return useMutation<
    ResponseConfig<CourseAccessControllerRevokeAllUserAccessMutationResponse>,
    ResponseErrorConfig<
      CourseAccessControllerRevokeAllUserAccess401 | CourseAccessControllerRevokeAllUserAccess403 | CourseAccessControllerRevokeAllUserAccess404
    >,
    { userId: CourseAccessControllerRevokeAllUserAccessPathParams['userId']; courseId: CourseAccessControllerRevokeAllUserAccessPathParams['courseId'] },
    TContext
  >(
    {
      mutationFn: async ({ userId, courseId }) => {
        return courseAccessControllerRevokeAllUserAccess(userId, courseId, config)
      },
      mutationKey,
      ...mutationOptions,
    },
    queryClient,
  )
}