/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import { z } from 'zod'

export const eventGroupDtoSchema = z.object({
  id: z.string().describe('Event group ID'),
  eventId: z.string().describe('Event ID'),
  eventName: z.string().describe('Event name'),
  labName: z.string().describe('Lab name'),
  dateTime: z.string().datetime({ offset: true }).describe('Date and time of the event'),
  maxStudents: z.number().describe('Maximum number of students'),
  enrolledStudents: z.number().describe('Number of enrolled students'),
  autoStart: z.boolean().describe('Whether auto-start is enabled'),
  status: z.string().describe('Current status of the event group'),
  actualStartTime: z.string().datetime({ offset: true }).describe('Actual start time').optional(),
  actualEndTime: z.string().datetime({ offset: true }).describe('Actual end time').optional(),
  examModeStartTime: z.string().datetime({ offset: true }).describe('Exam mode start time').optional(),
})

export type EventGroupDtoSchema = z.infer<typeof eventGroupDtoSchema>