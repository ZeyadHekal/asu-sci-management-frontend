import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { DataTable } from "mantine-datatable";
import { LuArrowLeft, LuSearch } from "react-icons/lu";
import { FaRegEdit } from "react-icons/fa";
import { RiDeleteBinLine } from "react-icons/ri";
import { FiAlertTriangle } from "react-icons/fi";
import { IoMdTime } from "react-icons/io";
import { UpdateModal, RejectReportModal, UpdateHistoryModal } from "../components";
import DeleteConfirmationModal from "../../../ui/modal/DeleteConfirmationModal";
import { toast } from "react-hot-toast";
import { useDeviceControllerGetById } from "../../../generated/hooks/devicesHooks/useDeviceControllerGetById";
import { useDeviceControllerGetDeviceMaintenanceHistory } from "../../../generated/hooks/devicesHooks/useDeviceControllerGetDeviceMaintenanceHistory";
import { useDeviceControllerGetDeviceLoginHistory } from "../../../generated/hooks/devicesHooks/useDeviceControllerGetDeviceLoginHistory";
import { useDeviceControllerGetDeviceReports } from "../../../generated/hooks/devicesHooks/useDeviceControllerGetDeviceReports";
import { useDeviceReportControllerGetDeviceReports } from "../../../generated/hooks/device-reportsHooks/useDeviceReportControllerGetDeviceReports";

interface UpdateRecord {
    id: number;
    date: string;
    type: string;
    status: string;
    issue?: string;
    resolution?: string;
    involvedPersonnel: string[];
    reportId?: number;
}

interface LoginRecord {
    id: number;
    userName: string;
    userId: string;
    lastActionTime: string;
}

interface ReportRecord {
    id: number;
    date: string;
    problemType: string;
    description: string;
    status: string;
    urgency: string;
    reportedBy: string;
    updates?: { id: number; date: string; status: string; resolution?: string }[];
    rejectionReason?: string;
}

const DeviceHistoryPage = () => {
    const { deviceId } = useParams();
    const navigate = useNavigate();
    const [device, setDevice] = useState<{
        id: number;
        deviceName: string;
        lab: string;
        status: string;
        addedSince: string;
        specs: string[];
        software: string[];
    } | null>(null);

    // Modal states
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingUpdateId, setEditingUpdateId] = useState<number | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingUpdateId, setDeletingUpdateId] = useState<number | null>(null);
    const [selectedReport, setSelectedReport] = useState<ReportRecord | null>(null);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectingReportId, setRejectingReportId] = useState<number | null>(null);

    // Data states
    const [maintenanceRecords, setMaintenanceRecords] = useState<UpdateRecord[]>([]);
    const [loginRecords, setLoginRecords] = useState<LoginRecord[]>([]);
    const [reportRecords, setReportRecords] = useState<ReportRecord[]>([]);
    const [activeTab, setActiveTab] = useState<"maintenance" | "logins" | "reports">("maintenance");

    // Pagination states
    const [maintenancePage, setMaintenancePage] = useState(1);
    const [loginPage, setLoginPage] = useState(1);
    const [reportsPage, setReportsPage] = useState(1);
    const PAGE_SIZES = [5, 10, 20, 30];
    const [maintenancePageSize, setMaintenancePageSize] = useState(PAGE_SIZES[3]);
    const [loginPageSize, setLoginPageSize] = useState(PAGE_SIZES[3]);
    const [reportsPageSize, setReportsPageSize] = useState(PAGE_SIZES[3]);

    // Search states
    const [maintenanceSearch, setMaintenanceSearch] = useState("");
    const [loginSearch, setLoginSearch] = useState("");
    const [reportsSearch, setReportsSearch] = useState("");

    // Filtered records
    const [filteredMaintenanceRecords, setFilteredMaintenanceRecords] = useState<UpdateRecord[]>([]);
    const [filteredLoginRecords, setFilteredLoginRecords] = useState<LoginRecord[]>([]);
    const [filteredReportRecords, setFilteredReportRecords] = useState<ReportRecord[]>([]);

    // Paginated records
    const [paginatedMaintenanceRecords, setPaginatedMaintenanceRecords] = useState<UpdateRecord[]>([]);
    const [paginatedLoginRecords, setPaginatedLoginRecords] = useState<LoginRecord[]>([]);
    const [paginatedReportRecords, setPaginatedReportRecords] = useState<ReportRecord[]>([]);

    // Add state for update history modal
    const [isUpdateHistoryModalOpen, setIsUpdateHistoryModalOpen] = useState(false);
    const [selectedReportForHistory, setSelectedReportForHistory] = useState<ReportRecord | null>(null);

    // Check URL parameters for tab selection
    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const tabParam = searchParams.get('tab');

        if (tabParam === 'reports') {
            setActiveTab('reports');
        }
    }, []);

    // Fetch device details
    const { data: deviceData, isLoading: deviceLoading } = useDeviceControllerGetById(deviceId || "");

    // Fetch maintenance history
    const { data: maintenanceHistoryData, isLoading: maintenanceLoading } = useDeviceControllerGetDeviceMaintenanceHistory(deviceId || "");

    // Fetch login history
    const { data: loginHistoryData, isLoading: loginLoading } = useDeviceControllerGetDeviceLoginHistory(deviceId || "");

    // Fetch reports
    const { data: reportsData, isLoading: reportsLoading } = useDeviceControllerGetDeviceReports(deviceId || "");

    // Process the fetched data and create temporary data where API is not fully implemented
    useEffect(() => {
        if (deviceData?.data) {
            const device = deviceData.data;
            setDevice({
                id: Number(deviceId),
                deviceName: device.name || `Device ${device.IPAddress}`,
                lab: "Lab B2-215", // Temporary - should come from lab mapping
                status: device.status || "Available",
                addedSince: device.addedSince ? new Date(device.addedSince).toISOString().split('T')[0] : "2022-06-01",
                specs: device.specDetails?.map(spec => spec.value) || ["Intel Core i5", "16GB RAM", "512GB SSD", "Windows 11"],
                software: ["Visual Studio Code", "MySQL", "Cisco Packet Tracer"] // Temporary data
            });
        }

        // Process maintenance history - using temporary data since API returns unknown
        if (maintenanceHistoryData) {
            const mockMaintenanceRecords: UpdateRecord[] = [
                {
                    id: 1,
                    date: "2023-05-15",
                    type: "Regular Update",
                    status: "Passed",
                    involvedPersonnel: ["John Smith", "Emily Davis"]
                },
                {
                    id: 2,
                    date: "2023-07-21",
                    type: "Hardware Issue",
                    status: "Resolved",
                    issue: "Keyboard not functioning properly",
                    resolution: "Replaced keyboard",
                    involvedPersonnel: ["Sarah Johnson"]
                },
                {
                    id: 3,
                    date: "2023-09-10",
                    type: "Software Issue",
                    status: "In Progress",
                    issue: "Windows not booting",
                    resolution: "System recovery in progress",
                    involvedPersonnel: ["Michael Brown", "James Wilson"]
                }
            ];
            setMaintenanceRecords(mockMaintenanceRecords);
            setFilteredMaintenanceRecords(mockMaintenanceRecords);
        }

        // Process login history - using temporary data since API returns unknown
        if (loginHistoryData) {
            const mockLoginRecords: LoginRecord[] = [
                {
                    id: 1,
                    userName: "Ahmed Ali",
                    userId: "ahmedali@example.edu",
                    lastActionTime: "2023-10-15 10:45:15"
                },
                {
                    id: 2,
                    userName: "Sara Mohamed",
                    userId: "saramohamed@example.edu",
                    lastActionTime: "2023-10-15 13:30:45"
                },
                {
                    id: 3,
                    userName: "Omar Khaled",
                    userId: "omarkhaled@example.edu",
                    lastActionTime: "2023-10-16 11:45:22"
                }
            ];
            setLoginRecords(mockLoginRecords);
            setFilteredLoginRecords(mockLoginRecords);
        }

        // Process reports data
        if (reportsData?.data) {
            // If API returns actual data, use it; otherwise use temporary data
            const mockReportRecords: ReportRecord[] = [
                {
                    id: 1,
                    date: "2023-11-05",
                    problemType: "Hardware Issue",
                    description: "The keyboard is missing several keys and the spacebar is sticking.",
                    status: "Resolved",
                    urgency: "Medium",
                    reportedBy: "Ahmed Ali",
                    updates: [
                        {
                            id: 101,
                            date: "2023-11-06",
                            status: "In Progress",
                            resolution: "Ordered replacement keyboard"
                        },
                        {
                            id: 102,
                            date: "2023-11-08",
                            status: "Resolved",
                            resolution: "Replaced keyboard with new one from inventory"
                        }
                    ]
                },
                {
                    id: 2,
                    date: "2023-11-12",
                    problemType: "Hardware Issue",
                    description: "Monitor screen keeps flickering, especially when using dark mode applications.",
                    status: "Pending",
                    urgency: "High",
                    reportedBy: "Sara Mohamed"
                }
            ];
            setReportRecords(mockReportRecords);
            setFilteredReportRecords(mockReportRecords);
        }
    }, [deviceData, maintenanceHistoryData, loginHistoryData, reportsData, deviceId]);

    // Handle search and pagination for maintenance records
    useEffect(() => {
        if (maintenanceSearch) {
            const filtered = maintenanceRecords.filter(record =>
                record.type.toLowerCase().includes(maintenanceSearch.toLowerCase()) ||
                record.status.toLowerCase().includes(maintenanceSearch.toLowerCase()) ||
                record.issue?.toLowerCase().includes(maintenanceSearch.toLowerCase()) ||
                record.resolution?.toLowerCase().includes(maintenanceSearch.toLowerCase()) ||
                record.involvedPersonnel.some(person =>
                    person.toLowerCase().includes(maintenanceSearch.toLowerCase())
                )
            );
            setFilteredMaintenanceRecords(filtered);
            setMaintenancePage(1);
        } else {
            setFilteredMaintenanceRecords(maintenanceRecords);
        }
    }, [maintenanceSearch, maintenanceRecords]);

    // Handle search and pagination for login records
    useEffect(() => {
        if (loginSearch) {
            const filtered = loginRecords.filter(record =>
                record.userName.toLowerCase().includes(loginSearch.toLowerCase()) ||
                record.userId.toLowerCase().includes(loginSearch.toLowerCase()) ||
                record.lastActionTime.toLowerCase().includes(loginSearch.toLowerCase())
            );
            setFilteredLoginRecords(filtered);
            setLoginPage(1);
        } else {
            setFilteredLoginRecords(loginRecords);
        }
    }, [loginSearch, loginRecords]);

    // Handle search and pagination for report records
    useEffect(() => {
        if (reportsSearch) {
            const filtered = reportRecords.filter(record =>
                record.problemType.toLowerCase().includes(reportsSearch.toLowerCase()) ||
                record.description.toLowerCase().includes(reportsSearch.toLowerCase()) ||
                record.status.toLowerCase().includes(reportsSearch.toLowerCase()) ||
                record.reportedBy.toLowerCase().includes(reportsSearch.toLowerCase()) ||
                record.urgency.toLowerCase().includes(reportsSearch.toLowerCase())
            );
            setFilteredReportRecords(filtered);
            setReportsPage(1);
        } else {
            setFilteredReportRecords(reportRecords);
        }
    }, [reportsSearch, reportRecords]);

    // Calculate paginated maintenance records
    useEffect(() => {
        const from = (maintenancePage - 1) * maintenancePageSize;
        const to = from + maintenancePageSize;
        setPaginatedMaintenanceRecords(filteredMaintenanceRecords.slice(from, to));
    }, [maintenancePage, maintenancePageSize, filteredMaintenanceRecords]);

    // Calculate paginated login records
    useEffect(() => {
        const from = (loginPage - 1) * loginPageSize;
        const to = from + loginPageSize;
        setPaginatedLoginRecords(filteredLoginRecords.slice(from, to));
    }, [loginPage, loginPageSize, filteredLoginRecords]);

    // Calculate paginated report records
    useEffect(() => {
        const from = (reportsPage - 1) * reportsPageSize;
        const to = from + reportsPageSize;
        setPaginatedReportRecords(filteredReportRecords.slice(from, to));
    }, [reportsPage, reportsPageSize, filteredReportRecords]);

    const handleAddUpdate = (reportId?: number) => {
        setIsEditMode(false);
        setEditingUpdateId(null);
        setSelectedReport(null);

        // If reportId is provided, find the report and set it as selectedReport
        if (reportId && reportRecords.length > 0) {
            const foundReport = reportRecords.find(report => report.id === reportId);
            if (foundReport) {
                setSelectedReport(foundReport);
            }
        }

        setIsUpdateModalOpen(true);
    };

    const handleEditUpdate = (id: number) => {
        setIsEditMode(true);
        setEditingUpdateId(id);
        setIsUpdateModalOpen(true);
    };

    const handleDeleteUpdate = (id: number) => {
        setDeletingUpdateId(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteUpdate = () => {
        if (deletingUpdateId) {
            setMaintenanceRecords(
                prevRecords => prevRecords.filter(record => record.id !== deletingUpdateId)
            );
            setIsDeleteModalOpen(false);
            setDeletingUpdateId(null);
        }
    };

    const handleCloseUpdateModal = () => {
        setIsUpdateModalOpen(false);
        setIsEditMode(false);
        setEditingUpdateId(null);
    };

    const handleSaveUpdate = (update: Omit<UpdateRecord, "id">) => {
        if (isEditMode && editingUpdateId) {
            // Update existing record
            setMaintenanceRecords(
                maintenanceRecords.map(record =>
                    record.id === editingUpdateId
                        ? { ...update, id: editingUpdateId }
                        : record
                )
            );
        } else {
            // Add new record
            const newUpdate: UpdateRecord = {
                ...update,
                id: Date.now(), // Generate a unique ID
            };
            setMaintenanceRecords([newUpdate, ...maintenanceRecords]);
        }
        setIsUpdateModalOpen(false);
        setIsEditMode(false);
        setEditingUpdateId(null);

        // If update is for a report, update the report status if it's completed
        if (update.reportId && (update.status === "Resolved" || update.status === "Passed")) {
            setReportRecords(
                reportRecords.map(report =>
                    report.id === update.reportId
                        ? { ...report, status: "Resolved" }
                        : report
                )
            );
        }
    };

    const handleReportUpdate = (reportId: number) => {
        handleAddUpdate(reportId);
    };

    const handleReportProblem = () => {
        navigate(`/devices/report-problem?deviceId=${deviceId}`);
    };

    // Add handler for rejecting reports
    const handleRejectReport = (reportId: number) => {
        setRejectingReportId(reportId);
        setIsRejectModalOpen(true);
    };

    const handleCloseRejectModal = () => {
        setIsRejectModalOpen(false);
        setRejectingReportId(null);
    };

    const handleConfirmReject = (reason: string) => {
        if (rejectingReportId) {
            setReportRecords(
                reportRecords.map(report =>
                    report.id === rejectingReportId
                        ? { ...report, status: "Rejected", rejectionReason: reason }
                        : report
                )
            );
            setIsRejectModalOpen(false);
            setRejectingReportId(null);
        }
    };

    // Track updates for reports
    useEffect(() => {
        // After each update save/edit, associate updates with reports
        // This will create a map of reportId -> updates
        const updatesForReports = maintenanceRecords.reduce((acc, record) => {
            if (record.reportId) {
                if (!acc[record.reportId]) {
                    acc[record.reportId] = [];
                }
                acc[record.reportId].push({
                    id: record.id,
                    date: record.date,
                    status: record.status,
                    resolution: record.resolution
                });
            }
            return acc;
        }, {} as Record<number, { id: number; date: string; status: string; resolution?: string }[]>);

        // Update the reports with their associated updates
        setReportRecords(prevReports =>
            prevReports.map(report => ({
                ...report,
                updates: updatesForReports[report.id] || []
            }))
        );
    }, [maintenanceRecords]);

    // Add handler for viewing update history
    const handleViewUpdateHistory = (report: ReportRecord) => {
        setSelectedReportForHistory(report);
        setIsUpdateHistoryModalOpen(true);
    };

    if (deviceLoading || maintenanceLoading || loginLoading || reportsLoading) {
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

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
                                <p className="text-sm text-gray-500 mb-1">Total Reports</p>
                                <p className="font-medium text-orange-600">{reportRecords.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Specifications</h2>
                            <ul className="space-y-2">
                                {device?.specs.map((spec, index) => (
                                    <li key={index} className="flex items-center gap-2">
                                        <span className="w-2 h-2 bg-secondary rounded-full"></span>
                                        <span className="text-gray-700">{spec}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800 mt-6 mb-4">Installed Software</h2>
                            <ul className="space-y-2">
                                {device?.software.map((sw, index) => (
                                    <li key={index} className="flex items-center gap-2">
                                        <span className="w-2 h-2 bg-secondary rounded-full"></span>
                                        <span className="text-gray-700">{sw}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-[#E0E6ED] mb-6">
                    <button
                        className={`py-3 px-5 font-medium text-sm border-b-2 transition-colors ${activeTab === "maintenance"
                            ? "border-secondary text-secondary"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                        onClick={() => setActiveTab("maintenance")}
                    >
                        Maintenance History
                    </button>
                    <button
                        className={`py-3 px-5 font-medium text-sm border-b-2 transition-colors ${activeTab === "logins"
                            ? "border-secondary text-secondary"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                        onClick={() => setActiveTab("logins")}
                    >
                        Login History
                    </button>
                    <button
                        className={`py-3 px-5 font-medium text-sm border-b-2 transition-colors ${activeTab === "reports"
                            ? "border-secondary text-secondary"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                        onClick={() => setActiveTab("reports")}
                    >
                        Reports History
                    </button>
                </div>

                {/* Action buttons */}
                <div className="flex justify-between mb-4">
                    <div className="relative w-[240px]">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                            <LuSearch size={18} className="text-[#0E1726]" />
                        </div>
                        <input
                            type="text"
                            placeholder={
                                activeTab === "maintenance" ? "Search updates" :
                                    activeTab === "logins" ? "Search login history" :
                                        "Search reports"
                            }
                            className="h-10 pl-10 pr-4 w-full rounded-md border border-[#E0E6ED] text-xs font-medium tracking-wider text-gray-500 outline-none focus:border-secondary transition-colors duration-200"
                            value={
                                activeTab === "maintenance" ? maintenanceSearch :
                                    activeTab === "logins" ? loginSearch :
                                        reportsSearch
                            }
                            onChange={(e) => {
                                if (activeTab === "maintenance") {
                                    setMaintenanceSearch(e.target.value);
                                } else if (activeTab === "logins") {
                                    setLoginSearch(e.target.value);
                                } else {
                                    setReportsSearch(e.target.value);
                                }
                            }}
                        />
                    </div>

                    {activeTab === "maintenance" && (
                        <button
                            onClick={() => handleAddUpdate()}
                            className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary-dark flex items-center gap-2"
                        >
                            New Update
                        </button>
                    )}

                    {activeTab === "reports" && (
                        <button
                            className="self-start h-10 px-4 rounded-lg bg-secondary flex items-center text-white"
                            onClick={handleReportProblem}
                        >
                            Report Problem
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="datatables p-6 pt-0">
                {activeTab === "maintenance" ? (
                    <DataTable
                        highlightOnHover
                        withBorder
                        className="table-hover whitespace-nowrap"
                        records={paginatedMaintenanceRecords}
                        columns={[
                            {
                                accessor: "date",
                                title: "Date",
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
                                render: (row) => row.issue || "-",
                            },
                            {
                                accessor: "resolution",
                                title: "Resolution",
                                render: (row) => row.resolution || "-",
                            },
                            {
                                accessor: "involvedPersonnel",
                                title: "Involved Personnel",
                                render: (row) => row.involvedPersonnel.join(", "),
                            },
                            {
                                accessor: "actions",
                                title: "Actions",
                                render: (row) => (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleEditUpdate(row.id)}
                                            className="text-gray-500 hover:text-secondary"
                                        >
                                            <FaRegEdit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUpdate(row.id)}
                                            className="text-gray-500 hover:text-danger"
                                        >
                                            <RiDeleteBinLine size={18} />
                                        </button>
                                    </div>
                                ),
                            },
                        ]}
                        totalRecords={filteredMaintenanceRecords.length}
                        recordsPerPage={maintenancePageSize}
                        onRecordsPerPageChange={setMaintenancePageSize}
                        page={maintenancePage}
                        onPageChange={(p) => setMaintenancePage(p)}
                        recordsPerPageOptions={PAGE_SIZES}
                    />
                ) : activeTab === "logins" ? (
                    <DataTable
                        highlightOnHover
                        withBorder
                        className="table-hover whitespace-nowrap"
                        records={paginatedLoginRecords}
                        columns={[
                            {
                                accessor: "userName",
                                title: "User",
                                sortable: true,
                            },
                            {
                                accessor: "userId",
                                title: "User ID",
                            },
                            {
                                accessor: "lastActionTime",
                                title: "Last Action Time",
                                sortable: true,
                            },
                        ]}
                        totalRecords={filteredLoginRecords.length}
                        recordsPerPage={loginPageSize}
                        onRecordsPerPageChange={setLoginPageSize}
                        page={loginPage}
                        onPageChange={(p) => setLoginPage(p)}
                        recordsPerPageOptions={PAGE_SIZES}
                    />
                ) : (
                    <DataTable
                        highlightOnHover
                        withBorder
                        className="table-hover whitespace-nowrap"
                        records={paginatedReportRecords}
                        columns={[
                            {
                                accessor: "date",
                                title: "Report Date",
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
                                accessor: "status",
                                title: "Status",
                                sortable: true,
                                render: (row) => (
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.status === "Resolved" ? "bg-green-100 text-green-800" :
                                        row.status === "In Progress" ? "bg-blue-100 text-blue-800" :
                                            row.status === "Pending" ? "bg-amber-100 text-amber-800" :
                                                "bg-red-100 text-red-800"
                                        }`}>
                                        {row.status}
                                    </span>
                                ),
                            },
                            {
                                accessor: "updates",
                                title: "Updates",
                                render: (row) => (
                                    <div
                                        className={`${(row.updates && row.updates.length > 0) || row.status === "Rejected" ? "cursor-pointer hover:bg-gray-50" : ""}`}
                                        onClick={() => {
                                            if ((row.updates && row.updates.length > 0) || row.status === "Rejected") {
                                                handleViewUpdateHistory(row);
                                            }
                                        }}
                                    >
                                        {row.status === "Rejected" ? (
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
                            {
                                accessor: "actions",
                                title: "Actions",
                                render: (row) => (
                                    <div className="flex items-center gap-2">
                                        {row.status !== "Resolved" && row.status !== "Rejected" && (
                                            <>
                                                <button
                                                    onClick={() => handleReportUpdate(row.id)}
                                                    className="px-3 py-1 bg-secondary text-white text-xs rounded-md hover:bg-secondary-dark"
                                                    title="Start update for this report"
                                                >
                                                    Start Update
                                                </button>
                                                <button
                                                    onClick={() => handleRejectReport(row.id)}
                                                    className="px-3 py-1 bg-red-500 text-white text-xs rounded-md hover:bg-red-600"
                                                    title="Reject this report"
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                    </div>
                                ),
                            },
                        ]}
                        totalRecords={filteredReportRecords.length}
                        recordsPerPage={reportsPageSize}
                        onRecordsPerPageChange={setReportsPageSize}
                        page={reportsPage}
                        onPageChange={(p) => setReportsPage(p)}
                        recordsPerPageOptions={PAGE_SIZES}
                        noRecordsText="No reported problems for this device"
                        emptyState={
                            <div className="flex flex-col items-center py-6">
                                <FiAlertTriangle size={36} className="text-gray-400 mb-2" />
                                <p className="text-gray-500">No reported problems for this device</p>
                                <button
                                    onClick={handleReportProblem}
                                    className="mt-3 text-secondary hover:underline"
                                >
                                    Report a problem
                                </button>
                            </div>
                        }
                    />
                )}
            </div>

            <UpdateModal
                isOpen={isUpdateModalOpen}
                onClose={handleCloseUpdateModal}
                onSave={handleSaveUpdate}
                deviceId={Number(deviceId)}
                deviceName={device?.deviceName || ""}
                isEditMode={isEditMode}
                updateData={isEditMode && editingUpdateId ?
                    maintenanceRecords.find(record => record.id === editingUpdateId) || null
                    : null
                }
                selectedReport={selectedReport}
                reportRecords={reportRecords.filter(report => report.status !== "Resolved")}
            />

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDeleteUpdate}
                title="Delete Update"
                message="Are you sure you want to delete this update record? This action cannot be undone."
            />

            <RejectReportModal
                isOpen={isRejectModalOpen}
                onClose={handleCloseRejectModal}
                onConfirm={handleConfirmReject}
            />

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

export default DeviceHistoryPage; 