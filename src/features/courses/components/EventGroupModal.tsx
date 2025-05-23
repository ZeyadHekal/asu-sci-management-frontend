import { useState, useEffect } from "react";
import { LuX, LuSave, LuCalendar, LuClock } from "react-icons/lu";
import Select from "react-select";
import { EventScheduleDto } from "../../../generated/types/EventScheduleDto";

interface EventGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  group?: (EventScheduleDto & { 
    groupName: string; 
    enrolledStudents: number; 
    capacity: number;
    labName: string;
  }) | null;
  eventId: string;
  courseId: string;
}

// Mock data for labs
const mockLabs = [
  { value: "lab1", label: "Lab A1-110" },
  { value: "lab2", label: "Lab A1-111" },
  { value: "lab3", label: "Lab A1-112" },
  { value: "lab4", label: "Lab B2-201" },
  { value: "lab5", label: "Lab B2-202" },
];

// Mock data for assistants
const mockAssistants = [
  { value: "ta1", label: "TA Ahmed Mohamed" },
  { value: "ta2", label: "TA Sara Ahmed" },
  { value: "ta3", label: "TA Mohamed Ibrahim" },
  { value: "ta4", label: "TA Fatma Ali" },
  { value: "ta5", label: "TA Ali Hassan" },
];

const EventGroupModal = ({ isOpen, onClose, group, eventId, courseId }: EventGroupModalProps) => {
  const [formData, setFormData] = useState({
    groupName: "",
    labId: "",
    dateTime: "",
    assisstantId: "",
    capacity: 25,
    examFiles: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (group) {
      setFormData({
        groupName: group.groupName,
        labId: group.labId,
        dateTime: group.dateTime.toISOString().slice(0, 16), // Format for datetime-local input
        assisstantId: group.assisstantId,
        capacity: group.capacity,
        examFiles: group.examFiles
      });
    } else {
      setFormData({
        groupName: "",
        labId: "",
        dateTime: "",
        assisstantId: "",
        capacity: 25,
        examFiles: ""
      });
    }
    setErrors({});
  }, [group, isOpen]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.groupName.trim()) {
      newErrors.groupName = "Group name is required";
    }
    
    if (!formData.labId) {
      newErrors.labId = "Lab selection is required";
    }
    
    if (!formData.dateTime) {
      newErrors.dateTime = "Date and time are required";
    }
    
    if (!formData.assisstantId) {
      newErrors.assisstantId = "Assistant assignment is required";
    }
    
    if (formData.capacity <= 0) {
      newErrors.capacity = "Capacity must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    // Here you would make API call to create/update event group
    console.log("Saving event group:", formData);
    
    // For now, just close the modal
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {group ? "Edit Event Group" : "Create New Event Group"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <LuX size={24} />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Group Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Group Name
            </label>
            <input
              type="text"
              value={formData.groupName}
              onChange={(e) => handleInputChange("groupName", e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-secondary ${
                errors.groupName ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter group name (e.g., Group A)"
            />
            {errors.groupName && <p className="text-red-500 text-xs mt-1">{errors.groupName}</p>}
          </div>

          {/* Lab Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lab
            </label>
            <Select
              options={mockLabs}
              value={mockLabs.find(lab => lab.value === formData.labId) || null}
              onChange={(selected) => handleInputChange("labId", selected?.value || "")}
              placeholder="Select a lab"
              classNamePrefix="react-select"
              className={errors.labId ? "border-red-500" : ""}
            />
            {errors.labId && <p className="text-red-500 text-xs mt-1">{errors.labId}</p>}
          </div>

          {/* Date and Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date & Time
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                value={formData.dateTime}
                onChange={(e) => handleInputChange("dateTime", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-secondary ${
                  errors.dateTime ? "border-red-500" : "border-gray-300"
                }`}
              />
              <LuCalendar size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            {errors.dateTime && <p className="text-red-500 text-xs mt-1">{errors.dateTime}</p>}
          </div>

          {/* Assistant Assignment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teaching Assistant
            </label>
            <Select
              options={mockAssistants}
              value={mockAssistants.find(ta => ta.value === formData.assisstantId) || null}
              onChange={(selected) => handleInputChange("assisstantId", selected?.value || "")}
              placeholder="Select a teaching assistant"
              classNamePrefix="react-select"
              className={errors.assisstantId ? "border-red-500" : ""}
            />
            {errors.assisstantId && <p className="text-red-500 text-xs mt-1">{errors.assisstantId}</p>}
          </div>

          {/* Capacity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Capacity
            </label>
            <input
              type="number"
              value={formData.capacity}
              onChange={(e) => handleInputChange("capacity", parseInt(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-secondary ${
                errors.capacity ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Maximum number of students"
              min="1"
            />
            {errors.capacity && <p className="text-red-500 text-xs mt-1">{errors.capacity}</p>}
          </div>

          {/* Exam Files */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Exam Files
            </label>
            <input
              type="text"
              value={formData.examFiles}
              onChange={(e) => handleInputChange("examFiles", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
              placeholder="Exam files path or URL (optional)"
            />
            <p className="text-xs text-gray-500 mt-1">
              Path to exam files specific to this group
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary-dark transition-colors"
          >
            <LuSave size={16} />
            {group ? "Update Group" : "Create Group"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventGroupModal; 