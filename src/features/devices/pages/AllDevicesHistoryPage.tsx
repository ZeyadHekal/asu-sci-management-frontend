import { useState, useEffect } from "react";
import { DataTable } from "mantine-datatable";
import { LuSearch, LuDownload, LuArrowLeft } from "react-icons/lu";
import Select from "react-select";
import { toast } from "react-hot-toast";
import { formatDate } from "../../../utils/dateUtils";
import { IoMdTime } from "react-icons/io";
import { UpdateHistoryModal } from "../components";
import { Link, useSearchParams } from "react-router";
import { useDeviceReportWebSocket } from "../../../services/deviceReportWebSocketService";
import { useWebSocket } from "../../../services/websocketService";
import { useDeviceReportControllerGetPaginated } from "../../../generated/hooks/device-reportsHooks/useDeviceReportControllerGetPaginated";
import { deviceReportControllerExportReportsXlsx } from "../../../generated/hooks/device-reportsHooks/useDeviceReportControllerExportReportsXlsx";
import { useDeviceControllerGetAll } from "../../../generated/hooks/devicesHooks/useDeviceControllerGetAll";
import { useLabControllerGetAll } from "../../../generated/hooks/labsHooks/useLabControllerGetAll";
import { useUserControllerGetAllStaff } from "../../../generated/hooks/usersHooks/useUserControllerGetAllStaff";
import { useMaintenanceHistoryControllerGetPaginated } from "../../../generated/hooks/device-maintenance-historyHooks/useMaintenanceHistoryControllerGetPaginated";
import { maintenanceHistoryControllerExportMaintenanceXlsx } from "../../../generated/hooks/device-maintenance-historyHooks/useMaintenanceHistoryControllerExportMaintenanceXlsx";
import { DeviceReportListDto } from "../../../generated/types/DeviceReportListDto";
import { MaintenanceHistoryListDto } from "../../../generated/types/MaintenanceHistoryListDto";
import { ReportStatus, getReportStatusBadge, getReportStatusLabel } from "../../../global/constants/reportStatus";

// Report statuses from the API
const availableReportStatuses = [
    { value: "all", label: "All Statuses" },
    { value: ReportStatus.REPORTED, label: getReportStatusLabel(ReportStatus.REPORTED) },
    { value: ReportStatus.PENDING_REVIEW, label: getReportStatusLabel(ReportStatus.PENDING_REVIEW) },
    { value: ReportStatus.IN_PROGRESS, label: getReportStatusLabel(ReportStatus.IN_PROGRESS) },
    { value: ReportStatus.RESOLVED, label: getReportStatusLabel(ReportStatus.RESOLVED) },
    { value: ReportStatus.REJECTED, label: getReportStatusLabel(ReportStatus.REJECTED) },
    { value: ReportStatus.CANCELLED, label: getReportStatusLabel(ReportStatus.CANCELLED) }
];

// Maintenance statuses
const availableMaintenanceStatuses = [
    { value: "all", label: "All Statuses" },
    { value: "SCHEDULED", label: "Scheduled" },
    { value: "IN_PROGRESS", label: "In Progress" },
    { value: "COMPLETED", label: "Completed" },
    { value: "CANCELLED", label: "Cancelled" },
    { value: "FAILED", label: "Failed" }
];

const AllDevicesHistoryPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState<"reports" | "maintenance">("reports");
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Filter states (always visible now)
    const [deviceFilter, setDeviceFilter] = useState<{ value: string; label: string } | null>(null);
    const [labFilter, setLabFilter] = useState<{ value: string; label: string } | null>(null);
    const [statusFilter, setStatusFilter] = useState<{ value: string; label: string } | null>(null);
    const [assistantFilter, setAssistantFilter] = useState<{ value: string; label: string } | null>(null);
    const [maintenanceStatusFilter, setMaintenanceStatusFilter] = useState<{ value: string; label: string } | null>(null);
    const [dateFromFilter, setDateFromFilter] = useState("");
    const [dateToFilter, setDateToFilter] = useState("");

    // Modal states
    const [isUpdateHistoryModalOpen, setIsUpdateHistoryModalOpen] = useState(false);
    const [selectedReportForHistory, setSelectedReportForHistory] = useState<DeviceReportListDto | null>(null);

    // Initialize WebSocket connections
    const { connect: connectWebSocket, status: webSocketStatus } = useWebSocket();
    const { connect: connectDeviceReportWS, registerReportUpdateHandler } = useDeviceReportWebSocket();

    // Handle tab URL parameters
    useEffect(() => {
        const tabFromUrl = searchParams.get('tab');
        
        if (tabFromUrl && ['reports', 'maintenance'].includes(tabFromUrl)) {
            setActiveTab(tabFromUrl as "reports" | "maintenance");
        } else if (!tabFromUrl) {
            // Set default tab and update URL
            setSearchParams({ tab: 'reports' });
        }
    }, [searchParams, setSearchParams]);

    // Function to handle tab change with URL update
    const handleTabChange = (tabId: "reports" | "maintenance") => {
        setActiveTab(tabId);
        setSearchParams({ tab: tabId });
    };

    // Fetch reports data using kubb generated hooks with backend filtering
    const { data: reportsData, isLoading: reportsLoading, refetch: refetchReports } = useDeviceReportControllerGetPaginated({
        page: page - 1, // Convert to 0-based pagination for backend
        limit: pageSize,
        ...(deviceFilter && { deviceId: deviceFilter.value }),
        ...(labFilter && { labId: labFilter.value }),
        ...(statusFilter && statusFilter.value !== "all" && { status: statusFilter.value as any }),
        ...(assistantFilter && { reporterId: assistantFilter.value }),
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(dateFromFilter && { dateFrom: dateFromFilter }),
        ...(dateToFilter && { dateTo: dateToFilter }),
    });
    
    const { data: devicesData } = useDeviceControllerGetAll();
    const { data: labsData } = useLabControllerGetAll();
    const { data: staffData } = useUserControllerGetAllStaff();
    
    // Fetch maintenance history with pagination (0-based) - using backend filtering
    const { data: maintenanceData, isLoading: maintenanceLoading, refetch: refetchMaintenance } = useMaintenanceHistoryControllerGetPaginated({
        page: page - 1, // Convert to 0-based pagination for backend
        limit: pageSize,
        ...(deviceFilter && { deviceId: deviceFilter.value }),
        ...(labFilter && { labId: labFilter.value }),
        ...(maintenanceStatusFilter && maintenanceStatusFilter.value !== "all" && { status: maintenanceStatusFilter.value as any }),
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(dateFromFilter && { dateFrom: dateFromFilter }),
        ...(dateToFilter && { dateTo: dateToFilter }),
    });

    // Process fetched data
    const reports = reportsData?.data && (reportsData.data as any)?.items ? (reportsData.data as any).items as DeviceReportListDto[] : [];
    const maintenanceRecords = maintenanceData?.data && (maintenanceData.data as any)?.items ? (maintenanceData.data as any).items as MaintenanceHistoryListDto[] : [];
    
    // Create device options from API data
    const allDevices = devicesData?.data 
        ? (Array.isArray(devicesData.data) ? devicesData.data : [devicesData.data]).map(device => ({ 
            value: device.id, 
            label: device.name
        }))
        : [];

    // Create lab options from API data
    const availableLabs = labsData?.data 
        ? (Array.isArray(labsData.data) ? labsData.data : [labsData.data]).map(lab => ({ 
            value: lab.id, 
            label: lab.name 
        }))
        : [];

    // Create staff/assistants options from API data
    const availableAssistants = staffData?.data 
        ? (Array.isArray(staffData.data) ? staffData.data : [staffData.data]).map(staff => ({ 
            value: staff.id, 
            label: staff.name
        }))
        : [];

    // Initialize WebSocket connections
    useEffect(() => {
        // Connect to main WebSocket
        connectWebSocket();
        
        // Connect to device report specific WebSocket
        connectDeviceReportWS();
    }, [connectWebSocket, connectDeviceReportWS]);

    // Set up WebSocket event handlers for real-time updates
    useEffect(() => {
        if (webSocketStatus === 'connected') {
            // Register handler for all device report updates
            const unsubscribe = registerReportUpdateHandler('*', (message) => {
                // Refetch data when reports or maintenance records are updated
                if (message.type === 'device_report:created' || 
                    message.type === 'device_report:updated' || 
                    message.type === 'device_report:status_changed') {
                    refetchReports();
                }
                
                if (message.type === 'maintenance_history:created' || 
                    message.type === 'maintenance_history:updated') {
                    refetchMaintenance();
                }
            });

            return unsubscribe;
        }
    }, [webSocketStatus, registerReportUpdateHandler, refetchReports, refetchMaintenance]);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    const formatDateAndTime = (dateString: string) => {
        const date = new Date(dateString);
        const formattedDate = date.toLocaleDateString();
        const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return `${formattedDate} ${formattedTime}`;
    };

    const handleExportData = async () => {
        try {
            // Build the filter parameters based on current filters
            const filterParams = activeTab === "reports" ? {
                ...(deviceFilter && { deviceId: deviceFilter.value }),
                ...(labFilter && { labId: labFilter.value }),
                ...(statusFilter && statusFilter.value !== "all" && { status: statusFilter.value as any }),
                ...(assistantFilter && { reporterId: assistantFilter.value }),
                ...(debouncedSearch && { search: debouncedSearch }),
                ...(dateFromFilter && { dateFrom: dateFromFilter }),
                ...(dateToFilter && { dateTo: dateToFilter }),
            } : {
                ...(deviceFilter && { deviceId: deviceFilter.value }),
                ...(labFilter && { labId: labFilter.value }),
                ...(maintenanceStatusFilter && maintenanceStatusFilter.value !== "all" && { status: maintenanceStatusFilter.value as any }),
                ...(debouncedSearch && { search: debouncedSearch }),
                ...(dateFromFilter && { dateFrom: dateFromFilter }),
                ...(dateToFilter && { dateTo: dateToFilter }),
            };

            // Call the appropriate export function based on active tab with binary response type
            const response = activeTab === "reports" 
                ? await deviceReportControllerExportReportsXlsx(filterParams, { responseType: 'blob' })
                : await maintenanceHistoryControllerExportMaintenanceXlsx(filterParams, { responseType: 'blob' });

            // Create a blob from the response data (already a blob)
            const blob = response.data as Blob;
            const url = window.URL.createObjectURL(blob);
            
            // Create a temporary link and trigger download
            const link = document.createElement('a');
            link.href = url;
            link.download = activeTab === "reports" ? 'device-reports.xlsx' : 'maintenance-history.xlsx';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            toast.success("Data exported successfully");
        } catch (error) {
            console.error('Export error:', error);
            toast.error("Failed to export data");
        }
    };

    // Clear all filters
    const clearFilters = () => {
        setSearch("");
        setDeviceFilter(null);
        setLabFilter(null);
        setStatusFilter(null);
        setAssistantFilter(null);
        setMaintenanceStatusFilter(null);
        setDateFromFilter("");
        setDateToFilter("");
    };

    // Add handler for viewing update history
    const handleViewUpdateHistory = (report: DeviceReportListDto) => {
        setSelectedReportForHistory(report);
        setIsUpdateHistoryModalOpen(true);
    };

    return (
        <div className="panel mt-6">
            <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Link to="/devices" className="text-secondary hover:text-secondary-dark">
                            <LuArrowLeft size={18} />
                        </Link>
                        <h2 className="text-2xl font-semibold text-secondary">Device History Logs</h2>
                    </div>

                    <div className="flex items-center gap-4 mt-4 sm:mt-0">
                        <button
                            className="h-9 px-3 rounded-md flex items-center gap-1 bg-gray-100 text-secondary hover:bg-gray-200"
                            onClick={handleExportData}
                            title="Export filtered data"
                        >
                            <LuDownload size={16} />
                            <span>Export</span>
                        </button>


                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 mb-6">
                    <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
                        <li className="mr-2">
                            <button
                                className={`inline-block p-4 rounded-t-lg ${activeTab === "reports"
                                    ? "border-b-2 border-secondary text-secondary"
                                    : "border-transparent hover:text-gray-600 hover:border-gray-300"
                                    }`}
                                onClick={() => handleTabChange("reports")}
                            >
                                Reports History
                            </button>
                        </li>
                        <li className="mr-2">
                            <button
                                className={`inline-block p-4 rounded-t-lg ${activeTab === "maintenance"
                                    ? "border-b-2 border-secondary text-secondary"
                                    : "border-transparent hover:text-gray-600 hover:border-gray-300"
                                    }`}
                                onClick={() => handleTabChange("maintenance")}
                            >
                                Maintenance History
                            </button>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Filter panel */}
            <div className="mb-6 p-4 bg-gray-50 border rounded-md">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Device</label>
                            <Select
                                options={allDevices}
                                isClearable
                                placeholder="Filter by device"
                                value={deviceFilter}
                                onChange={(option) => setDeviceFilter(option)}
                                className="text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Lab</label>
                            <Select
                                options={availableLabs}
                                isClearable
                                placeholder="Filter by lab"
                                value={labFilter}
                                onChange={(option) => setLabFilter(option)}
                                className="text-sm"
                            />
                        </div>
                        {activeTab === "reports" && (
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Status</label>
                                <Select
                                    options={availableReportStatuses}
                                    placeholder="Filter by status"
                                    value={statusFilter}
                                    onChange={(option) => option && setStatusFilter(option)}
                                    className="text-sm"
                                />
                            </div>
                        )}
                        {activeTab === "reports" && (
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Reporter</label>
                                <Select
                                    options={availableAssistants}
                                    isClearable
                                    placeholder="Filter by reporter"
                                    value={assistantFilter}
                                    onChange={(option) => setAssistantFilter(option)}
                                    className="text-sm"
                                />
                            </div>
                        )}
                        {activeTab === "maintenance" && (
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Status</label>
                                <Select
                                    options={availableMaintenanceStatuses}
                                    isClearable
                                    placeholder="Filter by status"
                                    value={maintenanceStatusFilter}
                                    onChange={(option) => setMaintenanceStatusFilter(option)}
                                    className="text-sm"
                                />
                            </div>
                        )}
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Date From</label>
                            <input
                                type="date"
                                value={dateFromFilter}
                                onChange={(e) => setDateFromFilter(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Date To</label>
                            <input
                                type="date"
                                value={dateToFilter}
                                onChange={(e) => setDateToFilter(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search by device, description, or person..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm"
                            />
                        </div>
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Clear All
                        </button>
                    </div>
                </div>

            {activeTab === "reports" && (
                <div className="datatables">
                    <DataTable<DeviceReportListDto>
                        highlightOnHover
                        withBorder
                        className="table-hover whitespace-nowrap"
                        records={reports}
                        columns={[
                            {
                                accessor: "created_at",
                                title: "Report Date",
                                sortable: true,
                                render: (row) => (
                                    <span>{formatDateAndTime(row.created_at.toString())}</span>
                                )
                            },
                            {
                                accessor: "deviceName",
                                title: "Device",
                                sortable: true,
                                render: (row) => (
                                    <Link 
                                        to={`/devices/${row.deviceId}/history`} 
                                        className="text-secondary hover:text-secondary-dark hover:underline"
                                    >
                                        {row.deviceName || `Device ${row.deviceId}`}
                                    </Link>
                                ),
                            },
                            {
                                accessor: "reporterName",
                                title: "Reported By",
                                sortable: true,
                                render: (row) => (
                                    <span>{row.reporterName || "Unknown"}</span>
                                )
                            },
                            {
                                accessor: "status",
                                title: "Status",
                                sortable: true,
                                render: (row) => (
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getReportStatusBadge(row.status)}`}>
                                        {getReportStatusLabel(row.status)}
                                    </span>
                                )
                            },
                            {
                                accessor: "description",
                                title: "Problem Description",
                                sortable: true,
                                render: (row) => (
                                    <div className="max-w-xs">
                                        <p className="truncate" title={row.description}>
                                            {row.description}
                                        </p>
                                    </div>
                                )
                            },
                            {
                                accessor: "resolutionUpdates",
                                title: "Updates",
                                render: (row) => (
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            (row.resolutionUpdates?.length || 0) > 0 
                                                ? "bg-blue-100 text-blue-800" 
                                                : "bg-gray-100 text-gray-600"
                                        }`}>
                                            {row.resolutionUpdates?.length || 0} update{(row.resolutionUpdates?.length || 0) !== 1 ? 's' : ''}
                                        </span>
                                        {(row.resolutionUpdates?.length || 0) > 0 && (
                                            <span className="text-xs text-gray-500">
                                                Latest: {row.resolutionUpdates?.[row.resolutionUpdates.length - 1]?.status || 'Unknown'}
                                            </span>
                                        )}
                                    </div>
                                )
                            },
                            {
                                accessor: "actions",
                                title: "Actions",
                                render: (row) => (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleViewUpdateHistory(row)}
                                            className="text-gray-500 hover:text-secondary"
                                            title="View update history"
                                        >
                                            <IoMdTime size={18} />
                                        </button>
                                    </div>
                                ),
                            },
                        ]}
                        totalRecords={(reportsData?.data as any)?.totalItems || 0}
                        recordsPerPage={pageSize}
                        page={page}
                        onPageChange={(p) => setPage(p)}
                        recordsPerPageOptions={PAGE_SIZES}
                        onRecordsPerPageChange={setPageSize}
                        emptyState={
                            <div className="text-center py-6">
                                <p className="text-gray-500">
                                    {reportsLoading ? "Loading reports..." : "No reports found"}
                                </p>
                            </div>
                        }
                    />
                </div>
            )}

            {activeTab === "maintenance" && (
                <div className="datatables">
                    <DataTable<MaintenanceHistoryListDto>
                        highlightOnHover
                        withBorder
                        className="table-hover whitespace-nowrap"
                        records={maintenanceRecords}
                        columns={[
                            {
                                accessor: "created_at",
                                title: "Date",
                                sortable: true,
                                render: (row) => (
                                    <span>{formatDateAndTime(row.created_at.toString())}</span>
                                )
                            },
                            {
                                accessor: "deviceName",
                                title: "Device",
                                sortable: true,
                                render: (row) => (
                                    <Link 
                                        to={`/devices/${row.deviceId}/history`} 
                                        className="text-secondary hover:text-secondary-dark hover:underline"
                                    >
                                        {row.deviceName || `Device ${row.deviceId}`}
                                    </Link>
                                ),
                            },
                            {
                                accessor: "maintenanceType",
                                title: "Type",
                                sortable: true,
                            },
                            {
                                accessor: "status",
                                title: "Status",
                                sortable: true,
                                render: (row) => (
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                        row.status === "COMPLETED" ? "bg-green-100 text-green-800" :
                                        row.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-800" :
                                        row.status === "SCHEDULED" ? "bg-yellow-100 text-yellow-800" :
                                        "bg-red-100 text-red-800"
                                    }`}>
                                        {row.status}
                                    </span>
                                )
                            },
                            {
                                accessor: "description",
                                title: "Description",
                                sortable: true,
                                render: (row) => (
                                    <div className="max-w-xs">
                                        <p className="truncate" title={row.description}>
                                            {row.description}
                                        </p>
                                    </div>
                                )
                            },
                            {
                                accessor: "involvedPersonnel",
                                title: "Involved Personnel",
                                sortable: true,
                                render: (row) => {
                                    const personnel = row.involvedPersonnel;
                                    let displayText = "No personnel listed";
                                    
                                    if (personnel) {
                                        if (Array.isArray(personnel)) {
                                            displayText = personnel.join(", ");
                                        } else if (typeof personnel === 'string') {
                                            displayText = personnel;
                                        } else {
                                            displayText = String(personnel);
                                        }
                                    }
                                    
                                    return (
                                        <div className="max-w-xs">
                                            <p className="truncate" title={displayText}>
                                                {displayText}
                                            </p>
                                        </div>
                                    );
                                }
                            },
                            {
                                accessor: "resolutionNotes",
                                title: "Resolution Notes",
                                render: (row) => (
                                    <div className="max-w-xs">
                                        <p className="truncate" title={row.resolutionNotes || "No notes"}>
                                            {row.resolutionNotes || "No notes"}
                                        </p>
                                    </div>
                                )
                            },
                        ]}
                        totalRecords={(maintenanceData?.data as any)?.totalItems || 0}
                        recordsPerPage={pageSize}
                        page={page}
                        onPageChange={(p) => setPage(p)}
                        recordsPerPageOptions={PAGE_SIZES}
                        onRecordsPerPageChange={setPageSize}
                        emptyState={
                            <div className="text-center py-6">
                                <p className="text-gray-500">
                                    {maintenanceLoading ? "Loading maintenance records..." : "No maintenance records found"}
                                </p>
                            </div>
                        }
                    />
                </div>
            )}

            {/* Add the Update History Modal */}
            <UpdateHistoryModal
                isOpen={isUpdateHistoryModalOpen}
                onClose={() => setIsUpdateHistoryModalOpen(false)}
                updates={selectedReportForHistory?.resolutionUpdates?.map((update, index) => ({
                    id: index + 1,
                    date: update.created_at ? new Date(update.created_at.toString()).toLocaleDateString() : new Date().toLocaleDateString(),
                    status: update.status === 'COMPLETED' ? 'Resolved' : update.status === 'IN_PROGRESS' ? 'In Progress' : update.status,
                    type: update.maintenanceType.replace('_', ' '),
                    issue: update.description,
                    resolution: update.resolutionNotes || undefined,
                    involvedPersonnel: Array.isArray(update.involvedPersonnel) ? update.involvedPersonnel : (update.involvedPersonnel ? [update.involvedPersonnel] : [])
                })) || []}
                reportDescription={selectedReportForHistory?.description || ""}
                reportDate={selectedReportForHistory?.created_at ? new Date(selectedReportForHistory.created_at.toString()).toLocaleDateString() : ""}
            />
        </div>
    );
};

export default AllDevicesHistoryPage; 