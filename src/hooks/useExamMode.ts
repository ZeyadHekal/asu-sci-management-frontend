import { useState, useEffect } from 'react';
import { useWebSocket } from '../services/websocketService';
import { useEventControllerGetStudentExamModeStatus } from '../generated/hooks/eventsHooks/useEventControllerGetStudentExamModeStatus';
import { ExamModeStatusDto } from '../generated/types/ExamModeStatusDto';
import { useAuthStore } from '../store/authStore';

export const useExamMode = () => {
    const [examModeStatus, setExamModeStatus] = useState<ExamModeStatusDto | null>(null);
    const [loading, setLoading] = useState(true);
    const { registerMessageHandler } = useWebSocket();
    const currentUserId = useAuthStore((state) => state.user?.id);

    // Fetch initial exam mode status
    const {
        data: apiExamModeStatus,
        isLoading: apiLoading,
        error,
        refetch
    } = useEventControllerGetStudentExamModeStatus({
        query: {
            refetchInterval: 30000, // Poll every 30 seconds as backup
            staleTime: 25000, // Consider data stale after 25 seconds
            enabled: !!currentUserId, // Only fetch when user is logged in
        }
    });

    // Reset state when user changes
    useEffect(() => {
        setExamModeStatus(null);
        setLoading(true);
    }, [currentUserId]);

    // Set initial data from API
    useEffect(() => {
        if (apiExamModeStatus?.data) {
            setExamModeStatus(apiExamModeStatus.data);
        }
        setLoading(apiLoading);
    }, [apiExamModeStatus, apiLoading]);

    // Real-time updates via WebSocket
    useEffect(() => {
        // Only set up WebSocket handlers if user is logged in
        if (!currentUserId) return;

        const handleExamModeChange = (message: any) => {
            console.log('Exam mode status changed:', message.data);
            setExamModeStatus(message.data);
        };

        // Register handler for exam mode status changes
        const unsubscribe = registerMessageHandler('exam:mode_status_change', handleExamModeChange);

        return () => {
            unsubscribe();
        };
    }, [registerMessageHandler, currentUserId]);

    return {
        examModeStatus,
        loading: loading || apiLoading,
        error,
        refetch
    };
}; 