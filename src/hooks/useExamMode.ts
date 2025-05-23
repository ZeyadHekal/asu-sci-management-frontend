import { useState, useEffect } from 'react';
import { useWebSocket } from '../services/websocketService';
import { useEventControllerGetStudentExamModeStatus } from '../generated/hooks/eventsHooks/useEventControllerGetStudentExamModeStatus';
import { ExamModeStatusDto } from '../generated/types/ExamModeStatusDto';

export const useExamMode = () => {
    const [examModeStatus, setExamModeStatus] = useState<ExamModeStatusDto | null>(null);
    const [loading, setLoading] = useState(true);
    const { registerMessageHandler } = useWebSocket();

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
        }
    });

    // Set initial data from API
    useEffect(() => {
        if (apiExamModeStatus?.data) {
            setExamModeStatus(apiExamModeStatus.data);
        }
        setLoading(apiLoading);
    }, [apiExamModeStatus, apiLoading]);

    // Real-time updates via WebSocket
    useEffect(() => {
        const handleExamModeChange = (message: any) => {
            console.log('Exam mode status changed:', message.data);
            setExamModeStatus(message.data);
        };

        // Register handler for exam mode status changes
        const unsubscribe = registerMessageHandler('exam:mode_status_change', handleExamModeChange);

        return () => {
            unsubscribe();
        };
    }, [registerMessageHandler]);

    return {
        examModeStatus,
        loading: loading || apiLoading,
        error,
        refetch
    };
}; 