import { useWebSocketStore, WebSocketMessage, MessageHandler } from './websocketService';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';
import { create } from 'zustand';
import { DeviceReportDto } from '../generated/types/DeviceReportDto';
import { DeviceReportListDto } from '../generated/types/DeviceReportListDto';
import { MaintenanceHistoryListDto } from '../generated/types/MaintenanceHistoryListDto';

// Device report specific WebSocket message types
export type DeviceReportWebSocketMessageType =
    | 'device_report:created'
    | 'device_report:updated'
    | 'device_report:status_changed'
    | 'device_report:assigned'
    | 'maintenance_history:created'
    | 'maintenance_history:updated'
    | 'device_report:counter_update'
    | 'notification';

// Device report WebSocket message data structures
export interface DeviceReportCreatedData {
    report: DeviceReportDto;
    deviceId: string;
    deviceName?: string;
    reporterId?: string;
    reporterName?: string;
}

export interface DeviceReportUpdatedData {
    report: DeviceReportDto;
    oldStatus?: string;
    newStatus?: string;
    deviceId: string;
    deviceName?: string;
    updatedBy?: string;
    updatedByName?: string;
}

export interface DeviceReportStatusChangedData {
    reportId: string;
    oldStatus: string;
    newStatus: string;
    deviceId: string;
    deviceName?: string;
    updatedBy?: string;
    updatedByName?: string;
    fixMessage?: string;
}

export interface DeviceReportAssignedData {
    reportId: string;
    deviceId: string;
    deviceName?: string;
    assignedTo?: string;
    assignedToName?: string;
    assignedBy?: string;
    assignedByName?: string;
}

export interface MaintenanceHistoryCreatedData {
    maintenance: MaintenanceHistoryListDto;
    reportId?: string;
    deviceId: string;
    deviceName?: string;
    createdBy?: string;
    createdByName?: string;
}

export interface MaintenanceHistoryUpdatedData {
    maintenance: MaintenanceHistoryListDto;
    reportId?: string;
    deviceId: string;
    deviceName?: string;
    updatedBy?: string;
    updatedByName?: string;
}

export interface DeviceReportCounterUpdateData {
    deviceId: string;
    deviceName?: string;
    totalReports: number;
    pendingReports: number;
    inProgressReports: number;
    resolvedReports: number;
}

// Device report WebSocket store interface
interface DeviceReportWebSocketStore {
    isConnected: boolean;
    reconnectAttempts: number;
    reportUpdateHandlers: Map<string, MessageHandler[]>;
    counterUpdateHandlers: MessageHandler[];
    notificationHandlers: MessageHandler[];
    connect: () => void;
    disconnect: () => void;
    registerReportUpdateHandler: (deviceId: string, handler: MessageHandler) => () => void;
    registerCounterUpdateHandler: (handler: MessageHandler) => () => void;
    registerNotificationHandler: (handler: MessageHandler) => () => void;
    unregisterAllHandlers: () => void;
}

// Create device report WebSocket store using Zustand
export const useDeviceReportWebSocketStore = create<DeviceReportWebSocketStore>((set, get) => ({
    isConnected: false,
    reconnectAttempts: 0,
    reportUpdateHandlers: new Map(),
    counterUpdateHandlers: [],
    notificationHandlers: [],

    connect: () => {
        const { status, registerMessageHandler } = useWebSocketStore.getState();

        if (status === 'connected' || status === 'connecting') {
            set({ isConnected: status === 'connected' });
            return;
        }

        // Register all device report related message handlers
        const messageTypes: DeviceReportWebSocketMessageType[] = [
            'device_report:created',
            'device_report:updated',
            'device_report:status_changed',
            'device_report:assigned',
            'maintenance_history:created',
            'maintenance_history:updated',
            'device_report:counter_update',
            'notification'
        ];

        messageTypes.forEach(messageType => {
            registerMessageHandler(messageType as any, (message: WebSocketMessage) => {
                const { reportUpdateHandlers, counterUpdateHandlers, notificationHandlers } = get();

                try {
                    switch (message.type) {
                        case 'device_report:created':
                        case 'device_report:updated':
                        case 'device_report:status_changed':
                        case 'device_report:assigned':
                        case 'maintenance_history:created':
                        case 'maintenance_history:updated':
                            const reportData = message.data as DeviceReportCreatedData | DeviceReportUpdatedData | DeviceReportStatusChangedData | DeviceReportAssignedData | MaintenanceHistoryCreatedData | MaintenanceHistoryUpdatedData;
                            const deviceId = reportData.deviceId;

                            // Notify handlers for this specific device
                            const deviceHandlers = reportUpdateHandlers.get(deviceId) || [];
                            deviceHandlers.forEach(handler => handler(message));

                            // Also notify handlers for all devices (using '*' as wildcard)
                            const allDeviceHandlers = reportUpdateHandlers.get('*') || [];
                            allDeviceHandlers.forEach(handler => handler(message));

                            // Show toast notification for relevant users
                            const currentUserId = useAuthStore.getState().user?.id;
                            if (message.type === 'device_report:created') {
                                const createData = message.data as DeviceReportCreatedData;
                                if (createData.reporterId !== currentUserId) {
                                    toast(`New report: ${createData.deviceName || 'Device'} - ${createData.report.description.substring(0, 50)}...`, {
                                        icon: '📋',
                                        duration: 5000,
                                    });
                                }
                            } else if (message.type === 'device_report:status_changed') {
                                const statusData = message.data as DeviceReportStatusChangedData;
                                if (statusData.updatedBy !== currentUserId) {
                                    toast(`Report status updated: ${statusData.deviceName || 'Device'} - ${statusData.newStatus}`, {
                                        icon: '🔄',
                                        duration: 4000,
                                    });
                                }
                            }
                            break;

                        case 'device_report:counter_update':
                            const counterData = message.data as DeviceReportCounterUpdateData;
                            counterUpdateHandlers.forEach(handler => handler(message));
                            break;

                        case 'notification':
                            notificationHandlers.forEach(handler => handler(message));
                            break;
                    }
                } catch (error) {
                    console.error('Error handling device report WebSocket message:', error);
                }
            });
        });

        set({ isConnected: true });
    },

    disconnect: () => {
        set({
            isConnected: false,
            reportUpdateHandlers: new Map(),
            counterUpdateHandlers: [],
            notificationHandlers: []
        });
    },

    registerReportUpdateHandler: (deviceId: string, handler: MessageHandler) => {
        const { reportUpdateHandlers } = get();
        const handlers = reportUpdateHandlers.get(deviceId) || [];
        handlers.push(handler);
        reportUpdateHandlers.set(deviceId, handlers);

        // Return unsubscribe function
        return () => {
            const { reportUpdateHandlers } = get();
            const handlers = reportUpdateHandlers.get(deviceId) || [];
            reportUpdateHandlers.set(
                deviceId,
                handlers.filter(h => h !== handler)
            );
        };
    },

    registerCounterUpdateHandler: (handler: MessageHandler) => {
        const { counterUpdateHandlers } = get();
        counterUpdateHandlers.push(handler);

        // Return unsubscribe function
        return () => {
            const { counterUpdateHandlers } = get();
            const updatedHandlers = counterUpdateHandlers.filter(h => h !== handler);
            set({ counterUpdateHandlers: updatedHandlers });
        };
    },

    registerNotificationHandler: (handler: MessageHandler) => {
        const { notificationHandlers } = get();
        notificationHandlers.push(handler);

        // Return unsubscribe function
        return () => {
            const { notificationHandlers } = get();
            const updatedHandlers = notificationHandlers.filter(h => h !== handler);
            set({ notificationHandlers: updatedHandlers });
        };
    },

    unregisterAllHandlers: () => {
        set({
            reportUpdateHandlers: new Map(),
            counterUpdateHandlers: [],
            notificationHandlers: []
        });
    }
}));

// Hook for components to use device report WebSocket functionality
export const useDeviceReportWebSocket = () => {
    const store = useDeviceReportWebSocketStore();
    const webSocketStore = useWebSocketStore();

    return {
        isConnected: store.isConnected && webSocketStore.status === 'connected',
        connect: store.connect,
        disconnect: store.disconnect,
        registerReportUpdateHandler: store.registerReportUpdateHandler,
        registerCounterUpdateHandler: store.registerCounterUpdateHandler,
        registerNotificationHandler: store.registerNotificationHandler,
        unregisterAllHandlers: store.unregisterAllHandlers
    };
};

// Hook specifically for device assistants/admins to listen for reports on their devices
export const useDeviceAssistantWebSocket = (deviceIds: string[] = []) => {
    const { registerReportUpdateHandler, registerCounterUpdateHandler } = useDeviceReportWebSocket();

    const registerForDevices = (handler: MessageHandler) => {
        const unsubscribeFunctions: (() => void)[] = [];

        // Register for specific devices
        deviceIds.forEach(deviceId => {
            unsubscribeFunctions.push(registerReportUpdateHandler(deviceId, handler));
        });

        // Also register for counter updates
        unsubscribeFunctions.push(registerCounterUpdateHandler(handler));

        // Return function to unsubscribe from all
        return () => {
            unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
        };
    };

    return {
        registerForDevices,
        registerReportUpdateHandler,
        registerCounterUpdateHandler
    };
};

// Hook specifically for reporters to listen for updates on their reports
export const useReporterWebSocket = (reporterUserId?: string) => {
    const { registerReportUpdateHandler, registerNotificationHandler } = useDeviceReportWebSocket();
    const currentUserId = useAuthStore.getState().user?.id;
    const targetUserId = reporterUserId || currentUserId;

    const registerForReports = (handler: MessageHandler) => {
        // Create a filtered handler that only responds to updates on this user's reports
        const filteredHandler: MessageHandler = (message: WebSocketMessage) => {
            const data = message.data as any;

            // Check if this update is relevant to the current reporter
            if (data.reporterId === targetUserId || data.report?.reporterId === targetUserId) {
                handler(message);
            }
        };

        // Register for all device updates (we'll filter in the handler)
        const unsubscribeReports = registerReportUpdateHandler('*', filteredHandler);
        const unsubscribeNotifications = registerNotificationHandler(filteredHandler);

        // Return function to unsubscribe from all
        return () => {
            unsubscribeReports();
            unsubscribeNotifications();
        };
    };

    return {
        registerForReports,
        registerReportUpdateHandler,
        registerNotificationHandler
    };
}; 