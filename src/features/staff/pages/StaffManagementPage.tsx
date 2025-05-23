import { useState, useEffect } from "react";
import { DataTable } from "mantine-datatable";
import { LuSearch } from "react-icons/lu";
import { FaRegEdit } from "react-icons/fa";
import { RiDeleteBinLine } from "react-icons/ri";
import { PiUsers } from "react-icons/pi";
import DeleteConfirmationModal from "../../../ui/modal/DeleteConfirmationModal";
import Select from "react-select";
import { useNavigate } from "react-router";
import Modal from "../../../ui/modal/Modal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FiLock } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { z } from "zod";

// Generated types and hooks
import { 
  useUserControllerGetPaginatedStaff,
  useUserControllerCreateStaff,
  useUserControllerUpdateStaff,
  useUserControllerDeleteStaff,
  useUserTypeControllerFindAllForStaffAssignment,
  usePrivilegeControllerGetAllPrivileges,
  usePrivilegeControllerAssignPrivilegeToUser,
  usePrivilegeControllerUnassignPrivilegeFromUser,
  createStaffDtoSchema,
  updateStaffDtoSchema,
  type CreateStaffDtoSchema,
  type UpdateStaffDtoSchema,
  type StaffDtoSchema,
  type PrivilegeCodeSchema,
} from "../../../generated";

// Strong password validation
const strongPasswordSchema = z.string()
    .min(8, "Password must be at least 8 characters long")
    .max(128, "Password must not exceed 128 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character");

// Validation schemas
const staffSchema = createStaffDtoSchema.extend({
  userTypeId: z.string().min(1, "User type is required"),
  password: strongPasswordSchema,
  confirmPassword: z.string().min(1, "Confirm password is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const updateStaffFormSchema = updateStaffDtoSchema.extend({
  userTypeId: z.string().optional(),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  // If password is provided, it must meet strength requirements
  if (data.password && data.password.length > 0) {
    try {
      strongPasswordSchema.parse(data.password);
    } catch (e) {
      return false;
    }
    // If password is provided, confirmation is required
    return data.password === data.confirmPassword;
  }
  return true;
}, {
  message: "If password is provided, it must meet strength requirements and passwords must match",
  path: ["confirmPassword"],
});

type StaffFormValues = z.infer<typeof staffSchema>;
type UpdateStaffFormValues = z.infer<typeof updateStaffFormSchema>;

const StaffManagementPage = () => {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState<{ value: string; label: string } | null>(null);
    const [userTypeFilter, setUserTypeFilter] = useState<{ value: string; label: string } | null>(null);
    const [selectedStaff, setSelectedStaff] = useState<StaffDtoSchema | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
    const [selectedPrivileges, setSelectedPrivileges] = useState<string[]>([]);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);

    // Reset page when search or filters change
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, departmentFilter, userTypeFilter]);

    // API hooks with server-side filtering and search
    const { data: staffData, isLoading: isLoadingStaff, refetch: refetchStaff } = useUserControllerGetPaginatedStaff({
        page: page - 1, // API expects 0-based indexing
        limit: pageSize,
        sortBy: "created_at",
        sortOrder: "desc",
        search: debouncedSearch || undefined,
        department: departmentFilter?.value || undefined,
        userType: userTypeFilter?.value || undefined,
    });

    const { data: userTypesData, isLoading: isLoadingUserTypes } = useUserTypeControllerFindAllForStaffAssignment();

    // Fetch all available privileges for permissions modal
    const { data: privilegesData } = usePrivilegeControllerGetAllPrivileges();

    const createStaffMutation = useUserControllerCreateStaff({
        mutation: {
            onSuccess: () => {
                toast.success("Staff member created successfully");
                refetchStaff();
                setIsStaffModalOpen(false);
                reset();
            },
            onError: (error: any) => {
                toast.error(`Failed to create staff: ${error?.response?.data?.message || "An error occurred"}`);
            },
        },
    });

    const updateStaffMutation = useUserControllerUpdateStaff({
        mutation: {
            onSuccess: () => {
                toast.success("Staff member updated successfully");
                refetchStaff();
                setIsStaffModalOpen(false);
                reset();
            },
            onError: (error: any) => {
                toast.error(`Failed to update staff: ${error?.response?.data?.message || "An error occurred"}`);
            },
        },
    });

    const deleteStaffMutation = useUserControllerDeleteStaff({
        mutation: {
            onSuccess: () => {
                toast.success("Staff member deleted successfully");
                refetchStaff();
                setIsDeleteModalOpen(false);
                setSelectedStaff(null);
            },
            onError: (error: any) => {
                toast.error(`Failed to delete staff: ${error?.response?.data?.message || "An error occurred"}`);
            },
        },
    });

    const assignPrivilegeMutation = usePrivilegeControllerAssignPrivilegeToUser({
        mutation: {
            onSuccess: () => {
                toast.success("Privilege assigned successfully");
                refetchStaff();
            },
            onError: (error: any) => {
                toast.error(`Failed to assign privilege: ${error?.response?.data?.message || "An error occurred"}`);
            },
        },
    });

    const unassignPrivilegeMutation = usePrivilegeControllerUnassignPrivilegeFromUser({
        mutation: {
            onSuccess: () => {
                toast.success("Privilege unassigned successfully");
                refetchStaff();
            },
            onError: (error: any) => {
                toast.error(`Failed to unassign privilege: ${error?.response?.data?.message || "An error occurred"}`);
            },
        },
    });

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
        setValue,
        watch,
    } = useForm<StaffFormValues>({
        resolver: zodResolver(isEditing ? updateStaffFormSchema : staffSchema),
    });

    // Computed values
    const staff = Array.isArray(staffData?.data?.items) ? staffData.data.items : [];
    const userTypes = Array.isArray(userTypesData?.data) ? userTypesData.data : [];
    const allPrivileges = Array.isArray(privilegesData?.data) ? privilegesData.data : [];
    const totalRecords = staffData?.data?.total || 0;

    // Helper function to get user type name from userTypeId
    const getUserTypeName = (userTypeId: string, fallbackName?: string): string => {
        const userType = userTypes.find(type => type.id === userTypeId);
        return userType?.name || fallbackName || "Unknown";
    };

    // Filter options - get unique values from all staff for better filtering
    const departmentOptions = Array.from(new Set(staff.map(s => s.department).filter(Boolean)))
        .map(dept => ({ value: dept as string, label: dept as string }));

    const userTypeOptions = userTypes.map((type) => ({
        value: type.name, // Use name for filtering as API expects userType name
        label: type.name,
    }));



    // Available privileges for the permissions modal
    const privilegeOptions = allPrivileges.map((privilege) => ({
        value: privilege.code,
        label: privilege.displayName || privilege.code,
    }));

    const handleAddStaff = () => {
        setIsEditing(false);
        reset({
            name: "",
            username: "",
            password: "",
            confirmPassword: "",
            title: "",
            department: "",
            userTypeId: "",
        });
        setIsStaffModalOpen(true);
    };

    const handleEditStaff = (staff: StaffDtoSchema) => {
        setIsEditing(true);
        setSelectedStaff(staff);
        reset({
            name: staff.name,
            username: staff.username,
            title: staff.title,
            department: staff.department,
            userTypeId: staff.userTypeId, // Use the userTypeId directly instead of finding by name
            password: "",
            confirmPassword: "",
        });
        setIsStaffModalOpen(true);
    };

    const handleEditPermissions = (staff: StaffDtoSchema) => {
        setSelectedStaff(staff);
        // Only set user-specific privileges for editing
        setSelectedPrivileges(staff.userPrivileges || []);
        setIsPermissionsModalOpen(true);
    };

    const handleDeleteStaff = (staff: StaffDtoSchema) => {
        setSelectedStaff(staff);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteStaff = async () => {
        if (selectedStaff) {
            deleteStaffMutation.mutate({ id: selectedStaff.id });
        }
    };

    const onSubmitStaff = async (data: StaffFormValues) => {
        try {
            if (isEditing && selectedStaff) {
                const updateData: any = {
                    name: data.name,
                    username: data.username,
                    title: data.title,
                    department: data.department,
                };
                
                // Only include password if it's provided
                if (data.password && data.password.trim() !== "") {
                    updateData.password = data.password;
                }

                // Only include userTypeId if it's provided
                if (data.userTypeId && data.userTypeId.trim() !== "") {
                    updateData.userTypeId = data.userTypeId;
                }

                updateStaffMutation.mutate({
                    id: selectedStaff.id,
                    data: updateData,
                });
            } else {
                createStaffMutation.mutate({
                    userTypeId: data.userTypeId,
                    data: {
                        name: data.name,
                        username: data.username,
                        password: data.password,
                        title: data.title,
                        department: data.department,
                    },
                });
            }
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };

    const handleSavePermissions = async () => {
        if (!selectedStaff) return;

        try {
            // Compare against user-specific privileges only
            const currentUserPrivileges = selectedStaff.userPrivileges || [];
            const newPrivileges = selectedPrivileges;

            // Find privileges to assign (new ones)
            const privilegesToAssign = newPrivileges.filter(p => !currentUserPrivileges.includes(p));
            
            // Find privileges to unassign (removed ones)
            const privilegesToUnassign = currentUserPrivileges.filter(p => !newPrivileges.includes(p));

            // Assign new privileges
            for (const privilege of privilegesToAssign) {
                assignPrivilegeMutation.mutate({
                    data: {
                        userId: selectedStaff.id,
                        privilegeCode: privilege as PrivilegeCodeSchema,
                    },
                });
            }

            // Unassign removed privileges
            for (const privilege of privilegesToUnassign) {
                unassignPrivilegeMutation.mutate({
                    data: {
                        userId: selectedStaff.id,
                        privilegeCode: privilege as PrivilegeCodeSchema,
                    },
                });
            }

            setIsPermissionsModalOpen(false);
            setSelectedStaff(null);
            setSelectedPrivileges([]);
        } catch (error: any) {
            toast.error(`Failed to update permissions: ${error?.response?.data?.message || "An error occurred"}`);
        }
    };

    const handleManageUserTypes = () => {
        navigate("/staff/user-types");
    };

    const clearFilters = () => {
        setSearch("");
        setDepartmentFilter(null);
        setUserTypeFilter(null);
    };

    return (
        <div className="panel mt-6">
            <div className="mb-4.5 flex flex-col gap-5 md:flex-row md:items-center">
                <div className="flex flex-col gap-4 md:gap-0 md:flex-row md:items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-semibold text-secondary">Staff Management</h2>
                    </div>
                    <div className="flex flex-col gap-3 md:flex-row">
                        <button
                            className="self-start h-10 px-3 rounded-lg bg-secondary flex items-center text-white"
                            onClick={() => navigate("/staff/requests")}
                        >
                            <PiUsers size={20} className="mr-2" />
                            View Requests
                        </button>
                        <button
                            className="self-start h-10 px-3 rounded-lg bg-secondary flex items-center text-white"
                            onClick={() => navigate("/staff/user-types")}
                        >
                            <PiUsers size={20} className="mr-2" />
                            Manage User Types
                        </button>
                        <button
                            className="self-start h-10 px-3 rounded-lg bg-secondary flex items-center text-white"
                            onClick={handleAddStaff}
                        >
                            Add Staff
                        </button>
                    </div>
                </div>
            </div>

            {/* Search and Filter panel - Always visible */}
            <div className="mb-6 p-4 bg-gray-50 border rounded-md relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Search</label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                <LuSearch size={16} className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search staff..."
                                className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 text-sm focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Department</label>
                        <Select
                            options={departmentOptions}
                            isClearable
                            placeholder="Filter by department"
                            value={departmentFilter}
                            onChange={(option) => setDepartmentFilter(option)}
                            className="text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">User Type</label>
                        <Select
                            options={userTypeOptions}
                            isClearable
                            placeholder="Filter by user type"
                            value={userTypeFilter}
                            onChange={(option) => setUserTypeFilter(option)}
                            className="text-sm"
                        />
                    </div>
                </div>
                {(search || departmentFilter || userTypeFilter) && (
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={clearFilters}
                            className="text-sm text-secondary hover:text-secondary-dark"
                        >
                            Clear all filters
                        </button>
                    </div>
                )}
            </div>

            <div className="datatables">
                <DataTable
                    highlightOnHover
                    withBorder
                    className="table-hover whitespace-nowrap"
                    records={staff}
                    columns={[
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
                            accessor: "userType",
                            title: "User Type",
                            sortable: true,
                            render: (row: StaffDtoSchema) => (
                                <span className="text-gray-900">
                                    {getUserTypeName(row.userTypeId, row.userType)}
                                </span>
                            ),
                        },
                        {
                            accessor: "status",
                            title: "Status",
                            sortable: true,
                            render: (row: StaffDtoSchema) => (
                                <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${row.status === true
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                        }`}
                                >
                                    {row.status ? "Active" : "Inactive"}
                                </span>
                            ),
                        },
                        {
                            accessor: "lastLogin",
                            title: "Last Login",
                            sortable: true,
                            render: (row: StaffDtoSchema) =>
                                row.lastLogin ? new Date(row.lastLogin).toLocaleDateString() : "Never",
                        },
                        {
                            accessor: "privileges",
                            title: "Privileges",
                            render: (row: StaffDtoSchema) => (
                                <div className="space-y-2">
                                    {/* User Type Privileges (inherited) */}
                                    {row.userTypePrivileges && row.userTypePrivileges.length > 0 && (
                                        <div>
                                            <div className="text-xs text-gray-500 mb-1">From User Type:</div>
                                            <div className="flex flex-wrap gap-1">
                                                {row.userTypePrivileges.map((privilege) => (
                                                    <span
                                                        key={privilege}
                                                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                                                        title="Inherited from user type"
                                                    >
                                                        {privilege}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* User-Specific Privileges */}
                                    {row.userPrivileges && row.userPrivileges.length > 0 && (
                                        <div>
                                            <div className="text-xs text-gray-500 mb-1">User-Specific:</div>
                                            <div className="flex flex-wrap gap-1">
                                                {row.userPrivileges.map((privilege) => (
                                                    <span
                                                        key={privilege}
                                                        className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs"
                                                        title="User-specific privilege"
                                                    >
                                                        {privilege}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Show message if no privileges */}
                                    {(!row.userTypePrivileges || row.userTypePrivileges.length === 0) && 
                                     (!row.userPrivileges || row.userPrivileges.length === 0) && (
                                        <span className="text-xs text-gray-400">No privileges assigned</span>
                                    )}
                                </div>
                            ),
                        },
                        {
                            accessor: "actions",
                            title: "Actions",
                            render: (row: StaffDtoSchema) => (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleEditStaff(row)}
                                        className="text-gray-500 hover:text-secondary"
                                        title="Edit staff"
                                    >
                                        <FaRegEdit size={20} className="text-[#0E1726]" />
                                    </button>
                                    <button
                                        onClick={() => handleEditPermissions(row)}
                                        className="text-gray-500 hover:text-secondary"
                                        title="Edit permissions"
                                    >
                                        <FiLock size={20} className="text-[#0E1726]" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteStaff(row)}
                                        className="text-gray-500 hover:text-danger"
                                        title="Delete staff"
                                    >
                                        <RiDeleteBinLine size={20} className="text-[#0E1726]" />
                                    </button>
                                </div>
                            ),
                        },
                    ]}
                    totalRecords={totalRecords}
                    recordsPerPage={pageSize}
                    onRecordsPerPageChange={setPageSize}
                    page={page}
                    onPageChange={(p) => setPage(p)}
                    recordsPerPageOptions={PAGE_SIZES}
                />
            </div>

            {/* Staff Modal */}
            <Modal
                isOpen={isStaffModalOpen}
                onClose={() => {
                    setIsStaffModalOpen(false);
                    reset();
                }}
                title={isEditing ? "Edit Staff Member" : "Add New Staff Member"}
                size="lg"
            >
                <form onSubmit={handleSubmit(onSubmitStaff)} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Full Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
                            {...register("name")}
                        />
                        {errors.name && (
                            <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
                        )}
                    </div>

                    {!isEditing && (
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
                                {...register("username")}
                            />
                            {errors.username && (
                                <p className="mt-1 text-xs text-red-600">{errors.username.message}</p>
                            )}
                        </div>
                    )}

                    {isEditing && (
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
                                {...register("username")}
                            />
                            {errors.username && (
                                <p className="mt-1 text-xs text-red-600">{errors.username.message}</p>
                            )}
                        </div>
                    )}



                    {!isEditing && (
                        <>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
                                    {...register("password")}
                                />
                                {errors.password && (
                                    <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                    Confirm Password
                                </label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
                                    {...register("confirmPassword")}
                                />
                                {errors.confirmPassword && (
                                    <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>
                                )}
                            </div>
                        </>
                    )}

                    {isEditing && (
                        <>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    New Password <span className="text-gray-500">(leave blank to keep current)</span>
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
                                    {...register("password")}
                                    placeholder="Leave blank to keep current password"
                                />
                                {errors.password && (
                                    <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                    Confirm New Password
                                </label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
                                    {...register("confirmPassword")}
                                    placeholder="Confirm new password"
                                />
                                {errors.confirmPassword && (
                                    <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>
                                )}
                            </div>
                        </>
                    )}

                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                            Job Title
                        </label>
                        <input
                            id="title"
                            type="text"
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
                            {...register("title")}
                        />
                        {errors.title && (
                            <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                            Department
                        </label>
                        <input
                            id="department"
                            type="text"
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
                            {...register("department")}
                        />
                        {errors.department && (
                            <p className="mt-1 text-xs text-red-600">{errors.department.message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="userType" className="block text-sm font-medium text-gray-700">
                            User Type
                        </label>
                        <select
                            id="userType"
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
                            {...register("userTypeId")}
                        >
                            <option value="">Select a user type</option>
                            {userTypes.map((type) => (
                                <option key={type.id} value={type.id}>
                                    {type.name}
                                </option>
                            ))}
                        </select>
                        {errors.userTypeId && (
                            <p className="mt-1 text-xs text-red-600">{errors.userTypeId.message}</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={() => {
                                setIsStaffModalOpen(false);
                                reset();
                            }}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-secondary border border-transparent rounded-md hover:bg-secondary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
                        >
                            {isEditing ? "Update" : "Create"}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDeleteStaff}
                title="Delete Staff Member"
                message={`Are you sure you want to delete staff member "${selectedStaff?.name}"? This action cannot be undone.`}
            />

            {/* Permissions Modal */}
            <Modal
                isOpen={isPermissionsModalOpen}
                onClose={() => {
                    setIsPermissionsModalOpen(false);
                    setSelectedStaff(null);
                    setSelectedPrivileges([]);
                }}
                title="Edit Staff Permissions"
                size="lg"
            >
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Staff Member
                        </label>
                        <p className="mt-1 text-sm text-gray-900">{selectedStaff?.name}</p>
                        <p className="text-xs text-gray-500">User Type: {selectedStaff?.userType}</p>
                    </div>

                    {/* User Type Privileges (Read-only) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Privileges from User Type (Read-only)
                        </label>
                        {selectedStaff?.userTypePrivileges && selectedStaff.userTypePrivileges.length > 0 ? (
                            <div className="flex flex-wrap gap-2 p-3 bg-blue-50 rounded-md border">
                                {selectedStaff.userTypePrivileges.map((privilege) => (
                                    <span
                                        key={privilege}
                                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                                        title="Inherited from user type - cannot be edited here"
                                    >
                                        {privilegeOptions.find(p => p.value === privilege)?.label || privilege}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 p-3 bg-gray-50 rounded-md border">
                                No privileges inherited from user type
                            </p>
                        )}
                    </div>

                    {/* User-Specific Privileges (Editable) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Additional User-Specific Privileges
                        </label>
                        <p className="text-xs text-gray-500 mb-2">
                            These privileges are specific to this user and can be managed independently of their user type.
                        </p>
                        <Select
                            isMulti
                            options={privilegeOptions}
                            value={selectedPrivileges.map((privilege) => ({
                                value: privilege,
                                label: privilegeOptions.find(p => p.value === privilege)?.label || privilege,
                            }))}
                            onChange={(selected) => {
                                setSelectedPrivileges(selected ? selected.map(option => option.value) : []);
                            }}
                            className="mt-1"
                            placeholder="Select additional privileges..."
                        />
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-yellow-800">
                                    Note
                                </h3>
                                <div className="mt-2 text-sm text-yellow-700">
                                    <p>
                                        • User type privileges are inherited and cannot be modified here. To change them, edit the user type or assign a different user type.
                                    </p>
                                    <p>
                                        • User-specific privileges are added on top of user type privileges.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={() => {
                                setIsPermissionsModalOpen(false);
                                setSelectedStaff(null);
                                setSelectedPrivileges([]);
                            }}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSavePermissions}
                            className="px-4 py-2 text-sm font-medium text-white bg-secondary border border-transparent rounded-md hover:bg-secondary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default StaffManagementPage; 