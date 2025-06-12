import { useState, useEffect } from "react";
import { DataTable } from "mantine-datatable";
import { LuSearch, LuPlus, LuHistory, LuInfo, LuLayoutDashboard } from "react-icons/lu";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "react-hot-toast";
import { FaRegClock, FaCheck, FaTimes, FaExclamationCircle } from "react-icons/fa";
import Select from "react-select";
import Modal from "../../../ui/modal/Modal";
import Badge from "../../../ui/Badge";
import { UpdateModal } from "../../devices/components";
import AssignedDevicesTab from "./AssignedDevicesTab";
import { ReportStatus, getReportStatusBadge, getReportStatusLabel, isReportUnresolved } from "../../../global/constants/reportStatus";
import { useDeviceReportControllerGetMyAssignedReports } from "../../../generated/hooks/device-reportsHooks/useDeviceReportControllerGetMyAssignedReports";
import { useDeviceReportControllerGetMyUnresolvedReportsCount } from "../../../generated/hooks/device-reportsHooks/useDeviceReportControllerGetMyUnresolvedReportsCount";
import { useDeviceReportControllerUpdate } from "../../../generated/hooks/device-reportsHooks/useDeviceReportControllerUpdate";
import { useQueryClient } from "@tanstack/react-query";
import { deviceReportControllerGetMyAssignedReportsQueryKey } from "../../../generated/hooks/device-reportsHooks/useDeviceReportControllerGetMyAssignedReports";
import { deviceReportControllerGetMyUnresolvedReportsCountQueryKey } from "../../../generated/hooks/device-reportsHooks/useDeviceReportControllerGetMyUnresolvedReportsCount";
import type { DeviceReportListDto } from "../../../generated/types/DeviceReportListDto";
import { deviceReportListDtoStatusEnum } from "../../../generated/types/DeviceReportListDto";
import apiClient from "../../../global/api/apiClient";

// Interface for report records to pass to UpdateModal
interface ReportRecord {
    id: string;
    date: string;
    problemType: string;
    description: string;
    status: string;
    urgency: string;
    reportedBy: string;
}

// Status filter options
const statusOptions = [
    { value: "all", label: "All Reports" },
    { value: ReportStatus.PENDING_REVIEW, label: getReportStatusLabel(ReportStatus.PENDING_REVIEW) },
    { value: ReportStatus.IN_PROGRESS, label: getReportStatusLabel(ReportStatus.IN_PROGRESS) },
    { value: ReportStatus.RESOLVED, label: getReportStatusLabel(ReportStatus.RESOLVED) },
    { value: ReportStatus.REJECTED, label: getReportStatusLabel(ReportStatus.REJECTED) },
];

// Mock data for assigned labs (for filtering - this would come from user's assigned labs in real app)
const assignedLabs = [
    { value: 1, label: "Lab B2-215" },
    { value: 2, label: "Lab B2-216" },
];

const AssistantDashboardPage = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const queryClient = useQueryClient();

    // Tab state
    const [activeTab, setActiveTab] = useState<"reports" | "devices">("reports");

    // Reports state
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(0);
    const PAGE_SIZES = [5, 10, 20, 30];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [selectedReport, setSelectedReport] = useState<any>(null);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState({ value: "all", label: "All Reports" });
    const [labFilter, setLabFilter] = useState<{ value: number; label: string } | null>(null);

    // Handle tab URL parameters
    useEffect(() => {
        const tabFromUrl = searchParams.get('tab');
        
        if (tabFromUrl && ['reports', 'devices'].includes(tabFromUrl)) {
            setActiveTab(tabFromUrl as "reports" | "devices");
        } else if (!tabFromUrl) {
            // Set default tab and update URL
            setSearchParams({ tab: 'reports' });
        }
    }, [searchParams, setSearchParams]);

    // Function to handle tab change with URL update
    const handleTabChange = (tabId: "reports" | "devices") => {
        setActiveTab(tabId);
        setSearchParams({ tab: tabId });
    };

    // Fetch reports data
    const { data: reportsData, isLoading: isLoadingReports } = useDeviceReportControllerGetMyAssignedReports({
        page,
        limit: pageSize,
        sortBy: "created_at",
        sortOrder: "desc",
        status: statusFilter.value !== "all" ? statusFilter.value as any : undefined,
        search: debouncedSearch || undefined,
    });

    // Fetch unresolved count for lab assistant
    const { data: unresolvedCountData, isLoading: isLoadingCount } = useDeviceReportControllerGetMyUnresolvedReportsCount();

    // Invalidate queries when maintenance is updated
    const invalidateQueries = () => {
        queryClient.invalidateQueries({
            queryKey: deviceReportControllerGetMyAssignedReportsQueryKey(),
        });
        queryClient.invalidateQueries({
            queryKey: deviceReportControllerGetMyUnresolvedReportsCountQueryKey(),
        });
    };

    const reports = (reportsData as any)?.data?.items || [];
    const totalReports = (reportsData as any)?.data?.total || 0;
    const unresolvedCount = (unresolvedCountData as any)?.data?.count || 0;

    // Debounce search to avoid too many API calls
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);

    // Reset page when search or filters change
    useEffect(() => {
        setPage(0);
    }, [debouncedSearch, statusFilter, labFilter]);

    // Format date to display
    const formatDate = (dateValue: string | Date | undefined) => {
        if (!dateValue) return 'N/A';
        
        try {
            const date = new Date(dateValue);
            if (isNaN(date.getTime())) return 'Invalid Date';
            
            return new Intl.DateTimeFormat('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            }).format(date);
        } catch (error) {
            return 'Invalid Date';
        }
    };

    // Calculate time passed
    const getTimePassed = (dateValue: string | Date | undefined) => {
        if (!dateValue) return 'N/A';
        
        try {
            const date = new Date(dateValue);
            if (isNaN(date.getTime())) return 'N/A';
            
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));

            if (diffHrs < 1) {
                const diffMins = Math.floor(diffMs / (1000 * 60));
                return diffMins < 1 ? 'Just now' : `${diffMins}m ago`;
            } else if (diffHrs < 24) {
                return `${diffHrs}h ago`;
            } else {
                const diffDays = Math.floor(diffHrs / 24);
                return `${diffDays}d ago`;
            }
        } catch (error) {
            return 'N/A';
        }
    };

    // View details
    const handleViewDetails = (report: any) => {
        setSelectedReport(report);
        setIsDetailsModalOpen(true);
    };

    // Handle add update
    const handleAddUpdate = (report: any) => {
        setSelectedReport(report);
        setIsUpdateModalOpen(true);
    };

    // Close update modal
    const handleCloseUpdateModal = () => {
        setIsUpdateModalOpen(false);
        setSelectedReport(null);
        invalidateQueries(); // Refresh the data
    };

    // View device
    const handleViewDevice = (report: any) => {
        if (report.deviceId) {
            navigate(`/devices/${report.deviceId}/history`);
        }
    };

    return (
        <div className="panel mt-6">
            <div className="mb-6">
                <h2 className="text-2xl font-semibold text-secondary mb-4">Lab Assistant Dashboard</h2>

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
                                Reports
                                {unresolvedCount > 0 && (
                                    <Badge variant="danger" className="ml-2">
                                        {unresolvedCount}
                                    </Badge>
                                )}
                            </button>
                        </li>
                        <li className="mr-2">
                            <button
                                className={`inline-block p-4 rounded-t-lg ${activeTab === "devices"
                                    ? "border-b-2 border-secondary text-secondary"
                                    : "border-transparent hover:text-gray-600 hover:border-gray-300"
                                    }`}
                                onClick={() => handleTabChange("devices")}
                            >
                                My Devices
                            </button>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Display the active tab content */}
            {activeTab === "reports" && (
                <div>
                    <div className="mb-6 flex flex-col gap-5 md:flex-row md:items-center">
                        <div className="flex flex-col gap-4 md:gap-0 md:flex-row md:items-center justify-between w-full">
                            <h3 className="text-xl font-semibold text-secondary">My Assigned Reports</h3>

                            <div className="flex flex-col gap-3 md:flex-row md:items-center">
                                <div className="w-[200px]">
                                    <Select
                                        options={assignedLabs}
                                        value={labFilter}
                                        onChange={(option) => setLabFilter(option)}
                                        placeholder="Filter by lab"
                                        isClearable
                                        className="basic-single"
                                        classNamePrefix="select"
                                    />
                                </div>

                                <div className="w-[200px]">
                                    <Select
                                        options={statusOptions}
                                        value={statusFilter}
                                        onChange={(option) => option && setStatusFilter(option)}
                                        className="basic-single"
                                        classNamePrefix="select"
                                    />
                                </div>

                                <div className="relative flex items-center">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                        <LuSearch size={18} className="text-gray-500" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search reports"
                                        className="h-10 pl-10 pr-4 w-[200px] rounded-md border border-[#E0E6ED] text-xs font-medium tracking-wider text-gray-500 outline-none focus:border-secondary transition-colors duration-200"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="datatables">
                        <DataTable
                            highlightOnHover
                            withBorder
                            className="table-hover whitespace-nowrap"
                            records={reports as DeviceReportListDto[]}
                            fetching={isLoadingReports}
                            columns={[
                                {
                                    accessor: "created_at",
                                    title: "Reported",
                                    sortable: true,
                                    render: (row: DeviceReportListDto) => (
                                        <div className="flex flex-col">
                                            <span>{formatDate(row.created_at)}</span>
                                            <span className="text-xs text-gray-500 flex items-center mt-0.5">
                                                <FaRegClock className="mr-1" size={12} />
                                                {getTimePassed(row.created_at)}
                                            </span>
                                        </div>
                                    )
                                },
                                {
                                    accessor: "deviceName",
                                    title: "Device",
                                    sortable: true,
                                    render: (row: DeviceReportListDto) => (
                                        <span>{row.deviceName || 'Unknown Device'}</span>
                                    )
                                },
                                {
                                    accessor: "softwareName",
                                    title: "Software",
                                    sortable: true,
                                    render: (row: DeviceReportListDto) => (
                                        <span>{row.softwareName || 'N/A'}</span>
                                    )
                                },
                                {
                                    accessor: "description",
                                    title: "Description",
                                    render: (row: DeviceReportListDto) => (
                                        <div className="max-w-[200px] truncate" title={row.description}>
                                            {row.description}
                                        </div>
                                    )
                                },
                                {
                                    accessor: "reporterName",
                                    title: "Reported By",
                                    sortable: true,
                                    render: (row: DeviceReportListDto) => (
                                        <span>{row.reporterName || 'Unknown'}</span>
                                    )
                                },
                                {
                                    accessor: "status",
                                    title: "Status",
                                    sortable: true,
                                    render: (row: DeviceReportListDto) => (
                                        <div className="flex items-center">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getReportStatusBadge(row.status)}`}>
                                                {getReportStatusLabel(row.status)}
                                            </span>

                                            {/* Add update button only for unresolved reports */}
                                            {isReportUnresolved(row.status) && (
                                                <button
                                                    onClick={() => handleAddUpdate(row)}
                                                    className="ml-2 text-blue-600 hover:text-blue-800 bg-blue-50 rounded-full p-1"
                                                    title="Add Update"
                                                >
                                                    <LuPlus size={14} />
                                                </button>
                                            )}
                                        </div>
                                    )
                                },
                                {
                                    accessor: "actions",
                                    title: "Actions",
                                    width: 100,
                                    render: (row: DeviceReportListDto) => (
                                        <div className="flex items-center justify-center space-x-2">
                                            <button
                                                onClick={() => handleViewDetails(row)}
                                                className="p-1 text-gray-500 hover:text-secondary"
                                                title="View Details"
                                            >
                                                <LuInfo size={18} />
                                            </button>

                                            <button
                                                onClick={() => handleViewDevice(row)}
                                                className="p-1 text-gray-500 hover:text-secondary"
                                                title="View Device"
                                            >
                                                <LuHistory size={18} />
                                            </button>
                                        </div>
                                    )
                                },
                            ]}
                            totalRecords={totalReports}
                            recordsPerPage={pageSize}
                            onRecordsPerPageChange={(newPageSize) => {
                                setPageSize(newPageSize);
                                setPage(0); // Reset to first page when changing page size
                            }}
                            page={page + 1} // DataTable uses 1-based pagination for display
                            onPageChange={(p) => setPage(p - 1)} // Convert back to 0-based for API
                            recordsPerPageOptions={PAGE_SIZES}
                            noRecordsText="No reports found"
                        />
                    </div>
                </div>
            )}

            {activeTab === "devices" && (
                <AssignedDevicesTab />
            )}

            {/* Update Modal */}
            <UpdateModal
                isOpen={isUpdateModalOpen}
                onClose={handleCloseUpdateModal}
                deviceId={selectedReport?.deviceId || ""}
                deviceName={selectedReport?.deviceName || "Unknown Device"}
                isEditMode={false}
                updateData={null}
                selectedReport={selectedReport ? {
                    id: selectedReport.id,
                    date: selectedReport.created_at ? new Date(selectedReport.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                    problemType: "Device Issue",
                    description: selectedReport.description,
                    status: selectedReport.status,
                    urgency: "Medium",
                    reportedBy: selectedReport.reporterName || "Unknown"
                } : null}
                reportRecords={selectedReport ? [{
                    id: selectedReport.id,
                    date: selectedReport.created_at ? new Date(selectedReport.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                    problemType: "Device Issue",
                    description: selectedReport.description,
                    status: selectedReport.status,
                    urgency: "Medium",
                    reportedBy: selectedReport.reporterName || "Unknown"
                }] : []}
            />

            {/* Details Modal */}
            <Modal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                title="Report Details"
                size="lg"
            >
                {selectedReport && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Reported by</p>
                                <p className="font-medium">{selectedReport.reporterName || 'Unknown'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Date</p>
                                <p className="font-medium">{formatDate(selectedReport.created_at)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Device</p>
                                <p className="font-medium">{selectedReport.deviceName || 'Unknown Device'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Software</p>
                                <p className="font-medium">{selectedReport.softwareName || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Status</p>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getReportStatusBadge(selectedReport.status)}`}>
                                    {getReportStatusLabel(selectedReport.status)}
                                </span>
                            </div>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500 mb-2">Description</p>
                            <p className="text-gray-800">{selectedReport.description}</p>
                        </div>

                        {selectedReport.fixMessage && (
                            <div>
                                <p className="text-sm text-gray-500 mb-2">Resolution</p>
                                <p className="text-gray-800">{selectedReport.fixMessage}</p>
                            </div>
                        )}

                        <div className="flex justify-end mt-6">
                            <button
                                onClick={() => setIsDetailsModalOpen(false)}
                                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AssistantDashboardPage; 