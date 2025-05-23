import { useState, useEffect } from "react";
import { DataTable } from "mantine-datatable";
import { LuSearch, LuFilter, LuDownload } from "react-icons/lu";
import Select from "react-select";
import { toast } from "react-hot-toast";
import { formatDate } from "../../../utils/dateUtils";
import { IoMdTime } from "react-icons/io";
import { UpdateHistoryModal } from "../components";
import { Link } from "react-router";
import { useDeviceReportControllerGetAll } from "../../../generated/hooks/device-reportsHooks/useDeviceReportControllerGetAll";
import { useDeviceControllerGetAll } from "../../../generated/hooks/devicesHooks/useDeviceControllerGetAll";
import { useLabControllerGetAll } from "../../../generated/hooks/labsHooks/useLabControllerGetAll";
import { DeviceReportDto } from "../../../generated/types/DeviceReportDto";

// Mock report statuses
const availableReportStatuses = [
    { value: "all", label: "All Statuses" },
    { value: "REPORTED", label: "Reported" },
    { value: "IN_PROGRESS", label: "In Progress" },
    { value: "RESOLVED", label: "Resolved" },
    { value: "CANCELLED", label: "Cancelled" }
];

// Mock assistants - should be fetched from API
const availableAssistants = [
    { value: 1, label: "Ahmed Mahmoud" },
    { value: 2, label: "Sara Ali" },
    { value: 3, label: "Omar Mohamed" },
    { value: 4, label: "Fatima Ibrahim" },
    { value: 5, label: "Khalid Hassan" }
];

// Add TypeScript interfaces for the data
interface ReportData {
    id: number;
    date: string;
    device: string;
    deviceId: number;
    lab: string;
    problemType: string;
    reportedBy: string;
    status: string;
    urgency: string;
    description: string;
    resolution?: string;
    assignedTo: { id: number; name: string; };
    updates: { id: number; date: string; status: string; resolution?: string }[];
    rejectionReason?: string;
}

interface MaintenanceData {
    id: number;
    date: string;
    device: string;
    lab: string;
    type: string;
    status: string;
    issue: string | null;
    resolution: string | null;
    performedBy: { id: number; name: string; };
    findings?: string;
    action?: string;
    involvedPersonnel: string[];
}

const AllDevicesHistoryPage = () => {
    const [activeTab, setActiveTab] = useState<"reports" | "maintenance">("reports");
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Filter states
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [deviceFilter, setDeviceFilter] = useState<{ value: number; label: string } | null>(null);
    const [labFilter, setLabFilter] = useState<{ value: string; label: string } | null>(null);
    const [statusFilter, setStatusFilter] = useState<{ value: string; label: string } | null>(null);
    const [assistantFilter, setAssistantFilter] = useState<{ value: number; label: string } | null>(null);
    const [dateFromFilter, setDateFromFilter] = useState("");
    const [dateToFilter, setDateToFilter] = useState("");

    // Data states
    const [filteredReports, setFilteredReports] = useState<DeviceReportDto[]>([]);
    const [filteredMaintenance, setFilteredMaintenance] = useState<MaintenanceData[]>([]);
    const [paginatedReports, setPaginatedReports] = useState<DeviceReportDto[]>([]);
    const [paginatedMaintenance, setPaginatedMaintenance] = useState<MaintenanceData[]>([]);

    // Modal states
    const [isUpdateHistoryModalOpen, setIsUpdateHistoryModalOpen] = useState(false);
    const [selectedReportForHistory, setSelectedReportForHistory] = useState<any>(null);

    // Fetch data using kubb generated hooks
    const { data: reportsData, isLoading: reportsLoading } = useDeviceReportControllerGetAll();
    const { data: devicesData } = useDeviceControllerGetAll();
    const { data: labsData } = useLabControllerGetAll();

    // Process fetched data
    const reports = reportsData?.data ? (Array.isArray(reportsData.data) ? reportsData.data : [reportsData.data]) : [];
    
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

    // Mock maintenance data - should be replaced with actual API call when available
    const mockMaintenanceHistory: MaintenanceData[] = [
        {
            id: 1,
            date: "2024-03-15T14:30:00",
            device: "Dell PC 01",
            lab: "Lab B2-215",
            type: "Scheduled Maintenance",
            status: "Completed",
            issue: null,
            resolution: "Routine system check and updates",
            performedBy: { id: 1, name: "Ahmed Mahmoud" },
            findings: "System running optimally",
            action: "Applied security updates",
            involvedPersonnel: ["Ahmed Mahmoud", "Sara Ali"]
        },
        {
            id: 2,
            date: "2024-03-14T10:15:00",
            device: "Dell PC 03",
            lab: "Lab B2-215",
            type: "Hardware Repair",
            status: "Completed",
            issue: "Faulty RAM module",
            resolution: "Replaced defective RAM module",
            performedBy: { id: 3, name: "Omar Mohamed" },
            findings: "One RAM module was causing system instability",
            action: "Replaced 8GB RAM module with new one",
            involvedPersonnel: ["Omar Mohamed"]
        }
    ];

    // Filter reports data
    useEffect(() => {
        let filtered = [...reports];

        // Apply device filter
        if (deviceFilter) {
            filtered = filtered.filter(item => item.deviceId === deviceFilter.value);
        }

        // Apply lab filter
        if (labFilter) {
            filtered = filtered.filter(item => item.lab === labFilter.value);
        }

        // Apply status filter
        if (statusFilter) {
            filtered = filtered.filter(item => item.status === statusFilter.value);
        }

        // Apply assistant filter
        if (assistantFilter) {
            filtered = filtered.filter(item => item.assignedTo.id === assistantFilter.value);
        }

        // Apply search
        if (search) {
            filtered = filtered.filter(item =>
                item.device.toLowerCase().includes(search.toLowerCase()) ||
                item.problemType.toLowerCase().includes(search.toLowerCase()) ||
                item.reportedBy.toLowerCase().includes(search.toLowerCase()) ||
                (item.resolution && item.resolution.toLowerCase().includes(search.toLowerCase()))
            );
        }

        // Apply date range
        filtered = filtered.filter(item => {
            const itemDate = new Date(item.date).toISOString().split('T')[0];
            return itemDate >= dateFromFilter && itemDate <= dateToFilter;
        });

        setFilteredReports(filtered);
        setPage(1);
    }, [search, deviceFilter, labFilter, statusFilter, assistantFilter, dateFromFilter, dateToFilter, reports]);

    // Filter maintenance data
    useEffect(() => {
        let filtered = [...mockMaintenanceHistory];

        // Apply device filter
        if (deviceFilter) {
            // For maintenance data, we need to match by device name since deviceId doesn't exist
            filtered = filtered.filter(item => {
                const deviceNumber = parseInt(item.device.split(' ').pop() || '0', 10);
                return deviceNumber === deviceFilter.value;
            });
        }

        // Apply lab filter
        if (labFilter) {
            filtered = filtered.filter(item => item.lab === labFilter.value);
        }

        // Apply assistant filter
        if (assistantFilter) {
            filtered = filtered.filter(item => item.performedBy.id === assistantFilter.value);
        }

        // Apply search - safely check for undefined properties
        if (search) {
            filtered = filtered.filter(item =>
                item.device.toLowerCase().includes(search.toLowerCase()) ||
                item.type.toLowerCase().includes(search.toLowerCase()) ||
                (item.findings ? item.findings.toLowerCase().includes(search.toLowerCase()) : false) ||
                (item.action ? item.action.toLowerCase().includes(search.toLowerCase()) : false)
            );
        }

        // Apply date range
        filtered = filtered.filter(item => {
            const itemDate = new Date(item.date).toISOString().split('T')[0];
            return itemDate >= dateFromFilter && itemDate <= dateToFilter;
        });

        setFilteredMaintenance(filtered);
        setPage(1);
    }, [search, deviceFilter, labFilter, assistantFilter, dateFromFilter, dateToFilter, mockMaintenanceHistory]);

    // Handle pagination for reports
    useEffect(() => {
        if (activeTab === "reports") {
            const from = (page - 1) * pageSize;
            const to = from + pageSize;
            setPaginatedReports(filteredReports.slice(from, to));
        }
    }, [page, pageSize, filteredReports, activeTab]);

    // Handle pagination for maintenance
    useEffect(() => {
        if (activeTab === "maintenance") {
            const from = (page - 1) * pageSize;
            const to = from + pageSize;
            setPaginatedMaintenance(filteredMaintenance.slice(from, to));
        }
    }, [page, pageSize, filteredMaintenance, activeTab]);

    // Reset page when changing tabs
    useEffect(() => {
        setPage(1);
    }, [activeTab]);

    // Format date nicely
    const formatDateAndTime = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    // Handle export
    const handleExportData = () => {
        const exportData = activeTab === "reports" ? filteredReports : filteredMaintenance;
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const exportFileDefaultName = `${activeTab}-history-${new Date().toISOString().split('T')[0]}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();

        toast.success(`Successfully exported ${activeTab} history data`);
    };

    // Clear all filters
    const clearFilters = () => {
        setSearch("");
        setDeviceFilter(null);
        setLabFilter(null);
        setStatusFilter(null);
        setAssistantFilter(null);
        setDateFromFilter("");
        setDateToFilter("");
    };

    // Add handler for viewing update history
    const handleViewUpdateHistory = (report: DeviceReportDto) => {
        setSelectedReportForHistory(report);
        setIsUpdateHistoryModalOpen(true);
    };

    return (
        <div className="panel mt-6">
            <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                    <h2 className="text-2xl font-semibold text-secondary">Device History Logs</h2>

                    <div className="flex items-center gap-4 mt-4 sm:mt-0">
                        <button
                            className="h-9 px-3 rounded-md flex items-center gap-1 bg-gray-100 text-secondary hover:bg-gray-200"
                            onClick={handleExportData}
                            title="Export filtered data"
                        >
                            <LuDownload size={16} />
                            <span>Export</span>
                        </button>

                        <button
                            className={`h-9 px-3 rounded-md flex items-center gap-1 ${isFilterOpen ? "bg-secondary text-white" : "bg-gray-100 text-secondary hover:bg-gray-200"}`}
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                        >
                            <LuFilter size={16} />
                            <span>Filters</span>
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
                                onClick={() => setActiveTab("reports")}
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
                                onClick={() => setActiveTab("maintenance")}
                            >
                                Maintenance History
                            </button>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Filter panel */}
            {isFilterOpen && (
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
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">
                                {activeTab === "reports" ? "Assigned To" : "Performed By"}
                            </label>
                            <Select
                                options={availableAssistants}
                                isClearable
                                placeholder="Filter by lab assistant"
                                value={assistantFilter}
                                onChange={(option) => setAssistantFilter(option)}
                                className="text-sm"
                            />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-sm text-gray-600 mb-1">Date From</label>
                            <input
                                type="date"
                                value={dateFromFilter}
                                onChange={(e) => setDateFromFilter(e.target.value)}
                                className="w-full h-[38px] px-3 py-2 rounded-md border border-[#E0E6ED] text-xs font-medium tracking-wider text-gray-500 outline-none focus:border-secondary transition-colors duration-200"
                            />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-sm text-gray-600 mb-1">Date To</label>
                            <input
                                type="date"
                                value={dateToFilter}
                                onChange={(e) => setDateToFilter(e.target.value)}
                                className="w-full h-[38px] px-3 py-2 rounded-md border border-[#E0E6ED] text-xs font-medium tracking-wider text-gray-500 outline-none focus:border-secondary transition-colors duration-200"
                            />
                        </div>
                    </div>

                    <div className="relative flex items-center mb-4">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                            <LuSearch size={18} className="text-gray-500" />
                        </div>
                        <input
                            type="text"
                            placeholder={activeTab === "reports" ? "Search reports..." : "Search maintenance records..."}
                            className="h-10 pl-10 pr-4 w-full rounded-md border border-[#E0E6ED] text-xs font-medium tracking-wider text-gray-500 outline-none focus:border-secondary transition-colors duration-200"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Filter operations */}
                    <div className="flex justify-end">
                        <button
                            onClick={clearFilters}
                            className="text-sm text-secondary hover:text-secondary-dark"
                        >
                            Clear all filters
                        </button>
                    </div>
                </div>
            )}

            {/* Reports Tab Content */}
            {activeTab === "reports" && (
                <div className="datatables">
                    <DataTable
                        highlightOnHover
                        withBorder
                        className="table-hover whitespace-nowrap"
                        records={paginatedReports}
                        columns={[
                            {
                                accessor: "date",
                                title: "Report Date",
                                sortable: true,
                                render: (row) => (
                                    <span>{formatDateAndTime(row.date)}</span>
                                )
                            },
                            {
                                accessor: "device",
                                title: "Device",
                                sortable: true,
                                render: (row) => (
                                    <Link 
                                        to={`/devices/${row.deviceId}/history`} 
                                        className="text-secondary hover:text-secondary-dark hover:underline"
                                    >
                                        {row.device}
                                    </Link>
                                ),
                            },
                            {
                                accessor: "lab",
                                title: "Lab",
                                sortable: true,
                            },
                            {
                                accessor: "reportedBy",
                                title: "Reported By",
                                sortable: true,
                            },
                            {
                                accessor: "problemType",
                                title: "Problem Type",
                                sortable: true,
                            },
                            {
                                accessor: "description",
                                title: "Description",
                                render: (row) => (
                                    <div className="max-w-[200px] truncate" title={row.description}>
                                        {row.description}
                                    </div>
                                )
                            },
                            {
                                accessor: "assignedTo",
                                title: "Assigned To",
                                sortable: true,
                                render: (row) => (
                                    <div className="flex items-center">
                                        <div className="w-7 h-7 bg-secondary text-white rounded-full flex items-center justify-center text-xs font-medium mr-2">
                                            {row.assignedTo.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <span>{row.assignedTo.name}</span>
                                    </div>
                                )
                            },
                            {
                                accessor: "status",
                                title: "Status",
                                sortable: true,
                                render: (row) => (
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.status === "resolved"
                                        ? "bg-green-100 text-green-800"
                                        : row.status === "in_progress"
                                            ? "bg-blue-100 text-blue-800"
                                            : row.status === "pending"
                                                ? "bg-yellow-100 text-yellow-800"
                                                : "bg-red-100 text-red-800"
                                        }`}>
                                        {row.status === "pending" ? "Pending" :
                                            row.status === "in_progress" ? "In Progress" :
                                                "Resolved"}
                                    </span>
                                )
                            },
                            {
                                accessor: "resolution",
                                title: "Resolution",
                                render: (row) => (
                                    <div className="max-w-[200px] truncate" title={row.resolution || "Not resolved yet"}>
                                        {row.resolution || "—"}
                                    </div>
                                )
                            },
                            {
                                accessor: "updates",
                                title: "Updates",
                                render: (row) => (
                                    <div
                                        className={`${(row.updates && row.updates.length > 0) || row.status === "rejected" ? "cursor-pointer hover:bg-gray-50" : ""}`}
                                        onClick={() => {
                                            if ((row.updates && row.updates.length > 0) || row.status === "rejected") {
                                                handleViewUpdateHistory(row);
                                            }
                                        }}
                                    >
                                        {row.status === "rejected" ? (
                                            <span className="text-red-500 flex items-center">
                                                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                                                    Rejected
                                                </span>
                                                <span className="ml-2 text-xs italic" title={row.rejectionReason}>
                                                    {row.rejectionReason || "No reason provided"}
                                                </span>
                                            </span>
                                        ) : row.updates && row.updates.length > 0 ? (
                                            <div className="flex flex-col gap-1">
                                                {row.updates.slice(0, 2).map((update, index) => (
                                                    <div key={update.id} className="flex items-center text-xs">
                                                        <IoMdTime className="mr-1" size={12} />
                                                        <span className="mr-1">{update.date}:</span>
                                                        <span className={`px-1 py-0.5 rounded-full text-xs font-semibold ${update.status === "Passed" || update.status === "Resolved"
                                                            ? "bg-green-100 text-green-800"
                                                            : update.status === "In Progress"
                                                                ? "bg-blue-100 text-blue-800"
                                                                : update.status === "Pending"
                                                                    ? "bg-yellow-100 text-yellow-800"
                                                                    : "bg-amber-100 text-amber-800"
                                                            }`}>
                                                            {update.status}
                                                        </span>
                                                        {update.resolution && (
                                                            <span className="ml-1 text-xs text-gray-600 truncate max-w-[100px]" title={update.resolution}>
                                                                - {update.resolution}
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                                {row.updates.length > 2 && (
                                                    <div className="text-xs text-blue-600 font-medium">
                                                        +{row.updates.length - 2} more...
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-gray-400">No updates yet</span>
                                        )}
                                    </div>
                                )
                            },
                        ]}
                        totalRecords={filteredReports.length}
                        recordsPerPage={pageSize}
                        onRecordsPerPageChange={setPageSize}
                        page={page}
                        onPageChange={(p) => setPage(p)}
                        recordsPerPageOptions={PAGE_SIZES}
                        noRecordsText="No reports found"
                    />
                </div>
            )}

            {/* Maintenance Tab Content */}
            {activeTab === "maintenance" && (
                <div className="datatables">
                    <DataTable
                        highlightOnHover
                        withBorder
                        className="table-hover whitespace-nowrap"
                        records={paginatedMaintenance}
                        columns={[
                            {
                                accessor: "date",
                                title: "Date",
                                sortable: true,
                                render: (row) => (
                                    <span>{formatDateAndTime(row.date)}</span>
                                )
                            },
                            {
                                accessor: "device",
                                title: "Device",
                                sortable: true,
                                render: (row) => {
                                    // Extract device ID from name (e.g., "Dell PC 01" -> 1)
                                    const deviceId = parseInt(row.device.split(' ').pop() || '0', 10);
                                    
                                    return (
                                        <Link 
                                            to={`/devices/${deviceId}/history`} 
                                            className="text-secondary hover:text-secondary-dark hover:underline"
                                        >
                                            {row.device}
                                        </Link>
                                    );
                                },
                            },
                            {
                                accessor: "lab",
                                title: "Lab",
                                sortable: true,
                            },
                            {
                                accessor: "type",
                                title: "Type",
                                sortable: true,
                            },
                            {
                                accessor: "status",
                                title: "Status",
                                sortable: true,
                                render: (row) => (
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.status === "Passed" || row.status === "Resolved"
                                        ? "bg-green-100 text-green-800"
                                        : row.status === "In Progress"
                                            ? "bg-blue-100 text-blue-800"
                                            : row.status === "Pending"
                                                ? "bg-yellow-100 text-yellow-800"
                                                : "bg-amber-100 text-amber-800"
                                        }`}>
                                        {row.status}
                                    </span>
                                ),
                            },
                            {
                                accessor: "issue",
                                title: "Issue",
                                render: (row) => (
                                    <div className="max-w-[200px] truncate" title={row.issue || "No issues reported"}>
                                        {row.issue || "-"}
                                    </div>
                                )
                            },
                            {
                                accessor: "resolution",
                                title: "Resolution",
                                render: (row) => (
                                    <div className="max-w-[200px] truncate" title={row.resolution || "No resolution needed"}>
                                        {row.resolution || "-"}
                                    </div>
                                )
                            },
                            {
                                accessor: "performedBy",
                                title: "Performed By",
                                sortable: true,
                                render: (row) => (
                                    <div className="flex items-center">
                                        <div className="w-7 h-7 bg-secondary text-white rounded-full flex items-center justify-center text-xs font-medium mr-2">
                                            {row.performedBy.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <span>{row.performedBy.name}</span>
                                    </div>
                                )
                            },
                            {
                                accessor: "involvedPersonnel",
                                title: "Involved Personnel",
                                render: (row) => row.involvedPersonnel.join(", "),
                            },
                        ]}
                        totalRecords={filteredMaintenance.length}
                        recordsPerPage={pageSize}
                        onRecordsPerPageChange={setPageSize}
                        page={page}
                        onPageChange={(p) => setPage(p)}
                        recordsPerPageOptions={PAGE_SIZES}
                        noRecordsText="No maintenance records found"
                    />
                </div>
            )}

            {/* Add the Update History Modal */}
            <UpdateHistoryModal
                isOpen={isUpdateHistoryModalOpen}
                onClose={() => setIsUpdateHistoryModalOpen(false)}
                updates={selectedReportForHistory?.updates || []}
                reportDescription={selectedReportForHistory?.description || ""}
                reportDate={selectedReportForHistory?.date || ""}
            />
        </div>
    );
};

export default AllDevicesHistoryPage; 