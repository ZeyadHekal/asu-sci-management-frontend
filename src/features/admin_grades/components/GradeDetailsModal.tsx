import { useState } from "react";
import Modal from "../../../ui/modal/Modal";

interface GradeDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GradeDetailsModal = ({ isOpen, onClose }: GradeDetailsModalProps) => {
  const [courseName, setCourseName] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [midtermGrade, setMidtermGrade] = useState("");
  const [finalGrade, setFinalGrade] = useState("");

  const handleSubmit = () => {
    // Handle form submission
    const gradeData = {
      courseName,
      studentName,
      studentId,
      midtermGrade,
      finalGrade,
    };

    console.log(gradeData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Grades Details" size="lg">
      <div className="flex flex-col gap-5">
        {/* Course Name */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="courseName"
            className="font-semibold text-[#0E1726] text-sm"
          >
            Course Name
          </label>
          <input
            id="courseName"
            type="text"
            placeholder="Enter Course Name"
            className="form-input"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
          />
        </div>

        {/* Student Name */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="studentName"
            className="font-semibold text-[#0E1726] text-sm"
          >
            Student Name
          </label>
          <input
            id="studentName"
            type="text"
            placeholder="Enter the Name"
            className="form-input"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
          />
        </div>

        {/* Student ID */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="studentId"
            className="font-semibold text-[#0E1726] text-sm"
          >
            Student ID
          </label>
          <input
            id="studentId"
            type="text"
            placeholder="Enter the ID Number"
            className="form-input"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
          />
        </div>

        {/* Midterm Exam */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="midtermGrade"
            className="font-semibold text-[#0E1726] text-sm"
          >
            Midterm Exam
          </label>
          <div className="flex flex-col gap-1">
            <input
              id="midtermGrade"
              type="text"
              placeholder="Enter the Grade"
              className="form-input"
              value={midtermGrade}
              onChange={(e) => setMidtermGrade(e.target.value)}
            />
            <button className="text-secondary text-xs font-semibold self-start">
              Review and grade the exam
            </button>
          </div>
        </div>

        {/* Final Exam */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="finalGrade"
            className="font-semibold text-[#0E1726] text-sm"
          >
            Final Exam
          </label>
          <div className="flex flex-col gap-1">
            <input
              id="finalGrade"
              type="text"
              placeholder="Enter the Grade"
              className="form-input"
              value={finalGrade}
              onChange={(e) => setFinalGrade(e.target.value)}
            />
            <button className="text-secondary text-xs font-semibold self-start">
              Review and grade the exam
            </button>
          </div>
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

export default GradeDetailsModal;
