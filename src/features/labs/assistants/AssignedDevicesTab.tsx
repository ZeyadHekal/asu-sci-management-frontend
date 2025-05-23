import { useState, useEffect } from "react";
import { DataTable } from "mantine-datatable";
import { LuSearch, LuHistory, LuInfo } from "react-icons/lu";
import { useNavigate } from "react-router";
import Select from "react-select";
import Modal from "../../../ui/modal/Modal";

// Mock data for devices assigned to the lab assistant
const mockAssignedDevices = [
    {
        id: 1,
        deviceName: "Dell PC 01",
        lab: "Lab B2-215",
        labId: 1,
        deviceSpecs: "DDR4 RAM 8GB, HDD 1TB 7200RPM, Intel Core i5-9400 2.9GHz",
        status: "Available",
        lastUpdate: "2024-03-01",
        needsMaintenance: false
    },
    {
        id: 2,
        deviceName: "Dell PC 02",
        lab: "Lab B2-215",
        labId: 1,
        deviceSpecs: "DDR4 RAM 16GB, SSD 512GB, Intel Core i5-10500 3.1GHz",
        status: "Needs Maintenance",
        lastUpdate: "2024-01-15",
        needsMaintenance: true
    },
    {
        id: 3,
        deviceName: "Dell PC 03",
        lab: "Lab B2-215",
        labId: 1,
        deviceSpecs: "DDR4 RAM 32GB, SSD 1TB, Intel Core i7-11700 2.5GHz",
        status: "Available",
        lastUpdate: "2024-02-10",
        needsMaintenance: false
    },
    {
        id: 5,
        deviceName: "Dell PC 05",
        lab: "Lab B2-216",
        labId: 2,
        deviceSpecs: "DDR4 RAM 16GB, SSD 512GB, Intel Core i7-10700 2.9GHz",
        status: "Available",
        lastUpdate: "2024-02-15",
        needsMaintenance: false
    },
    {
        id: 6,
        deviceName: "Dell PC 06",
        lab: "Lab B2-216",
        labId: 2,
        deviceSpecs: "DDR4 RAM 8GB, HDD 1TB 7200RPM, Intel Core i5-9400 2.9GHz",
        status: "Needs Maintenance",
        lastUpdate: "2024-01-20",
        needsMaintenance: true
    },
];

// Status filter options
const statusOptions = [
    { value: "all", label: "All Devices" },
    { value: "Available", label: "Available" },
    { value: "Needs Maintenance", label: "Needs Maintenance" },
];

// Mock data for assigned labs
const assignedLabs = [
    { value: 1, label: "Lab B2-215" },
    { value: 2, label: "Lab B2-216" },
];

const AssignedDevicesTab = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [5, 10, 20, 30];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [devices, setDevices] = useState(mockAssignedDevices);
    const [filteredDevices, setFilteredDevices] = useState(mockAssignedDevices);
    const [paginatedDevices, setPaginatedDevices] = useState<typeof mockAssignedDevices>([]);
    const [statusFilter, setStatusFilter] = useState({ value: "all", label: "All Devices" });
    const [labFilter, setLabFilter] = useState<{ value: number; label: string } | null>(null);
    const [selectedDeviceSpecs, setSelectedDeviceSpecs] = useState<string>("");
    const [isSpecsModalOpen, setIsSpecsModalOpen] = useState(false);
    const [selectedDeviceName, setSelectedDeviceName] = useState<string>("");

    // Handle search and filters
    useEffect(() => {
        let filtered = [...devices];

        // Apply lab filter
        if (labFilter) {
            filtered = filtered.filter(device => device.labId === labFilter.value);
        }

        // Apply status filter
        if (statusFilter.value !== "all") {
            filtered = filtered.filter(device => device.status === statusFilter.value);
        }

        // Apply search
        if (search) {
            filtered = filtered.filter(device =>
                device.deviceName.toLowerCase().includes(search.toLowerCase()) ||
                device.deviceSpecs.toLowerCase().includes(search.toLowerCase()) ||
                device.lab.toLowerCase().includes(search.toLowerCase())
            );
        }

        setFilteredDevices(filtered);
        setPage(1);
    }, [search, devices, statusFilter, labFilter]);

    // Handle pagination
    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        setPaginatedDevices(filteredDevices.slice(from, to));
    }, [page, pageSize, filteredDevices]);

    // Format date to display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        }).format(date);
    };

    const handleViewDeviceHistory = (deviceId: number) => {
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
                    records={paginatedDevices}
                    columns={[
                        {
                            accessor: "deviceName",
                            title: "Device Name",
                            sortable: true,
                            render: (row) => (
                                <span className="text-secondary">{row.deviceName}</span>
                            ),
                        },
                        {
                            accessor: "lab",
                            title: "Lab",
                            sortable: true,
                        },
                        {
                            accessor: "deviceSpecs",
                            title: "Device Specs",
                            render: (row) => (
                                <div className="flex items-center">
                                    <div className="max-w-[150px] truncate mr-2">
                                        {row.deviceSpecs.split(', ').slice(0, 2).join(', ')}...
                                    </div>
                                    <button
                                        onClick={() => handleViewSpecs(row.deviceName, row.deviceSpecs)}
                                        className="text-gray-500 hover:text-secondary"
                                        title="View full specifications"
                                    >
                                        <LuInfo size={16} />
                                    </button>
                                </div>
                            )
                        },
                        {
                            accessor: "lastUpdate",
                            title: "Last Update",
                            sortable: true,
                            render: (row) => (
                                <span>{formatDate(row.lastUpdate)}</span>
                            )
                        },
                        {
                            accessor: "status",
                            title: "Status",
                            sortable: true,
                            render: (row) => (
                                <div
                                    className={`w-32 h-[22px] flex justify-center items-center rounded text-xs font-semibold ${row.status === "Available"
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
                            render: (row) => (
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
                    totalRecords={filteredDevices.length}
                    recordsPerPage={pageSize}
                    onRecordsPerPageChange={setPageSize}
                    page={page}
                    onPageChange={(p) => setPage(p)}
                    recordsPerPageOptions={PAGE_SIZES}
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