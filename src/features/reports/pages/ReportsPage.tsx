import { useState, useEffect, useMemo } from "react";
import { DataTable } from "mantine-datatable";
import { LuSearch, LuHistory } from "react-icons/lu";
import { FiAlertTriangle } from "react-icons/fi";
import { useNavigate } from "react-router";
import Modal from "../../../ui/modal/Modal";
import { UpdateHistoryModal } from "../../devices/components";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Select from "react-select";
import { toast } from "react-hot-toast";
import { useDeviceReportControllerGetMyReports } from "../../../generated/hooks/device-reportsHooks/useDeviceReportControllerGetMyReports";
import { useDeviceReportControllerCreate } from "../../../generated/hooks/device-reportsHooks/useDeviceReportControllerCreate";
import { useDeviceControllerGetAll } from "../../../generated/hooks/devicesHooks/useDeviceControllerGetAll";
import { useLabControllerGetAll } from "../../../generated/hooks/labsHooks/useLabControllerGetAll";
import { DeviceReportDto } from "../../../generated/types/DeviceReportDto";
import { DeviceReportListDto } from "../../../generated/types/DeviceReportListDto";
import { getReportStatusBadge, getReportStatusLabel } from "../../../global/constants/reportStatus";

// Type for paginated response structure
interface DeviceReportPaginatedResponse {
    items: DeviceReportListDto[];
    total: number;
}

// Form schema for report
const reportSchema = z.object({
    labId: z.object({
        value: z.string(),
        label: z.string()
    }, { required_error: "Please select a lab" }),
    deviceId: z.object({
        value: z.string(),
        label: z.string()
    }, { required_error: "Please select a device" }),
    problemType: z.object({
        value: z.string(),
        label: z.string()
    }, { required_error: "Please select a problem type" }),
    description: z.string().min(1, "Description is required"),
});

type ReportFormData = z.infer<typeof reportSchema>;

const problemTypeOptions = [
    { value: "hardware", label: "Hardware Issue" },
    { value: "software", label: "Software Issue" },
    { value: "network", label: "Network Issue" },
    { value: "peripheral", label: "Peripheral Issue" },
    { value: "other", label: "Other" }
];

const ReportsPage = () => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [5, 10, 20, 30];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [filteredReports, setFilteredReports] = useState<DeviceReportListDto[]>([]);
    const [paginatedReports, setPaginatedReports] = useState<DeviceReportListDto[]>([]);
    
    // State for UpdateHistoryModal
    const [selectedReportForHistory, setSelectedReportForHistory] = useState<DeviceReportListDto | null>(null);
    const [isUpdateHistoryModalOpen, setIsUpdateHistoryModalOpen] = useState(false);

    // Fetch user's reports
    const { data: reportsData, isLoading: reportsLoading, refetch } = useDeviceReportControllerGetMyReports();
    
    // Note: API returns paginated response with { items: [], total: number } structure
    
    // Fetch devices and labs for form options
    const { data: devicesData } = useDeviceControllerGetAll();
    const { data: labsData } = useLabControllerGetAll();

    // Create device report mutation
    const { mutate: createReport, isPending: isCreating } = useDeviceReportControllerCreate({
        mutation: {
            onSuccess: () => {
                toast.success("Report submitted successfully");
                setIsModalOpen(false);
                reset();
                refetch();
            },
            onError: (error: any) => {
                toast.error(`Failed to submit report: ${error?.response?.data?.message || "An error occurred"}`);
            }
        }
    });

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors }
    } = useForm<ReportFormData>({
        resolver: zodResolver(reportSchema),
        defaultValues: {
            description: ""
        }
    });

    const selectedLab = watch("labId");
    const selectedDevice = watch("deviceId");
    const selectedProblemType = watch("problemType");

    // Memoize reports data to prevent infinite re-renders
    const reports = useMemo(() => {
        // Handle pagination response structure: { items: [], total: number }
        // The API actually returns a paginated response despite the generated type suggesting an array
        const data = reportsData?.data as unknown as DeviceReportPaginatedResponse;
        return data?.items || [];
    }, [reportsData?.data]);

    // Memoize lab options
    const labOptions = useMemo(() => {
        return labsData?.data 
            ? (Array.isArray(labsData.data) ? labsData.data : [labsData.data]).map(lab => ({ 
                value: lab.id, 
                label: lab.name 
            }))
            : [];
    }, [labsData?.data]);

    // Memoize device options filtered by selected lab
    const deviceOptions = useMemo(() => {
        return devicesData?.data 
            ? (Array.isArray(devicesData.data) ? devicesData.data : [devicesData.data])
                .filter(device => !selectedLab || device.labId === selectedLab.value)
                .map(device => ({ 
                    value: device.id, 
                    label: `${device.name}` 
                }))
            : [];
    }, [devicesData?.data, selectedLab]);

    // Debounce search to avoid too many filter operations
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1); // Reset to first page when searching
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    // Handle search filtering
    useEffect(() => {
        if (debouncedSearch) {
            const filtered = reports.filter(report =>
                (report.deviceName && report.deviceName.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
                (report.softwareName && report.softwareName.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
                report.description.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                report.status.toLowerCase().includes(debouncedSearch.toLowerCase())
            );
            setFilteredReports(filtered);
        } else {
            setFilteredReports(reports);
        }
    }, [debouncedSearch, reports]);

    // Handle pagination
    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        setPaginatedReports(filteredReports.slice(from, to));
    }, [page, pageSize, filteredReports]);

    const onSubmit = (data: ReportFormData) => {
        const reportData: any = {
            deviceId: data.deviceId.value,
            description: data.description,
            status: "REPORTED" as const
        };

        // Note: appId is now optional in the backend
        // In the future, we can add software selection for software-related issues

        createReport({
            data: reportData
        });
    };

    // Handler for viewing update history
    const handleViewUpdateHistory = (report: DeviceReportListDto) => {
        setSelectedReportForHistory(report);
        setIsUpdateHistoryModalOpen(true);
    };

    return (
        <div className="panel mt-6">
            <div className="mb-4.5 flex flex-col gap-5 md:flex-row md:items-center">
                <div className="flex flex-col gap-4 md:gap-0 md:flex-row md:items-center justify-between w-full">
                    <h2 className="text-2xl font-semibold text-secondary">Device Reports</h2>
                    <div className="flex flex-col gap-3 md:flex-row">
                        <div className="relative flex items-center flex-1 md:flex-auto">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                <LuSearch size={20} className="text-[#0E1726]" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search reports"
                                className="h-10 pl-10 pr-4 w-[240px] rounded-md border border-[#E0E6ED] text-xs font-medium tracking-wider text-gray-500 outline-none focus:border-secondary transition-colors duration-200"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <button
                            className="self-start h-10 px-4 rounded-lg bg-secondary flex items-center text-white"
                            onClick={() => setIsModalOpen(true)}
                        >
                            <FiAlertTriangle size={20} className="mr-2" />
                            Report Issue
                        </button>
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
                            accessor: "created_at",
                            title: "Date",
                            render: (row) => new Date(row.created_at).toLocaleDateString()
                        },
                        {
                            accessor: "deviceName",
                            title: "Device",
                            render: (row) => row.deviceName || "Unknown Device"
                        },
                        {
                            accessor: "softwareName",
                            title: "Software",
                            render: (row) => row.softwareName || "General"
                        },
                        {
                            accessor: "description",
                            title: "Description",
                            render: (row) => (
                                <div className="max-w-xs truncate" title={row.description}>
                                    {row.description}
                                </div>
                            )
                        },
                        {
                            accessor: "status",
                            title: "Status",
                            render: (row) => (
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getReportStatusBadge(row.status)}`}>
                                    {getReportStatusLabel(row.status)}
                                </span>
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
                                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                                        title="View resolution updates"
                                    >
                                        <LuHistory size={16} />
                                    </button>
                                </div>
                            )
                        }
                    ]}
                    totalRecords={filteredReports.length}
                    recordsPerPage={pageSize}
                    page={page}
                    onPageChange={setPage}
                    recordsPerPageOptions={PAGE_SIZES}
                    onRecordsPerPageChange={setPageSize}
                    fetching={reportsLoading}
                    noRecordsText="No reports found"
                />
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    reset();
                }}
                title="Report Device Issue"
                size="lg"
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Lab
                        </label>
                        <Select
                            options={labOptions}
                            value={selectedLab}
                            onChange={(option) => {
                                if (option) {
                                    setValue("labId", option);
                                    if (watch("deviceId")) {
                                        setValue("deviceId", undefined as any);
                                    }
                                }
                            }}
                            placeholder="Select a lab"
                            className="basic-single"
                            classNamePrefix="select"
                        />
                        {errors.labId && (
                            <p className="mt-1 text-xs text-red-600">{errors.labId.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Device
                        </label>
                        <Select
                            options={deviceOptions}
                            onChange={(option) => {
                                if (option) {
                                    setValue("deviceId", option);
                                }
                            }}
                            placeholder="Select a device"
                            className="basic-single"
                            classNamePrefix="select"
                            isDisabled={!selectedLab}
                        />
                        {errors.deviceId && (
                            <p className="mt-1 text-xs text-red-600">{errors.deviceId.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Problem Type
                        </label>
                        <Select
                            options={problemTypeOptions}
                            onChange={(option) => {
                                if (option) {
                                    setValue("problemType", option);
                                }
                            }}
                            placeholder="Select problem type"
                            className="basic-single"
                            classNamePrefix="select"
                        />
                        {errors.problemType && (
                            <p className="mt-1 text-xs text-red-600">{errors.problemType.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
                            rows={4}
                            placeholder="Describe the issue in detail"
                            {...register("description")}
                        />
                        {errors.description && (
                            <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={() => {
                                setIsModalOpen(false);
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
                            Submit Report
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Update History Modal */}
            <UpdateHistoryModal
                isOpen={isUpdateHistoryModalOpen}
                onClose={() => {
                    setIsUpdateHistoryModalOpen(false);
                    setSelectedReportForHistory(null);
                }}
                updates={selectedReportForHistory?.resolutionUpdates?.map(update => ({
                    id: parseInt(update.id),
                    date: new Date(update.created_at.toString()).toISOString(),
                    status: update.status === 'COMPLETED' ? 'Resolved' : 
                           update.status === 'IN_PROGRESS' ? 'In Progress' : 
                           update.status === 'FAILED' ? 'Failed' : 
                           update.status === 'CANCELLED' ? 'Cancelled' : update.status,
                    issue: update.description,
                    resolution: update.resolutionNotes || undefined,
                    involvedPersonnel: update.involvedPersonnel || []
                })) || []}
                reportDescription={selectedReportForHistory?.description || ""}
                reportDate={selectedReportForHistory?.created_at ? new Date(selectedReportForHistory.created_at).toLocaleDateString() : ""}
            />
        </div>
    );
};

export default ReportsPage; 