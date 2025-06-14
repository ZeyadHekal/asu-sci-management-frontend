/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import client from '../../../global/api/apiClient'
import type { RequestConfig, ResponseConfig, ResponseErrorConfig } from '../../../global/api/apiClient'
import type { UseMutationOptions, QueryClient } from '@tanstack/react-query'
import type {
  StudentFilesControllerDeleteStudentFileMutationResponse,
  StudentFilesControllerDeleteStudentFilePathParams,
} from '../../types/student-filesController/StudentFilesControllerDeleteStudentFile.ts'
import { useMutation } from '@tanstack/react-query'

export const studentFilesControllerDeleteStudentFileMutationKey = () => [{ url: '/student-files/{fileId}' }] as const

export type StudentFilesControllerDeleteStudentFileMutationKey = ReturnType<typeof studentFilesControllerDeleteStudentFileMutationKey>

/**
 * @summary Delete a student's submitted file
 * {@link /student-files/:fileId}
 */
export async function studentFilesControllerDeleteStudentFile(
  fileId: StudentFilesControllerDeleteStudentFilePathParams['fileId'],
  config: Partial<RequestConfig> & { client?: typeof client } = {},
) {
  const { client: request = client, ...requestConfig } = config

  const res = await request<StudentFilesControllerDeleteStudentFileMutationResponse, ResponseErrorConfig<Error>, unknown>({
    method: 'DELETE',
    url: `/student-files/${fileId}`,
    ...requestConfig,
  })
  return res
}

/**
 * @summary Delete a student's submitted file
 * {@link /student-files/:fileId}
 */
export function useStudentFilesControllerDeleteStudentFile<TContext>(
  options: {
    mutation?: UseMutationOptions<
      ResponseConfig<StudentFilesControllerDeleteStudentFileMutationResponse>,
      ResponseErrorConfig<Error>,
      { fileId: StudentFilesControllerDeleteStudentFilePathParams['fileId'] },
      TContext
    > & { client?: QueryClient }
    client?: Partial<RequestConfig> & { client?: typeof client }
  } = {},
) {
  const { mutation: { client: queryClient, ...mutationOptions } = {}, client: config = {} } = options ?? {}
  const mutationKey = mutationOptions?.mutationKey ?? studentFilesControllerDeleteStudentFileMutationKey()

  return useMutation<
    ResponseConfig<StudentFilesControllerDeleteStudentFileMutationResponse>,
    ResponseErrorConfig<Error>,
    { fileId: StudentFilesControllerDeleteStudentFilePathParams['fileId'] },
    TContext
  >(
    {
      mutationFn: async ({ fileId }) => {
        return studentFilesControllerDeleteStudentFile(fileId, config)
      },
      mutationKey,
      ...mutationOptions,
    },
    queryClient,
  )
}