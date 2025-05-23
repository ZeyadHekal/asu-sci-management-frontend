import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { EventDto } from '../generated/types/EventDto';
import { EventScheduleDto } from '../generated/types/EventScheduleDto';
import { ExamModeStatusDto } from '../generated/types/ExamModeStatusDto';

type ExamStatus = 'scheduled' | 'exam_mode_active' | 'started' | 'ended' | 'cancelled';

interface ExamScheduleWithDetails extends EventScheduleDto {
    eventName?: string;
    courseName?: string;
    status?: ExamStatus;
    enrolledStudents?: number;
    maxStudents?: number;
}

interface ExamStore {
    // Current exam state
    currentExamMode: boolean;
    currentExamSchedules: ExamScheduleWithDetails[];
    examModeStatus: ExamModeStatusDto | null;
    currentExamScheduleId: string | null;

    // Admin exam management
    events: EventDto[];
    selectedEvent: EventDto | null;
    eventSchedules: Map<string, ExamScheduleWithDetails[]>;

    // Real-time updates
    subscribedChannels: Set<string>;
    examNotifications: any[];

    // Actions
    setExamMode: (enabled: boolean) => void;
    setExamModeStatus: (status: ExamModeStatusDto) => void;
    setCurrentExamScheduleId: (id: string | null) => void;
    addExamNotification: (notification: any) => void;
    clearExamNotifications: () => void;
    resetExamStore: () => void;
    setEvents: (events: EventDto[]) => void;
    setSelectedEvent: (event: EventDto | null) => void;
    addEventSchedule: (eventId: string, schedule: ExamScheduleWithDetails) => void;
    updateEventScheduleStatus: (scheduleId: string, status: ExamStatus) => void;
    subscribeToChannel: (channelId: string) => void;
    unsubscribeFromChannel: (channelId: string) => void;

    // Computed getters
    getActiveExams: () => ExamScheduleWithDetails[];
    getUpcomingExams: () => ExamScheduleWithDetails[];
    getTodayExams: () => ExamScheduleWithDetails[];
}

export const useExamStore = create<ExamStore>()(
    devtools(
        (set, get) => ({
            // Initial state
            currentExamMode: false,
            currentExamSchedules: [],
            examModeStatus: null,
            currentExamScheduleId: null,
            events: [],
            selectedEvent: null,
            eventSchedules: new Map(),
            subscribedChannels: new Set(),
            examNotifications: [],

            // Actions
            setExamMode: (enabled) =>
                set({ currentExamMode: enabled }, false, 'setExamMode'),

            setExamModeStatus: (status) =>
                set((state) => {
                    // Get the active exam schedule ID from the status
                    const activeSchedule = status.examSchedules?.find(
                        schedule => schedule.status === 'started' || schedule.status === 'exam_mode_active'
                    );
                    const scheduleId = activeSchedule?.eventScheduleId || null;

                    return {
                        examModeStatus: status,
                        currentExamScheduleId: scheduleId
                    };
                }, false, 'setExamModeStatus'),

            setCurrentExamScheduleId: (id) =>
                set({ currentExamScheduleId: id }, false, 'setCurrentExamScheduleId'),

            addExamNotification: (notification) =>
                set(
                    (state) => ({
                        examNotifications: [...state.examNotifications, notification],
                    }),
                    false,
                    'addExamNotification'
                ),

            clearExamNotifications: () =>
                set({ examNotifications: [] }, false, 'clearExamNotifications'),

            resetExamStore: () =>
                set(
                    {
                        currentExamMode: false,
                        currentExamSchedules: [],
                        examModeStatus: null,
                        currentExamScheduleId: null,
                        events: [],
                        selectedEvent: null,
                        eventSchedules: new Map(),
                        subscribedChannels: new Set(),
                        examNotifications: [],
                    },
                    false,
                    'resetExamStore'
                ),

            setEvents: (events) =>
                set({ events }, false, 'setEvents'),

            setSelectedEvent: (event) =>
                set({ selectedEvent: event }, false, 'setSelectedEvent'),

            addEventSchedule: (eventId, schedule) =>
                set(
                    (state) => {
                        const schedules = new Map(state.eventSchedules);
                        const eventSchedules = schedules.get(eventId) || [];
                        schedules.set(eventId, [...eventSchedules, schedule]);
                        return { eventSchedules: schedules };
                    },
                    false,
                    'addEventSchedule'
                ),

            updateEventScheduleStatus: (scheduleId, status) =>
                set(
                    (state) => {
                        const schedules = new Map(state.eventSchedules);
                        for (const [eventId, eventSchedules] of schedules.entries()) {
                            const updated = eventSchedules.map((schedule) =>
                                schedule.id === scheduleId ? { ...schedule, status } : schedule
                            );
                            schedules.set(eventId, updated);
                        }

                        // Also update current exam schedules
                        const updatedCurrentSchedules = state.currentExamSchedules.map((schedule) =>
                            schedule.id === scheduleId ? { ...schedule, status } : schedule
                        );

                        return {
                            eventSchedules: schedules,
                            currentExamSchedules: updatedCurrentSchedules
                        };
                    },
                    false,
                    'updateEventScheduleStatus'
                ),

            subscribeToChannel: (channelId) =>
                set(
                    (state) => ({
                        subscribedChannels: new Set([...state.subscribedChannels, channelId]),
                    }),
                    false,
                    'subscribeToChannel'
                ),

            unsubscribeFromChannel: (channelId) =>
                set(
                    (state) => {
                        const channels = new Set(state.subscribedChannels);
                        channels.delete(channelId);
                        return { subscribedChannels: channels };
                    },
                    false,
                    'unsubscribeFromChannel'
                ),

            // Computed getters
            getActiveExams: () => {
                const { currentExamSchedules } = get();
                return currentExamSchedules.filter(
                    (exam) => exam.status === 'exam_mode_active' || exam.status === 'started'
                );
            },

            getUpcomingExams: () => {
                const { currentExamSchedules } = get();
                const now = new Date();
                return currentExamSchedules.filter(
                    (exam) => new Date(exam.dateTime) > now && exam.status === 'scheduled'
                );
            },

            getTodayExams: () => {
                const { currentExamSchedules } = get();
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);

                return currentExamSchedules.filter((exam) => {
                    const examDate = new Date(exam.dateTime);
                    return examDate >= today && examDate < tomorrow;
                });
            },
        }),
        { name: 'ExamStore' }
    )
); 