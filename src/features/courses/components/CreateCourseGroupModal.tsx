import { useState, useEffect } from "react";
import Modal from "../../../ui/modal/Modal";
import Select from "react-select";
import { LuInfo } from "react-icons/lu";

interface CreateCourseGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    courseId: number;
    courseName: string;
    groupData?: {
        id: number;
        groupName: string;
        lab: string;
        day: string;
        startTime: string;
        endTime: string;
        assistants: string[];
    } | null;
}

// Mock labs data
const labsData = [
    { value: "Lab B2-215", label: "Lab B2-215" },
    { value: "Lab B2-216", label: "Lab B2-216" },
    { value: "Lab B2-217", label: "Lab B2-217" },
    { value: "Lab A1-110", label: "Lab A1-110" },
    { value: "Lab A1-111", label: "Lab A1-111" },
    { value: "Lab A1-112", label: "Lab A1-112" },
    { value: "Lab C3-320", label: "Lab C3-320" }
];

// Mock days data
const daysData = [
    { value: "Saturday", label: "Saturday" },
    { value: "Sunday", label: "Sunday" },
    { value: "Monday", label: "Monday" },
    { value: "Tuesday", label: "Tuesday" },
    { value: "Wednesday", label: "Wednesday" },
    { value: "Thursday", label: "Thursday" }
];

// Mock teaching assistants data
const assistantsData = [
    { value: "TA Ahmed", label: "TA Ahmed" },
    { value: "TA Sara", label: "TA Sara" },
    { value: "TA Mohamed", label: "TA Mohamed" },
    { value: "TA Nour", label: "TA Nour" },
    { value: "TA Khaled", label: "TA Khaled" },
    { value: "TA Heba", label: "TA Heba" },
    { value: "TA Ali", label: "TA Ali" },
    { value: "TA Mariam", label: "TA Mariam" },
    { value: "TA Omar", label: "TA Omar" },
    { value: "TA Amal", label: "TA Amal" },
    { value: "TA Youssef", label: "TA Youssef" },
    { value: "TA Nada", label: "TA Nada" }
];

const CreateCourseGroupModal = ({
    isOpen,
    onClose,
    courseId,
    courseName,
    groupData = null
}: CreateCourseGroupModalProps) => {
    const [groupName, setGroupName] = useState("");
    const [lab, setLab] = useState<any>(null);
    const [day, setDay] = useState<any>(null);
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [assistants, setAssistants] = useState<any[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Reset form when modal opens or group data changes
    useEffect(() => {
        if (isOpen) {
            if (groupData) {
                // Populate form with existing data
                setGroupName(groupData.groupName);
                setLab({ value: groupData.lab, label: groupData.lab });
                setDay({ value: groupData.day, label: groupData.day });
                setStartTime(groupData.startTime);
                setEndTime(groupData.endTime);
                setAssistants(groupData.assistants.map(a => ({ value: a, label: a })));
            } else {
                // Reset form for a new group
                setGroupName("");
                setLab(null);
                setDay(null);
                setStartTime("");
                setEndTime("");
                setAssistants([]);
            }

            setErrors({});
        }
    }, [isOpen, groupData]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!groupName.trim()) {
            newErrors.groupName = "Group name is required";
        }

        if (!lab) {
            newErrors.lab = "Lab is required";
        }

        if (!day) {
            newErrors.day = "Day is required";
        }

        if (!startTime) {
            newErrors.startTime = "Start time is required";
        }

        if (!endTime) {
            newErrors.endTime = "End time is required";
        }

        if (startTime && endTime) {
            const start = new Date(`2000/01/01 ${startTime}`);
            const end = new Date(`2000/01/01 ${endTime}`);

            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                newErrors.timeRange = "Please enter valid time values";
            } else if (start >= end) {
                newErrors.timeRange = "End time must be after start time";
            }
        }

        if (assistants.length === 0) {
            newErrors.assistants = "At least one teaching assistant is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validateForm()) {
            return;
        }

        // In a real app, you would send this data to an API
        const formData = {
            id: groupData ? groupData.id : Math.floor(Math.random() * 1000),
            courseId,
            groupName,
            lab: lab.value,
            day: day.value,
            startTime,
            endTime,
            assistants: assistants.map(a => a.value)
        };

        console.log("Group form data:", formData);

        // Close the modal
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={groupData ? `Edit Group - ${groupData.groupName}` : `Create New Group - ${courseName}`}
            size="lg"
        >
            <div className="flex flex-col gap-5">
                {/* Group Name */}
                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor="groupName"
                        className="font-semibold text-[#0E1726] text-sm"
                    >
                        Group Name <span className="text-danger">*</span>
                    </label>
                    <input
                        id="groupName"
                        type="text"
                        placeholder="e.g., Group A"
                        className={`form-input ${errors.groupName ? 'border-danger' : ''}`}
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                    />
                    {errors.groupName && (
                        <p className="text-xs text-danger mt-1">{errors.groupName}</p>
                    )}
                </div>

                {/* Lab Selection */}
                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor="lab"
                        className="font-semibold text-[#0E1726] text-sm"
                    >
                        Lab <span className="text-danger">*</span>
                    </label>
                    <Select
                        id="lab"
                        options={labsData}
                        placeholder="Select lab"
                        className={`basic-single ${errors.lab ? 'border-danger rounded-md' : ''}`}
                        classNamePrefix="react-select"
                        value={lab}
                        onChange={(selectedOption) => setLab(selectedOption)}
                    />
                    {errors.lab && (
                        <p className="text-xs text-danger mt-1">{errors.lab}</p>
                    )}
                </div>

                {/* Day Selection */}
                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor="day"
                        className="font-semibold text-[#0E1726] text-sm"
                    >
                        Day <span className="text-danger">*</span>
                    </label>
                    <Select
                        id="day"
                        options={daysData}
                        placeholder="Select day"
                        className={`basic-single ${errors.day ? 'border-danger rounded-md' : ''}`}
                        classNamePrefix="react-select"
                        value={day}
                        onChange={(selectedOption) => setDay(selectedOption)}
                    />
                    {errors.day && (
                        <p className="text-xs text-danger mt-1">{errors.day}</p>
                    )}
                </div>

                {/* Time Inputs */}
                <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-[#0E1726] text-sm">
                        Time <span className="text-danger">*</span>
                    </label>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label htmlFor="startTime" className="text-xs text-gray-600">
                                Start Time
                            </label>
                            <input
                                id="startTime"
                                type="time"
                                className={`form-input ${errors.startTime ? 'border-danger' : ''}`}
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                            />
                            {errors.startTime && (
                                <p className="text-xs text-danger mt-1">{errors.startTime}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1">
                            <label htmlFor="endTime" className="text-xs text-gray-600">
                                End Time
                            </label>
                            <input
                                id="endTime"
                                type="time"
                                className={`form-input ${errors.endTime ? 'border-danger' : ''}`}
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                            />
                            {errors.endTime && (
                                <p className="text-xs text-danger mt-1">{errors.endTime}</p>
                            )}
                        </div>
                    </div>

                    {errors.timeRange && (
                        <p className="text-xs text-danger mt-1">{errors.timeRange}</p>
                    )}
                </div>

                {/* Teaching Assistants */}
                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor="assistants"
                        className="font-semibold text-[#0E1726] text-sm"
                    >
                        Teaching Assistants <span className="text-danger">*</span>
                    </label>
                    <Select
                        id="assistants"
                        options={assistantsData}
                        placeholder="Select teaching assistants"
                        className={`basic-multi-select ${errors.assistants ? 'border-danger rounded-md' : ''}`}
                        classNamePrefix="react-select"
                        isMulti
                        value={assistants}
                        onChange={(selectedOptions) => setAssistants(selectedOptions as any)}
                    />
                    {errors.assistants && (
                        <p className="text-xs text-danger mt-1">{errors.assistants}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                        Recommended: 2 TAs per group for better supervision
                    </p>
                </div>
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
                    className="w-[95px] h-[30px] flex justify-center items-center rounded-md bg-secondary text-white"
                >
                    Save
                </button>
            </div>
        </Modal>
    );
};

export default CreateCourseGroupModal; 