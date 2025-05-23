import { useState, useEffect } from "react";
import { LuFileText, LuTriangle } from "react-icons/lu";
import { useDeviceControllerGetDeviceReports } from "../../../generated/hooks/devicesHooks/useDeviceControllerGetDeviceReports";
import { DeviceReportDto } from "../../../generated/types/DeviceReportDto";
import { getReportStatusBadge, getReportStatusLabel } from "../../../global/constants/reportStatus";
import { useDeviceAssistantWebSocket } from "../../../services/deviceReportWebSocketService";
import { useWebSocket } from "../../../services/websocketService";

interface DeviceReportsWidgetProps {
  deviceId: string;
  deviceName?: string;
}

const DeviceReportsWidget = ({ deviceId, deviceName }: DeviceReportsWidgetProps) => {
  const [reports, setReports] = useState<DeviceReportDto[]>([]);

  // Initialize WebSocket connections
  const { connect: connectWebSocket, status: webSocketStatus } = useWebSocket();
  const { registerForDevices } = useDeviceAssistantWebSocket([deviceId]);

  // Fetch device reports using kubb generated hook
  const { data: reportsData, isLoading, error, refetch } = useDeviceControllerGetDeviceReports(deviceId);

  // Initialize WebSocket connection
  useEffect(() => {
    connectWebSocket();
  }, [connectWebSocket]);

  // Set up WebSocket event handlers for this specific device
  useEffect(() => {
    if (webSocketStatus === 'connected') {
      const unsubscribe = registerForDevices((message) => {
        // Refetch reports when this device's reports are updated
        if (message.type === 'device_report:created' || 
            message.type === 'device_report:updated' || 
            message.type === 'device_report:status_changed') {
          refetch();
        }
      });

      return unsubscribe;
    }
  }, [webSocketStatus, registerForDevices, refetch]);

  useEffect(() => {
    if (reportsData?.data) {
      // Handle both array and single object responses
      const reportsArray = Array.isArray(reportsData.data) ? reportsData.data : [reportsData.data];
      setReports(reportsArray);
    } else {
      // Use temporary data when API is not available
      const tempReports: DeviceReportDto[] = [
        {
          id: `temp-${deviceId}-1`,
          description: "Keyboard keys are sticking and not responding properly",
          status: "PENDING_REVIEW",
          deviceId: deviceId,
          appId: "general",
          created_at: new Date("2024-03-15T10:30:00Z"),
          updated_at: new Date("2024-03-15T10:30:00Z"),
          deviceName: deviceName || "Unknown Device",
          reporterName: "Ahmed Hassan"
        },
        {
          id: `temp-${deviceId}-2`,
          description: "Monitor display flickering during use",
          status: "IN_PROGRESS",
          deviceId: deviceId,
          appId: "general",
          fixMessage: "Checking display cables and drivers",
          created_at: new Date("2024-03-14T14:20:00Z"),
          updated_at: new Date("2024-03-15T09:15:00Z"),
          deviceName: deviceName || "Unknown Device",
          reporterName: "Sara Mohamed"
        }
      ];
      setReports(tempReports);
    }
  }, [reportsData, deviceId, deviceName]);

  if (isLoading) {
    return (
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <LuFileText size={18} className="text-orange-600" />
          <h3 className="font-medium text-gray-800">Device Reports</h3>
        </div>
        <div className="text-sm text-gray-500">Loading reports...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <LuFileText size={18} className="text-orange-600" />
          <h3 className="font-medium text-gray-800">Device Reports</h3>
        </div>
        <div className="text-sm text-red-500">Error loading reports</div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "RESOLVED":
        return "✓";
      case "IN_PROGRESS":
        return "⏳";
      case "CANCELLED":
        return "✗";
      default:
        return "!";
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <LuFileText size={18} className="text-orange-600" />
          <h3 className="font-medium text-gray-800">Device Reports</h3>
        </div>
        <span className="text-sm text-gray-500">{reports.length} total</span>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-4">
          <LuTriangle size={24} className="mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">No reports found for this device</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.slice(0, 3).map((report) => (
            <div key={report.id} className="border-l-4 border-orange-200 pl-3 py-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800 mb-1">
                    {report.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>By: {report.reporterName || "Unknown"}</span>
                    <span>•</span>
                    <span>{new Date(report.created_at).toLocaleDateString()}</span>
                  </div>
                  {report.fixMessage && (
                    <p className="text-xs text-blue-600 mt-1">{report.fixMessage}</p>
                  )}
                </div>
                <div className="ml-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getReportStatusBadge(report.status)}`}>
                    {getStatusIcon(report.status)} {getReportStatusLabel(report.status)}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {reports.length > 3 && (
            <div className="text-center pt-2">
              <button className="text-sm text-secondary hover:text-secondary-dark">
                View all {reports.length} reports →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DeviceReportsWidget; 