import { DataTable } from "mantine-datatable";
import { useEffect, useState } from "react";
import { LuSearch, LuFilter } from "react-icons/lu";
import { FaRegEdit } from "react-icons/fa";
import { RiDeleteBinLine } from "react-icons/ri";
import { PiBooks } from "react-icons/pi";
import { cn } from "../../../global/utils/cn";
import DeleteConfirmationModal from "../../../ui/modal/DeleteConfirmationModal";
import Select from "react-select";
import { StudentDto } from "../../../generated/types/StudentDto";
import AddEditStudentModal from "../components/AddEditStudentModal";
import StudentCoursesModal from "../components/StudentCoursesModal";
import Avatar from "../../../ui/avatar/Avatar";
import { useUserControllerGetPaginatedStudents } from "../../../generated/hooks/usersHooks/useUserControllerGetPaginatedStudents";
import { useUserControllerDeleteStudent } from "../../../generated/hooks/usersHooks/useUserControllerDeleteStudent";
import React from "react";
import toast from "react-hot-toast";

// Available programs data for filtering
const availablePrograms = [
    { value: "Mathematics", label: "Mathematics" },
    { value: "Computer Science", label: "Computer Science" },
    { value: "Statistics", label: "Statistics" },
    { value: "Physics", label: "Physics" }
];

// Available levels for filtering
const availableLevels = [
    { value: "1", label: "Level 1" },
    { value: "2", label: "Level 2" },
    { value: "3", label: "Level 3" },
    { value: "4", label: "Level 4" }
];

const StudentsPage = () => {
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [search, setSearch] = useState("");

    // Filter states
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [programFilter, setProgramFilter] = useState<{ value: string; label: string } | null>(null);
    const [levelFilter, setLevelFilter] = useState<{ value: string; label: string } | null>(null);

    // Modal states
    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [isCoursesModalOpen, setIsCoursesModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<StudentDto | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    // Student data with pagination
    const { data: studentsData, isLoading, refetch } = useUserControllerGetPaginatedStudents(
        {
            page: page - 1,
            limit: pageSize,
            // Add search parameters if the API supports it
            ...(search && { search }),
        },
        {
            query: {
                enabled: true,
                refetchOnWindowFocus: false
            }
        }
    );

    // Delete student mutation
    const deleteStudentMutation = useUserControllerDeleteStudent();

    // Apply client-side filtering when API doesn't support it
    const filteredStudents = React.useMemo(() => {
        if (!studentsData?.data?.items) return [];
        
        let students: StudentDto[] = [];
        
        // Handle different possible shapes of the response
        if (Array.isArray(studentsData.data.items)) {
            students = studentsData.data.items;
        } else if (studentsData.data.items && typeof studentsData.data.items === 'object') {
            students = [studentsData.data.items as StudentDto];
        }
        
        let filtered = [...students];
        
        // Apply search filter client-side if not handled by API
        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(
                student =>
                    student.name.toLowerCase().includes(searchLower) ||
                    student.seatNo.toString().includes(searchLower) ||
                    student.program.toLowerCase().includes(searchLower) ||
                    student.username.toLowerCase().includes(searchLower)
            );
        }
        
        // Apply program filter
        if (programFilter) {
            filtered = filtered.filter(
                student => student.program === programFilter.value
            );
        }
        
        // Apply level filter
        if (levelFilter) {
            filtered = filtered.filter(
                student => student.level === parseInt(levelFilter.value)
            );
        }
        
        return filtered;
    }, [studentsData, search, programFilter, levelFilter]);

    // Total count of records from API or filtered count
    const totalRecords = React.useMemo(() => {
        return studentsData?.data?.total || filteredStudents.length;
    }, [studentsData, filteredStudents]);

    const handleStudentFormSubmit = async () => {
        // Refresh the students data
        await refetch();
        setIsAddEditModalOpen(false);
        setSelectedStudent(null);
        setIsEditing(false);
    };

    const handleAddStudent = () => {
        setIsAddEditModalOpen(true);
        setSelectedStudent(null);
        setIsEditing(false);
    };

    const handleEditStudent = (student: StudentDto) => {
        setSelectedStudent(student);
        setIsEditing(true);
        setIsAddEditModalOpen(true);
    };

    const handleDeleteStudent = (student: StudentDto) => {
        setSelectedStudent(student);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteStudent = async () => {
        if (!selectedStudent) return;

        try {
            await deleteStudentMutation.mutateAsync({ id: selectedStudent.id });
            toast.success("Student deleted successfully");
            await refetch();
        } catch (error: any) {
            console.error("Error deleting student:", error);
            toast.error(error?.response?.data?.message || "Failed to delete student");
        } finally {
            setIsDeleteModalOpen(false);
            setSelectedStudent(null);
        }
    };

    const handleManageCourses = (student: StudentDto) => {
        setSelectedStudent(student);
        setIsCoursesModalOpen(true);
    };

    const clearFilters = () => {
        setProgramFilter(null);
        setLevelFilter(null);
    };

    // Reset to first page when filters change
    React.useEffect(() => {
        setPage(1);
    }, [search, programFilter, levelFilter]);

    return (
        <div className="panel mt-6">
            <div className="mb-4.5 flex flex-col gap-5 md:flex-row md:items-center">
                <div className="flex flex-col gap-4 md:gap-0 md:flex-row md:items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-semibold text-secondary">All Students</h2>
                    </div>
                    <div className="flex flex-col gap-3 md:flex-row">
                        <div className="relative flex items-center flex-1 md:flex-auto">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                <LuSearch size={20} className="text-[#0E1726]" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search students..."
                                className="h-10 pl-10 pr-4 w-[240px] rounded-md border border-[#E0E6ED] text-xs font-medium tracking-wider text-gray-500 outline-none focus:border-secondary transition-colors duration-200"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <button
                            className={`self-start h-10 px-3 rounded-md flex items-center gap-1 ${isFilterOpen ? "bg-secondary text-white" : "bg-gray-100 text-secondary"}`}
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                        >
                            <LuFilter size={16} />
                            <span>Filters</span>
                        </button>
                        <button
                            className="self-start h-10 px-3 rounded-lg bg-secondary flex items-center text-white"
                            onClick={handleAddStudent}
                        >
                            Add New Student
                        </button>
                    </div>
                </div>
            </div>

            {/* Filter panel */}
            {isFilterOpen && (
                <div className="mb-6 p-4 bg-gray-50 border rounded-md relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Program</label>
                            <Select
                                options={availablePrograms}
                                isClearable
                                placeholder="Filter by program"
                                value={programFilter}
                                onChange={(option) => setProgramFilter(option)}
                                className="text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Level</label>
                            <Select
                                options={availableLevels}
                                isClearable
                                placeholder="Filter by level"
                                value={levelFilter}
                                onChange={(option) => setLevelFilter(option)}
                                className="text-sm"
                            />
                        </div>
                    </div>
                    {(programFilter || levelFilter) && (
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
            )}

            <div className="datatables relative z-0">
                <DataTable
                    highlightOnHover
                    withBorder
                    className="table-hover whitespace-nowrap"
                    records={filteredStudents}
                    columns={[
                        {
                            accessor: "seatNo",
                            title: "Seat No",
                            sortable: true,
                            render: (row) => (
                                <span className="text-secondary font-medium">{row.seatNo}</span>
                            ),
                        },
                        {
                            accessor: "name",
                            title: "Name",
                            sortable: true,
                            render: (row) => (
                                <div className="flex items-center">
                                    <div className="mr-2">
                                        <Avatar 
                                            size={9}
                                            shape="circle" 
                                            imageSrc={row.photo}
                                            text={row.name?.charAt(0)}
                                        />
                                    </div>
                                    <span>{row.name}</span>
                                </div>
                            ),
                        },
                        {
                            accessor: "username",
                            title: "Username",
                            sortable: true,
                        },
                        {
                            accessor: "level",
                            title: "Level",
                            sortable: true,
                            render: (row) => (
                                <span>Level {row.level}</span>
                            ),
                        },
                        {
                            accessor: "program",
                            title: "Program",
                            sortable: true,
                        },
                        {
                            accessor: "courses",
                            title: "Courses",
                            render: (row) => (
                                <button
                                    className="w-[95px] h-[30px] flex justify-center items-center gap-1 rounded-3xl bg-secondary text-white"
                                    onClick={() => handleManageCourses(row)}
                                >
                                    <PiBooks size={16} />
                                    <span>Manage</span>
                                </button>
                            ),
                        },
                        {
                            accessor: "actions",
                            title: "Actions",
                            render: (row) => (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleEditStudent(row)}
                                        className="text-gray-500 hover:text-secondary"
                                        title="Edit student"
                                    >
                                        <FaRegEdit size={20} className="text-[#0E1726]" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteStudent(row)}
                                        className="text-gray-500 hover:text-danger"
                                        title="Delete student"
                                    >
                                        <RiDeleteBinLine size={20} className="text-[#0E1726]" />
                                    </button>
                                </div>
                            ),
                        },
                    ]}
                    fetching={isLoading}
                    totalRecords={totalRecords}
                    recordsPerPage={pageSize}
                    onRecordsPerPageChange={setPageSize}
                    page={page}
                    onPageChange={(p) => setPage(p)}
                    recordsPerPageOptions={PAGE_SIZES}
                />
            </div>

            {/* Add/Edit Student Modal */}
            <AddEditStudentModal
                isOpen={isAddEditModalOpen}
                onClose={() => {
                    setIsAddEditModalOpen(false);
                    setSelectedStudent(null);
                    setIsEditing(false);
                }}
                student={selectedStudent}
                isEditing={isEditing}
                onSubmitSuccess={handleStudentFormSubmit}
            />

            {/* Student Courses Modal */}
            <StudentCoursesModal
                isOpen={isCoursesModalOpen}
                onClose={() => setIsCoursesModalOpen(false)}
                student={selectedStudent}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDeleteStudent}
                title="Delete Student"
                message={`Are you sure you want to delete student "${selectedStudent?.name}"? This action cannot be undone.`}
            />
        </div>
    );
};

export default StudentsPage; 