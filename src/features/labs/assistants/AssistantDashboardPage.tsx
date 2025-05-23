import { useState, useEffect } from "react";
import { DataTable } from "mantine-datatable";
import { LuSearch, LuBell, LuHistory, LuInfo, LuLayoutDashboard } from "react-icons/lu";
import { useNavigate } from "react-router";
import { toast } from "react-hot-toast";
import { FaRegClock, FaCheck, FaTimes, FaExclamationCircle } from "react-icons/fa";
import Select from "react-select";
import Modal from "../../../ui/modal/Modal";
import Badge from "../../../ui/Badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import AssignedDevicesTab from "./AssignedDevicesTab";

// Define response schema with Zod
const responseSchema = z.object({
    resolution: z.string().min(10, "Resolution details must be at least 10 characters"),
    status: z.enum(["resolved", "in_progress", "not_fixable"]),
});

type ResponseFormData = z.infer<typeof responseSchema>;

// Status filter options
const statusOptions = [
    { value: "all", label: "All Reports" },
    { value: "pending", label: "Pending" },
    { value: "in_progress", label: "In Progress" },
    { value: "resolved", label: "Resolved" },
];

// Mock data for assigned labs
const assignedLabs = [
    { value: 1, label: "Lab B2-215" },
    { value: 2, label: "Lab B2-216" },
];

// Mock reports data
const mockReports = [
    {
        id: 1,
        date: "2024-03-15T14:30:00",
        lab: "Lab B2-215",
        labId: 1,
        device: "Dell PC 01",
        deviceId: 1,
        problemType: "Hardware Issue",
        description: "Keyboard is not working properly",
        status: "pending",
        reportedBy: "Ahmed Hassan",
        isNew: true,
    },
    {
        id: 2,
        date: "2024-03-14T10:15:00",
        lab: "Lab B2-215",
        labId: 1,
        device: "Dell PC 03",
        deviceId: 3,
        problemType: "Software Issue",
        description: "Visual Studio Code keeps crashing when opening projects",
        status: "in_progress",
        reportedBy: "Sara Ali",
        resolution: "Reinstalling Visual Studio Code and checking for system updates",
        isNew: false,
    },
    {
        id: 3,
        date: "2024-03-13T09:45:00",
        lab: "Lab B2-216",
        labId: 2,
        device: "Dell PC 05",
        deviceId: 5,
        problemType: "Network Issue",
        description: "Cannot connect to university network",
        status: "resolved",
        reportedBy: "Mohamed Khalid",
        resolution: "Reset network adapter and updated drivers",
        isNew: false,
    },
    {
        id: 4,
        date: "2024-03-15T16:20:00",
        lab: "Lab B2-216",
        labId: 2,
        device: "Dell PC 06",
        deviceId: 6,
        problemType: "Hardware Issue",
        description: "Monitor display has vertical lines",
        status: "pending",
        reportedBy: "Fatima Ahmed",
        isNew: true,
    },
    {
        id: 5,
        date: "2024-03-12T11:30:00",
        lab: "Lab B2-215",
        labId: 1,
        device: "Dell PC 02",
        deviceId: 2,
        problemType: "Peripheral Issue",
        description: "Mouse stops working intermittently",
        status: "resolved",
        reportedBy: "Omar Samy",
        resolution: "Replaced faulty mouse with new one",
        isNew: false,
    },
];

const AssistantDashboardPage = () => {
    const navigate = useNavigate();

    // Tab state
    const [activeTab, setActiveTab] = useState<"reports" | "devices">("reports");

    // Reports state
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [5, 10, 20, 30];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [reports, setReports] = useState(mockReports);
    const [filteredReports, setFilteredReports] = useState(mockReports);
    const [paginatedReports, setPaginatedReports] = useState<typeof mockReports>([]);
    const [selectedReport, setSelectedReport] = useState<(typeof mockReports)[0] | null>(null);
    const [isRespondModalOpen, setIsRespondModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState({ value: "all", label: "All Reports" });
    const [labFilter, setLabFilter] = useState<{ value: number; label: string } | null>(null);
    const [newReportsCount, setNewReportsCount] = useState(0);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<ResponseFormData>({
        resolver: zodResolver(responseSchema),
    });

    // Count new reports
    useEffect(() => {
        const count = reports.filter(report => report.isNew).length;
        setNewReportsCount(count);
    }, [reports]);

    // Handle search and filters
    useEffect(() => {
        let filtered = [...reports];

        // Apply lab filter
        if (labFilter) {
            filtered = filtered.filter(report => report.labId === labFilter.value);
        }

        // Apply status filter
        if (statusFilter.value !== "all") {
            filtered = filtered.filter(report => report.status === statusFilter.value);
        }

        // Apply search
        if (search) {
            filtered = filtered.filter(report =>
                report.device.toLowerCase().includes(search.toLowerCase()) ||
                report.problemType.toLowerCase().includes(search.toLowerCase()) ||
                report.description.toLowerCase().includes(search.toLowerCase()) ||
                report.reportedBy.toLowerCase().includes(search.toLowerCase())
            );
        }

        setFilteredReports(filtered);
        setPage(1);
    }, [search, reports, statusFilter, labFilter]);

    // Handle pagination
    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        setPaginatedReports(filteredReports.slice(from, to));
    }, [page, pageSize, filteredReports]);

    // Format date to display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    // Calculate time passed
    const getTimePassed = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));

        if (diffHrs < 1) {
            const diffMins = Math.floor(diffMs / (1000 * 60));
            return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
        } else if (diffHrs < 24) {
            return `${diffHrs} hr${diffHrs !== 1 ? 's' : ''} ago`;
        } else {
            const diffDays = Math.floor(diffHrs / 24);
            return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
        }
    };

    // Handle marking a report as viewed (no longer new)
    const markAsViewed = (reportId: number) => {
        setReports(reports.map(report =>
            report.id === reportId ? { ...report, isNew: false } : report
        ));
    };

    // Handle viewing report details
    const handleViewDetails = (report: (typeof mockReports)[0]) => {
        setSelectedReport(report);
        setIsDetailsModalOpen(true);
        if (report.isNew) {
            markAsViewed(report.id);
        }
    };

    // Handle opening response modal
    const handleRespond = (report: (typeof mockReports)[0]) => {
        setSelectedReport(report);
        setIsRespondModalOpen(true);
        if (report.isNew) {
            markAsViewed(report.id);
        }
    };

    // Handle report response submission
    const onSubmitResponse = (data: ResponseFormData) => {
        if (!selectedReport) return;

        // Update the report with the response
        const updatedReports = reports.map(report =>
            report.id === selectedReport.id
                ? {
                    ...report,
                    status: data.status,
                    resolution: data.resolution,
                    isNew: false
                }
                : report
        );

        setReports(updatedReports);
        setIsRespondModalOpen(false);
        reset();

        // If resolved or in progress, redirect to create an update entry
        if (data.status === "resolved" || data.status === "in_progress") {
            // Show success notification before navigating
            toast.success("Response submitted successfully!");

            // Navigate to device history with update tab selected and report ID as parameter
            // This would be used by the update form to pre-fill details
            setTimeout(() => {
                navigate(`/devices/${selectedReport.deviceId}/history?tab=maintenance&reportId=${selectedReport.id}`);
            }, 1000);
        } else {
            // Just show success notification for not fixable status
            toast.success("Response submitted successfully!");
        }
    };

    // View device details
    const handleViewDevice = (report: (typeof mockReports)[0]) => {
        navigate(`/devices/${report.deviceId}/history?tab=reports`);
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
                                onClick={() => setActiveTab("reports")}
                            >
                                Reports
                                {newReportsCount > 0 && (
                                    <Badge variant="danger" className="ml-2">
                                        {newReportsCount}
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
                                onClick={() => setActiveTab("devices")}
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
                            <div className="flex items-center">
                                <h3 className="text-xl font-semibold text-secondary">My Assigned Reports</h3>
                                {newReportsCount > 0 && (
                                    <Badge variant="danger" className="ml-3">
                                        {newReportsCount} Unresolved
                                    </Badge>
                                )}
                            </div>

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
                            records={paginatedReports}
                            columns={[
                                {
                                    accessor: "status",
                                    title: "",
                                    width: "40px",
                                    render: (row) => (
                                        <div className="flex justify-center">
                                            {row.isNew && (
                                                <div className="h-2 w-2 rounded-full bg-red-500" title="New report"></div>
                                            )}
                                        </div>
                                    )
                                },
                                {
                                    accessor: "date",
                                    title: "Reported",
                                    sortable: true,
                                    render: (row) => (
                                        <div className="flex flex-col">
                                            <span>{formatDate(row.date)}</span>
                                            <span className="text-xs text-gray-500 flex items-center mt-0.5">
                                                <FaRegClock className="mr-1" size={12} />
                                                {getTimePassed(row.date)}
                                            </span>
                                        </div>
                                    )
                                },
                                {
                                    accessor: "lab",
                                    title: "Lab",
                                    sortable: true,
                                },
                                {
                                    accessor: "device",
                                    title: "Device",
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
                                    accessor: "reportedBy",
                                    title: "Reported By",
                                    sortable: true,
                                },
                                {
                                    accessor: "status",
                                    title: "Status",
                                    sortable: true,
                                    render: (row) => (
                                        <div className="flex items-center">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.status === "resolved"
                                                ? "bg-green-100 text-green-800"
                                                : row.status === "in_progress"
                                                    ? "bg-blue-100 text-blue-800"
                                                    : "bg-yellow-100 text-yellow-800"
                                                }`}>
                                                {row.status === "pending" ? "Pending" :
                                                    row.status === "in_progress" ? "In Progress" :
                                                        "Resolved"}
                                            </span>

                                            {/* Add respond button only for pending or in_progress reports */}
                                            {(row.status === "pending" || row.status === "in_progress") && (
                                                <button
                                                    onClick={() => handleRespond(row)}
                                                    className="ml-2 text-blue-600 hover:text-blue-800 bg-blue-50 rounded-full p-1"
                                                    title="Respond"
                                                >
                                                    <LuBell size={14} />
                                                </button>
                                            )}
                                        </div>
                                    )
                                },
                                {
                                    accessor: "actions",
                                    title: "Actions",
                                    width: 100,
                                    render: (row) => (
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
                            totalRecords={filteredReports.length}
                            recordsPerPage={pageSize}
                            onRecordsPerPageChange={setPageSize}
                            page={page}
                            onPageChange={(p) => setPage(p)}
                            recordsPerPageOptions={PAGE_SIZES}
                            noRecordsText="No reports found"
                        />
                    </div>
                </div>
            )}

            {activeTab === "devices" && (
                <AssignedDevicesTab />
            )}

            {/* Response Modal */}
            <Modal
                isOpen={isRespondModalOpen}
                onClose={() => {
                    setIsRespondModalOpen(false);
                    reset();
                }}
                title="Respond to Report"
                size="lg"
            >
                {selectedReport && (
                    <div>
                        <div className="mb-4 p-4 bg-gray-50 rounded-md">
                            <div className="grid grid-cols-2 gap-4 mb-3">
                                <div>
                                    <p className="text-sm text-gray-500">Reported by</p>
                                    <p className="font-medium">{selectedReport.reportedBy}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Date</p>
                                    <p className="font-medium">{formatDate(selectedReport.date)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Lab</p>
                                    <p className="font-medium">{selectedReport.lab}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Device</p>
                                    <p className="font-medium">{selectedReport.device}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-sm text-gray-500">Problem Type</p>
                                    <p className="font-medium">{selectedReport.problemType}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-sm text-gray-500">Description</p>
                                    <p className="font-medium">{selectedReport.description}</p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit(onSubmitResponse)} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Status
                                </label>
                                <div className="flex space-x-4">
                                    <label className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            value="in_progress"
                                            {...register("status")}
                                            className="text-secondary focus:ring-secondary"
                                            defaultChecked={selectedReport.status === "in_progress"}
                                        />
                                        <span className="ml-2">In Progress</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            value="resolved"
                                            {...register("status")}
                                            className="text-secondary focus:ring-secondary"
                                            defaultChecked={selectedReport.status === "resolved"}
                                        />
                                        <span className="ml-2">Resolved</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            value="not_fixable"
                                            {...register("status")}
                                            className="text-secondary focus:ring-secondary"
                                        />
                                        <span className="ml-2">Not Fixable</span>
                                    </label>
                                </div>
                                {errors.status && (
                                    <p className="mt-1 text-xs text-red-600">{errors.status.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Resolution Details / Comments
                                </label>
                                <textarea
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
                                    rows={4}
                                    placeholder="Provide details on how you addressed the issue or any comments..."
                                    {...register("resolution")}
                                    defaultValue={selectedReport.resolution || ""}
                                />
                                {errors.resolution && (
                                    <p className="mt-1 text-xs text-red-600">{errors.resolution.message}</p>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsRespondModalOpen(false);
                                        reset();
                                    }}
                                    className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-md bg-secondary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-secondary-dark focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
                                >
                                    Submit Response
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </Modal>

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
                                <p className="font-medium">{selectedReport.reportedBy}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Date</p>
                                <p className="font-medium">{formatDate(selectedReport.date)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Lab</p>
                                <p className="font-medium">{selectedReport.lab}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Device</p>
                                <p className="font-medium">{selectedReport.device}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-sm text-gray-500">Problem Type</p>
                                <p className="font-medium">{selectedReport.problemType}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-sm text-gray-500">Description</p>
                                <p className="font-medium">{selectedReport.description}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-sm text-gray-500">Status</p>
                                <p className="font-medium">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${selectedReport.status === "resolved"
                                        ? "bg-green-100 text-green-800"
                                        : selectedReport.status === "in_progress"
                                            ? "bg-blue-100 text-blue-800"
                                            : "bg-yellow-100 text-yellow-800"
                                        }`}>
                                        {selectedReport.status === "pending" ? "Pending" :
                                            selectedReport.status === "in_progress" ? "In Progress" :
                                                "Resolved"}
                                    </span>
                                </p>
                            </div>

                            {selectedReport.resolution && (
                                <div className="col-span-2">
                                    <p className="text-sm text-gray-500">Resolution / Comments</p>
                                    <p className="font-medium">{selectedReport.resolution}</p>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            {(selectedReport.status === "pending" || selectedReport.status === "in_progress") && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsDetailsModalOpen(false);
                                        handleRespond(selectedReport);
                                    }}
                                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    Respond
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={() => handleViewDevice(selectedReport)}
                                className="rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2"
                            >
                                View Device
                            </button>

                            <button
                                type="button"
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