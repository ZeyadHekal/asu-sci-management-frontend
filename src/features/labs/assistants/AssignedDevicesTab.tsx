import { useState, useEffect } from "react";
import { DataTable } from "mantine-datatable";
import { LuSearch, LuHistory, LuInfo } from "react-icons/lu";
import { useNavigate } from "react-router";
import Select from "react-select";
import Modal from "../../../ui/modal/Modal";
import { useDeviceControllerGetMyAssignedDevices } from "../../../generated/hooks/devicesHooks/useDeviceControllerGetMyAssignedDevices";
import type { DeviceListDto } from "../../../generated/types/DeviceListDto";

// Status filter options
const statusOptions = [
    { value: "all", label: "All Devices" },
    { value: "Working", label: "Working" },
    { value: "Has Issues", label: "Has Issues" },
];

const AssignedDevicesTab = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0); // API uses 0-based pagination
    const PAGE_SIZES = [5, 10, 20, 30];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [statusFilter, setStatusFilter] = useState({ value: "all", label: "All Devices" });
    const [selectedDeviceSpecs, setSelectedDeviceSpecs] = useState<string>("");
    const [isSpecsModalOpen, setIsSpecsModalOpen] = useState(false);
    const [selectedDeviceName, setSelectedDeviceName] = useState<string>("");

    // Fetch assigned devices
    const { data: devicesData, isLoading: isLoadingDevices } = useDeviceControllerGetMyAssignedDevices({
        page,
        limit: pageSize,
        sortBy: "created_at",
        sortOrder: "desc",
        deviceName: search || undefined,
        status: statusFilter.value !== "all" ? statusFilter.value : undefined,
    });

    const devices = (devicesData as any)?.data?.items || [];
    const totalDevices = (devicesData as any)?.data?.total || 0;

    // Format date to display
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Invalid date';
            return new Intl.DateTimeFormat('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            }).format(date);
        } catch (error) {
            return 'Invalid date';
        }
    };

    const handleViewDeviceHistory = (deviceId: string) => {
        navigate(`/devices/${deviceId}/history`);
    };

    const handleViewSpecs = (deviceName: string, specs: string) => {
        setSelectedDeviceName(deviceName);
        setSelectedDeviceSpecs(specs);
        setIsSpecsModalOpen(true);
    };

    return (
        <div>
            <div className="mb-6 flex flex-col gap-5 md:flex-row md:items-center">
                <div className="flex flex-col gap-4 md:gap-0 md:flex-row md:items-center justify-between w-full">
                    <h2 className="text-2xl font-semibold text-secondary">My Assigned Devices</h2>

                    <div className="flex flex-col gap-3 md:flex-row md:items-center">
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
                                placeholder="Search devices"
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
                    records={devices}
                    fetching={isLoadingDevices}
                    columns={[
                        {
                            accessor: "name",
                            title: "Device Name",
                            sortable: true,
                            render: (row: DeviceListDto) => (
                                <span className="text-secondary">{row.name}</span>
                            ),
                        },
                        {
                            accessor: "labName",
                            title: "Lab",
                            sortable: true,
                            render: (row: DeviceListDto) => (
                                <span>{row.labName}</span>
                            ),
                        },
                        {
                            accessor: "specDetails",
                            title: "Device Specs",
                            render: (row: DeviceListDto) => {
                                const specsText = row.specDetails?.map(spec => `${spec.category}: ${spec.value}`).join(', ') || 'No specs available';
                                return (
                                    <div className="flex items-center">
                                        <div className="max-w-[150px] truncate mr-2">
                                            {specsText.split(', ').slice(0, 2).join(', ')}...
                                        </div>
                                        <button
                                            onClick={() => handleViewSpecs(row.name, specsText)}
                                            className="text-gray-500 hover:text-secondary"
                                            title="View full specifications"
                                        >
                                            <LuInfo size={16} />
                                        </button>
                                    </div>
                                );
                            }
                        },
                        {
                            accessor: "addedSince",
                            title: "Added Since",
                            sortable: true,
                            render: (row: DeviceListDto) => (
                                <span>{formatDate(row.addedSince.toString())}</span>
                            )
                        },
                        {
                            accessor: "status",
                            title: "Status",
                            sortable: true,
                            render: (row: DeviceListDto) => (
                                <div
                                    className={`w-32 h-[22px] flex justify-center items-center rounded text-xs font-semibold ${row.status === "Working"
                                        ? "border border-success text-success"
                                        : "border border-danger text-danger"
                                        }`}
                                >
                                    {row.status}
                                </div>
                            ),
                        },
                        {
                            accessor: "actions",
                            title: "Actions",
                            render: (row: DeviceListDto) => (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleViewDeviceHistory(row.id)}
                                        className="hover:text-secondary transition-colors"
                                        title="View device history"
                                    >
                                        <LuHistory size={20} className="text-[#0E1726]" />
                                    </button>
                                </div>
                            ),
                        },
                    ]}
                    totalRecords={totalDevices}
                    recordsPerPage={pageSize}
                    onRecordsPerPageChange={setPageSize}
                    page={totalDevices > 0 ? page + 1 : 1} // Only show proper page when there are records
                    onPageChange={(p) => setPage(p - 1)} // Convert back to 0-based for API
                    recordsPerPageOptions={totalDevices > pageSize ? PAGE_SIZES : []}
                    noRecordsText="No devices found"
                />
            </div>

            {/* Device Specifications Modal */}
            <Modal
                isOpen={isSpecsModalOpen}
                onClose={() => setIsSpecsModalOpen(false)}
                title={`${selectedDeviceName} - Specifications`}
                size="md"
            >
                <div className="p-4">
                    <ul className="list-disc pl-5 space-y-2">
                        {selectedDeviceSpecs.split(', ').map((spec, index) => (
                            <li key={index} className="text-gray-700">{spec}</li>
                        ))}
                    </ul>
                </div>
            </Modal>
        </div>
    );
};

export default AssignedDevicesTab; 