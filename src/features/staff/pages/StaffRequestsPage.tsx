import { useState } from "react";
import { DataTable } from "mantine-datatable";
import { LuSearch } from "react-icons/lu";
import { FaCheck, FaTimes } from "react-icons/fa";
import { PiUsers } from "react-icons/pi";
import DeleteConfirmationModal from "../../../ui/modal/DeleteConfirmationModal";
import Modal from "../../../ui/modal/Modal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Select from "react-select";
import { useNavigate } from "react-router";
import { useStaffRequestControllerFindAll } from "../../../generated/hooks/staff-requestsHooks/useStaffRequestControllerFindAll";
import { useStaffRequestControllerFindPending } from "../../../generated/hooks/staff-requestsHooks/useStaffRequestControllerFindPending";
import { useStaffRequestControllerApprove } from "../../../generated/hooks/staff-requestsHooks/useStaffRequestControllerApprove";
import { useStaffRequestControllerReject } from "../../../generated/hooks/staff-requestsHooks/useStaffRequestControllerReject";
import { toast } from "react-hot-toast";
import { StaffRequestDto } from "../../../generated";

interface UserType {
    id: string;
    name: string;
    description: string;
    privileges: string[];
}

// Mock user types - TODO: Replace with API call when available
const mockUserTypes: UserType[] = [
    {
        id: "1",
        name: "Faculty",
        description: "Teaching staff with course management privileges",
        privileges: ["TEACH_COURSE", "ASSIST_IN_COURSE"],
    },
    {
        id: "2",
        name: "Staff",
        description: "Administrative and support staff",
        privileges: ["LAB_MAINTENANCE"],
    },
];

const approveSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    title: z.string().min(1, "Title is required"),
    department: z.string().min(1, "Department is required"),
    userType: z.string().min(1, "User type is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

const rejectSchema = z.object({
    reason: z.string().min(1, "Rejection reason is required"),
});

type ApproveFormValues = z.infer<typeof approveSchema>;
type RejectFormValues = z.infer<typeof rejectSchema>;

const StaffRequestsPage = () => {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
    const [selectedRequest, setSelectedRequest] = useState<StaffRequestDto | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

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
              request.email.toLowerCase().includes(search.toLowerCase()) ||
              request.department.toLowerCase().includes(search.toLowerCase())
            : true;
    }) || [];

    const handleApprove = (request: StaffRequestDto) => {
        setSelectedRequest(request);
        setApproveValue("name", request.name);
        setApproveValue("email", request.email);
        setApproveValue("title", request.title);
        setApproveValue("department", request.department);
        setIsApproveModalOpen(true);
    };

    const handleReject = (request: StaffRequestDto) => {
        setSelectedRequest(request);
        setIsRejectModalOpen(true);
    };

    const onApproveSubmit = async (data: ApproveFormValues) => {
        if (!selectedRequest) return;

        try {
            await approveMutation.mutateAsync({
                id: selectedRequest.id,
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
            });
            toast.success("Request rejected successfully");
            setIsRejectModalOpen(false);
            resetReject();
        } catch (error) {
            console.error("Error rejecting request:", error);
            toast.error("Failed to reject request");
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
                        onClick={() => setActiveTab("pending")}
                    >
                        Pending Requests
                    </button>
                    <button
                        className={`px-4 py-2 text-sm font-medium ${activeTab === "history"
                            ? "text-secondary border-b-2 border-secondary"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                        onClick={() => setActiveTab("history")}
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
                    columns={[
                        {
                            accessor: "name",
                            title: "Name",
                            sortable: true,
                        },
                        {
                            accessor: "email",
                            title: "Email",
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
                            render: ({ createdAt }: StaffRequestDto) => new Date(createdAt).toLocaleDateString(),
                        },
                        {
                            accessor: "actions",
                            title: "Actions",
                            render: (request: StaffRequestDto) => (
                                <div className="flex items-center gap-2">
                                    {request.status === "PENDING" && (
                                        <>
                                            <button
                                                onClick={() => handleApprove(request)}
                                                className="btn btn-sm btn-success"
                                            >
                                                <FaCheck className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleReject(request)}
                                                className="btn btn-sm btn-danger"
                                            >
                                                <FaTimes className="h-4 w-4" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            ),
                        },
                    ]}
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

            {/* Approve Modal */}
            <Modal
                isOpen={isApproveModalOpen}
                onClose={() => {
                    setIsApproveModalOpen(false);
                    resetApprove();
                }}
                title="Approve Staff Request"
            >
                <form onSubmit={handleApproveSubmit(onApproveSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                            {...registerApprove("name")}
                        />
                        {approveErrors.name && (
                            <p className="mt-1 text-sm text-red-600">{approveErrors.name.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                            {...registerApprove("email")}
                        />
                        {approveErrors.email && (
                            <p className="mt-1 text-sm text-red-600">{approveErrors.email.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Title</label>
                        <input
                            type="text"
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                            {...registerApprove("title")}
                        />
                        {approveErrors.title && (
                            <p className="mt-1 text-sm text-red-600">{approveErrors.title.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Department</label>
                        <input
                            type="text"
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                            {...registerApprove("department")}
                        />
                        {approveErrors.department && (
                            <p className="mt-1 text-sm text-red-600">
                                {approveErrors.department.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">User Type</label>
                        <Select
                            options={mockUserTypes.map((type) => ({
                                value: type.id,
                                label: type.name,
                            }))}
                            onChange={(option) => {
                                if (option) {
                                    setApproveValue("userType", option.value);
                                }
                            }}
                            className="mt-1"
                        />
                        {approveErrors.userType && (
                            <p className="mt-1 text-sm text-red-600">
                                {approveErrors.userType.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                            {...registerApprove("password")}
                        />
                        {approveErrors.password && (
                            <p className="mt-1 text-sm text-red-600">
                                {approveErrors.password.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                            {...registerApprove("confirmPassword")}
                        />
                        {approveErrors.confirmPassword && (
                            <p className="mt-1 text-sm text-red-600">
                                {approveErrors.confirmPassword.message}
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
                            className="btn btn-outline-danger"
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