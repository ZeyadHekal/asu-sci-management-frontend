import { useState } from "react";
import EnhancedExamDetailsModal from "../components/EnhancedExamDetailsModal";
import { useAuthStore } from "../../../store/authStore";
import { EnhancedExamDto } from "../types/examTypes";
import { PiPlay, PiPause, PiStop, PiEye } from 'react-icons/pi';

const exams = [
  {
    id: 1,
    course: "Operating System",
    code: "CS258",
    type: "1st Term, Mid Term Exam",
    location: "In Campus",
    date: "30-04-2025",
    duration: "2 Hours",
    time: "11:00 AM",
    status: "upcoming",
    totalStudents: 85,
    requiredGroups: 3,
    settings: {
      autoStart: false,
      enableExamMode30MinBefore: true
    }
  },
  {
    id: 2,
    course: "Operating System",
    code: "CS258",
    type: "1st Term, Mid Term Exam",
    location: "In Campus",
    date: "20-04-2025",
    duration: "2 Hours",
    time: "11:00 AM",
    status: "completed",
    totalStudents: 78,
    requiredGroups: 3,
    settings: {
      autoStart: true,
      enableExamMode30MinBefore: true
    }
  },
  {
    id: 3,
    course: "Data Structures",
    code: "CS201",
    type: "Final Exam",
    location: "In Campus",
    date: "05-05-2025",
    duration: "3 Hours",
    time: "09:00 AM",
    status: "scheduled",
    totalStudents: 92,
    requiredGroups: 4,
    settings: {
      autoStart: true,
      enableExamMode30MinBefore: true
    }
  },
];

const AdminExamsPage = () => {
  const [isAddExamModalOpen, setIsAddExamModalOpen] = useState(false);
  const { setExamMode } = useAuthStore();

  const handleExamSave = (examData: Partial<EnhancedExamDto>) => {
    console.log('Saving exam:', examData);
    // TODO: Implement actual API call to save exam
  };

  const handleStartExam = (examId: number) => {
    console.log('Starting exam:', examId);
    // TODO: Implement exam start functionality
  };

  const handleStopExam = (examId: number) => {
    console.log('Stopping exam:', examId);
    // TODO: Implement exam stop functionality
  };

  const handleViewExamDetails = (examId: number) => {
    console.log('Viewing exam details:', examId);
    // TODO: Implement exam details view
  };

  const handleEnterExamMode = () => {
    setExamMode(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      {/* Header with Exam Mode Button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-secondary">Exam Management</h2>
        <div className="flex gap-4">
          <button
            onClick={handleEnterExamMode}
            className="px-4 py-2 rounded-md bg-primary hover:bg-primary/90 text-white font-medium"
          >
            Enter Exam Mode
          </button>
          <button
            className="self-start h-10 p-3 rounded-lg bg-secondary flex items-center text-white"
            onClick={() => setIsAddExamModalOpen(true)}
          >
            Create New Exam
          </button>
        </div>
      </div>

      {/* Upcoming & Scheduled Exams */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        <div>
          <h3 className="text-lg font-semibold text-secondary mb-4">Active Exams</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {exams
              .filter((exam) => exam.status === "upcoming" || exam.status === "scheduled")
              .map((exam) => (
                <ExamCard key={exam.id} exam={exam} onStart={handleStartExam} onStop={handleStopExam} onView={handleViewExamDetails} />
              ))}
          </div>
        </div>
      </div>

      {/* Completed Exams */}
      <div>
        <h3 className="text-lg font-semibold text-secondary mb-4">Completed Exams</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {exams
            .filter((exam) => exam.status === "completed")
            .map((exam) => (
              <ExamCard key={exam.id} exam={exam} onStart={handleStartExam} onStop={handleStopExam} onView={handleViewExamDetails} />
            ))}
        </div>
      </div>
      
      <EnhancedExamDetailsModal
        isOpen={isAddExamModalOpen}
        onClose={() => setIsAddExamModalOpen(false)}
        onSave={handleExamSave}
      />
    </>
  );
};

function ExamCard({ exam, onStart, onStop, onView }: { 
  exam: (typeof exams)[0]; 
  onStart: (id: number) => void;
  onStop: (id: number) => void;
  onView: (id: number) => void;
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-5 border border-[#A9A9A9]">
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-black">{exam.course}</span>
            <span className="text-[#0E1726] text-base font-semibold">
              ({exam.code})
            </span>
          </div>
          <div className="text-[#939393] font-semibold text-base">
            {exam.type}
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(exam.status)}`}>
              {exam.status.toUpperCase()}
            </span>
            <div className="self-start bg-[#EDFEF8] text-[#42AD8F] rounded-lg px-3 py-1 text-sm font-medium">
              {exam.location}
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => onView(exam.id)}
            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
            title="View Details"
          >
            <PiEye size={16} />
          </button>
          
          {exam.status === 'upcoming' || exam.status === 'scheduled' ? (
            <button 
              onClick={() => onStart(exam.id)}
              className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
              title="Start Exam"
            >
              <PiPlay size={16} />
            </button>
          ) : exam.status === 'in_progress' ? (
            <button 
              onClick={() => onStop(exam.id)}
              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
              title="Stop Exam"
            >
              <PiStop size={16} />
            </button>
          ) : (
            <button className="bg-[#202A33] text-white rounded-lg px-4 py-2">
              Add Grade
            </button>
          )}
        </div>
      </div>

      <hr className="my-3 border-[#A9A9A9]" />
      
      {/* Exam Details Grid */}
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <div className="text-[#939393] text-sm font-semibold">Date:</div>
          <div className="text-black text-sm font-semibold">{exam.date}</div>
        </div>
        <div>
          <div className="text-[#939393] text-sm font-semibold">Time:</div>
          <div className="text-black text-sm font-semibold">{exam.time}</div>
        </div>
        <div>
          <div className="text-[#939393] text-sm font-semibold">Duration:</div>
          <div className="text-black text-sm font-semibold">{exam.duration}</div>
        </div>
        <div>
          <div className="text-[#939393] text-sm font-semibold">Students:</div>
          <div className="text-black text-sm font-semibold">{exam.totalStudents}</div>
        </div>
      </div>

      {/* Group Information */}
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Groups Required:</span>
          <span className="font-semibold">{exam.requiredGroups}</span>
        </div>
        <div className="flex justify-between items-center text-sm mt-1">
          <span className="text-gray-600">Auto Start:</span>
          <span className="font-semibold">{exam.settings.autoStart ? 'Yes' : 'No'}</span>
        </div>
      </div>
    </div>
  );
}

export default AdminExamsPage;
