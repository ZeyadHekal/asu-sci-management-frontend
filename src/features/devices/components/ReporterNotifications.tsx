import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useReporterWebSocket } from '../../../services/deviceReportWebSocketService';
import { useAuthStore } from '../../../store/authStore';
import { LuBell, LuBellOff } from 'react-icons/lu';

interface ReporterNotificationsProps {
    enabled?: boolean;
}

const ReporterNotifications = ({ enabled = true }: ReporterNotificationsProps) => {
    const [isListening, setIsListening] = useState(false);
    const [notificationCount, setNotificationCount] = useState(0);
    const { user } = useAuthStore();
    const { registerForReports } = useReporterWebSocket(user?.id);

    useEffect(() => {
        if (!enabled || !user?.id) return;

        // Register for real-time updates on this reporter's reports
        const unsubscribe = registerForReports((message) => {
            setNotificationCount(prev => prev + 1);

            switch (message.type) {
                case 'device_report:status_changed':
                    const statusData = message.data;
                    toast.success(
                        `Your report status updated: ${statusData.deviceName || 'Device'} - ${statusData.newStatus}`,
                        {
                            icon: '🔄',
                            duration: 6000,
                        }
                    );
                    break;

                case 'device_report:updated':
                    const updateData = message.data;
                    toast.info(
                        `Your report was updated: ${updateData.deviceName || 'Device'}`,
                        {
                            icon: '📝',
                            duration: 5000,
                        }
                    );
                    break;

                case 'maintenance_history:created':
                    const maintenanceData = message.data;
                    toast.info(
                        `Maintenance started on ${maintenanceData.deviceName || 'Device'}`,
                        {
                            icon: '🔧',
                            duration: 5000,
                        }
                    );
                    break;

                case 'notification':
                    // Handle general notifications related to this reporter's reports
                    const notificationData = message.data;
                    if (notificationData.message) {
                        toast(notificationData.message, {
                            icon: '📢',
                            duration: 4000,
                        });
                    }
                    break;
            }
        });

        setIsListening(true);

        // Cleanup function
        return () => {
            unsubscribe();
            setIsListening(false);
        };
    }, [enabled, user?.id, registerForReports]);

    if (!enabled || !user) {
        return null;
    }

    return (
        <div className="flex items-center gap-2 text-sm">
            {isListening ? (
                <div className="flex items-center gap-2 text-green-600">
                    <LuBell size={16} className="animate-pulse" />
                    <span>Live notifications on</span>
                    {notificationCount > 0 && (
                        <span className="bg-red-500 text-white rounded-full px-2 py-0.5 text-xs">
                            {notificationCount}
                        </span>
                    )}
                </div>
            ) : (
                <div className="flex items-center gap-2 text-gray-500">
                    <LuBellOff size={16} />
                    <span>Notifications off</span>
                </div>
            )}
        </div>
    );
};

export default ReporterNotifications; 