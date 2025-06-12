import { useState, useEffect } from "react";
import Modal from "../../../ui/modal/Modal";
import Select from "react-select";
import { LuInfo, LuCalendar, LuClock, LuUser } from "react-icons/lu";
import { useLabControllerGetAll } from "../../../generated/hooks/labsHooks/useLabControllerGetAll";
import { useCourseGroupControllerCreate } from "../../../generated/hooks/course-groupsHooks/useCourseGroupControllerCreate";
import { useCourseGroupControllerUpdate } from "../../../generated/hooks/course-groupsHooks/useCourseGroupControllerUpdate";
import { useCourseGroupControllerGetAvailableDevicesForLab } from "../../../generated/hooks/course-groupsHooks/useCourseGroupControllerGetAvailableDevicesForLab";
import { useCourseGroupControllerCreateSchedule } from "../../../generated/hooks/course-groupsHooks/useCourseGroupControllerCreateSchedule";
import { useUserControllerGetAllAssistants } from "../../../generated/hooks/usersHooks/useUserControllerGetAllAssistants";
import { useUserControllerGetAllStaff } from "../../../generated/hooks/usersHooks/useUserControllerGetAllStaff";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { courseGroupControllerGetPaginatedQueryKey } from "../../../generated/hooks/course-groupsHooks/useCourseGroupControllerGetPaginated";
import { client } from "../../../global/api/apiClient";
import toast from "react-hot-toast";

interface CreateCourseGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    courseId: string;
    courseName: string;
    groupData?: {
        id: string;
        name: string;
        labId?: string;
        labName?: string;
        capacity?: number;
        order: number;
        isDefault: boolean;
    } | null;
}

const CreateCourseGroupModal = ({
    isOpen,
    onClose,
    onSuccess,
    courseId,
    courseName,
    groupData = null
}: CreateCourseGroupModalProps) => {
    const [lab, setLab] = useState<any>(null);
    const [weekDay, setWeekDay] = useState<any>(null);
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [assistant, setAssistant] = useState<any>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const queryClient = useQueryClient();

    // Fetch existing schedule data when editing
    const { data: existingScheduleData } = useQuery({
        queryKey: ['groupSchedule', groupData?.id],
        queryFn: async () => {
            if (!groupData?.id) return null;
            const response = await client({
                method: 'GET',
                url: `/course-groups/${groupData.id}/schedule-table?limit=1`
            });
            return response.data;
        },
        enabled: !!groupData?.id && isOpen
    });

    // Fetch all available labs
    const { data: labsData, isLoading: labsLoading } = useLabControllerGetAll();

    // Fetch assistants and staff
    const { data: assistantsData, isLoading: assistantsLoading } = useUserControllerGetAllAssistants();
    const { data: staffData, isLoading: staffLoading } = useUserControllerGetAllStaff();

    // Fetch available devices for selected lab
    const { 
        data: labCapacityData,
        isLoading: capacityLoading 
    } = useCourseGroupControllerGetAvailableDevicesForLab(
        lab?.value, 
        courseId,
        {
            query: {
                enabled: !!lab?.value && !!courseId
            }
        }
    );

    // Create group mutation
    const createMutation = useCourseGroupControllerCreate({
        mutation: {
            onSuccess: async (response) => {
                toast.success("Group created successfully");
                
                // If schedule data is provided, create it now
                if (assistant && (weekDay || startTime || endTime)) {
                    // Only create schedule if at least one schedule field is filled
                    if (weekDay && startTime && endTime) {
                        try {
                            await scheduleCreateMutation.mutateAsync({
                                data: {
                                    courseGroupId: response.data.id,
                                    assistantId: assistant.value,
                                    weekDay: weekDay.value,
                                    startTime: startTime,
                                    endTime: endTime
                                }
                            });
                            toast.success("Schedule created successfully");
                        } catch (error) {
                            console.error("Schedule creation error:", error);
                            toast.error("Group created but failed to create schedule");
                        }
                    }
                }
                
                queryClient.invalidateQueries({
                    queryKey: courseGroupControllerGetPaginatedQueryKey(),
                });
                onClose();
            },
            onError: (error) => {
                toast.error("Failed to create group");
                console.error("Create error:", error);
            },
        },
    });

    // Update group mutation
    const updateMutation = useCourseGroupControllerUpdate({
        mutation: {
            onSuccess: () => {
                toast.success("Group updated successfully");
                queryClient.invalidateQueries({
                    queryKey: courseGroupControllerGetPaginatedQueryKey(),
                });
                onClose();
            },
            onError: (error) => {
                toast.error("Failed to update group");
                console.error("Update error:", error);
            },
        },
    });

    // Create schedule mutation
    const scheduleCreateMutation = useCourseGroupControllerCreateSchedule();

    // Week day options
    const weekDayOptions = [
        { value: 'Monday', label: 'Monday' },
        { value: 'Tuesday', label: 'Tuesday' },
        { value: 'Wednesday', label: 'Wednesday' },
        { value: 'Thursday', label: 'Thursday' },
        { value: 'Friday', label: 'Friday' },
        { value: 'Saturday', label: 'Saturday' },
        { value: 'Sunday', label: 'Sunday' }
    ];

    // Reset form when modal opens or group data changes
    useEffect(() => {
        if (isOpen) {
            if (groupData) {
                // Edit mode - populate all fields
                if (groupData.labId) {
                    // Find the lab option from the labs data
                    const labsList = Array.isArray(labsData?.data) ? labsData.data : [];
                    const labOption = labsList.find(l => l.id === groupData.labId);
                    if (labOption) {
                        setLab({ value: labOption.id, label: labOption.name });
                    }
                }
                
                // Load existing schedule data for editing
                if (existingScheduleData && (existingScheduleData as any)?.data?.items?.[0]) {
                    const scheduleItem = (existingScheduleData as any).data.items[0];
                    
                    // Set week day
                    if (scheduleItem.weekDay && scheduleItem.weekDay !== 'Not Scheduled') {
                        const weekDayOption = weekDayOptions.find(option => option.value === scheduleItem.weekDay);
                        if (weekDayOption) {
                            setWeekDay(weekDayOption);
                        }
                    }
                    
                    // Set time slots
                    if (scheduleItem.timeSlot && scheduleItem.timeSlot !== 'Not Scheduled') {
                        const [start, end] = scheduleItem.timeSlot.split(' - ');
                        setStartTime(start || "");
                        setEndTime(end || "");
                    }
                    
                    // Set assistant - get the first teaching assistant
                    if (scheduleItem.teachingAssistants && scheduleItem.teachingAssistants.length > 0) {
                        const assistantName = scheduleItem.teachingAssistants[0];
                        // Find assistant in combined list
                        const assistantsList = Array.isArray(assistantsData?.data) ? assistantsData.data : [];
                        const staffList = Array.isArray(staffData?.data) ? staffData.data : [];
                        const allAssistants = [...assistantsList, ...staffList];
                        const assistantMatch = allAssistants.find(a => a.name === assistantName);
                        if (assistantMatch) {
                            setAssistant({ value: assistantMatch.id, label: `${assistantMatch.name} (${assistantMatch.username})` });
                        }
                    }
                } else {
                    // No existing schedule, clear schedule fields
                    setWeekDay(null);
                    setStartTime("");
                    setEndTime("");
                    setAssistant(null);
                }
            } else {
                // Create mode - reset all fields
                setLab(null);
                setWeekDay(null);
                setStartTime("");
                setEndTime("");
                setAssistant(null);
            }
            setErrors({});
        }
    }, [isOpen, groupData, labsData, existingScheduleData, assistantsData, staffData]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        // For non-default groups, lab is required
        if (!groupData?.isDefault && !lab) {
            newErrors.lab = "Lab is required for regular groups";
        }

        // Check lab capacity if lab is selected
        if (lab && labCapacityData?.data && (labCapacityData.data as any).availableDevices === 0) {
            newErrors.lab = "Selected lab has no available devices for this course";
        }

        // Assistant is required
        if (!assistant) {
            newErrors.assistant = "Teaching assistant is required";
        }

        // If any schedule field is filled, validate the schedule logic
        if (weekDay || startTime || endTime) {
            if (startTime && endTime && startTime >= endTime) {
                newErrors.endTime = "End time must be after start time";
            }
            // If one time field is filled, both should be filled
            if ((startTime && !endTime) || (!startTime && endTime)) {
                if (!startTime) newErrors.startTime = "Start time is required when end time is specified";
                if (!endTime) newErrors.endTime = "End time is required when start time is specified";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const getNextGroupOrder = () => {
        // For new groups, the backend will auto-assign the correct order
        // This is just for display purposes
        return 1; // Will be calculated by backend
    };

    const getGroupName = (order: number) => {
        return `Group ${String.fromCharCode(64 + order)}`;
    };

    const handleSubmit = () => {
        if (!validateForm()) {
            return;
        }

        if (groupData) {
            // Update existing group - ensure order is never null
            const orderValue = groupData.order && groupData.order > 0 ? groupData.order : 1;
            
            updateMutation.mutate({
                id: groupData.id,
                data: {
                    courseId: courseId,
                    order: orderValue,
                    labId: lab?.value || undefined,
                    isDefault: groupData.isDefault,
                    capacity: (labCapacityData?.data as any)?.availableDevices || undefined,
                }
            });
        } else {
            // Create new group - order will be calculated automatically by backend
            createMutation.mutate({
                data: {
                    courseId: courseId,
                    order: 1, // Backend will auto-assign the correct order
                    labId: lab?.value || undefined,
                    isDefault: false,
                    capacity: (labCapacityData?.data as any)?.availableDevices || undefined,
                }
            });
        }
    };

    const labsList = Array.isArray(labsData?.data) ? labsData.data : [];
    const labOptions = labsList.map(lab => ({
        value: lab.id,
        label: lab.name
    }));

    // Combine assistants and staff for selection
    const assistantsList = Array.isArray(assistantsData?.data) ? assistantsData.data : [];
    const staffList = Array.isArray(staffData?.data) ? staffData.data : [];
    const allAssistants = [...assistantsList, ...staffList];
    
    const assistantOptions = allAssistants.map(assistant => ({
        value: assistant.id,
        label: `${assistant.name} (${assistant.username})`
    }));

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={groupData ? `Edit Group - ${groupData.name}` : `Create New Group - ${courseName}`}
            size="lg"
        >
            <div className="flex flex-col gap-5">
                {/* Information about Default Group */}
                {!groupData && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                        <div className="flex items-start gap-2">
                            <LuInfo className="text-amber-600 mt-0.5" size={16} />
                            <div className="flex-1">
                                <p className="text-xs text-amber-800">
                                    <strong>Note:</strong> A default group has been automatically created for this course. 
                                    The default group serves as a temporary holding area for students and cannot be assigned to any lab. 
                                    Create additional groups to properly organize students with lab assignments.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Group Information */}
                {groupData ? (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <div className="flex items-start gap-2">
                            <LuInfo className="text-blue-600 mt-0.5" size={16} />
                            <div className="flex-1">
                                <p className="text-xs text-blue-800">
                                    <strong>Group Name:</strong> {groupData.name} (Order: {groupData.order})
                                    {groupData.isDefault && " - This is the default group"}
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                        <div className="flex items-start gap-2">
                            <LuInfo className="text-green-600 mt-0.5" size={16} />
                            <div className="flex-1">
                                <p className="text-xs text-green-800">
                                    <strong>New Group:</strong> Group name will be automatically assigned based on order (e.g., Group A, Group B, etc.)
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Lab Selection */}
                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor="lab"
                        className="font-semibold text-[#0E1726] text-sm"
                    >
                        Lab Assignment {!groupData?.isDefault && <span className="text-danger">*</span>}
                    </label>
                    
                    {groupData?.isDefault ? (
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                            <p className="text-sm text-gray-600">
                                Default groups cannot be assigned to labs. They serve as temporary holding areas for students.
                            </p>
                        </div>
                    ) : (
                        <>
                            <Select
                                id="lab"
                                options={labOptions}
                                placeholder="Select lab"
                                className={`basic-single ${errors.lab ? 'border-danger rounded-md' : ''}`}
                                classNamePrefix="react-select"
                                value={lab}
                                onChange={(selectedOption) => setLab(selectedOption)}
                                isLoading={labsLoading}
                                isDisabled={labsLoading}
                            />
                            {errors.lab && (
                                <p className="text-xs text-danger mt-1">{errors.lab}</p>
                            )}
                            
                            {/* Lab Capacity Information */}
                            {lab && !capacityLoading && labCapacityData?.data && (
                                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                    <div className="flex items-start gap-2">
                                        <LuInfo className="text-blue-600 mt-0.5" size={16} />
                                        <div className="flex-1">
                                            <h4 className="text-sm font-medium text-blue-800 mb-1">
                                                Lab Capacity Information
                                            </h4>
                                            <div className="space-y-1">
                                                <p className="text-xs text-blue-700">
                                                    <strong>Available Devices:</strong> {(labCapacityData.data as any).availableDevices} out of {(labCapacityData.data as any).totalDevices}
                                                </p>
                                                {(labCapacityData.data as any).requiredSoftware?.length > 0 && (
                                                    <p className="text-xs text-blue-700">
                                                        <strong>Required Software:</strong> {(labCapacityData.data as any).requiredSoftware.join(', ')}
                                                    </p>
                                                )}
                                                {(labCapacityData.data as any).availableDevices === 0 && (
                                                    <p className="text-xs text-orange-600 font-medium">
                                                        ⚠️ No devices available in this lab for this course
                                                    </p>
                                                )}
                                                <p className="text-xs text-blue-600">
                                                    Group capacity will be set to: {(labCapacityData.data as any).availableDevices}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {lab && capacityLoading && (
                                <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
                                    <p className="text-xs text-gray-600">Loading capacity information...</p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Schedule Section - Always show for non-default groups */}
                {!groupData?.isDefault && (
                    <div className="border-t pt-4">
                        <div className="flex items-center gap-2 mb-3">
                            <LuCalendar className="text-primary" size={16} />
                            <h4 className="font-medium text-gray-900 text-sm">Schedule Information</h4>
                        </div>

                        <div className="space-y-4 p-4 bg-gray-50 rounded-md border">
                            {/* Teaching Assistant - Required */}
                            <div className="flex flex-col gap-1.5">
                                <label className="font-medium text-[#0E1726] text-sm">
                                    <LuUser className="inline mr-1" size={14} />
                                    Teaching Assistant <span className="text-danger">*</span>
                                </label>
                                <Select
                                    options={assistantOptions}
                                    placeholder="Select teaching assistant"
                                    className={`basic-single ${errors.assistant ? 'border-danger rounded-md' : ''}`}
                                    classNamePrefix="react-select"
                                    value={assistant}
                                    onChange={(selectedOption) => setAssistant(selectedOption)}
                                    isLoading={assistantsLoading || staffLoading}
                                    isDisabled={assistantsLoading || staffLoading}
                                />
                                {errors.assistant && (
                                    <p className="text-xs text-danger mt-1">{errors.assistant}</p>
                                )}
                                
                                {allAssistants.length === 0 && !assistantsLoading && !staffLoading && (
                                    <p className="text-xs text-orange-600">
                                        ⚠️ No assistants found in the system.
                                    </p>
                                )}
                            </div>

                            {/* Week Day - Optional */}
                            <div className="flex flex-col gap-1.5">
                                <label className="font-medium text-[#0E1726] text-sm">
                                    Day of Week
                                </label>
                                <Select
                                    options={weekDayOptions}
                                    placeholder="Select day (optional)"
                                    className={`basic-single ${errors.weekDay ? 'border-danger rounded-md' : ''}`}
                                    classNamePrefix="react-select"
                                    value={weekDay}
                                    onChange={(selectedOption) => setWeekDay(selectedOption)}
                                    isClearable
                                />
                                {errors.weekDay && (
                                    <p className="text-xs text-danger mt-1">{errors.weekDay}</p>
                                )}
                            </div>

                            {/* Time Fields - Optional */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="font-medium text-[#0E1726] text-sm">
                                        <LuClock className="inline mr-1" size={14} />
                                        Start Time
                                    </label>
                                    <input
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        className={`form-input ${errors.startTime ? 'border-danger' : ''}`}
                                        placeholder="Optional"
                                    />
                                    {errors.startTime && (
                                        <p className="text-xs text-danger mt-1">{errors.startTime}</p>
                                    )}
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="font-medium text-[#0E1726] text-sm">
                                        <LuClock className="inline mr-1" size={14} />
                                        End Time
                                    </label>
                                    <input
                                        type="time"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        className={`form-input ${errors.endTime ? 'border-danger' : ''}`}
                                        placeholder="Optional"
                                    />
                                    {errors.endTime && (
                                        <p className="text-xs text-danger mt-1">{errors.endTime}</p>
                                    )}
                                </div>
                            </div>

                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                <div className="flex items-start gap-2">
                                    <LuInfo className="text-yellow-600 mt-0.5" size={16} />
                                    <div className="flex-1">
                                        <p className="text-xs text-yellow-800">
                                            <strong>Schedule Assignment:</strong> The teaching assistant is required for group management. 
                                            Day and time fields are optional and can be set later through schedule management.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-4 mt-6">
                <button
                    onClick={onClose}
                    className="w-[95px] h-[30px] flex justify-center items-center rounded-md border border-danger text-danger"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={createMutation.isPending || updateMutation.isPending || scheduleCreateMutation.isPending}
                    className="w-[95px] h-[30px] flex justify-center items-center rounded-md bg-secondary text-white disabled:opacity-50"
                >
                    {(createMutation.isPending || updateMutation.isPending || scheduleCreateMutation.isPending) ? "Saving..." : "Save"}
                </button>
            </div>
        </Modal>
    );
};

export default CreateCourseGroupModal; 