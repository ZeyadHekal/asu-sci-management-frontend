import React from 'react';
import { useWebSocketStore, WebSocketMessage, MessageHandler } from './websocketService';
import { useAuthStore } from '../store/authStore';
import { useExamStore } from '../store/examStore';
import { ExamModeNotification, StudentExamStatus, ExamChannelData } from '../features/admin_exams/types/examTypes';
import { toast } from 'react-hot-toast';
import { create } from 'zustand';
import { useEventControllerGetStudentExamModeStatus } from '../generated/hooks/eventsHooks/useEventControllerGetStudentExamModeStatus';
import { useEventControllerGetStudentScheduleIds } from '../generated/hooks/eventsHooks/useEventControllerGetStudentScheduleIds';

// Exam-specific WebSocket message types
export type ExamWebSocketMessageType =
    | 'exam:mode_start'
    | 'exam:access_granted'
    | 'exam:started'
    | 'exam:ended'
    | 'exam:warning'
    | 'exam:status_update'
    | 'exam:channel_join'
    | 'exam:channel_leave';

// Exam WebSocket store interface for local component state
interface ExamWebSocketStore {
    studentExamStatus: StudentExamStatus | null;
    handleExamModeStart: (notification: ExamModeNotification) => void;
    handleExamAccessGranted: (notification: ExamModeNotification) => void;
    handleExamStarted: (notification: ExamModeNotification) => void;
    handleExamEnded: (notification: ExamModeNotification) => void;
    handleExamWarning: (notification: ExamModeNotification) => void;
    sendExamStatusUpdate: (status: StudentExamStatus) => void;
}

// Create local exam WebSocket store
export const useExamWebSocketStore = create<ExamWebSocketStore>((set, get) => ({
    studentExamStatus: null,

    // Handle exam mode start notification
    handleExamModeStart: (notification: ExamModeNotification) => {
        const authStore = useAuthStore.getState();
        const examStore = useExamStore.getState();

        // Set exam mode in auth store
        authStore.setExamMode(true);
        examStore.setExamMode(true);
        examStore.addExamNotification(notification);

        // Show notification to user
        toast(
            `Exam mode started: ${notification.message}. You can now prepare for your exam.`,
            {
                duration: 8000,
                icon: '📝'
            }
        );

        console.log('Exam mode started:', notification);
    },

    // Handle exam access granted notification
    handleExamAccessGranted: (notification: ExamModeNotification) => {
        const examStore = useExamStore.getState();
        examStore.addExamNotification(notification);

        // Show notification that exam files are now accessible
        toast.success(
            `Exam access granted: ${notification.message}. You can now start your exam.`,
            {
                duration: 10000,
                icon: '🎯'
            }
        );

        // Update student status to indicate they have access
        const currentStatus = get().studentExamStatus;
        if (currentStatus) {
            const updatedStatus: StudentExamStatus = {
                ...currentStatus,
                hasAccess: true,
                status: 'in_exam'
            };
            get().sendExamStatusUpdate(updatedStatus);
        }

        console.log('Exam access granted:', notification);
    },

    // Handle exam started notification
    handleExamStarted: (notification: ExamModeNotification) => {
        const examStore = useExamStore.getState();
        examStore.addExamNotification(notification);

        toast.success(`Exam started: ${notification.message}`, {
            duration: 5000,
            icon: '🚀'
        });

        console.log('Exam started:', notification);
    },

    // Handle exam ended notification
    handleExamEnded: (notification: ExamModeNotification) => {
        const authStore = useAuthStore.getState();
        const examStore = useExamStore.getState();

        authStore.setExamMode(false);
        examStore.setExamMode(false);
        examStore.addExamNotification(notification);

        toast(
            `Exam ended: ${notification.message}`,
            {
                duration: 5000,
                icon: '✅'
            }
        );

        console.log('Exam ended:', notification);
    },

    // Handle exam warning notification
    handleExamWarning: (notification: ExamModeNotification) => {
        const examStore = useExamStore.getState();
        examStore.addExamNotification(notification);

        toast(
            `Exam warning: ${notification.message}`,
            {
                duration: 8000,
                icon: '⚠️'
            }
        );

        console.log('Exam warning:', notification);
    },

    // Send exam status update
    sendExamStatusUpdate: (status: StudentExamStatus) => {
        const wsStore = useWebSocketStore.getState();
        wsStore.sendMessage('exam:status_update', status);
        set({ studentExamStatus: status });
    },
}));

// Main hook for exam WebSocket functionality
export const useExamWebSocket = () => {
    const examLocalStore = useExamWebSocketStore();
    const examStore = useExamStore();
    const baseWS = useWebSocketStore();
    const currentUserId = useAuthStore.getState().user?.id;

    // Setup exam message handlers when this hook is used
    React.useEffect(() => {
        // Only set up handlers if user is logged in
        if (!currentUserId) return;

        // Register handlers for exam-specific messages
        const unsubscribeHandlers: (() => void)[] = [];

        // Handler for exam mode start
        const examModeStartHandler: MessageHandler = (message: WebSocketMessage) => {
            if (message.type === 'exam:mode_start') {
                examLocalStore.handleExamModeStart(message.data as ExamModeNotification);
            }
        };

        // Handler for exam access granted
        const examAccessHandler: MessageHandler = (message: WebSocketMessage) => {
            if (message.type === 'exam:access_granted') {
                examLocalStore.handleExamAccessGranted(message.data as ExamModeNotification);
            }
        };

        // Handler for exam started
        const examStartedHandler: MessageHandler = (message: WebSocketMessage) => {
            if (message.type === 'exam:started') {
                examLocalStore.handleExamStarted(message.data as ExamModeNotification);
            }
        };

        // Handler for exam ended
        const examEndedHandler: MessageHandler = (message: WebSocketMessage) => {
            if (message.type === 'exam:ended') {
                examLocalStore.handleExamEnded(message.data as ExamModeNotification);
            }
        };

        // Handler for exam warnings
        const examWarningHandler: MessageHandler = (message: WebSocketMessage) => {
            if (message.type === 'exam:warning') {
                examLocalStore.handleExamWarning(message.data as ExamModeNotification);
            }
        };

        // Register all handlers
        unsubscribeHandlers.push(
            baseWS.registerMessageHandler('notification', examModeStartHandler),
            baseWS.registerMessageHandler('notification', examAccessHandler),
            baseWS.registerMessageHandler('notification', examStartedHandler),
            baseWS.registerMessageHandler('notification', examEndedHandler),
            baseWS.registerMessageHandler('notification', examWarningHandler)
        );

        // Cleanup function
        return () => {
            unsubscribeHandlers.forEach(unsubscribe => unsubscribe());
        };
    }, [currentUserId]); // Add currentUserId as dependency

    // Subscribe to exam channels for real-time updates
    const subscribeToExamChannels = (channelData: ExamChannelData[]) => {
        channelData.forEach(({ channelName, examId, groupIds }) => {
            if (!examStore.subscribedChannels.has(channelName)) {
                // Send join channel message to backend
                const success = baseWS.sendMessage('exam:channel_join', {
                    channelName,
                    examId,
                    groupIds,
                    studentId: useAuthStore.getState().user?.id
                });

                if (success) {
                    examStore.subscribeToChannel(channelName);
                    console.log(`Subscribed to exam channel: ${channelName}`);
                }
            }
        });
    };

    // Unsubscribe from exam channels
    const unsubscribeFromExamChannels = (channelNames: string[]) => {
        channelNames.forEach(channelName => {
            if (examStore.subscribedChannels.has(channelName)) {
                baseWS.sendMessage('exam:channel_leave', {
                    channelName,
                    studentId: useAuthStore.getState().user?.id
                });
                examStore.unsubscribeFromChannel(channelName);
                console.log(`Unsubscribed from exam channel: ${channelName}`);
            }
        });
    };

    return {
        // Exam-specific methods
        subscribeToExamChannels,
        unsubscribeFromExamChannels,
        sendExamStatusUpdate: examLocalStore.sendExamStatusUpdate,
        clearExamNotifications: examStore.clearExamNotifications,

        // State from stores
        subscribedChannels: examStore.subscribedChannels,
        studentExamStatus: examLocalStore.studentExamStatus,
        activeExamNotifications: examStore.examNotifications,
        currentExamMode: examStore.currentExamMode,
        examModeStatus: examStore.examModeStatus,

        // Base WebSocket functionality
        wsStatus: baseWS.status,
        wsConnect: baseWS.connect,
        wsDisconnect: baseWS.disconnect,
        wsSendMessage: baseWS.sendMessage
    };
};

// Hook to get and monitor student's exam mode status
export const useStudentExamModeStatus = () => {
    const examStore = useExamStore();
    const authStore = useAuthStore();
    const currentUserId = authStore.user?.id;

    const { data: examModeStatus, isLoading, error, refetch } = useEventControllerGetStudentExamModeStatus({
        query: {
            refetchInterval: 30000, // Poll every 30 seconds
            staleTime: 25000, // Consider data stale after 25 seconds
            enabled: !!currentUserId, // Only run query when user is logged in
        }
    });

    // Reset exam store when user changes
    React.useEffect(() => {
        if (currentUserId) {
            // Clear previous user's exam state when switching users
            examStore.resetExamStore();
        }
    }, [currentUserId]);

    React.useEffect(() => {
        if (examModeStatus?.data) {
            examStore.setExamModeStatus(examModeStatus.data);
            // Update exam mode in auth store if needed
            useAuthStore.getState().setExamMode(examModeStatus.data.isInExamMode || false);
            examStore.setExamMode(examModeStatus.data.isInExamMode || false);
        }
    }, [examModeStatus?.data]);

    return {
        examModeStatus: examModeStatus?.data,
        isLoading,
        error,
        refetch
    };
};

// Hook to get student's schedule IDs for WebSocket subscription
export const useStudentScheduleIds = () => {
    const { data: scheduleIds, isLoading, error } = useEventControllerGetStudentScheduleIds({
        query: {
            staleTime: 5 * 60 * 1000, // 5 minutes
        }
    });

    return {
        scheduleIds: scheduleIds?.data || [],
        isLoading,
        error
    };
};

// Helper function to get exam channels for a student using the API
export const getStudentExamChannels = async (studentId: string): Promise<ExamChannelData[]> => {
    try {
        // Use the generated API hook's underlying function
        // This would be implemented by getting schedule IDs and creating channel data
        // For now, we'll return a basic implementation
        return [
            {
                examId: 'exam-today',
                groupIds: [studentId],
                channelName: `exam-${studentId}-today`
            }
        ];
    } catch (error) {
        console.error('Failed to get student exam channels:', error);
        return [];
    }
}; 