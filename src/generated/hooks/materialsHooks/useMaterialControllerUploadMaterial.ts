/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import client from '../../../global/api/apiClient'
import type { RequestConfig, ResponseConfig, ResponseErrorConfig } from '../../../global/api/apiClient'
import type { UseMutationOptions, QueryClient } from '@tanstack/react-query'
import type {
  MaterialControllerUploadMaterialMutationRequest,
  MaterialControllerUploadMaterialMutationResponse,
  MaterialControllerUploadMaterialPathParams,
  MaterialControllerUploadMaterial400,
  MaterialControllerUploadMaterial401,
  MaterialControllerUploadMaterial403,
} from '../../types/materialsController/MaterialControllerUploadMaterial.ts'
import { useMutation } from '@tanstack/react-query'

export const materialControllerUploadMaterialMutationKey = () => [{ url: '/materials/course/{courseId}' }] as const

export type MaterialControllerUploadMaterialMutationKey = ReturnType<typeof materialControllerUploadMaterialMutationKey>

/**
 * @description Upload files as course materials
 * @summary Upload course material
 * {@link /materials/course/:courseId}
 */
export async function materialControllerUploadMaterial(
  courseId: MaterialControllerUploadMaterialPathParams['courseId'],
  data: MaterialControllerUploadMaterialMutationRequest,
  config: Partial<RequestConfig<MaterialControllerUploadMaterialMutationRequest>> & { client?: typeof client } = {},
) {
  const { client: request = client, ...requestConfig } = config

  const formData = new FormData()
  if (data) {
    Object.keys(data).forEach((key) => {
      const value = data[key as keyof typeof data]
      if (typeof key === 'string' && (typeof value === 'string' || value instanceof Blob)) {
        formData.append(key, value as unknown as string)
      }
    })
  }
  const res = await request<
    MaterialControllerUploadMaterialMutationResponse,
    ResponseErrorConfig<MaterialControllerUploadMaterial400 | MaterialControllerUploadMaterial401 | MaterialControllerUploadMaterial403>,
    MaterialControllerUploadMaterialMutationRequest
  >({
    method: 'POST',
    url: `/materials/course/${courseId}`,
    data: formData,
    ...requestConfig,
    headers: { 'Content-Type': 'multipart/form-data', ...requestConfig.headers },
  })
  return res
}

/**
 * @description Upload files as course materials
 * @summary Upload course material
 * {@link /materials/course/:courseId}
 */
export function useMaterialControllerUploadMaterial<TContext>(
  options: {
    mutation?: UseMutationOptions<
      ResponseConfig<MaterialControllerUploadMaterialMutationResponse>,
      ResponseErrorConfig<MaterialControllerUploadMaterial400 | MaterialControllerUploadMaterial401 | MaterialControllerUploadMaterial403>,
      { courseId: MaterialControllerUploadMaterialPathParams['courseId']; data: MaterialControllerUploadMaterialMutationRequest },
      TContext
    > & { client?: QueryClient }
    client?: Partial<RequestConfig<MaterialControllerUploadMaterialMutationRequest>> & { client?: typeof client }
  } = {},
) {
  const { mutation: { client: queryClient, ...mutationOptions } = {}, client: config = {} } = options ?? {}
  const mutationKey = mutationOptions?.mutationKey ?? materialControllerUploadMaterialMutationKey()

  return useMutation<
    ResponseConfig<MaterialControllerUploadMaterialMutationResponse>,
    ResponseErrorConfig<MaterialControllerUploadMaterial400 | MaterialControllerUploadMaterial401 | MaterialControllerUploadMaterial403>,
    { courseId: MaterialControllerUploadMaterialPathParams['courseId']; data: MaterialControllerUploadMaterialMutationRequest },
    TContext
  >(
    {
      mutationFn: async ({ courseId, data }) => {
        return materialControllerUploadMaterial(courseId, data, config)
      },
      mutationKey,
      ...mutationOptions,
    },
    queryClient,
  )
}