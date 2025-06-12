import { useState, useEffect } from "react";
import { LuX, LuSave } from "react-icons/lu";
import { EventDto } from "../../../generated/types/EventDto";
import { CreateEventDto } from "../../../generated/types/CreateEventDto";
import { useEventControllerCreate } from "../../../generated/hooks/eventsHooks/useEventControllerCreate";
import { useEventControllerUpdate } from "../../../generated/hooks/eventsHooks/useEventControllerUpdate";
import toast from "react-hot-toast";

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  event: EventDto | null;
  courseId: string;
}

const EventDetailsModal = ({ isOpen, onClose, onSuccess, event, courseId }: EventDetailsModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    duration: 60,
    isExam: false,
    isInLab: false,
    examFiles: "",
    degree: 0,
    autoStart: false,
    examModeStartMinutes: 30
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // API hooks
  const createEventMutation = useEventControllerCreate({
    mutation: {
      onSuccess: () => {
        toast.success("Event created successfully!");
        onSuccess?.();
        onClose();
      },
      onError: (error: any) => {
        toast.error("Failed to create event");
      },
    },
  });

  const updateEventMutation = useEventControllerUpdate({
    mutation: {
      onSuccess: () => {
        toast.success("Event updated successfully!");
        onSuccess?.();
        onClose();
      },
      onError: (error: any) => {
        toast.error("Failed to update event");
      },
    },
  });

  useEffect(() => {
    if (event) {
      setFormData({
        name: event.name,
        duration: event.duration,
        isExam: event.isExam,
        isInLab: event.isInLab,
        examFiles: event.examFiles,
        degree: event.degree,
        autoStart: event.autoStart,
        examModeStartMinutes: event.examModeStartMinutes
      });
    } else {
      setFormData({
        name: "",
        duration: 60,
        isExam: false,
        isInLab: false,
        examFiles: "",
        degree: 0,
        autoStart: false,
        examModeStartMinutes: 30
      });
    }
    setErrors({});
  }, [event, isOpen]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Event name is required";
    }
    
    if (formData.duration <= 0) {
      newErrors.duration = "Duration must be greater than 0";
    }
    
    if (formData.degree < 0) {
      newErrors.degree = "Degree cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const eventData: CreateEventDto = {
      name: formData.name,
      duration: formData.duration,
      eventType: formData.isExam ? 'exam' : 'assignment',
      locationType: formData.isInLab ? 'lab_devices' : 'online',
      hasMarks: formData.degree > 0,
      totalMarks: formData.degree > 0 ? formData.degree : undefined,
      requiresModels: false,
      allowRandomModelAssignment: false,
      courseId: courseId,
      autoStart: formData.autoStart,
      examModeStartMinutes: formData.examModeStartMinutes
    };

    try {
      if (event) {
        // Update existing event
        await updateEventMutation.mutateAsync({
          event_id: event.id,
          data: eventData
        });
      } else {
        // Create new event
        await createEventMutation.mutateAsync({
          data: eventData
        });
      }
    } catch (error) {
      // Error handling is done in mutation callbacks
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {event ? "Edit Event" : "Create New Event"}
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
          {/* Event Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-secondary ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter event name"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => handleInputChange("duration", parseInt(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-secondary ${
                errors.duration ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Duration in minutes"
              min="1"
            />
            {errors.duration && <p className="text-red-500 text-xs mt-1">{errors.duration}</p>}
          </div>

          {/* Event Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Type
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={!formData.isExam}
                  onChange={() => handleInputChange("isExam", false)}
                  className="mr-2"
                />
                Assignment
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={formData.isExam}
                  onChange={() => handleInputChange("isExam", true)}
                  className="mr-2"
                />
                Exam
              </label>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={!formData.isInLab}
                  onChange={() => handleInputChange("isInLab", false)}
                  className="mr-2"
                />
                Online
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={formData.isInLab}
                  onChange={() => handleInputChange("isInLab", true)}
                  className="mr-2"
                />
                In Lab
              </label>
            </div>
          </div>

          {/* Marks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Marks
            </label>
            <input
              type="number"
              value={formData.degree}
              onChange={(e) => handleInputChange("degree", parseInt(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-secondary ${
                errors.degree ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Total marks (0 for no marks)"
              min="0"
            />
            {errors.degree && <p className="text-red-500 text-xs mt-1">{errors.degree}</p>}
            <p className="text-xs text-gray-500 mt-1">
              Set to 0 if this event doesn't have marks assigned
            </p>
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
              placeholder="Exam files (optional)"
            />
            <p className="text-xs text-gray-500 mt-1">
              Path or name of exam files if applicable
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
            {event ? "Update Event" : "Create Event"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsModal; 