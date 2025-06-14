/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import client from '../../../global/api/apiClient'
import type { RequestConfig, ResponseConfig, ResponseErrorConfig } from '../../../global/api/apiClient'
import type { UseMutationOptions, QueryClient } from '@tanstack/react-query'
import type {
  EventControllerAddGroupToSimulationMutationRequest,
  EventControllerAddGroupToSimulationMutationResponse,
  EventControllerAddGroupToSimulationPathParams,
} from '../../types/eventsController/EventControllerAddGroupToSimulation.ts'
import { useMutation } from '@tanstack/react-query'

export const eventControllerAddGroupToSimulationMutationKey = () => [{ url: '/events/{courseId}/simulate-groups/add-group' }] as const

export type EventControllerAddGroupToSimulationMutationKey = ReturnType<typeof eventControllerAddGroupToSimulationMutationKey>

/**
 * @summary Add a group to the simulation by selecting a lab
 * {@link /events/:courseId/simulate-groups/add-group}
 */
export async function eventControllerAddGroupToSimulation(
  courseId: EventControllerAddGroupToSimulationPathParams['courseId'],
  data: EventControllerAddGroupToSimulationMutationRequest,
  config: Partial<RequestConfig<EventControllerAddGroupToSimulationMutationRequest>> & { client?: typeof client } = {},
) {
  const { client: request = client, ...requestConfig } = config

  const res = await request<
    EventControllerAddGroupToSimulationMutationResponse,
    ResponseErrorConfig<Error>,
    EventControllerAddGroupToSimulationMutationRequest
  >({ method: 'POST', url: `/events/${courseId}/simulate-groups/add-group`, data, ...requestConfig })
  return res
}

/**
 * @summary Add a group to the simulation by selecting a lab
 * {@link /events/:courseId/simulate-groups/add-group}
 */
export function useEventControllerAddGroupToSimulation<TContext>(
  options: {
    mutation?: UseMutationOptions<
      ResponseConfig<EventControllerAddGroupToSimulationMutationResponse>,
      ResponseErrorConfig<Error>,
      { courseId: EventControllerAddGroupToSimulationPathParams['courseId']; data: EventControllerAddGroupToSimulationMutationRequest },
      TContext
    > & { client?: QueryClient }
    client?: Partial<RequestConfig<EventControllerAddGroupToSimulationMutationRequest>> & { client?: typeof client }
  } = {},
) {
  const { mutation: { client: queryClient, ...mutationOptions } = {}, client: config = {} } = options ?? {}
  const mutationKey = mutationOptions?.mutationKey ?? eventControllerAddGroupToSimulationMutationKey()

  return useMutation<
    ResponseConfig<EventControllerAddGroupToSimulationMutationResponse>,
    ResponseErrorConfig<Error>,
    { courseId: EventControllerAddGroupToSimulationPathParams['courseId']; data: EventControllerAddGroupToSimulationMutationRequest },
    TContext
  >(
    {
      mutationFn: async ({ courseId, data }) => {
        return eventControllerAddGroupToSimulation(courseId, data, config)
      },
      mutationKey,
      ...mutationOptions,
    },
    queryClient,
  )
}