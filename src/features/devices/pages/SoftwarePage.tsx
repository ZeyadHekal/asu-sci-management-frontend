import { DataTable } from "mantine-datatable";
import { useEffect, useState } from "react";
import { LuSearch, LuArrowLeft } from "react-icons/lu";
import { FaRegEdit } from "react-icons/fa";
import { RiDeleteBinLine } from "react-icons/ri";
import { Link } from "react-router";
import SoftwareDetailsModal from "../components/SoftwareDetailsModal";
import DeleteConfirmationModal from "../../../ui/modal/DeleteConfirmationModal";
import { toast } from "react-hot-toast";
import { useSoftwareControllerGetPaginated } from "../../../generated/hooks/softwaresHooks/useSoftwareControllerGetPaginated";
import { useSoftwareControllerDelete } from "../../../generated/hooks/softwaresHooks/useSoftwareControllerDelete";
import { SoftwareDto } from "../../../generated/types/SoftwareDto";

// Extended interface to include fields that might not be in the API yet
interface ExtendedSoftwareDto extends SoftwareDto {
    addedDate?: string;
    status?: "Active" | "Inactive";
}

const SoftwarePage = () => {
    const [page, setPage] = useState(0); // API uses 0-based pagination
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [isSoftwareModalOpen, setIsSoftwareModalOpen] = useState(false);
    const [selectedSoftware, setSelectedSoftware] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingSoftwareId, setDeletingSoftwareId] = useState<string | null>(null);
    const [deletingSoftwareName, setDeletingSoftwareName] = useState<string>("");

    // State for software data
    const [softwareList, setSoftwareList] = useState<ExtendedSoftwareDto[]>([]);
    const [filteredSoftware, setFilteredSoftware] = useState<ExtendedSoftwareDto[]>([]);
    const [paginatedSoftware, setPaginatedSoftware] = useState<ExtendedSoftwareDto[]>([]);

    // Debounce search to avoid too many API calls
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(0); // Reset to first page when searching
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);

    // Fetch software using the generated hook
    const { 
        data: softwareData, 
        isLoading, 
        error,
        refetch 
    } = useSoftwareControllerGetPaginated({
        page,
        limit: pageSize,
        sortBy: "name",
        sortOrder: "asc"
    });

    // Delete software mutation
    const { mutate: deleteSoftware, isPending: isDeleting } = useSoftwareControllerDelete({
        mutation: {
            onSuccess: () => {
                toast.success("Software deleted successfully");
                refetch();
                setIsDeleteModalOpen(false);
                setDeletingSoftwareId(null);
                setDeletingSoftwareName("");
            },
            onError: (error: any) => {
                toast.error(`Failed to delete software: ${error?.response?.data?.message || "An error occurred"}`);
            }
        }
    });

    // Process the fetched data and create temporary data where API is not fully implemented
    useEffect(() => {
        if (softwareData?.data?.items) {
            const software = Array.isArray(softwareData.data.items) 
                ? softwareData.data.items 
                : [softwareData.data.items];
            
            // Map the API data to include additional fields that might be missing
            const enhancedSoftware: ExtendedSoftwareDto[] = software.map((item: ExtendedSoftwareDto) => ({
                ...item,
                // Add temporary fields if they don't exist in API
                addedDate: "2024-01-15", // Temporary - should come from API
                status: "Active" as const // Temporary - should come from API
            }));
            
            setSoftwareList(enhancedSoftware);
        } else {
            // Use temporary data when API is not available
            const tempSoftware: ExtendedSoftwareDto[] = [
                {
                    id: "temp-1",
                    name: "Visual Studio Code",
                    requiredMemory: "4GB",
                    requiredStorage: "5GB",
                    addedDate: "2023-01-15",
                    status: "Active"
                },
                {
                    id: "temp-2",
                    name: "MySQL",
                    requiredMemory: "2GB",
                    requiredStorage: "1GB",
                    addedDate: "2023-02-10",
                    status: "Active"
                },
                {
                    id: "temp-3",
                    name: "Cisco Packet Tracer",
                    requiredMemory: "8GB",
                    requiredStorage: "2GB",
                    addedDate: "2023-03-05",
                    status: "Active"
                },
                {
                    id: "temp-4",
                    name: "Unity",
                    requiredMemory: "16GB",
                    requiredStorage: "20GB",
                    addedDate: "2023-04-20",
                    status: "Inactive"
                },
                {
                    id: "temp-5",
                    name: "Android Studio",
                    requiredMemory: "8GB",
                    requiredStorage: "10GB",
                    addedDate: "2023-05-12",
                    status: "Active"
                }
            ];
            setSoftwareList(tempSoftware);
        }
    }, [softwareData]);

    // Handle search and filtering
    useEffect(() => {
        if (debouncedSearch) {
            const filtered = softwareList.filter(item =>
                item.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                `${item.requiredMemory} RAM, ${item.requiredStorage} Storage`.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                (item.status && item.status.toLowerCase().includes(debouncedSearch.toLowerCase()))
            );
            setFilteredSoftware(filtered);
        } else {
            setFilteredSoftware(softwareList);
        }
        setPage(0); // Reset to first page when search changes
    }, [debouncedSearch, softwareList]);

    // Handle pagination
    useEffect(() => {
        const from = page * pageSize;
        const to = from + pageSize;
        setPaginatedSoftware(filteredSoftware.slice(from, to));
    }, [page, pageSize, filteredSoftware]);

    const handleEdit = (id: string) => {
        setSelectedSoftware(id);
        setIsSoftwareModalOpen(true);
    };

    const handleDelete = (software: ExtendedSoftwareDto) => {
        setDeletingSoftwareId(software.id);
        setDeletingSoftwareName(software.name);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteSoftware = () => {
        if (deletingSoftwareId) {
            deleteSoftware({
                software_ids: deletingSoftwareId
            });
        }
    };

    const handleCloseSoftwareModal = () => {
        setIsSoftwareModalOpen(false);
        setSelectedSoftware(null);
    };

    const onSoftwareUpdated = () => {
        refetch();
        handleCloseSoftwareModal();
    };

    // Show error state
    if (error) {
        return (
            <div className="panel mt-6">
                <div className="flex flex-col items-center justify-center h-64">
                    <div className="text-red-500 text-lg font-semibold mb-2">Error loading software</div>
                    <div className="text-gray-600 mb-4">{error.message}</div>
                    <button 
                        onClick={() => refetch()}
                        className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary-dark"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="panel mt-6">
            <div className="mb-4.5 flex flex-col gap-5 md:flex-row md:items-center">
                <div className="flex flex-col gap-4 md:gap-0 md:flex-row md:items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                        <Link to="/devices" className="text-secondary hover:text-secondary-dark">
                            <LuArrowLeft size={18} />
                        </Link>
                        <h2 className="text-2xl font-semibold text-secondary">Available Software</h2>
                    </div>
                    <div className="flex flex-col gap-3 md:flex-row">
                        <div className="relative flex items-center flex-1 md:flex-auto">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                <LuSearch size={20} className="text-[#0E1726]" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search software..."
                                className="h-10 pl-10 pr-4 w-[240px] rounded-md border border-[#E0E6ED] text-xs font-medium tracking-wider text-gray-500 outline-none focus:border-secondary transition-colors duration-200"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <button
                            className="self-start h-10 p-3 rounded-lg bg-secondary flex items-center text-white"
                            onClick={() => {
                                setSelectedSoftware(null);
                                setIsSoftwareModalOpen(true);
                            }}
                        >
                            Add New Software
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="datatables">
                <DataTable
                    highlightOnHover
                    withBorder
                    className="table-hover whitespace-nowrap"
                    records={paginatedSoftware}
                    columns={[
                        {
                            accessor: "name",
                            title: "Software Name",
                            render: (row) => (
                                <span className="text-secondary font-medium">{row.name}</span>
                            ),
                        },
                        { 
                            accessor: "requirements", 
                            title: "Requirements",
                            render: (row) => (
                                <span className="text-gray-700">
                                    {row.requiredMemory} RAM, {row.requiredStorage} Storage
                                </span>
                            )
                        },
                        { 
                            accessor: "addedDate", 
                            title: "Added Date",
                            render: (row) => (
                                <span className="text-gray-700">
                                    {row.addedDate || "Unknown"}
                                </span>
                            )
                        },
                        {
                            accessor: "status",
                            title: "Status",
                            render: (row) => (
                                <div
                                    className={`w-32 h-[22px] flex justify-center items-center rounded text-xs font-semibold ${
                                        row.status === "Active"
                                            ? "border border-success text-success"
                                            : "border border-danger text-danger"
                                    }`}
                                >
                                    {row.status || "Active"}
                                </div>
                            ),
                        },
                        {
                            accessor: "actions",
                            title: "Actions",
                            render: (row) => (
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => handleEdit(row.id)}
                                        className="text-gray-500 hover:text-secondary"
                                        title="Edit software"
                                    >
                                        <FaRegEdit size={20} className="text-[#0E1726]" />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(row)}
                                        className="text-gray-500 hover:text-danger"
                                        title="Delete software"
                                        disabled={isDeleting}
                                    >
                                        <RiDeleteBinLine size={20} className="text-[#0E1726]" />
                                    </button>
                                </div>
                            ),
                        },
                    ]}
                    totalRecords={filteredSoftware.length}
                    recordsPerPage={pageSize}
                    onRecordsPerPageChange={(newPageSize) => {
                        setPageSize(newPageSize);
                        setPage(0); // Reset to first page
                    }}
                    page={page + 1} // DataTable uses 1-based pagination for display
                    onPageChange={(newPage) => setPage(newPage - 1)} // Convert back to 0-based
                    recordsPerPageOptions={PAGE_SIZES}
                    fetching={isLoading}
                    noRecordsText="No software found"
                    emptyState={
                        !isLoading && paginatedSoftware.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="text-gray-500 text-lg font-medium">No software found</div>
                                <div className="text-gray-400 text-sm mt-1">
                                    {search ? 'Try adjusting your search' : 'Add your first software to get started'}
                                </div>
                                {!search && (
                                    <button
                                        onClick={() => setIsSoftwareModalOpen(true)}
                                        className="mt-4 px-4 py-2 bg-secondary text-white rounded-md text-sm"
                                    >
                                        Add Software
                                    </button>
                                )}
                            </div>
                        ) : undefined
                    }
                />
            </div>

            <SoftwareDetailsModal
                isOpen={isSoftwareModalOpen}
                onClose={handleCloseSoftwareModal}
                softwareId={selectedSoftware}
                onSoftwareUpdated={onSoftwareUpdated}
            />

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDeleteSoftware}
                title="Delete Software"
                message={`Are you sure you want to delete "${deletingSoftwareName}"? This action cannot be undone.`}
            />
        </div>
    );
};

export default SoftwarePage; 