import { useState, useEffect } from "react";
import Modal from "../../../ui/modal/Modal";
import Select from "react-select";
import { MultiValue } from "react-select";

interface CourseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseToEdit?: {
    id?: number;
    courseCode: string;
    courseName: string;
    courseType: string;
    assignedDoctors: string;
    software: string;
  } | null;
}

const CourseDetailsModal = ({ isOpen, onClose, courseToEdit }: CourseDetailsModalProps) => {
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [courseType, setCourseType] = useState<{
    value: string;
    label: string;
  } | null>(null);
  const [assignedDoctors, setAssignedDoctors] = useState<
    MultiValue<{ value: string; label: string }>
  >([]);
  const [requiredSoftware, setRequiredSoftware] = useState<
    MultiValue<{ value: string; label: string }>
  >([]);

  // Populate form when editing an existing course
  useEffect(() => {
    if (courseToEdit) {
      setCourseName(courseToEdit.courseName);
      setCourseCode(courseToEdit.courseCode);
      setCourseType({
        value: courseToEdit.courseType,
        label: courseToEdit.courseType,
      });
      
      // Split the assigned doctors string into an array if it's a comma-separated list
      const doctorsArray = courseToEdit.assignedDoctors.split(", ");
      const doctorsOptions = doctorsArray.map(doctor => ({
        value: doctor,
        label: doctor
      }));
      setAssignedDoctors(doctorsOptions);

      // If software isn't 'N/A', add it to required software
      if (courseToEdit.software && courseToEdit.software !== "N/A") {
        setRequiredSoftware([{
          value: courseToEdit.software.toLowerCase(),
          label: courseToEdit.software
        }]);
      }
    } else {
      // Reset form when adding a new course
      setCourseName("");
      setCourseCode("");
      setCourseType(null);
      setAssignedDoctors([]);
      setRequiredSoftware([]);
    }
  }, [courseToEdit, isOpen]);

  const handleSubmit = () => {
    // Handle form submission
    const courseData = {
      id: courseToEdit?.id,
      courseName,
      courseCode,
      courseType: courseType?.value,
      assignedDoctors: assignedDoctors.map(doctor => doctor.value).join(", "),
      requiredSoftware: requiredSoftware.map(software => software.value),
    };
    
    console.log(courseData);
    onClose();
  };

  // Options for the Select components
  const doctorOptions = [
    { value: "Dr. Salma Youssef", label: "Dr. Salma Youssef" },
    { value: "Dr. Ahmed Ali", label: "Dr. Ahmed Ali" },
    { value: "Dr. Fatma El-Sayed", label: "Dr. Fatma El-Sayed" },
    { value: "Dr. Omar Khaled", label: "Dr. Omar Khaled" },
    { value: "Dr. Sara Mohamed", label: "Dr. Sara Mohamed" },
    { value: "Dr. Hossam Ibrahim", label: "Dr. Hossam Ibrahim" }
  ];

  const courseTypeOptions = [
    { value: "Practical", label: "Practical" },
    { value: "Theory", label: "Theory" },
  ];

  const softwareOptions = [
    { value: "vscode", label: "Visual Studio Code" },
    { value: "mysql", label: "MySQL" },
    { value: "packet-tracer", label: "Cisco Packet Tracer" },
    { value: "unity", label: "Unity" },
    { value: "android-studio", label: "Android Studio" },
    { value: "python", label: "Python" },
    { value: "r", label: "R" },
    { value: "aws", label: "AWS" },
    { value: "hadoop", label: "Hadoop" },
    { value: "docker", label: "Docker" }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={courseToEdit ? "Edit Course" : "Add New Course"} size="lg">
      <div className="flex flex-col gap-5">
        {/* Course Name */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="courseName">Course Name</label>
          <input
            id="courseName"
            type="text"
            placeholder="Enter Course Name"
            className="form-input"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
          />
        </div>

        {/* Course Code */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="courseCode">Course Code</label>
          <input
            id="courseCode"
            type="text"
            placeholder="Enter Course Code"
            className="form-input"
            value={courseCode}
            onChange={(e) => setCourseCode(e.target.value)}
          />
        </div>

        {/* Course Type */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="courseType">Course Type</label>
          <Select
            id="courseType"
            options={courseTypeOptions}
            placeholder="Select Course Type"
            classNamePrefix="react-select"
            value={courseType}
            onChange={(selectedOption) => setCourseType(selectedOption)}
          />
        </div>

        {/* Assigned Doctors */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="assignedDoctors">Assigned Doctors</label>
          <Select
            id="assignedDoctors"
            options={doctorOptions}
            placeholder="Enter doctors"
            isMulti
            classNamePrefix="react-select"
            value={assignedDoctors}
            onChange={(selectedOptions) => setAssignedDoctors(selectedOptions)}
          />
        </div>

        {/* Required Software */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="requiredSoftware">Required Software</label>
          <Select
            id="requiredSoftware"
            options={softwareOptions}
            placeholder="Select required software"
            isMulti
            classNamePrefix="react-select"
            value={requiredSoftware}
            onChange={(selectedOptions) => setRequiredSoftware(selectedOptions)}
          />
        </div>

        <p className="text-xs font-semibold text-[#222222]">
          The number of students will be added automatically.
        </p>
      </div>

      <div className="flex justify-end gap-4 mt-2">
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

export default CourseDetailsModal;
