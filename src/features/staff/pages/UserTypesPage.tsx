import { useState, useEffect } from "react";
import { DataTable } from "mantine-datatable";
import { LuSearch } from "react-icons/lu";
import { FaRegEdit } from "react-icons/fa";
import { RiDeleteBinLine } from "react-icons/ri";
import DeleteConfirmationModal from "../../../ui/modal/DeleteConfirmationModal";
import { useNavigate } from "react-router";
import Modal from "../../../ui/modal/Modal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Select from "react-select";
import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import {
    usePrivilegeControllerGetAllPrivileges,
    usePrivilegeControllerAssignPrivilegeToUserType,
    usePrivilegeControllerUnassignPrivilegeFromUserTypeById,
    PrivilegeCode,
    privilegeCodeEnum,
    useUserTypeControllerFindAllWithPrivileges,
    userTypeControllerFindAllWithPrivilegesQueryKey,
    type UserTypeControllerFindAllWithPrivilegesQueryParams,
    type UserTypeDto,
    useUserTypeControllerCreate,
    useUserTypeControllerUpdate,
    useUserTypeControllerDelete,
    type UpdateUserTypeDto,
    type CreateUserTypeDto,
    type GenericAssignPrivilegeDto,
} from "../../../generated";
import useDebounce from "../../../hooks/useDebounce";

interface UserType extends UserTypeDto {
    privileges: PrivilegeAssignmentDto[];
}

interface PrivilegeAssignmentDto {
    code: PrivilegeCode;
    friendlyName: string;
    group: string;
    requiresResource: boolean;
    paramKey: string;
    entityName: string;
    resourceIds?: string[];
}

const userTypeSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    privileges: z.array(z.nativeEnum(privilegeCodeEnum)).min(1, "At least one privilege is required"),
});

type UserTypeFormValues = z.infer<typeof userTypeSchema>;

const UserTypesPage = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 500);
    const [selectedUserType, setSelectedUserType] = useState<UserType | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isUserTypeModalOpen, setIsUserTypeModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const { data: privilegesData, isLoading: isLoadingPrivileges } = usePrivilegeControllerGetAllPrivileges();
    const availablePrivileges = (privilegesData?.data as PrivilegeAssignmentDto[] | undefined)?.map((privilege) => ({
        value: privilege.code,
        label: privilege.friendlyName,
        group: privilege.group,
    })) || [];

    const assignPrivilegeMutation = usePrivilegeControllerAssignPrivilegeToUserType();
    const unassignPrivilegeMutation = usePrivilegeControllerUnassignPrivilegeFromUserTypeById();
    const createUserTypeMutation = useUserTypeControllerCreate();
    const updateUserTypeMutation = useUserTypeControllerUpdate();
    const deleteUserTypeMutation = useUserTypeControllerDelete();

    const {
        data: userTypesApiResponse,
        isLoading: isLoadingUserTypes,
        isError: isErrorUserTypes,
        error: userTypesError,
    } = useUserTypeControllerFindAllWithPrivileges(
        {
            page: page - 1,
            limit: pageSize,
            search: debouncedSearch,
        },
        {
            query: {
                placeholderData: (previousData) => previousData,
            },
        }
    );

    const records: UserType[] = (userTypesApiResponse?.data?.items as unknown as UserType[] | undefined) || [];
    const totalRecords = userTypesApiResponse?.data?.total || 0;

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch]);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<UserTypeFormValues>({
        resolver: zodResolver(userTypeSchema),
    });

    const selectedPrivileges = watch("privileges") || [];

    const handleEditUserType = (userType: UserType) => {
        setIsEditing(true);
        reset({
            name: userType.name,
            description: userType.description || "",
            privileges: userType.privileges.map(p => p.code),
        });
        setSelectedUserType(userType);
        setIsUserTypeModalOpen(true);
    };

    const handleDeleteUserType = (userType: UserType) => {
        setSelectedUserType(userType);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteUserType = async () => {
        if (selectedUserType) {
            try {
                await deleteUserTypeMutation.mutateAsync({ ids: selectedUserType.id });
                toast.success(`User type "${selectedUserType.name}" deleted successfully`);
                await queryClient.invalidateQueries({
                    queryKey: userTypeControllerFindAllWithPrivilegesQueryKey({ page: page -1, limit: pageSize, search: debouncedSearch }),
                });
            } catch (error) {
                console.error("Error deleting user type:", error);
                toast.error(`Failed to delete user type "${selectedUserType.name}"`);
            }
        }
        setIsDeleteModalOpen(false);
        setSelectedUserType(null);
    };

    const handleAddUserType = () => {
        setIsEditing(false);
        reset({ name: "", description: "", privileges: [] });
        setSelectedUserType(null);
        setIsUserTypeModalOpen(true);
    };

    const onSubmitUserType = async (data: UserTypeFormValues) => {
        try {
            if (isEditing && selectedUserType) {
                await updateUserTypeMutation.mutateAsync({
                    id: selectedUserType.id,
                    data: {
                        name: data.name,
                        description: data.description,
                    } as UpdateUserTypeDto,
                });

                const currentPrivileges = selectedUserType.privileges.map(p => p.code);
                const privilegesToAdd = data.privileges.filter(p => !currentPrivileges.includes(p));
                const privilegesToRemove = currentPrivileges.filter(p => !data.privileges.includes(p));

                await Promise.all(
                    privilegesToAdd.map(privilegeCode =>
                        assignPrivilegeMutation.mutateAsync({
                            data: {
                                userTypeId: selectedUserType.id,
                                privilegeCode,
                            },
                        })
                    )
                );

                await Promise.all(
                    privilegesToRemove.map(privilegeCode =>
                        unassignPrivilegeMutation.mutateAsync({
                            userTypeId: selectedUserType.id,
                            privilegeCode,
                        })
                    )
                );

                toast.success("User type updated successfully");
            } else {
                const createPayload: CreateUserTypeDto = {
                    name: data.name,
                    description: data.description,
                    privilege_assignments: data.privileges.map(pc => ({ privilegeCode: pc, resourceIds: [] })) as GenericAssignPrivilegeDto[],
                };
                await createUserTypeMutation.mutateAsync({
                    data: createPayload,
                });
                toast.success("User type created successfully");
            }
            setIsUserTypeModalOpen(false);
            reset({ name: "", description: "", privileges: [] });
            await queryClient.invalidateQueries({
                queryKey: userTypeControllerFindAllWithPrivilegesQueryKey({ page: page -1, limit: pageSize, search: debouncedSearch }),
            });
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error("Failed to save user type");
        }
    };

    return (
        <div className="panel mt-6">
            <div className="mb-4.5 flex flex-col gap-5 md:flex-row md:items-center">
                <div className="flex flex-col gap-4 md:gap-0 md:flex-row md:items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-semibold text-secondary">User Types</h2>
                    </div>
                    <div className="flex flex-col gap-3 md:flex-row">
                        <div className="relative flex items-center flex-1 md:flex-auto">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                <LuSearch size={20} className="text-[#0E1726]" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search user types..."
                                className="h-10 pl-10 pr-4 w-[240px] rounded-md border border-[#E0E6ED] text-xs font-medium tracking-wider text-gray-500 outline-none focus:border-secondary transition-colors duration-200"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <button
                            className="self-start h-10 px-3 rounded-lg bg-secondary flex items-center text-white"
                            onClick={handleAddUserType}
                        >
                            Add New User Type
                        </button>
                    </div>
                </div>
            </div>

            <div className="datatables">
                <DataTable
                    highlightOnHover
                    withBorder
                    className="table-hover whitespace-nowrap"
                    records={records}
                    columns={[
                        {
                            accessor: "name",
                            title: "Name",
                            sortable: true,
                        },
                        {
                            accessor: "description",
                            title: "Description",
                            sortable: true,
                        },
                        {
                            accessor: "privileges",
                            title: "Privileges",
                            render: (row) => (
                                <div className="flex flex-wrap gap-1">
                                    {row.privileges.map((privilege) => (
                                        <span
                                            key={privilege.code}
                                            className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs"
                                        >
                                            {privilege.friendlyName}
                                        </span>
                                    ))}
                                </div>
                            ),
                        },
                        {
                            accessor: "actions",
                            title: "Actions",
                            render: (row) => (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleEditUserType(row)}
                                        className="text-gray-500 hover:text-secondary"
                                        title="Edit user type"
                                    >
                                        <FaRegEdit size={20} className="text-[#0E1726]" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteUserType(row)}
                                        className="text-gray-500 hover:text-danger"
                                        title="Delete user type"
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
                    fetching={isLoadingUserTypes}
                />
            </div>

            <Modal
                isOpen={isUserTypeModalOpen}
                onClose={() => {
                    setIsUserTypeModalOpen(false);
                    reset();
                }}
                title={isEditing ? "Edit User Type" : "Add New User Type"}
                size="lg"
            >
                <form onSubmit={handleSubmit(onSubmitUserType)} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Name
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

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Description
                        </label>
                        <textarea
                            id="description"
                            rows={3}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
                            {...register("description")}
                        />
                        {errors.description && (
                            <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="privileges" className="block text-sm font-medium text-gray-700">
                            Privileges
                        </label>
                        <Select
                            isMulti
                            isLoading={isLoadingPrivileges}
                            options={availablePrivileges}
                            value={availablePrivileges.filter(option => selectedPrivileges.includes(option.value))}
                            onChange={(selected) => {
                                setValue("privileges", selected ? selected.map(option => option.value) : []);
                            }}
                            className="mt-1"
                            menuPortalTarget={document.body}
                            styles={{
                                menuPortal: base => ({ ...base, zIndex: 9999 }),
                            }}
                        />
                        {errors.privileges && (
                            <p className="mt-1 text-xs text-red-600">{errors.privileges.message}</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={() => {
                                setIsUserTypeModalOpen(false);
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

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDeleteUserType}
                title="Delete User Type"
                message={`Are you sure you want to delete user type "${selectedUserType?.name}"? This action cannot be undone.`}
            />
        </div>
    );
};

export default UserTypesPage; 