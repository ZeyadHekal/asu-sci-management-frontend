/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import client from '../../../global/api/apiClient'
import type { RequestConfig, ResponseErrorConfig, ResponseConfig } from '../../../global/api/apiClient'
import type { InfiniteData, QueryKey, QueryClient, InfiniteQueryObserverOptions, UseInfiniteQueryResult } from '@tanstack/react-query'
import type { FileControllerGetSignedUrlQueryResponse, FileControllerGetSignedUrlPathParams } from '../../types/filesController/FileControllerGetSignedUrl.ts'
import { infiniteQueryOptions, useInfiniteQuery } from '@tanstack/react-query'

export const fileControllerGetSignedUrlInfiniteQueryKey = (id: FileControllerGetSignedUrlPathParams['id']) =>
  [{ url: '/files/:id/url', params: { id: id } }] as const

export type FileControllerGetSignedUrlInfiniteQueryKey = ReturnType<typeof fileControllerGetSignedUrlInfiniteQueryKey>

/**
 * @summary Get signed URL for file access
 * {@link /files/:id/url}
 */
export async function fileControllerGetSignedUrlInfinite(
  id: FileControllerGetSignedUrlPathParams['id'],
  config: Partial<RequestConfig> & { client?: typeof client } = {},
) {
  const { client: request = client, ...requestConfig } = config

  const res = await request<FileControllerGetSignedUrlQueryResponse, ResponseErrorConfig<Error>, unknown>({
    method: 'GET',
    url: `/files/${id}/url`,
    ...requestConfig,
  })
  return res
}

export function fileControllerGetSignedUrlInfiniteQueryOptions(
  id: FileControllerGetSignedUrlPathParams['id'],
  config: Partial<RequestConfig> & { client?: typeof client } = {},
) {
  const queryKey = fileControllerGetSignedUrlInfiniteQueryKey(id)
  return infiniteQueryOptions<
    ResponseConfig<FileControllerGetSignedUrlQueryResponse>,
    ResponseErrorConfig<Error>,
    ResponseConfig<FileControllerGetSignedUrlQueryResponse>,
    typeof queryKey
  >({
    enabled: !!id,
    queryKey,
    queryFn: async ({ signal }) => {
      config.signal = signal
      return fileControllerGetSignedUrlInfinite(id, config)
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage['page'],
    getPreviousPageParam: (firstPage) => firstPage['page'],
  })
}

/**
 * @summary Get signed URL for file access
 * {@link /files/:id/url}
 */
export function useFileControllerGetSignedUrlInfinite<
  TData = InfiniteData<ResponseConfig<FileControllerGetSignedUrlQueryResponse>>,
  TQueryData = ResponseConfig<FileControllerGetSignedUrlQueryResponse>,
  TQueryKey extends QueryKey = FileControllerGetSignedUrlInfiniteQueryKey,
>(
  id: FileControllerGetSignedUrlPathParams['id'],
  options: {
    query?: Partial<
      InfiniteQueryObserverOptions<ResponseConfig<FileControllerGetSignedUrlQueryResponse>, ResponseErrorConfig<Error>, TData, TQueryData, TQueryKey>
    > & { client?: QueryClient }
    client?: Partial<RequestConfig> & { client?: typeof client }
  } = {},
) {
  const { query: { client: queryClient, ...queryOptions } = {}, client: config = {} } = options ?? {}
  const queryKey = queryOptions?.queryKey ?? fileControllerGetSignedUrlInfiniteQueryKey(id)

  const query = useInfiniteQuery(
    {
      ...(fileControllerGetSignedUrlInfiniteQueryOptions(id, config) as unknown as InfiniteQueryObserverOptions),
      queryKey,
      ...(queryOptions as unknown as Omit<InfiniteQueryObserverOptions, 'queryKey'>),
    },
    queryClient,
  ) as UseInfiniteQueryResult<TData, ResponseErrorConfig<Error>> & { queryKey: TQueryKey }

  query.queryKey = queryKey as TQueryKey

  return query
}