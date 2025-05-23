import { useState } from "react";
import Modal from "../../../ui/modal/Modal";
import { DataTable } from "mantine-datatable";
import Select from "react-select";

interface GradeItem {
  id: string;
  type: string;
  name: string;
  score: number;
  maxScore: number;
  date: string;
}

interface StudentGradesModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: {
    id: number;
    name: string;
    studentId: string;
  } | null;
}

const StudentGradesModal = ({
  isOpen,
  onClose,
  student,
}: StudentGradesModalProps) => {
  // State for existing grades
  const [grades, setGrades] = useState<GradeItem[]>([
    {
      id: "1",
      type: "Quiz",
      name: "Quiz 1",
      score: 18,
      maxScore: 20,
      date: "2023-09-15",
    },
    {
      id: "2",
      type: "Assignment",
      name: "Assignment 1",
      score: 24,
      maxScore: 25,
      date: "2023-09-22",
    },
    {
      id: "3",
      type: "Midterm",
      name: "Midterm Exam",
      score: 40,
      maxScore: 50,
      date: "2023-10-20",
    },
    {
      id: "4",
      type: "Quiz",
      name: "Quiz 2",
      score: 16,
      maxScore: 20,
      date: "2023-11-05",
    },
    {
      id: "5",
      type: "Assignment",
      name: "Assignment 2",
      score: 22,
      maxScore: 25,
      date: "2023-11-15",
    },
  ]);

  // States for adding a new grade
  const [isAddingGrade, setIsAddingGrade] = useState(false);
  const [newGradeType, setNewGradeType] = useState<{
    value: string;
    label: string;
  } | null>(null);
  const [newGradeName, setNewGradeName] = useState("");
  const [newGradeScore, setNewGradeScore] = useState("");
  const [newGradeMaxScore, setNewGradeMaxScore] = useState("");

  // Calculate total grades
  const totalScore = grades.reduce((sum, grade) => sum + grade.score, 0);
  const totalMaxScore = grades.reduce((sum, grade) => sum + grade.maxScore, 0);
  const percentage = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;

  const handleAddGrade = () => {
    if (!newGradeType || !newGradeName || !newGradeScore || !newGradeMaxScore) {
      return;
    }

    const newGrade: GradeItem = {
      id: Date.now().toString(),
      type: newGradeType.value,
      name: newGradeName,
      score: Number(newGradeScore),
      maxScore: Number(newGradeMaxScore),
      date: new Date().toISOString().split("T")[0],
    };

    setGrades([...grades, newGrade]);
    
    // Reset form
    setIsAddingGrade(false);
    setNewGradeType(null);
    setNewGradeName("");
    setNewGradeScore("");
    setNewGradeMaxScore("");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const gradeTypeOptions = [
    { value: "Quiz", label: "Quiz" },
    { value: "Assignment", label: "Assignment" },
    { value: "Midterm", label: "Midterm" },
    { value: "Final", label: "Final" },
    { value: "Project", label: "Project" },
    { value: "Practical", label: "Practical" },
    { value: "Participation", label: "Participation" },
  ];

  if (!student) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${student.name}'s Grades`}
      size="lg"
    >
      <div className="flex flex-col gap-6">
        {/* Grade Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-md border">
            <div className="text-gray-500 text-sm">Total Score</div>
            <div className="text-2xl font-semibold text-secondary">
              {totalScore}/{totalMaxScore}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-md border">
            <div className="text-gray-500 text-sm">Percentage</div>
            <div className="text-2xl font-semibold text-secondary">
              {percentage.toFixed(2)}%
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-md border">
            <div className="text-gray-500 text-sm">Assessment Items</div>
            <div className="text-2xl font-semibold text-secondary">
              {grades.length}
            </div>
          </div>
        </div>

        {/* Add Grade Button */}
        <div className="flex justify-end">
          <button
            onClick={() => setIsAddingGrade(!isAddingGrade)}
            className="px-4 py-2 bg-secondary text-white rounded-md text-sm"
          >
            {isAddingGrade ? "Cancel" : "Add Grade"}
          </button>
        </div>

        {/* Add Grade Form */}
        {isAddingGrade && (
          <div className="bg-gray-50 p-4 rounded-md border">
            <h3 className="text-lg font-semibold mb-4">Add New Grade</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="gradeType" className="text-sm font-medium">
                  Grade Type
                </label>
                <Select
                  id="gradeType"
                  options={gradeTypeOptions}
                  value={newGradeType}
                  onChange={setNewGradeType}
                  placeholder="Select type"
                  classNamePrefix="react-select"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="gradeName" className="text-sm font-medium">
                  Grade Name
                </label>
                <input
                  id="gradeName"
                  type="text"
                  value={newGradeName}
                  onChange={(e) => setNewGradeName(e.target.value)}
                  placeholder="e.g. Quiz 3"
                  className="form-input"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="gradeScore" className="text-sm font-medium">
                  Score
                </label>
                <input
                  id="gradeScore"
                  type="number"
                  value={newGradeScore}
                  onChange={(e) => setNewGradeScore(e.target.value)}
                  placeholder="Student's score"
                  className="form-input"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="gradeMaxScore" className="text-sm font-medium">
                  Max Score
                </label>
                <input
                  id="gradeMaxScore"
                  type="number"
                  value={newGradeMaxScore}
                  onChange={(e) => setNewGradeMaxScore(e.target.value)}
                  placeholder="Maximum possible score"
                  className="form-input"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={handleAddGrade}
                className="px-4 py-2 bg-secondary text-white rounded-md text-sm"
              >
                Save Grade
              </button>
            </div>
          </div>
        )}

        {/* Grades Table */}
        <div className="datatables">
          <DataTable
            highlightOnHover
            withBorder
            className="table-hover"
            records={grades}
            columns={[
              {
                accessor: "type",
                title: "Type",
                render: (row) => (
                  <span className="font-medium">{row.type}</span>
                ),
              },
              { accessor: "name", title: "Assessment" },
              {
                accessor: "score",
                title: "Score",
                render: (row) => (
                  <span className="font-medium">
                    {row.score}/{row.maxScore}
                  </span>
                ),
              },
              {
                accessor: "percentage",
                title: "Percentage",
                render: (row) => (
                  <span className="font-medium">
                    {((row.score / row.maxScore) * 100).toFixed(2)}%
                  </span>
                ),
              },
              {
                accessor: "date",
                title: "Date",
                render: (row) => formatDate(row.date),
              },
            ]}
          />
        </div>
      </div>
    </Modal>
  );
};

export default StudentGradesModal; 