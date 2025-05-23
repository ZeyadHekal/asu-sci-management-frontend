import { useState } from "react";
import Modal from "../../../ui/modal/Modal";
import Select, { MultiValue } from "react-select";
import ExamGroupCalculator from "./ExamGroupCalculator";
import { ExamSettings, GroupCalculationResult, EnhancedExamDto } from "../types/examTypes";

interface EnhancedExamDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (examData: Partial<EnhancedExamDto>) => void;
  initialData?: Partial<EnhancedExamDto>;
}

const courseOptions = [
  { value: "CS258", label: "Operating System (CS258)" },
  { value: "CS201", label: "Data Structures (CS201)" },
  { value: "CS301", label: "Database Systems (CS301)" },
];

const doctorOptions = [
  { value: "Dr. Salma Youssef", label: "Dr. Salma Youssef" },
  { value: "Dr. Ahmed Ali", label: "Dr. Ahmed Ali" },
  { value: "Dr. Fatma El-Sayed", label: "Dr. Fatma El-Sayed" },
];

const EnhancedExamDetailsModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData 
}: EnhancedExamDetailsModalProps) => {
  const [examName, setExamName] = useState(initialData?.name || "");
  const [selectedCourse, setSelectedCourse] = useState<{value: string; label: string} | null>(null);
  const [duration, setDuration] = useState(initialData?.duration || 120);
  const [degree, setDegree] = useState(initialData?.degree || 100);
  const [isInLab, setIsInLab] = useState(initialData?.isInLab || false);
  const [examFiles, setExamFiles] = useState<File[]>([]);
  const [assignedDoctors, setAssignedDoctors] = useState<MultiValue<{ value: string; label: string }>>([]);
  
  // Exam Settings
  const [examSettings, setExamSettings] = useState<ExamSettings>({
    autoStart: false,
    enableExamMode30MinBefore: true,
    allowEarlyAccess: false,
    lockdownBrowserRequired: false,
    ...initialData?.settings
  });

  const [groupCalculation, setGroupCalculation] = useState<GroupCalculationResult | null>(null);
  const [showGroupCalculator, setShowGroupCalculator] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setExamFiles(files);
  };

  const handleGroupCalculationComplete = (result: GroupCalculationResult) => {
    setGroupCalculation(result);
  };

  const handleSubmit = () => {
    const examData: Partial<EnhancedExamDto> = {
      name: examName,
      duration,
      degree,
      isExam: true,
      isInLab,
      courseId: selectedCourse?.value || "",
      examFiles: examFiles.map(f => f.name).join(", "),
      settings: examSettings,
      totalStudents: groupCalculation?.totalStudents || 0,
      requiredLabs: groupCalculation?.availableLabs.length || 0,
      status: 'draft'
    };

    onSave(examData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create/Edit Exam" size="xl">
      <div className="flex flex-col gap-6 max-h-[80vh] overflow-y-auto">
        {/* Basic Exam Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="examName">Exam Name</label>
            <input
              id="examName"
              type="text"
              placeholder="Enter Exam Name"
              className="form-input"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="course">Course</label>
            <Select
              id="course"
              options={courseOptions}
              placeholder="Select Course"
              classNamePrefix="react-select"
              value={selectedCourse}
              onChange={(selectedOption) => setSelectedCourse(selectedOption)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="duration">Duration (minutes)</label>
            <input
              id="duration"
              type="number"
              placeholder="Enter Duration"
              className="form-input"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="degree">Total Degree</label>
            <input
              id="degree"
              type="number"
              placeholder="Enter Total Degree"
              className="form-input"
              value={degree}
              onChange={(e) => setDegree(Number(e.target.value))}
            />
          </div>
        </div>

        {/* Lab Exam Toggle */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isInLab"
            checked={isInLab}
            onChange={(e) => setIsInLab(e.target.checked)}
            className="form-checkbox"
          />
          <label htmlFor="isInLab" className="text-sm font-medium">
            This is a lab-based exam (requires group allocation)
          </label>
        </div>

        {/* Exam Settings */}
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-3">Exam Settings</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="autoStart"
                checked={examSettings.autoStart}
                onChange={(e) => setExamSettings(prev => ({ ...prev, autoStart: e.target.checked }))}
                className="form-checkbox"
              />
              <label htmlFor="autoStart" className="text-sm">Auto-start exam at scheduled time</label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="examMode30Min"
                checked={examSettings.enableExamMode30MinBefore}
                onChange={(e) => setExamSettings(prev => ({ ...prev, enableExamMode30MinBefore: e.target.checked }))}
                className="form-checkbox"
              />
              <label htmlFor="examMode30Min" className="text-sm">Enable exam mode 30 minutes before</label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="allowEarlyAccess"
                checked={examSettings.allowEarlyAccess}
                onChange={(e) => setExamSettings(prev => ({ ...prev, allowEarlyAccess: e.target.checked }))}
                className="form-checkbox"
              />
              <label htmlFor="allowEarlyAccess" className="text-sm">Allow early access to exam</label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="lockdownBrowser"
                checked={examSettings.lockdownBrowserRequired}
                onChange={(e) => setExamSettings(prev => ({ ...prev, lockdownBrowserRequired: e.target.checked }))}
                className="form-checkbox"
              />
              <label htmlFor="lockdownBrowser" className="text-sm">Require lockdown browser</label>
            </div>
          </div>

          {/* Start/End Time for Auto Start */}
          {examSettings.autoStart && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="startTime">Start Time</label>
                <input
                  id="startTime"
                  type="datetime-local"
                  className="form-input"
                  value={examSettings.startTime ? new Date(examSettings.startTime).toISOString().slice(0, 16) : ''}
                  onChange={(e) => setExamSettings(prev => ({ 
                    ...prev, 
                    startTime: e.target.value ? new Date(e.target.value) : undefined 
                  }))}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="endTime">End Time</label>
                <input
                  id="endTime"
                  type="datetime-local"
                  className="form-input"
                  value={examSettings.endTime ? new Date(examSettings.endTime).toISOString().slice(0, 16) : ''}
                  onChange={(e) => setExamSettings(prev => ({ 
                    ...prev, 
                    endTime: e.target.value ? new Date(e.target.value) : undefined 
                  }))}
                />
              </div>
            </div>
          )}
        </div>

        {/* Exam Files Upload */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="examFiles">Exam Files</label>
          <input
            id="examFiles"
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.zip"
            className="form-input"
            onChange={handleFileUpload}
          />
          {examFiles.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-gray-600">Selected files:</p>
              <ul className="list-disc list-inside text-sm text-gray-700">
                {examFiles.map((file, index) => (
                  <li key={index}>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</li>
                ))}
              </ul>
            </div>
          )}
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

        {/* Group Calculator for Lab Exams */}
        {isInLab && (
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold text-gray-800">Group Allocation</h4>
              <button
                type="button"
                onClick={() => setShowGroupCalculator(!showGroupCalculator)}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
              >
                {showGroupCalculator ? 'Hide Calculator' : 'Show Calculator'}
              </button>
            </div>
            
            {showGroupCalculator && selectedCourse && (
              <ExamGroupCalculator
                courseId={selectedCourse.value}
                onCalculationComplete={handleGroupCalculationComplete}
              />
            )}

            {groupCalculation && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <h5 className="font-medium text-green-800 mb-2">Group Calculation Summary:</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div>
                    <span className="text-green-700">Students:</span>
                    <span className="font-medium ml-1">{groupCalculation.totalStudents}</span>
                  </div>
                  <div>
                    <span className="text-green-700">Groups:</span>
                    <span className="font-medium ml-1">{groupCalculation.requiredGroups}</span>
                  </div>
                  <div>
                    <span className="text-green-700">Labs:</span>
                    <span className="font-medium ml-1">{groupCalculation.availableLabs.length}</span>
                  </div>
                  <div>
                    <span className="text-green-700">Per Group:</span>
                    <span className="font-medium ml-1">{groupCalculation.studentsPerGroup}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!examName || !selectedCourse}
          className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save Exam
        </button>
      </div>
    </Modal>
  );
};

export default EnhancedExamDetailsModal; 