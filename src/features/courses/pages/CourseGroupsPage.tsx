import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { DataTable } from "mantine-datatable";
import { LuSearch, LuArrowLeft, LuPlus, LuUsers, LuMoveUp, LuMoveDown } from "react-icons/lu";
import { FaRegEdit } from "react-icons/fa";
import { RiDeleteBinLine } from "react-icons/ri";
import { HiArrowsUpDown } from "react-icons/hi2";
import CreateCourseGroupModal from "../components/CreateCourseGroupModal";
import { useCourseControllerGetById } from "../../../generated";
import { useCourseGroupControllerGetPaginated } from "../../../generated";

const CourseGroupsPage = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [filteredGroups, setFilteredGroups] = useState<any[]>([]);
    const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<any>(null);
    const [isReorderMode, setIsReorderMode] = useState(false);
    const [draggedGroup, setDraggedGroup] = useState<any>(null);

    // Fetch course data using the generated hook
    const { 
        data: courseData, 
        isLoading: courseLoading, 
        error: courseError 
    } = useCourseControllerGetById(courseId!, {
        query: {
            enabled: !!courseId
        }
    });

    // Fetch course groups using the generated hook
    const { 
        data: groupsData, 
        isLoading: groupsLoading, 
        error: groupsError 
    } = useCourseGroupControllerGetPaginated({
        courseId: courseId!,
        page: 0,
        limit: 100 // Get all groups
    }, {
        query: {
            enabled: !!courseId
        }
    });

    const course = courseData?.data;
    
    // Memoize groups to prevent infinite re-renders
    const groups = useMemo(() => {
        return groupsData?.data?.items || [];
    }, [groupsData?.data?.items]);

    useEffect(() => {
        if (courseError) {
            // Handle course not found
            navigate("/courses");
        }
    }, [courseError, navigate]);

    // Memoize filtered groups to prevent unnecessary re-calculations
    useEffect(() => {
        if (groups.length > 0) {
            const filtered = groups.filter((group: any) =>
                group.name?.toLowerCase().includes(search.toLowerCase()) ||
                group.labName?.toLowerCase().includes(search.toLowerCase()) ||
                group.dayOfWeek?.toLowerCase().includes(search.toLowerCase()) ||
                `${group.startTime} - ${group.endTime}`.toLowerCase().includes(search.toLowerCase())
            );

            setFilteredGroups(filtered);
        } else {
            setFilteredGroups([]);
        }
    }, [search, groups]);

    // Show error state for course not found only
    if (courseError) {
        return (
            <div className="panel mt-6">
                <div className="flex flex-col items-center justify-center h-64">
                    <div className="text-red-500 text-lg font-semibold mb-2">Course not found</div>
                    <div className="text-gray-600 mb-4">The requested course could not be loaded.</div>
                    <button 
                        onClick={() => navigate("/courses")}
                        className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary-dark"
                    >
                        Back to Courses
                    </button>
                </div>
            </div>
        );
    }

    const handleViewGroup = (groupId: string) => {
        navigate(`/courses/${courseId}/groups/${groupId}`);
    };

    const handleEditGroup = (group: any) => {
        setEditingGroup(group);
        setIsCreateGroupModalOpen(true);
    };

    const formatTime = (time24h: string) => {
        try {
            const [hours, minutes] = time24h.split(':');
            const date = new Date();
            date.setHours(parseInt(hours, 10));
            date.setMinutes(parseInt(minutes, 10));

            return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        } catch (error) {
            return time24h;
        }
    };

    const handleCloseModal = () => {
        setIsCreateGroupModalOpen(false);
        setEditingGroup(null);
    };

    // Create courseCode from subjectCode and courseNumber for display
    const courseCode = course ? `${course.subjectCode}${course.courseNumber}` : '';

    return (
        <div className="panel mt-6">
            {/* Header */}
            <div className="flex flex-col gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate(`/courses/${courseId}`)}
                        className="flex items-center gap-1 text-secondary hover:text-secondary-dark"
                    >
                        <LuArrowLeft size={14} />
                        <span>Back to Course</span>
                    </button>
                </div>

                <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-secondary">Lab Groups</h1>
                        <p className="text-gray-600">
                            {course?.name ? `${course.name} (${courseCode})` : courseLoading ? "Loading course..." : "Course"}
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 md:flex-row">
                        <div className="relative flex items-center">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                <LuSearch size={20} className="text-[#0E1726]" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search groups..."
                                className="h-10 pl-10 pr-4 w-full md:w-[240px] rounded-md border border-[#E0E6ED] text-xs font-medium tracking-wider text-gray-500 outline-none focus:border-secondary transition-colors duration-200"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <button
                            onClick={() => setIsCreateGroupModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary-dark text-sm"
                        >
                            <LuPlus size={16} />
                            Create Group
                        </button>
                    </div>
                </div>
            </div>

            {/* Groups Table */}
            <div className="datatables">
                <DataTable
                    records={filteredGroups}
                    columns={[
                        {
                            accessor: "name",
                            title: "Group Name",
                            render: ({ name }) => (
                                <div className="font-medium text-secondary">{name}</div>
                            ),
                        },
                        {
                            accessor: "labName",
                            title: "Lab",
                            render: ({ labName }) => (
                                <div className="text-gray-700">{labName}</div>
                            ),
                        },
                        {
                            accessor: "dayOfWeek",
                            title: "Day & Time",
                            render: ({ dayOfWeek, startTime, endTime }) => (
                                <div className="flex flex-col">
                                    <span className="font-medium">{dayOfWeek}</span>
                                    <span className="text-sm text-gray-500">
                                        {formatTime(startTime)} - {formatTime(endTime)}
                                    </span>
                                </div>
                            ),
                        },
                        {
                            accessor: "capacity",
                            title: "Students",
                            render: ({ capacity }) => (
                                <div className="flex items-center gap-2">
                                    <LuUsers size={16} className="text-gray-500" />
                                    <span>0/{capacity}</span>
                                </div>
                            ),
                        },
                        {
                            accessor: "actions",
                            title: "Actions",
                            render: (group) => (
                                <div className="flex items-center justify-center gap-2">
                                    <button
                                        onClick={() => handleViewGroup(group.id)}
                                        className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-colors"
                                        title="View Group"
                                    >
                                        <LuUsers size={14} />
                                    </button>
                                    <button
                                        onClick={() => handleEditGroup(group)}
                                        className="p-2 rounded-md bg-blue-100 hover:bg-blue-200 text-blue-600 hover:text-blue-800 transition-colors"
                                        title="Edit Group"
                                    >
                                        <FaRegEdit size={14} />
                                    </button>
                                    <button
                                        className="p-2 rounded-md bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-800 transition-colors"
                                        title="Delete Group"
                                    >
                                        <RiDeleteBinLine size={14} />
                                    </button>
                                </div>
                            ),
                        },
                    ]}
                    minHeight={200}
                    fetching={groupsLoading}
                    emptyState={
                        <div className="flex flex-col items-center justify-center p-8">
                            <LuUsers size={48} className="text-gray-300 mb-4" />
                            <p className="text-gray-500 text-lg font-medium mb-2">No Groups Found</p>
                            <p className="text-gray-400 text-sm mb-4">
                                {search ? "Try adjusting your search criteria" : "Create the first group to get started"}
                            </p>
                            {!search && (
                                <button
                                    onClick={() => setIsCreateGroupModalOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary-dark text-sm"
                                >
                                    <LuPlus size={16} />
                                    Create Group
                                </button>
                            )}
                        </div>
                    }
                />
            </div>

            <CreateCourseGroupModal
                isOpen={isCreateGroupModalOpen}
                onClose={handleCloseModal}
                courseId={parseInt(courseId!)}
                courseName={course?.name || ""}
                groupData={editingGroup}
            />
        </div>
    );
};

export default CourseGroupsPage; 