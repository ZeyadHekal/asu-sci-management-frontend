import { useState, useEffect } from "react";
import { DataTable } from "mantine-datatable";
import { LuSearch, LuEye, LuTrash, LuCheck, LuX, LuImage } from "react-icons/lu";
import { FaCheck, FaTimes, FaEye } from "react-icons/fa";
import { PiUsers } from "react-icons/pi";
import DeleteConfirmationModal from "../../../ui/modal/DeleteConfirmationModal";
import Modal from "../../../ui/modal/Modal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Select from "react-select";
import { useNavigate, useSearchParams } from "react-router";
import { useStaffRequestControllerFindAll } from "../../../generated/hooks/staff-requestsHooks/useStaffRequestControllerFindAll";
import { useStaffRequestControllerFindPending } from "../../../generated/hooks/staff-requestsHooks/useStaffRequestControllerFindPending";
import { useStaffRequestControllerApprove } from "../../../generated/hooks/staff-requestsHooks/useStaffRequestControllerApprove";
import { useStaffRequestControllerReject } from "../../../generated/hooks/staff-requestsHooks/useStaffRequestControllerReject";
import { useUserTypeControllerFindAllForStaffAssignment } from "../../../generated/hooks/user-typesHooks/useUserTypeControllerFindAllForStaffAssignment";
import { toast } from "react-hot-toast";
import { StaffRequestDto } from "../../../generated";

// Strong password validation
const strongPasswordSchema = z.string()
    .min(8, "Password must be at least 8 characters long")
    .max(128, "Password must not exceed 128 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character");

const approveSchema = z.object({
    name: z.string().min(1, "Name is required"),
    username: z.string().min(1, "Username is required"),
    title: z.string().min(1, "Title is required"),
    department: z.string().min(1, "Department is required"),
    userType: z.string().min(1, "User type is required"),
});

const rejectSchema = z.object({
    reason: z.string().min(1, "Rejection reason is required"),
});

type ApproveFormValues = z.infer<typeof approveSchema>;
type RejectFormValues = z.infer<typeof rejectSchema>;

interface SelectOption {
    value: string;
    label: string;
}

const StaffRequestsPage = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
    const [selectedRequest, setSelectedRequest] = useState<StaffRequestDto | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
    const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string>("");

    // Handle tab URL parameters
    useEffect(() => {
        const tabFromUrl = searchParams.get('tab');
        
        if (tabFromUrl && ['pending', 'history'].includes(tabFromUrl)) {
            setActiveTab(tabFromUrl as "pending" | "history");
        } else if (!tabFromUrl) {
            // Set default tab and update URL
            setSearchParams({ tab: 'pending' });
        }
    }, [searchParams, setSearchParams]);

    // Function to handle tab change with URL update
    const handleTabChange = (tabId: "pending" | "history") => {
        setActiveTab(tabId);
        setSearchParams({ tab: tabId });
    };

    // Fetch staff requests based on active tab
    const { data: pendingRequests, isLoading: isPendingLoading } = useStaffRequestControllerFindPending(
        {
            page: page - 1, // API uses 0-based indexing
            limit: pageSize,
        },
        {
            query: {
                enabled: activeTab === "pending",
            },
        }
    );

    const { data: allRequests, isLoading: isAllLoading } = useStaffRequestControllerFindAll(
        {
            page: page - 1, // API uses 0-based indexing
            limit: pageSize,
        },
        {
            query: {
                enabled: activeTab === "history",
            },
        }
    );

    // Fetch user types for the approval modal (excluding Student types)
    const { data: userTypesData, isLoading: isLoadingUserTypes } = useUserTypeControllerFindAllForStaffAssignment();

    // Mutations for approve and reject
    const approveMutation = useStaffRequestControllerApprove();
    const rejectMutation = useStaffRequestControllerReject();

    const {
        register: registerApprove,
        handleSubmit: handleApproveSubmit,
        reset: resetApprove,
        setValue: setApproveValue,
        formState: { errors: approveErrors },
    } = useForm<ApproveFormValues>({
        resolver: zodResolver(approveSchema),
    });

    const {
        register: registerReject,
        handleSubmit: handleRejectSubmit,
        reset: resetReject,
        formState: { errors: rejectErrors },
    } = useForm<RejectFormValues>({
        resolver: zodResolver(rejectSchema),
    });

    const filteredRequests = (activeTab === "pending" 
        ? pendingRequests?.data?.items 
        : allRequests?.data?.items
    )?.filter((request) => {
        return search
            ? request.name.toLowerCase().includes(search.toLowerCase()) ||
              request.username.toLowerCase().includes(search.toLowerCase()) ||
              request.department.toLowerCase().includes(search.toLowerCase())
            : true;
    }) || [];

    const handleApprove = (request: StaffRequestDto) => {
        setSelectedRequest(request);
        setApproveValue("name", request.name);
        setApproveValue("username", request.username);
        setApproveValue("title", request.title);
        setApproveValue("department", request.department);
        setIsApproveModalOpen(true);
    };

    const handleReject = (request: StaffRequestDto) => {
        setSelectedRequest(request);
        setIsRejectModalOpen(true);
    };

    const handleViewPhoto = (photoUrl: string) => {
        setSelectedPhotoUrl(photoUrl);
        setIsPhotoModalOpen(true);
    };

    const onApproveSubmit = async (data: ApproveFormValues) => {
        if (!selectedRequest) return;

        try {
            await approveMutation.mutateAsync({
                id: selectedRequest.id,
                data: {
                    name: data.name,
                    username: data.username,
                    title: data.title,
                    department: data.department,
                    userTypeId: data.userType,
                },
            });
            toast.success("Request approved successfully");
            setIsApproveModalOpen(false);
            resetApprove();
        } catch (error) {
            console.error("Error approving request:", error);
            toast.error("Failed to approve request");
        }
    };

    const onRejectSubmit = async (data: RejectFormValues) => {
        if (!selectedRequest) return;

        try {
            await rejectMutation.mutateAsync({
                id: selectedRequest.id,
                data: {
                    reason: data.reason,
                },
            });
            toast.success("Request rejected successfully");
            setIsRejectModalOpen(false);
            resetReject();
        } catch (error) {
            console.error("Error rejecting request:", error);
            toast.error("Failed to reject request");
        }
    };

    // Format date helper function - handle both string and Date inputs
    const formatDate = (dateInput: string | Date) => {
        try {
            // Handle the case where the date comes as a string from the API
            const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
            if (isNaN(date.getTime())) {
                return "Invalid date";
            }
            // Format as DD/MM/YY
            return date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit'
            });
        } catch (error) {
            return "Invalid date";
        }
    };

    // Get user type name by ID
    const getUserTypeName = (userTypeId: string) => {
        const userType = userTypesData?.data?.find(ut => ut.id === userTypeId);
        return userType?.name || "Unknown";
    };

    // Get description based on status
    const getDescription = (request: StaffRequestDto) => {
        switch (request.status) {
            case "APPROVED":
                return `Approved as ${getUserTypeName(request.userTypeId)}`;
            case "REJECTED":
                return request.rejectionReason || "No reason provided";
            case "PENDING":
                return "-";
            default:
                return "-";
        }
    };

    // User type options for the select dropdown (excluding Student types)
    const userTypeOptions: SelectOption[] = userTypesData?.data?.map((userType) => ({
        value: userType.id,
        label: userType.name,
    })) || [];

    // Define columns based on active tab
    const getColumns = () => {
        const baseColumns = [
            {
                accessor: "name",
                title: "Name",
                sortable: true,
            },
            {
                accessor: "username",
                title: "Username",
                sortable: true,
            },
            {
                accessor: "title",
                title: "Title",
                sortable: true,
            },
            {
                accessor: "department",
                title: "Department",
                sortable: true,
            },
            {
                accessor: "status",
                title: "Status",
                sortable: true,
                render: ({ status }: StaffRequestDto) => (
                    <span
                        className={`badge ${status === "PENDING"
                            ? "bg-warning"
                            : status === "APPROVED"
                                ? "bg-success"
                                : "bg-danger"
                            }`}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
                    </span>
                ),
            },
            {
                accessor: "createdAt",
                title: "Submitted",
                sortable: true,
                render: ({ createdAt }: StaffRequestDto) => formatDate(createdAt),
            },
        ];

        if (activeTab === "pending") {
            return [
                ...baseColumns,
                {
                    accessor: "idPhoto",
                    title: "ID Photo",
                    render: (request: StaffRequestDto) => (
                        <div className="flex items-center justify-center">
                            {request.idPhotoUrl ? (
                                <button
                                    onClick={() => handleViewPhoto(request.idPhotoUrl!)}
                                    className="btn btn-sm btn-outline-primary"
                                    title="View ID Photo"
                                >
                                    <FaEye className="h-4 w-4" />
                                </button>
                            ) : (
                                <span className="text-gray-400">No photo</span>
                            )}
                        </div>
                    ),
                },
                {
                    accessor: "actions",
                    title: "Actions",
                    render: (request: StaffRequestDto) => (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleApprove(request)}
                                className="btn btn-sm btn-success"
                                title="Approve"
                            >
                                <FaCheck className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => handleReject(request)}
                                className="btn btn-sm btn-danger"
                                title="Reject"
                            >
                                <FaTimes className="h-4 w-4" />
                            </button>
                        </div>
                    ),
                },
            ];
        } else {
            return [
                ...baseColumns,
                {
                    accessor: "updatedAt",
                    title: "Updated At",
                    sortable: true,
                    render: ({ updatedAt }: StaffRequestDto) => formatDate(updatedAt),
                },
                {
                    accessor: "description",
                    title: "Description",
                    render: (request: StaffRequestDto) => (
                        <span className="text-sm">
                            {getDescription(request)}
                        </span>
                    ),
                },
            ];
        }
    };

    return (
        <div className="panel mt-6">
            <div className="mb-4.5 flex flex-col gap-5 md:flex-row md:items-center">
                <div className="flex flex-col gap-4 md:gap-0 md:flex-row md:items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-semibold text-secondary">Staff Requests</h2>
                    </div>
                    <div className="flex flex-col gap-3 md:flex-row">
                        <div className="relative flex items-center flex-1 md:flex-auto">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                <LuSearch size={20} className="text-[#0E1726]" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search requests..."
                                className="h-10 pl-10 pr-4 w-[240px] rounded-md border border-[#E0E6ED] text-xs font-medium tracking-wider text-gray-500 outline-none focus:border-secondary transition-colors duration-200"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-6">
                <div className="flex border-b border-gray-200">
                    <button
                        className={`px-4 py-2 text-sm font-medium ${activeTab === "pending"
                            ? "text-secondary border-b-2 border-secondary"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                        onClick={() => handleTabChange("pending")}
                    >
                        Pending Requests
                    </button>
                    <button
                        className={`px-4 py-2 text-sm font-medium ${activeTab === "history"
                            ? "text-secondary border-b-2 border-secondary"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                        onClick={() => handleTabChange("history")}
                    >
                        History
                    </button>
                </div>
            </div>

            <div className="datatables">
                <DataTable
                    highlightOnHover
                    withBorder
                    className="table-hover whitespace-nowrap"
                    records={filteredRequests}
                    fetching={isPendingLoading || isAllLoading}
                    columns={getColumns()}
                    totalRecords={
                        activeTab === "pending"
                            ? pendingRequests?.data?.total || 0
                            : allRequests?.data?.total || 0
                    }
                    recordsPerPage={pageSize}
                    page={page}
                    onPageChange={(p) => setPage(p)}
                    recordsPerPageOptions={PAGE_SIZES}
                    onRecordsPerPageChange={setPageSize}
                />
            </div>

            {/* Photo Modal */}
            <Modal
                isOpen={isPhotoModalOpen}
                onClose={() => {
                    setIsPhotoModalOpen(false);
                    setSelectedPhotoUrl("");
                }}
                title="ID Photo"
                size="md"
            >
                <div className="flex justify-center">
                    {selectedPhotoUrl ? (
                        <img
                            src={selectedPhotoUrl}
                            alt="ID Photo"
                            className="max-w-full max-h-96 object-contain rounded-lg"
                        />
                    ) : (
                        <p className="text-gray-500">No photo available</p>
                    )}
                </div>
            </Modal>

            {/* Approve Modal */}
            <Modal
                isOpen={isApproveModalOpen}
                onClose={() => {
                    setIsApproveModalOpen(false);
                    resetApprove();
                }}
                title="Review and Approve Staff Request"
            >
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-700">
                        <strong>Note:</strong> You can edit the fields below before approving the request. 
                        The user's original password will be used for their account.
                    </p>
                </div>
                
                <form onSubmit={handleApproveSubmit(onApproveSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                            {...registerApprove("name")}
                            placeholder="Enter staff member name"
                        />
                        {approveErrors.name && (
                            <p className="mt-1 text-sm text-red-600">{approveErrors.name.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Username</label>
                        <input
                            type="text"
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                            {...registerApprove("username")}
                            placeholder="Enter username"
                        />
                        {approveErrors.username && (
                            <p className="mt-1 text-sm text-red-600">{approveErrors.username.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Title</label>
                        <input
                            type="text"
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                            {...registerApprove("title")}
                            placeholder="Enter job title"
                        />
                        {approveErrors.title && (
                            <p className="mt-1 text-sm text-red-600">{approveErrors.title.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Department</label>
                        <input
                            type="text"
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                            {...registerApprove("department")}
                            placeholder="Enter department"
                        />
                        {approveErrors.department && (
                            <p className="mt-1 text-sm text-red-600">
                                {approveErrors.department.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">User Type</label>
                        <Select<SelectOption>
                            options={userTypeOptions}
                            onChange={(option: SelectOption | null) => {
                                if (option) {
                                    setApproveValue("userType", option.value);
                                }
                            }}
                            className="mt-1"
                            placeholder="Select user type..."
                            isLoading={isLoadingUserTypes}
                        />
                        {approveErrors.userType && (
                            <p className="mt-1 text-sm text-red-600">
                                {approveErrors.userType.message}
                            </p>
                        )}
                    </div>

                    <div className="mt-4 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setIsApproveModalOpen(false);
                                resetApprove();
                            }}
                            className="btn btn-outline-danger"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={approveMutation.isPending}
                            className="btn btn-primary"
                        >
                            {approveMutation.isPending ? "Approving..." : "Approve"}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Reject Modal */}
            <Modal
                isOpen={isRejectModalOpen}
                onClose={() => {
                    setIsRejectModalOpen(false);
                    resetReject();
                }}
                title="Reject Staff Request"
            >
                <form onSubmit={handleRejectSubmit(onRejectSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Rejection Reason
                        </label>
                        <textarea
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                            rows={4}
                            placeholder="Please provide a reason for rejection..."
                            {...registerReject("reason")}
                        />
                        {rejectErrors.reason && (
                            <p className="mt-1 text-sm text-red-600">{rejectErrors.reason.message}</p>
                        )}
                    </div>

                    <div className="mt-4 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setIsRejectModalOpen(false);
                                resetReject();
                            }}
                            className="btn btn-outline-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={rejectMutation.isPending}
                            className="btn btn-danger"
                        >
                            {rejectMutation.isPending ? "Rejecting..." : "Reject"}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default StaffRequestsPage; 