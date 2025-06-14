/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import { z } from 'zod'

export const proposedGroupSimpleDtoSchema = z.object({
  labId: z.string(),
  proposedCapacity: z.number(),
  autoStart: z.boolean().default(false).describe('Whether this group should auto-start the exam'),
  dateTime: z.string().datetime({ offset: true }).describe('Date and time for this group schedule'),
  assistantIds: z.array(z.string()).describe('Assistant IDs for this group'),
})

export type ProposedGroupSimpleDtoSchema = z.infer<typeof proposedGroupSimpleDtoSchema>