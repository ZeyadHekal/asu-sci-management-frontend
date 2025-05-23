import { useState } from "react";
import Modal from "../../../ui/modal/Modal";
import Select, { MultiValue } from "react-select";

interface ExamDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const courseTypeOptions = [
  { value: "Practical", label: "Practical" },
  { value: "Theory", label: "Theory" },
];

const doctorOptions = [
  { value: "Dr. Salma Youssef", label: "Dr. Salma Youssef" },
  { value: "Dr. Ahmed Ali", label: "Dr. Ahmed Ali" },
  { value: "Dr. Fatma El-Sayed", label: "Dr. Fatma El-Sayed" },
];

const ExamDetailsModal = ({ isOpen, onClose }: ExamDetailsModalProps) => {
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [courseType, setCourseType] = useState<{
    value: string;
    label: string;
  } | null>(null);
  const [numberOfQuestions, setNumberOfQuestions] = useState("");
  const [location, setLocation] = useState("");
  const [assignedDoctors, setAssignedDoctors] = useState<
    MultiValue<{ value: string; label: string }>
  >([]);

  const handleSubmit = () => {
    // Handle form submission
    console.log({
      courseName,
      courseCode,
      courseType,
      numberOfQuestions,
      location,
      assignedDoctors,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Exam Details" size="lg">
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

        {/* Number of Questions */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="numberOfQuestions">Number of Questions</label>
          <input
            id="numberOfQuestions"
            type="number"
            placeholder="Enter Number of Questions"
            className="form-input"
            value={numberOfQuestions}
            onChange={(e) => setNumberOfQuestions(e.target.value)}
          />
        </div>

        {/* Location */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="location">Location</label>
          <input
            id="location"
            type="text"
            placeholder="Enter Location"
            className="form-input"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        {/* Assigned Doctors */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="assignedDoctors">Assigned Doctors</label>
          <Select
            id="assignedDoctors"
            options={doctorOptions}
            placeholder="Select Assigned Doctors"
            isMulti
            classNamePrefix="react-select"
            value={assignedDoctors}
            onChange={(selectedOptions) => setAssignedDoctors(selectedOptions)}
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

export default ExamDetailsModal;
