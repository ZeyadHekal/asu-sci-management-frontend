import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { DataTable } from "mantine-datatable";
import { LuSearch, LuArrowLeft, LuPlus, LuUsers, LuMoveUp, LuMoveDown, LuArrowUp, LuArrowDown } from "react-icons/lu";
import { TbAlertTriangle } from "react-icons/tb";
import { FaRegEdit } from "react-icons/fa";
import { RiDeleteBinLine } from "react-icons/ri";
import { HiArrowsUpDown } from "react-icons/hi2";
import CreateCourseGroupModal from "../components/CreateCourseGroupModal";
import { useCourseControllerGetById } from "../../../generated";
import { useCourseGroupControllerGetScheduleTable } from "../../../generated/hooks/course-groupsHooks/useCourseGroupControllerGetScheduleTable";
import { useCourseGroupControllerDelete } from "../../../generated/hooks/course-groupsHooks/useCourseGroupControllerDelete";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { client } from "../../../global/api/apiClient";
import { courseGroupControllerGetScheduleTableQueryKey } from "../../../generated/hooks/course-groupsHooks/useCourseGroupControllerGetScheduleTable";
import toast from "react-hot-toast";
import { useCourseGroupControllerGetStudentsInDefaultGroup } from "../../../generated/hooks/course-groupsHooks/useCourseGroupControllerGetStudentsInDefaultGroup";
import { useCourseGroupControllerReorderGroups } from "../../../generated/hooks/course-groupsHooks/useCourseGroupControllerReorderGroups";

const CourseGroupsPage = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [filteredGroups, setFilteredGroups] = useState<any[]>([]);
    const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<any>(null);
    const [isReorderMode, setIsReorderMode] = useState(false);
    const [draggedGroup, setDraggedGroup] = useState<any>(null);
    const [deleteConfirmGroup, setDeleteConfirmGroup] = useState<any>(null);

    const queryClient = useQueryClient();

    // Delete group mutation
    const deleteMutation = useCourseGroupControllerDelete({
        mutation: {
            onSuccess: () => {
                toast.success("Group deleted successfully");
                queryClient.invalidateQueries({
                    queryKey: courseGroupControllerGetScheduleTableQueryKey(),
                });
                setDeleteConfirmGroup(null);
            },
            onError: (error) => {
                toast.error("Failed to delete group");
                console.error("Delete error:", error);
                setDeleteConfirmGroup(null);
            },
        },
    });

    // Add reorder mutation
    const reorderMutation = useCourseGroupControllerReorderGroups({
        mutation: {
            onSuccess: () => {
                toast.success("Groups reordered successfully");
                queryClient.invalidateQueries({
                    queryKey: courseGroupControllerGetScheduleTableQueryKey(),
                });
            },
            onError: (error) => {
                toast.error("Failed to reorder groups");
                console.error(error);
            },
        },
    });

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

    // Fetch course groups with schedule data using the schedule table endpoint
    const { 
        data: groupsData, 
        isLoading: groupsLoading, 
        error: groupsError 
    } = useCourseGroupControllerGetScheduleTable({
        courseId: courseId!,
        page: 0,
        limit: 100 // Get all groups
    }, {
        query: {
            enabled: !!courseId
        }
    });

    // Fetch students in default group
    const { 
        data: defaultGroupStudents,
        isLoading: defaultGroupLoading 
    } = useQuery({
        queryKey: ['defaultGroupStudents', courseId],
        queryFn: async () => {
            const response = await client({
                method: 'GET',
                url: `/course-groups/course/${courseId}/default-group-students`
            });
            return response.data;
        },
        enabled: !!courseId
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
                group.groupName?.toLowerCase().includes(search.toLowerCase()) ||
                group.labName?.toLowerCase().includes(search.toLowerCase()) ||
                group.weekDay?.toLowerCase().includes(search.toLowerCase()) ||
                group.timeSlot?.toLowerCase().includes(search.toLowerCase()) ||
                group.teachingAssistants?.some((assistant: string) => 
                    assistant.toLowerCase().includes(search.toLowerCase())
                )
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
        // Transform group data to match modal's expected structure
        let order = 1; // Default fallback
        
        // Try to extract order from groupName, handle both "Group A" format and "No Group"
        if (group.groupName && group.groupName !== 'No Group') {
            const orderMatch = group.groupName.match(/Group ([A-Z])/);
            if (orderMatch && orderMatch[1]) {
                order = orderMatch[1].charCodeAt(0) - 64; // Convert A=1, B=2, etc.
            }
        } else if (group.isDefault) {
            order = 999; // Default groups have order 999
        }
        
        const transformedGroup = {
            id: group.id,
            name: group.groupName,
            labId: group.labId,
            labName: group.labName,
            capacity: group.totalCapacity,
            order: order,
            isDefault: group.isDefault,
        };
        setEditingGroup(transformedGroup);
        setIsCreateGroupModalOpen(true);
    };

    const handleDeleteGroup = (group: any) => {
        setDeleteConfirmGroup(group);
    };

    const confirmDelete = () => {
        if (deleteConfirmGroup) {
            deleteMutation.mutate({ id: deleteConfirmGroup.id });
        }
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

    // Helper functions for reordering groups
    const handleMoveGroupUp = (group: any) => {
        const nonDefaultGroups = filteredGroups.filter(g => !g.isDefault);
        const currentIndex = nonDefaultGroups.findIndex(g => g.id === group.id);
        
        if (currentIndex > 0) {
            const newOrder = [...nonDefaultGroups];
            [newOrder[currentIndex], newOrder[currentIndex - 1]] = [newOrder[currentIndex - 1], newOrder[currentIndex]];
            
            const groupIds = newOrder.map(g => g.id);
            reorderMutation.mutate({
                id: courseId!,
                data: { groupIds }
            });
        }
    };

    const handleMoveGroupDown = (group: any) => {
        const nonDefaultGroups = filteredGroups.filter(g => !g.isDefault);
        const currentIndex = nonDefaultGroups.findIndex(g => g.id === group.id);
        
        if (currentIndex < nonDefaultGroups.length - 1) {
            const newOrder = [...nonDefaultGroups];
            [newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]];
            
            const groupIds = newOrder.map(g => g.id);
            reorderMutation.mutate({
                id: courseId!,
                data: { groupIds }
            });
        }
    };

    const canMoveUp = (group: any) => {
        if (group.isDefault) return false;
        const nonDefaultGroups = filteredGroups.filter(g => !g.isDefault);
        const currentIndex = nonDefaultGroups.findIndex(g => g.id === group.id);
        return currentIndex > 0;
    };

    const canMoveDown = (group: any) => {
        if (group.isDefault) return false;
        const nonDefaultGroups = filteredGroups.filter(g => !g.isDefault);
        const currentIndex = nonDefaultGroups.findIndex(g => g.id === group.id);
        return currentIndex < nonDefaultGroups.length - 1;
    };

    // Create courseCode from subjectCode and courseNumber for display
    const courseCode = course ? `${course.subjectCode}${course.courseNumber}` : '';

    return (
        <div className="panel mt-6">
            {/* Warning Banner for Students in Default Group */}
            {(defaultGroupStudents as {count: number})?.count > 0 && (
                <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-start gap-3">
                        <TbAlertTriangle className="text-orange-600 mt-0.5" size={20} />
                        <div className="flex-1">
                            <h3 className="font-medium text-orange-800 mb-1">
                                Students in Default Group
                            </h3>
                            <p className="text-sm text-orange-700 mb-2">
                                There are <strong>{(defaultGroupStudents as {count: number})?.count} students</strong> assigned to the default group. 
                                The default group is intended as a temporary holding group and cannot be assigned to any lab.
                            </p>
                            <p className="text-sm text-orange-600">
                                Please create proper groups for these students or fix device issues to increase capacity in existing groups.
                            </p>
                        </div>
                    </div>
                </div>
            )}

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
                            accessor: "groupName",
                            title: "Group Name",
                            render: ({ groupName, isDefault }) => (
                                <div className="flex items-center gap-2">
                                    <div className="font-medium text-secondary">{groupName}</div>
                                    {isDefault && (
                                        <span className="px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-full font-medium">
                                            Default
                                        </span>
                                    )}
                                </div>
                            ),
                        },
                        {
                            accessor: "labName",
                            title: "Lab",
                            render: ({ labName, isDefault }) => (
                                <div className="text-gray-700">
                                    {isDefault && labName === 'No Lab Assigned' ? (
                                        <span className="text-orange-600 font-medium">No Lab Assigned</span>
                                    ) : (
                                        labName
                                    )}
                                </div>
                            ),
                        },
                        {
                            accessor: "weekDay",
                            title: "Day & Time",
                            render: ({ weekDay, timeSlot }) => (
                                <div className="flex flex-col">
                                    <span className="font-medium">{weekDay}</span>
                                    <span className="text-sm text-gray-500">{timeSlot}</span>
                                </div>
                            ),
                        },
                        {
                            accessor: "teachingAssistants",
                            title: "Teaching Assistants",
                            render: ({ teachingAssistants }) => (
                                <div className="flex flex-col">
                                    {teachingAssistants && teachingAssistants.length > 0 ? (
                                        teachingAssistants.map((assistant: string, index: number) => (
                                            <span key={index} className="text-sm text-gray-700">
                                                {assistant}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-sm text-orange-600">No Assistant Assigned</span>
                                    )}
                                </div>
                            ),
                        },
                        {
                            accessor: "currentEnrollment",
                            title: "Students",
                            render: ({ totalCapacity, currentEnrollment, isDefault }) => (
                                <div className="flex items-center gap-2">
                                    <LuUsers size={16} className="text-gray-500" />
                                    <span className={isDefault && currentEnrollment > 0 ? "text-orange-600 font-medium" : ""}>
                                        {currentEnrollment || 0}/{totalCapacity || 0}
                                    </span>
                                    {isDefault && currentEnrollment > 0 && (
                                        <span className="text-xs text-orange-600 ml-1">⚠️</span>
                                    )}
                                </div>
                            ),
                        },
                        {
                            accessor: "actions",
                            title: "Actions",
                            render: (group) => (
                                <div className="flex items-center justify-center gap-1">
                                    {/* Reorder buttons - only for non-default groups */}
                                    {!group.isDefault && (
                                        <>
                                            <button
                                                onClick={() => handleMoveGroupUp(group)}
                                                disabled={!canMoveUp(group) || reorderMutation.isPending}
                                                className={`p-1.5 rounded-md transition-colors ${
                                                    canMoveUp(group) && !reorderMutation.isPending
                                                        ? 'bg-green-100 hover:bg-green-200 text-green-600 hover:text-green-800'
                                                        : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                                                }`}
                                                title="Move Up"
                                            >
                                                <LuArrowUp size={12} />
                                            </button>
                                            <button
                                                onClick={() => handleMoveGroupDown(group)}
                                                disabled={!canMoveDown(group) || reorderMutation.isPending}
                                                className={`p-1.5 rounded-md transition-colors ${
                                                    canMoveDown(group) && !reorderMutation.isPending
                                                        ? 'bg-green-100 hover:bg-green-200 text-green-600 hover:text-green-800'
                                                        : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                                                }`}
                                                title="Move Down"
                                            >
                                                <LuArrowDown size={12} />
                                            </button>
                                        </>
                                    )}
                                    
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
                                    {!group.isDefault && (
                                        <button
                                            onClick={() => handleDeleteGroup(group)}
                                            className="p-2 rounded-md bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-800 transition-colors"
                                            title="Delete Group"
                                        >
                                            <RiDeleteBinLine size={14} />
                                        </button>
                                    )}
                                    {group.isDefault && (
                                        <div 
                                            className="p-2 rounded-md bg-gray-50 text-gray-400 cursor-not-allowed"
                                            title="Default group cannot be deleted"
                                        >
                                            <RiDeleteBinLine size={14} />
                                        </div>
                                    )}
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
                onSuccess={handleCloseModal}
                courseId={courseId!}
                courseName={course?.name || ""}
                groupData={editingGroup}
            />

            {/* Delete Confirmation Modal */}
            {deleteConfirmGroup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Confirm Delete
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Are you sure you want to delete the group "{deleteConfirmGroup.name}"? 
                            This action cannot be undone and all students in this group will be moved to the default group.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteConfirmGroup(null)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={deleteMutation.isPending}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                            >
                                {deleteMutation.isPending ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseGroupsPage; 