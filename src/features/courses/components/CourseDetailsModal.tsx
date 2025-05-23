import { useState, useEffect, useMemo } from "react";
import Modal from "../../../ui/modal/Modal";
import Select from "react-select";
import { MultiValue } from "react-select";
import { useUserControllerGetAllDoctors } from "../../../generated/hooks/usersHooks/useUserControllerGetAllDoctors";
import { useSoftwareControllerGetAll } from "../../../generated/hooks/softwaresHooks/useSoftwareControllerGetAll";
import { useCourseControllerCreate } from "../../../generated/hooks/coursesHooks/useCourseControllerCreate";
import { useCourseControllerUpdate } from "../../../generated/hooks/coursesHooks/useCourseControllerUpdate";
import type { CreateCourseDto } from "../../../generated/types/CreateCourseDto";
import type { UpdateCourseDto } from "../../../generated/types/UpdateCourseDto";
import type { DoctorDto } from "../../../generated/types/DoctorDto";
import type { SoftwareListDto } from "../../../generated/types/SoftwareListDto";
import toast from "react-hot-toast";

interface CourseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  courseToEdit?: {
    id?: string;
    name: string;
    creditHours: number;
    subjectCode: string;
    courseNumber: number;
    hasLab: boolean;
    labDuration: string;
    attendanceMarks: number;
    assignedDoctors?: string[];
    requiredSoftware?: string[];
  } | null;
}

interface DoctorOption {
  value: string;
  label: string;
}

interface SoftwareOption {
  value: string;
  label: string;
}

const CourseDetailsModal = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  courseToEdit 
}: CourseDetailsModalProps) => {
  // Form state
  const [formData, setFormData] = useState<CreateCourseDto>({
    name: "",
    creditHours: 0,
    subjectCode: "",
    courseNumber: 0,
    hasLab: false,
    labDuration: "0:00",
    attendanceMarks: 0,
    doctorIds: [],
    softwareIds: [],
  });

  // Dropdown states
  const [selectedDoctors, setSelectedDoctors] = useState<MultiValue<DoctorOption>>([]);
  const [selectedSoftware, setSelectedSoftware] = useState<MultiValue<SoftwareOption>>([]);

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // API hooks
  const { data: doctorsData, isLoading: isDoctorsLoading } = useUserControllerGetAllDoctors();
  const { data: softwareData, isLoading: isSoftwareLoading } = useSoftwareControllerGetAll();

  const createCourseMutation = useCourseControllerCreate({
    mutation: {
      onSuccess: (response) => {
        toast.success("Course created successfully!");
        onSuccess?.();
        onClose();
      },
      onError: (error: any) => {
        const errorMessage = error?.response?.data?.message || "Failed to create course";
        toast.error(errorMessage);
      },
    },
  });

  const updateCourseMutation = useCourseControllerUpdate({
    mutation: {
      onSuccess: (response) => {
        toast.success("Course updated successfully!");
        onSuccess?.();
        onClose();
      },
      onError: (error: any) => {
        const errorMessage = error?.response?.data?.message || "Failed to update course";
        toast.error(errorMessage);
      },
    },
  });

  // Transform API data to dropdown options
  const doctorOptions: DoctorOption[] = useMemo(() => {
    if (Array.isArray(doctorsData?.data)) {
      return (doctorsData.data as DoctorDto[]).map((doctor: DoctorDto) => ({
        value: doctor.id,
        label: doctor.name,
      }));
    }
    return [];
  }, [doctorsData]);

  const softwareOptions: SoftwareOption[] = useMemo(() => {
    if (Array.isArray(softwareData?.data)) {
      return (softwareData.data as SoftwareListDto[]).map((software: SoftwareListDto) => ({
        value: software.id,
        label: software.name,
      }));
    }
    return [];
  }, [softwareData]);

  // Autofill form when editing
  useEffect(() => {
    if (courseToEdit && isOpen) {
      // Find doctor IDs from names - only if we have doctor options loaded and assigned doctors data
      const doctorIds = doctorOptions.length > 0 && courseToEdit.assignedDoctors?.length 
        ? courseToEdit.assignedDoctors.map(doctorName => {
            const doctor = doctorOptions.find(opt => opt.label === doctorName);
            return doctor?.value;
          }).filter(Boolean) 
        : [];

      // Find software IDs from names - only if we have software options loaded and required software data
      const softwareIds = softwareOptions.length > 0 && courseToEdit.requiredSoftware?.length 
        ? courseToEdit.requiredSoftware.map(softwareName => {
            const software = softwareOptions.find(opt => opt.label === softwareName);
            return software?.value;
          }).filter(Boolean) 
        : [];

      setFormData({
        name: courseToEdit.name,
        creditHours: courseToEdit.creditHours,
        subjectCode: courseToEdit.subjectCode,
        courseNumber: courseToEdit.courseNumber,
        hasLab: courseToEdit.hasLab,
        labDuration: courseToEdit.labDuration,
        attendanceMarks: courseToEdit.attendanceMarks,
        doctorIds: doctorIds as string[],
        softwareIds: softwareIds as string[],
      });

      // Set selected doctors from the found IDs
      const selectedDoctorOptions = doctorOptions.filter(opt => doctorIds.includes(opt.value));
      setSelectedDoctors(selectedDoctorOptions);

      // Set selected software from the found IDs
      const selectedSoftwareOptions = softwareOptions.filter(opt => softwareIds.includes(opt.value));
      setSelectedSoftware(selectedSoftwareOptions);
    } else if (!courseToEdit && isOpen) {
      // Reset form for new course
      setFormData({
        name: "",
        creditHours: 0,
        subjectCode: "",
        courseNumber: 0,
        hasLab: false,
        labDuration: "0:00",
        attendanceMarks: 0,
        doctorIds: [],
        softwareIds: [],
      });
      setSelectedDoctors([]);
      setSelectedSoftware([]);
    }
    setErrors({});
  }, [courseToEdit, isOpen, doctorOptions, softwareOptions]);

  // Update form data when doctor/software selection changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      doctorIds: selectedDoctors.map(doctor => doctor.value),
    }));
  }, [selectedDoctors]);

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      softwareIds: selectedSoftware.map(software => software.value),
    }));
  }, [selectedSoftware]);

  const handleInputChange = (field: keyof CreateCourseDto, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Course name is required";
    }

    if (!formData.subjectCode.trim()) {
      newErrors.subjectCode = "Subject code is required";
    } else if (formData.subjectCode.length !== 4) {
      newErrors.subjectCode = "Subject code must be exactly 4 characters";
    }

    if (!formData.courseNumber || formData.courseNumber <= 0) {
      newErrors.courseNumber = "Course number is required and must be positive";
    }

    if (!formData.creditHours || formData.creditHours <= 0) {
      newErrors.creditHours = "Credit hours is required and must be positive";
    }

    if (!formData.attendanceMarks || formData.attendanceMarks < 0) {
      newErrors.attendanceMarks = "Attendance marks must be 0 or greater";
    }

    if (!formData.labDuration.trim()) {
      newErrors.labDuration = "Lab duration is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      if (courseToEdit?.id) {
        // Update existing course
        const updateData: UpdateCourseDto = {
          name: formData.name,
          creditHours: formData.creditHours,
          subjectCode: formData.subjectCode,
          courseNumber: formData.courseNumber,
          hasLab: formData.hasLab,
          labDuration: formData.labDuration,
          attendanceMarks: formData.attendanceMarks,
          doctorIds: formData.doctorIds,
          softwareIds: formData.softwareIds,
        };
        
        await updateCourseMutation.mutateAsync({
          course_id: courseToEdit.id,
          data: updateData,
        });
      } else {
        // Create new course
        await createCourseMutation.mutateAsync({
          data: formData,
        });
      }
    } catch (error) {
      // Error handling is done in mutation callbacks
    }
  };

  const isLoading = isDoctorsLoading || isSoftwareLoading || createCourseMutation.isPending || updateCourseMutation.isPending;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={courseToEdit ? "Edit Course" : "Add New Course"} 
      size="lg"
    >
      <div className="flex flex-col gap-5 max-h-[70vh] overflow-y-auto">
        {/* Course Name */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="courseName">
            Course Name <span className="text-danger">*</span>
          </label>
          <input
            id="courseName"
            type="text"
            placeholder="Enter Course Name"
            className={`form-input ${errors.name ? 'border-danger' : ''}`}
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            disabled={isLoading}
          />
          {errors.name && <span className="text-xs text-danger">{errors.name}</span>}
        </div>

        {/* Subject Code and Course Number */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="subjectCode">
              Subject Code <span className="text-danger">*</span>
            </label>
            <input
              id="subjectCode"
              type="text"
              placeholder="e.g., COMP"
              className={`form-input ${errors.subjectCode ? 'border-danger' : ''}`}
              value={formData.subjectCode}
              onChange={(e) => handleInputChange("subjectCode", e.target.value.toUpperCase())}
              maxLength={4}
              disabled={isLoading}
            />
            {errors.subjectCode && <span className="text-xs text-danger">{errors.subjectCode}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="courseNumber">
              Course Number <span className="text-danger">*</span>
            </label>
            <input
              id="courseNumber"
              type="number"
              placeholder="e.g., 101"
              className={`form-input ${errors.courseNumber ? 'border-danger' : ''}`}
              value={formData.courseNumber || ""}
              onChange={(e) => handleInputChange("courseNumber", parseInt(e.target.value) || 0)}
              disabled={isLoading}
            />
            {errors.courseNumber && <span className="text-xs text-danger">{errors.courseNumber}</span>}
          </div>
        </div>

        {/* Credit Hours and Attendance Marks */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="creditHours">
              Credit Hours <span className="text-danger">*</span>
            </label>
            <input
              id="creditHours"
              type="number"
              placeholder="e.g., 3"
              className={`form-input ${errors.creditHours ? 'border-danger' : ''}`}
              value={formData.creditHours || ""}
              onChange={(e) => handleInputChange("creditHours", parseInt(e.target.value) || 0)}
              disabled={isLoading}
            />
            {errors.creditHours && <span className="text-xs text-danger">{errors.creditHours}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="attendanceMarks">
              Attendance Marks <span className="text-danger">*</span>
            </label>
            <input
              id="attendanceMarks"
              type="number"
              placeholder="e.g., 5"
              className={`form-input ${errors.attendanceMarks ? 'border-danger' : ''}`}
              value={formData.attendanceMarks || ""}
              onChange={(e) => handleInputChange("attendanceMarks", parseInt(e.target.value) || 0)}
              disabled={isLoading}
            />
            {errors.attendanceMarks && <span className="text-xs text-danger">{errors.attendanceMarks}</span>}
          </div>
        </div>

        {/* Has Lab and Lab Duration */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="hasLab">Course Type</label>
            <Select
              id="hasLab"
              options={[
                { value: false, label: "Theory" },
                { value: true, label: "Practical (Has Lab)" },
              ]}
              placeholder="Select Course Type"
              classNamePrefix="react-select"
              value={
                formData.hasLab !== undefined
                  ? { value: formData.hasLab, label: formData.hasLab ? "Practical (Has Lab)" : "Theory" }
                  : null
              }
              onChange={(selectedOption) => handleInputChange("hasLab", selectedOption?.value || false)}
              isDisabled={isLoading}
              menuPortalTarget={document.body}
              styles={{
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                menu: (base) => ({ ...base, zIndex: 9999 }),
              }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="labDuration">
              Lab Duration <span className="text-danger">*</span>
            </label>
            <input
              id="labDuration"
              type="text"
              placeholder="e.g., 2:00"
              className={`form-input ${errors.labDuration ? 'border-danger' : ''}`}
              value={formData.labDuration}
              onChange={(e) => handleInputChange("labDuration", e.target.value)}
              disabled={isLoading}
            />
            {errors.labDuration && <span className="text-xs text-danger">{errors.labDuration}</span>}
          </div>
        </div>

        {/* Assigned Doctors */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="assignedDoctors">Assigned Doctors</label>
          <Select
            id="assignedDoctors"
            options={doctorOptions}
            placeholder={isDoctorsLoading ? "Loading doctors..." : "Select doctors"}
            isMulti
            classNamePrefix="react-select"
            value={selectedDoctors}
            onChange={(selectedOptions) => setSelectedDoctors(selectedOptions)}
            isDisabled={isLoading || isDoctorsLoading}
            isLoading={isDoctorsLoading}
            menuPortalTarget={document.body}
            styles={{
              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              menu: (base) => ({ ...base, zIndex: 9999 }),
              control: (base) => ({ ...base, minHeight: '42px' }),
            }}
          />
          <p className="text-xs text-gray-500">
            Select doctors with TEACH_COURSE privilege who will be assigned to this course.
          </p>
        </div>

        {/* Required Software */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="requiredSoftware">Required Software</label>
          <Select
            id="requiredSoftware"
            options={softwareOptions}
            placeholder={isSoftwareLoading ? "Loading software..." : "Select required software"}
            isMulti
            classNamePrefix="react-select"
            value={selectedSoftware}
            onChange={(selectedOptions) => setSelectedSoftware(selectedOptions)}
            isDisabled={isLoading || isSoftwareLoading}
            isLoading={isSoftwareLoading}
            menuPortalTarget={document.body}
            styles={{
              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              menu: (base) => ({ ...base, zIndex: 9999 }),
              control: (base) => ({ ...base, minHeight: '42px' }),
            }}
          />
          <p className="text-xs text-gray-500">
            Select software that will be required for this course. This affects lab capacity calculations.
          </p>
        </div>

        <p className="text-xs font-semibold text-[#222222]">
          Note: Assigned doctors and required software will be saved with the course.
        </p>
      </div>

      <div className="flex justify-end gap-4 mt-6">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="w-[95px] h-[35px] flex justify-center items-center rounded-md border border-danger text-danger hover:bg-danger hover:text-white transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="min-w-[95px] h-[35px] flex justify-center items-center rounded-md bg-secondary text-white hover:bg-secondary-dark transition-colors disabled:opacity-50 px-4"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>{courseToEdit ? "Updating..." : "Creating..."}</span>
            </div>
          ) : (
            <span>{courseToEdit ? "Update" : "Create"}</span>
          )}
        </button>
      </div>
    </Modal>
  );
};

export default CourseDetailsModal;
