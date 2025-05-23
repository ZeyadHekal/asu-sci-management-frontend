import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router";
import { DataTable } from "mantine-datatable";
import { LuArrowLeft, LuSearch, LuDownload } from "react-icons/lu";
import { FaRegEdit, FaTools } from "react-icons/fa";
import { RiDeleteBinLine } from "react-icons/ri";
import { FiAlertTriangle } from "react-icons/fi";
import { IoMdTime } from "react-icons/io";
import { MdBlock } from "react-icons/md";
import { UpdateModal, RejectReportModal, UpdateHistoryModal } from "../components";
import DeleteConfirmationModal from "../../../ui/modal/DeleteConfirmationModal";
import { toast } from "react-hot-toast";
import { useDeviceControllerGetById } from "../../../generated/hooks/devicesHooks/useDeviceControllerGetById";
import { useDeviceControllerGetDeviceDetails } from "../../../generated/hooks/devicesHooks/useDeviceControllerGetDeviceDetails";
import { useDeviceControllerGetDeviceMaintenanceHistory } from "../../../generated/hooks/devicesHooks/useDeviceControllerGetDeviceMaintenanceHistory";
import { useDeviceControllerGetDeviceLoginHistory } from "../../../generated/hooks/devicesHooks/useDeviceControllerGetDeviceLoginHistory";
import { useDeviceControllerGetDeviceReports } from "../../../generated/hooks/devicesHooks/useDeviceControllerGetDeviceReports";
import { deviceReportControllerExportReportsXlsx } from "../../../generated/hooks/device-reportsHooks/useDeviceReportControllerExportReportsXlsx";
import { maintenanceHistoryControllerExportMaintenanceXlsx } from "../../../generated/hooks/device-maintenance-historyHooks/useMaintenanceHistoryControllerExportMaintenanceXlsx";
import { DeviceReportDto } from "../../../generated/types/DeviceReportDto";
import { MaintenanceHistoryDto } from "../../../generated/types/MaintenanceHistoryDto";
import { LoginHistoryDto } from "../../../generated/types/LoginHistoryDto";
import { getReportStatusBadge, getReportStatusLabel, isReportUnresolved } from "../../../global/constants/reportStatus";
import { useDeviceReportControllerRejectReport } from "../../../generated/hooks/device-reportsHooks/useDeviceReportControllerRejectReport";

const DeviceHistoryPage = () => {
    const { deviceId } = useParams();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    
    // Device state
    const [device, setDevice] = useState<{
        id: string;
        deviceName: string;
        lab: string;
        status: string;
        addedSince: string;
        specs: string[];
        software: string[];
        IPAddress?: string;
    } | null>(null);

    // Modal states
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingUpdateId, setEditingUpdateId] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingUpdateId, setDeletingUpdateId] = useState<string | null>(null);
    const [selectedReport, setSelectedReport] = useState<DeviceReportDto | null>(null);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectingReportId, setRejectingReportId] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState<string>("");

    // Tab state
    const [activeTab, setActiveTab] = useState<"maintenance" | "logins" | "reports">("maintenance");

    // Pagination states
    const [maintenancePage, setMaintenancePage] = useState(1);
    const [loginPage, setLoginPage] = useState(1);
    const [reportsPage, setReportsPage] = useState(1);
    const PAGE_SIZES = [10, 20, 50, 100];
    const [maintenancePageSize, setMaintenancePageSize] = useState(PAGE_SIZES[2]);
    const [loginPageSize, setLoginPageSize] = useState(PAGE_SIZES[2]);
    const [reportsPageSize, setReportsPageSize] = useState(PAGE_SIZES[2]);
    const [reports, setReports] = useState<DeviceReportDto[]>([]);

    // Search states
    const [maintenanceSearch, setMaintenanceSearch] = useState("");
    const [loginSearch, setLoginSearch] = useState("");
    const [reportsSearch, setReportsSearch] = useState("");

    // State for update history modal
    const [isUpdateHistoryModalOpen, setIsUpdateHistoryModalOpen] = useState(false);
    const [selectedReportForHistory, setSelectedReportForHistory] = useState<DeviceReportDto | null>(null);

    // Fetch device reports
    const { data: reportsData, isLoading: reportsLoading, refetch: refetchReports } = useDeviceControllerGetDeviceReports(deviceId || "");

    useEffect(() => {
        if (reportsData?.data && Array.isArray(reportsData.data)) {
            setReports(reportsData.data as DeviceReportDto[]);
        }
    }, [reportsData]);

    // Handle tab URL parameters
    useEffect(() => {
        const tabFromUrl = searchParams.get('tab');
        
        if (tabFromUrl && ['maintenance', 'logins', 'reports'].includes(tabFromUrl)) {
            setActiveTab(tabFromUrl as "maintenance" | "logins" | "reports");
        } else if (!tabFromUrl) {
            // Set default tab and update URL
            setSearchParams({ tab: 'maintenance' });
        }
    }, [searchParams, setSearchParams]);

    // Function to handle tab change with URL update
    const handleTabChange = (tabId: "maintenance" | "logins" | "reports") => {
        setActiveTab(tabId);
        setSearchParams({ tab: tabId });
    };

    // Fetch device details
    const { data: deviceData, isLoading: deviceLoading } = useDeviceControllerGetById(deviceId || "");
    
    // Fetch comprehensive device details using generated hook
    const { data: deviceDetailsData, isLoading: deviceDetailsLoading } = useDeviceControllerGetDeviceDetails(deviceId || "");

    // Fetch maintenance history with pagination (0-based)
    const { data: maintenanceHistoryData, isLoading: maintenanceLoading } = useDeviceControllerGetDeviceMaintenanceHistory(
        deviceId || "", 
        { page: maintenancePage - 1, limit: maintenancePageSize } // Convert to 0-based pagination for backend
    );

    // Fetch login history with pagination
    const { data: loginHistoryData, isLoading: loginLoading } = useDeviceControllerGetDeviceLoginHistory(
        deviceId || "", 
        { page: loginPage, limit: loginPageSize }
    );

    // Process device data
    useEffect(() => {
        const deviceDetails = deviceDetailsData?.data;
        const deviceBasic = deviceData?.data;
        
        if (deviceDetails || deviceBasic) {
            setDevice({
                id: deviceId || "",
                deviceName: (deviceDetails?.name || deviceBasic?.name) || `Device ${deviceDetails?.IPAddress || (deviceBasic as any)?.IPAddress}`,
                lab: deviceDetails?.labName ? `${deviceDetails.labName}` : "Unknown Lab",
                status: (deviceDetails?.hasIssue || (deviceBasic as any)?.hasIssue) ? "Has Issues" : "Available",
                addedSince: (deviceDetails?.created_at || (deviceBasic as any)?.created_at) ? new Date(deviceDetails?.created_at || (deviceBasic as any)?.created_at).toISOString().split('T')[0] : "Unknown",
                specs: deviceDetails?.specifications?.length 
                    ? deviceDetails.specifications.map((spec: any) => `${spec.category}: ${spec.value}`)
                    : deviceBasic?.specDetails?.map((spec: any) => `${spec.category}: ${spec.value}`) || ["No specifications available"],
                software: deviceDetails?.installedSoftware?.length 
                    ? deviceDetails.installedSoftware.map((sw: any) => sw.name)
                    : ["No software installed"],
                IPAddress: deviceDetails?.IPAddress || (deviceBasic as any)?.IPAddress
            });
        }
    }, [deviceData, deviceDetailsData, deviceId]);

    // Get API data directly with proper typing
    const maintenanceRecords = (maintenanceHistoryData?.data as any)?.items || [];
    const loginRecords = (loginHistoryData?.data as any)?.items || [];
    const reportRecords = (reportsData?.data as any)?.items || [];
    
    // Calculate unresolved reports count
    const unresolvedReportsCount = useMemo(() => {
        return reportRecords.filter((report: DeviceReportDto) => isReportUnresolved(report.status)).length;
    }, [reportRecords]);

    // Calculate filtered records using useMemo
    const filteredMaintenanceRecords = useMemo(() => {
        if (!maintenanceSearch) return maintenanceRecords;
        return maintenanceRecords.filter((record: MaintenanceHistoryDto) =>
            record.maintenanceType.toLowerCase().includes(maintenanceSearch.toLowerCase()) ||
            record.status.toLowerCase().includes(maintenanceSearch.toLowerCase()) ||
            record.description?.toLowerCase().includes(maintenanceSearch.toLowerCase()) ||
            record.resolutionNotes?.toLowerCase().includes(maintenanceSearch.toLowerCase()) ||
            record.involvedPersonnel?.some(person => person.toLowerCase().includes(maintenanceSearch.toLowerCase()))
        );
    }, [maintenanceSearch, maintenanceRecords]);

    const filteredLoginRecords = useMemo(() => {
        if (!loginSearch) return loginRecords;
        return loginRecords.filter((record: LoginHistoryDto) =>
            record.userName?.toLowerCase().includes(loginSearch.toLowerCase()) ||
            record.ipAddress?.toLowerCase().includes(loginSearch.toLowerCase()) ||
            record.loginStatus?.toLowerCase().includes(loginSearch.toLowerCase())
        );
    }, [loginSearch, loginRecords]);

    const filteredReportRecords = useMemo(() => {
        if (!reportsSearch) return reportRecords;
        return reportRecords.filter((record: DeviceReportDto) =>
            record.description.toLowerCase().includes(reportsSearch.toLowerCase()) ||
            record.status.toLowerCase().includes(reportsSearch.toLowerCase()) ||
            record.reporterName?.toLowerCase().includes(reportsSearch.toLowerCase()) ||
            record.fixMessage?.toLowerCase().includes(reportsSearch.toLowerCase())
        );
    }, [reportsSearch, reportRecords]);

    // Calculate paginated records using useMemo (only for client-side pagination)
    const paginatedMaintenanceRecords = useMemo(() => {
        const from = (maintenancePage - 1) * maintenancePageSize;
        const to = from + maintenancePageSize;
        return filteredMaintenanceRecords.slice(from, to);
    }, [maintenancePage, maintenancePageSize, filteredMaintenanceRecords]);

    const paginatedLoginRecords = useMemo(() => {
        const from = (loginPage - 1) * loginPageSize;
        const to = from + loginPageSize;
        return filteredLoginRecords.slice(from, to);
    }, [loginPage, loginPageSize, filteredLoginRecords]);

    const paginatedReportRecords = useMemo(() => {
        const from = (reportsPage - 1) * reportsPageSize;
        const to = from + reportsPageSize;
        return filteredReportRecords.slice(from, to);
    }, [reportsPage, reportsPageSize, filteredReportRecords]);

    // Reset pagination when search changes
    useEffect(() => {
        setMaintenancePage(1);
    }, [maintenanceSearch]);

    useEffect(() => {
        setLoginPage(1);
    }, [loginSearch]);

    useEffect(() => {
        setReportsPage(1);
    }, [reportsSearch]);

    // Helper function to format date and time
    const formatDateAndTime = (dateString: string | Date) => {
        const date = new Date(dateString);
        const formattedDate = date.toLocaleDateString();
        const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return `${formattedDate} ${formattedTime}`;
    };

    const handleAddUpdate = useCallback((reportId?: string) => {
        setIsEditMode(false);
        setEditingUpdateId(null);
        setSelectedReport(null);

        if (reportId) {
            const foundReport = reportRecords.find((report: DeviceReportDto) => report.id === reportId);
            if (foundReport) {
                setSelectedReport(foundReport);
            }
        }

        setIsUpdateModalOpen(true);
    }, [reportRecords]);

    const handleEditUpdate = useCallback((id: string) => {
        setIsEditMode(true);
        setEditingUpdateId(id);
        setIsUpdateModalOpen(true);
    }, []);

    const handleDeleteUpdate = useCallback((id: string) => {
        setDeletingUpdateId(id);
        setIsDeleteModalOpen(true);
    }, []);

    const confirmDeleteUpdate = () => {
        if (deletingUpdateId) {
            // In a real app, you would make an API call to delete the maintenance record
            toast.success("Maintenance record deleted successfully");
            setIsDeleteModalOpen(false);
            setDeletingUpdateId(null);
        }
    };

    const handleCloseUpdateModal = () => {
        setIsUpdateModalOpen(false);
        setIsEditMode(false);
        setEditingUpdateId(null);
        setSelectedReport(null);
    };

    const handleRejectReport = (reportId: string) => {
        setRejectingReportId(reportId);
        setIsRejectModalOpen(true);
    };

    const rejectReportMutation = useDeviceReportControllerRejectReport({
        mutation: {
            onSuccess: (response) => {
                // Update the report status in the local state
                const updatedReport = response.data;
                setReports(prevReports => 
                    prevReports.map(report => 
                        report.id === updatedReport.id ? updatedReport : report
                    )
                );
                
                toast.success("Report rejected successfully");
                setIsRejectModalOpen(false);
                setRejectingReportId(null);
                setRejectionReason("");
                refetchReports();
            },
            onError: (error) => {
                console.error('Error rejecting report:', error);
                toast.error("Failed to reject report");
            }
        },
        client: {
            data: { reason: rejectionReason }
        }
    });

    const handleRejectReportConfirm = (reason: string) => {
        if (rejectingReportId) {
            setRejectionReason(reason);
            rejectReportMutation.mutate({ 
                reportId: rejectingReportId
            });
        }
    };

    const handleViewUpdateHistory = (report: DeviceReportDto) => {
        setSelectedReportForHistory(report);
        setIsUpdateHistoryModalOpen(true);
    };

    // Export handler for device-specific data
    const handleExportData = async () => {
        try {
            // Filter parameters for this specific device
            const filterParams = {
                deviceId: deviceId,
                // Include search terms
                ...(activeTab === "maintenance" && maintenanceSearch && { search: maintenanceSearch }),
                ...(activeTab === "reports" && reportsSearch && { search: reportsSearch }),
            };

            // Call the appropriate export function based on active tab with binary response type
            if (activeTab === "maintenance") {
                const response = await maintenanceHistoryControllerExportMaintenanceXlsx(filterParams, { responseType: 'blob' });
                const blob = response.data as Blob;
                const url = window.URL.createObjectURL(blob);
                
                const link = document.createElement('a');
                link.href = url;
                link.download = `${device?.deviceName || `device-${deviceId}`}-maintenance-history.xlsx`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                
                toast.success("Maintenance history exported successfully");
            } else if (activeTab === "reports") {
                const response = await deviceReportControllerExportReportsXlsx(filterParams, { responseType: 'blob' });
                const blob = response.data as Blob;
                const url = window.URL.createObjectURL(blob);
                
                const link = document.createElement('a');
                link.href = url;
                link.download = `${device?.deviceName || `device-${deviceId}`}-reports.xlsx`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                
                toast.success("Reports exported successfully");
            } else {
                toast.error("Export not supported for login history");
            }
        } catch (error) {
            console.error('Export error:', error);
            toast.error("Failed to export data");
        }
    };

    // Define columns for maintenance table
    const maintenanceColumns = useMemo(() => [
        {
            accessor: "created_at",
            title: "Date",
            sortable: true,
            render: (row: MaintenanceHistoryDto) => (
                <span>{formatDateAndTime(row.created_at)}</span>
            )
        },
        {
            accessor: "maintenanceType",
            title: "Type",
            sortable: true,
            render: (row: MaintenanceHistoryDto) => (
                <span>{row.maintenanceType.replace('_', ' ')}</span>
            )
        },
        {
            accessor: "status",
            title: "Status",
            sortable: true,
            render: (row: MaintenanceHistoryDto) => (
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
            render: (row: MaintenanceHistoryDto) => (
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
            render: (row: MaintenanceHistoryDto) => (
                <div className="max-w-xs">
                    <p className="truncate" title={row.involvedPersonnel?.join(", ") || "No personnel listed"}>
                        {row.involvedPersonnel?.join(", ") || "No personnel listed"}
                    </p>
                </div>
            )
        },
        {
            accessor: "resolutionNotes",
            title: "Resolution",
            render: (row: MaintenanceHistoryDto) => (
                <div className="max-w-xs">
                    <p className="truncate" title={row.resolutionNotes || "No resolution"}>
                        {row.resolutionNotes || "No resolution"}
                    </p>
                </div>
            )
        },
        {
            accessor: "actions",
            title: "Actions",
            render: (row: MaintenanceHistoryDto) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleEditUpdate(row.id)}
                        className="text-gray-500 hover:text-secondary"
                        title="Edit maintenance record"
                    >
                        <FaRegEdit size={18} />
                    </button>
                    <button
                        onClick={() => handleDeleteUpdate(row.id)}
                        className="text-gray-500 hover:text-danger"
                        title="Delete maintenance record"
                    >
                        <RiDeleteBinLine size={18} />
                    </button>
                </div>
            ),
        },
    ], [handleEditUpdate, handleDeleteUpdate]);

    // Define columns for login table
    const loginColumns = useMemo(() => [
        {
            accessor: "loginTime",
            title: "Login Time",
            sortable: true,
            render: (row: LoginHistoryDto) => (
                <span>{row.loginTime ? formatDateAndTime(row.loginTime) : "N/A"}</span>
            )
        },
        {
            accessor: "userName",
            title: "User",
            sortable: true,
            render: (row: LoginHistoryDto) => (
                <span>{row.userName || "Unknown"}</span>
            )
        },
        {
            accessor: "loginStatus",
            title: "Status",
            sortable: true,
            render: (row: LoginHistoryDto) => (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    row.loginStatus === "SUCCESS" ? "bg-green-100 text-green-800" :
                    row.loginStatus === "FAILED" ? "bg-red-100 text-red-800" :
                    "bg-yellow-100 text-yellow-800"
                }`}>
                    {row.loginStatus || "Unknown"}
                </span>
            )
        },
        {
            accessor: "sessionDuration",
            title: "Duration",
            render: (row: LoginHistoryDto) => (
                <span>
                    {row.sessionDuration ? `${Math.round(row.sessionDuration / 60)} min` : "N/A"}
                </span>
            )
        },
        {
            accessor: "ipAddress",
            title: "IP Address",
            render: (row: LoginHistoryDto) => (
                <span>{row.ipAddress || "N/A"}</span>
            )
        },
        {
            accessor: "operatingSystem",
            title: "OS",
            render: (row: LoginHistoryDto) => (
                <span>{row.operatingSystem || "N/A"}</span>
            )
        },
        {
            accessor: "browser",
            title: "Browser",
            render: (row: LoginHistoryDto) => (
                <span>{row.browser || "N/A"}</span>
            )
        },
    ], []);

    // Define columns for reports table
    const reportsColumns = useMemo(() => [
        {
            accessor: "created_at",
            title: "Report Date",
            sortable: true,
            render: (row: DeviceReportDto) => (
                <span>{formatDateAndTime(row.created_at)}</span>
            )
        },
        {
            accessor: "reporterName",
            title: "Reported By",
            sortable: true,
            render: (row: DeviceReportDto) => (
                <span>{row.reporterName || "Unknown"}</span>
            )
        },
        {
            accessor: "status",
            title: "Status",
            sortable: true,
                         render: (row: DeviceReportDto) => (
                 <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getReportStatusBadge(row.status)}`}>
                     {getReportStatusLabel(row.status)}
                 </span>
             )
        },
        {
            accessor: "description",
            title: "Problem Description",
            render: (row: DeviceReportDto) => (
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
            render: (row: DeviceReportDto) => (
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
            render: (row: DeviceReportDto) => (
                <div className="flex items-center gap-2">
                                         {isReportUnresolved(row.status) && (
                        <>
                            <button
                                onClick={() => handleAddUpdate(row.id)}
                                className="text-gray-500 hover:text-secondary"
                                title="Add update"
                            >
                                <FaTools size={18} />
                            </button>
                                                         <button
                                 onClick={() => handleRejectReport(row.id)}
                                 className="text-gray-500 hover:text-danger"
                                 title="Reject report"
                             >
                                 <MdBlock size={18} />
                             </button>
                        </>
                    )}
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
    ], [handleAddUpdate, handleRejectReport, handleViewUpdateHistory]);

    if (deviceLoading || deviceDetailsLoading) {
        return <div className="panel mt-6 p-6">Loading device information...</div>;
    }

    return (
        <div className="panel mt-6">
            {/* Header */}
            <div className="mb-6 p-6 pb-0">
                <div className="flex items-center gap-2 mb-1">
                    <Link to="/devices" className="text-secondary hover:text-secondary-dark">
                        <LuArrowLeft size={18} />
                    </Link>
                    <h1 className="text-2xl font-semibold text-secondary">
                        {device?.deviceName} History
                    </h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Lab Location</p>
                                <p className="font-medium">{device?.lab}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Status</p>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${device?.status === "Available" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                    }`}>
                                    {device?.status}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Added Since</p>
                                <p className="font-medium">{device?.addedSince}</p>
                            </div>
                        </div>
                    </div>
                                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Unresolved Reports</p>
                                    <p className="font-medium text-orange-600">
                                        {unresolvedReportsCount}
                                    </p>
                                </div>
                            </div>
                        </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Maintenance Records</p>
                                <p className="font-medium text-blue-600">
                                    {deviceDetailsData?.data?.totalMaintenanceRecords ?? maintenanceRecords.length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Last Login</p>
                                <p className="font-medium text-purple-600">
                                    {loginRecords.length > 0 ? formatDateAndTime(loginRecords[0]?.loginTime || loginRecords[0]?.created_at) : "Never"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Device details cards */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    <div className="bg-gray-50 p-6 rounded-lg">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Device Information</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-500">IP Address:</span>
                                <span className="text-sm font-medium">{deviceDetailsData?.data?.IPAddress || device?.IPAddress || 'Unknown'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-500">Assistant:</span>
                                <span className="text-sm font-medium">{deviceDetailsData?.data?.assistantName || 'Unknown'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-500">Last Updated:</span>
                                <span className="text-sm font-medium">
                                    {deviceDetailsData?.data?.updated_at 
                                        ? new Date(deviceDetailsData.data.updated_at).toLocaleDateString()
                                        : 'Unknown'
                                    }
                                </span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Specifications</h2>
                        <ul className="space-y-2">
                            {device?.specs.map((spec, index) => (
                                <li key={index} className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-secondary rounded-full"></span>
                                    <span className="text-gray-700 text-sm">{spec}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Installed Software</h2>
                        <ul className="space-y-2">
                            {device?.software.map((sw, index) => (
                                <li key={index} className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-secondary rounded-full"></span>
                                    <span className="text-gray-700 text-sm">{sw}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-[#E0E6ED] mb-6">
                    <button
                        className={`py-3 px-5 font-medium text-sm border-b-2 transition-colors ${activeTab === "maintenance"
                            ? "border-secondary text-secondary"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                        onClick={() => handleTabChange("maintenance")}
                    >
                        Maintenance History
                    </button>
                    <button
                        className={`py-3 px-5 font-medium text-sm border-b-2 transition-colors ${activeTab === "logins"
                            ? "border-secondary text-secondary"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                        onClick={() => handleTabChange("logins")}
                    >
                        Login History
                    </button>
                    <button
                        className={`py-3 px-5 font-medium text-sm border-b-2 transition-colors ${activeTab === "reports"
                            ? "border-secondary text-secondary"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                        onClick={() => handleTabChange("reports")}
                    >
                        Reports History
                    </button>
                </div>

                {/* Action buttons */}
                <div className="flex justify-between items-center mb-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <LuSearch className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-secondary focus:border-secondary sm:text-sm"
                            placeholder={`Search ${activeTab}...`}
                            value={
                                activeTab === "maintenance" ? maintenanceSearch :
                                activeTab === "logins" ? loginSearch :
                                reportsSearch
                            }
                            onChange={(e) => {
                                if (activeTab === "maintenance") setMaintenanceSearch(e.target.value);
                                else if (activeTab === "logins") setLoginSearch(e.target.value);
                                else setReportsSearch(e.target.value);
                            }}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        {(activeTab === "maintenance" || activeTab === "reports") && (
                            <button
                                className="h-9 px-3 rounded-md flex items-center gap-1 bg-gray-100 text-secondary hover:bg-gray-200"
                                onClick={handleExportData}
                                title={`Export ${activeTab} data for this device`}
                            >
                                <LuDownload size={16} />
                                <span>Export</span>
                            </button>
                        )}

                        {activeTab === "maintenance" && (
                            <button
                                onClick={() => handleAddUpdate()}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-secondary hover:bg-secondary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
                            >
                                <FaTools className="mr-2 h-4 w-4" />
                                Add Maintenance Record
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Tab Content */}
            <div className="p-6 pt-0">
                {activeTab === "maintenance" && (
                    <DataTable
                        highlightOnHover
                        withBorder
                        className="table-hover whitespace-nowrap"
                        minHeight={400}
                        records={paginatedMaintenanceRecords}
                        columns={maintenanceColumns}
                        totalRecords={filteredMaintenanceRecords.length}
                        recordsPerPage={maintenancePageSize}
                        onRecordsPerPageChange={setMaintenancePageSize}
                        page={maintenancePage}
                        onPageChange={(p) => setMaintenancePage(p)}
                        recordsPerPageOptions={PAGE_SIZES}
                        emptyState={
                            <div className="flex flex-col items-center py-6">
                                <FaTools size={36} className="text-gray-400 mb-2" />
                                <p className="text-gray-500">
                                    {maintenanceLoading ? "Loading maintenance history..." : "No maintenance history for this device"}
                                </p>
                            </div>
                        }
                    />
                )}

                {activeTab === "logins" && (
                    <DataTable
                        highlightOnHover
                        withBorder
                        className="table-hover whitespace-nowrap"
                        minHeight={400}
                        records={paginatedLoginRecords}
                        columns={loginColumns}
                        totalRecords={filteredLoginRecords.length}
                        recordsPerPage={loginPageSize}
                        onRecordsPerPageChange={setLoginPageSize}
                        page={loginPage}
                        onPageChange={(p) => setLoginPage(p)}
                        recordsPerPageOptions={PAGE_SIZES}
                        emptyState={
                            <div className="flex flex-col items-center py-6">
                                <LuSearch size={36} className="text-gray-400 mb-2" />
                                <p className="text-gray-500">
                                    {loginLoading ? "Loading login history..." : "No login history for this device"}
                                </p>
                            </div>
                        }
                    />
                )}

                {activeTab === "reports" && (
                    <DataTable
                        highlightOnHover
                        withBorder
                        className="table-hover whitespace-nowrap"
                        minHeight={400}
                        records={paginatedReportRecords}
                        columns={reportsColumns}
                        totalRecords={filteredReportRecords.length}
                        recordsPerPage={reportsPageSize}
                        onRecordsPerPageChange={setReportsPageSize}
                        page={reportsPage}
                        onPageChange={(p) => setReportsPage(p)}
                        recordsPerPageOptions={PAGE_SIZES}
                        emptyState={
                            <div className="flex flex-col items-center py-6">
                                <FiAlertTriangle size={36} className="text-gray-400 mb-2" />
                                <p className="text-gray-500">
                                    {reportsLoading ? "Loading reports..." : "No reported problems for this device"}
                                </p>
                            </div>
                        }
                    />
                )}
            </div>

            {/* Modals */}
            <UpdateModal
                isOpen={isUpdateModalOpen}
                onClose={handleCloseUpdateModal}
                deviceId={deviceId || ""}
                deviceName={device?.deviceName || ""}
                isEditMode={isEditMode}
                updateData={isEditMode && editingUpdateId ? (() => {
                    const record = maintenanceRecords.find((record: MaintenanceHistoryDto) => record.id === editingUpdateId);
                    if (!record) return null;
                    return {
                        id: record.id,
                        date: record.created_at ? new Date(record.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                        type: record.maintenanceType || "OTHER",
                        status: record.status || "SCHEDULED",
                        issue: record.description || "",
                        resolution: record.resolutionNotes || "",
                        involvedPersonnel: record.involvedPersonnel || [],
                        reportId: record.relatedReportId || undefined,
                        completedAt: record.completedAt ? new Date(record.completedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
                    };
                })() : null}
                selectedReport={selectedReport ? {
                    id: selectedReport.id,
                    date: selectedReport.created_at ? new Date(selectedReport.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                    problemType: "Hardware Issue",
                    description: selectedReport.description,
                    status: selectedReport.status,
                    urgency: "Medium",
                    reportedBy: selectedReport.reporterName || "Unknown"
                } : null}
                reportRecords={reportRecords.filter((report: DeviceReportDto) => isReportUnresolved(report.status)).map((report: DeviceReportDto) => ({
                    id: report.id,
                    date: report.created_at ? new Date(report.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                    problemType: "Hardware Issue",
                    description: report.description,
                    status: report.status,
                    urgency: "Medium",
                    reportedBy: report.reporterName || "Unknown"
                }))}
            />

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDeleteUpdate}
                title="Delete Maintenance Record"
                message="Are you sure you want to delete this maintenance record? This action cannot be undone."
            />

            <RejectReportModal
                isOpen={isRejectModalOpen}
                onClose={() => setIsRejectModalOpen(false)}
                onConfirm={handleRejectReportConfirm}
            />

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
                    involvedPersonnel: update.involvedPersonnel || []
                })) || []}
                reportDescription={selectedReportForHistory?.description || ""}
                reportDate={selectedReportForHistory?.created_at ? new Date(selectedReportForHistory.created_at.toString()).toLocaleDateString() : ""}
            />
        </div>
    );
};

export default DeviceHistoryPage; 