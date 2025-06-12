import { useState, useEffect } from 'react';
import { useAuthStore } from '../../../store/authStore';
import { useExamStore } from '../../../store/examStore';
import { useExamWebSocket, useStudentExamModeStatus, useStudentScheduleIds } from '../../../services/examWebSocketService';
import { useExamMode } from '../../../hooks/useExamMode';
import { useEventControllerGetStudentExams } from '../../../generated/hooks/eventsHooks/useEventControllerGetStudentExams';
import { ExamModeIndicator } from '../components/ExamModeIndicator';
import { FileSubmission } from '../components/FileSubmission';
import { ExamModelViewer } from '../components/ExamModelViewer';
import { PiClock, PiCalendar, PiWarning, PiCheckCircle, PiDownload, PiUpload } from 'react-icons/pi';
import { toast } from 'react-hot-toast';
import Modal from '../../../ui/modal/Modal';

interface StudentExam {
  id: string;
  name: string;
  courseName: string;
  courseCode: string;
  date: Date;
  duration: number;
  location: string;
  status: 'upcoming' | 'exam_mode' | 'in_progress' | 'completed';
  hasAccess: boolean;
  examFiles?: string[];
  groupId?: string;
  scheduleId?: string;
  examStatus?: 'scheduled' | 'exam_mode_active' | 'started' | 'ended' | 'cancelled';
}

const StudentExamsPage = () => {
  const { user, examMode } = useAuthStore();
  const examStore = useExamStore();
  const examWS = useExamWebSocket();
  const { examModeStatus, isLoading: statusLoading, refetch: refetchStatus } = useStudentExamModeStatus();
  const { scheduleIds, isLoading: scheduleIdsLoading } = useStudentScheduleIds();
  const { examModeStatus: realtimeExamStatus } = useExamMode(); // Use the new hook for real-time updates
  const { data: studentExams, isLoading: examsLoading, refetch: refetchExams } = useEventControllerGetStudentExams();
  const [exams, setExams] = useState<StudentExam[]>([]);
  const [todayExams, setTodayExams] = useState<StudentExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExamPreparationModal, setShowExamPreparationModal] = useState(false);
  const [selectedExamForPreparation, setSelectedExamForPreparation] = useState<StudentExam | null>(null);
  const [activeExamScheduleId, setActiveExamScheduleId] = useState<string | null>(null);

  useEffect(() => {
    // Initialize exam data from API
    if (studentExams?.data) {
      const transformedExams: StudentExam[] = studentExams.data.map(exam => ({
        id: exam.id,
        name: exam.name,
        courseName: exam.courseName,
        courseCode: exam.courseCode,
        date: new Date(exam.dateTime),
        duration: exam.duration,
        location: exam.location,
        status: exam.status as StudentExam['status'],
        hasAccess: exam.hasAccess,
        examFiles: Array.isArray(exam.examFiles) ? exam.examFiles.flat().filter(f => typeof f === 'string') : [],
        groupId: exam.groupId,
        scheduleId: exam.scheduleId,
        examStatus: exam.status as 'scheduled' | 'exam_mode_active' | 'started' | 'ended' | 'cancelled'
      }));

      setExams(transformedExams);
      
      // Filter today's exams
      const today = new Date();
      const todaysExams = transformedExams.filter(exam => {
        const examDate = new Date(exam.date);
        return examDate.toDateString() === today.toDateString();
      });
      setTodayExams(todaysExams);
    }
    
    setLoading(examsLoading);
  }, [studentExams, examsLoading]);

  // Update exams based on real-time exam mode status
  useEffect(() => {
    if (realtimeExamStatus?.examSchedules) {
      // Convert the exam schedule objects to exam objects
      const apiExams = realtimeExamStatus.examSchedules.map((schedule, index) => ({
        id: schedule.eventScheduleId,
        name: schedule.eventName,
        courseName: 'Course Name', // Would come from API
        courseCode: 'N/A',
        date: schedule.dateTime ? new Date(schedule.dateTime) : new Date(),
        duration: 120, // Would come from API
        location: 'Computer Lab',
        status: getExamStatusFromApiStatus(schedule.status),
        hasAccess: schedule.status === 'started',
        scheduleId: schedule.eventScheduleId,
        examStatus: schedule.status as 'scheduled' | 'exam_mode_active' | 'started' | 'ended' | 'cancelled',
        groupId: `group-${index + 1}`
      }));
      
      if (apiExams.length > 0) {
        setExams(prevExams => {
          // Merge API exams with existing mock data
          const updatedExams = [...prevExams];
          apiExams.forEach(apiExam => {
            const existingIndex = updatedExams.findIndex(exam => exam.scheduleId === apiExam.scheduleId);
            if (existingIndex >= 0) {
              updatedExams[existingIndex] = { ...updatedExams[existingIndex], ...apiExam };
            } else {
              updatedExams.push(apiExam);
            }
          });
          return updatedExams;
        });

        // Set active exam for file submission and model viewing
        const activeExam = apiExams.find(exam => exam.examStatus === 'started' || exam.examStatus === 'exam_mode_active');
        if (activeExam) {
          setActiveExamScheduleId(activeExam.scheduleId!);
        } else if (apiExams.length > 0) {
          setActiveExamScheduleId(apiExams[0].scheduleId!);
        }
      }
    }
  }, [realtimeExamStatus]);

  const getExamStatusFromApiStatus = (apiStatus: string): StudentExam['status'] => {
    switch (apiStatus) {
      case 'scheduled':
        return 'upcoming';
      case 'exam_mode_active':
        return 'exam_mode';
      case 'started':
        return 'in_progress';
      case 'ended':
        return 'completed';
      default:
        return 'upcoming';
    }
  };

  const getExamStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'text-blue-600 bg-blue-50';
      case 'exam_mode': return 'text-yellow-600 bg-yellow-50';
      case 'in_progress': return 'text-green-600 bg-green-50';
      case 'completed': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getExamStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming': return <PiClock className="w-4 h-4" />;
      case 'exam_mode': return <PiWarning className="w-4 h-4" />;
      case 'in_progress': return <PiCheckCircle className="w-4 h-4" />;
      case 'completed': return <PiCheckCircle className="w-4 h-4" />;
      default: return <PiClock className="w-4 h-4" />;
    }
  };

  const formatTimeUntilExam = (examDate: Date) => {
    const now = new Date();
    const diff = examDate.getTime() - now.getTime();
    
    if (diff <= 0) return 'Exam time';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getTimeUntilExam = (examDate: Date) => {
    const now = new Date();
    const diff = examDate.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60)); // Return minutes until exam
  };

  const canEnterExamEarly = (exam: StudentExam) => {
    const minutesUntilExam = getTimeUntilExam(exam.date);
    return minutesUntilExam <= 30 && minutesUntilExam >= 0; // Can enter 30 minutes before
  };

  const handleDownloadExamFiles = (exam: StudentExam) => {
    if (exam.examFiles && exam.hasAccess) {
      console.log('Downloading exam files for:', exam.name);
    }
  };

  const handleEnterExamEarly = (exam: StudentExam) => {
    setSelectedExamForPreparation(exam);
    setShowExamPreparationModal(true);
  };

  const handleConfirmExamEntry = () => {
    if (selectedExamForPreparation) {
      examStore.setExamMode(true);
      toast.success('You have entered exam mode. Please wait for the exam to start.');
      setShowExamPreparationModal(false);
      setSelectedExamForPreparation(null);
    }
  };

  if (loading || statusLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Exams</h1>
        <div className="flex items-center gap-2">
          {examMode && (
            <div className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
              Exam Mode Active
            </div>
          )}
        </div>
      </div>

      {/* Real-time Exam Mode Indicator */}
      <ExamModeIndicator />

      {/* File Submission and Exam Model Section for Active Exams */}
      {activeExamScheduleId && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ExamModelViewer 
            scheduleId={activeExamScheduleId}
            examStatus={(realtimeExamStatus?.examSchedules.find(s => s.eventScheduleId === activeExamScheduleId)?.status as 'scheduled' | 'exam_mode_active' | 'started' | 'ended' | 'cancelled') || 'scheduled'}
          />
          <FileSubmission 
            scheduleId={activeExamScheduleId}
            disabled={!realtimeExamStatus?.examSchedules.find(s => s.eventScheduleId === activeExamScheduleId && (s.status === 'started' || s.status === 'ended'))}
          />
        </div>
      )}

      {/* Exam Notifications */}
      {examWS.activeExamNotifications.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-800 mb-2">Exam Notifications</h3>
          <div className="space-y-2">
            {examWS.activeExamNotifications.map((notification, index) => (
              <div key={index} className="text-sm text-blue-700">
                {notification.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Today's Exams */}
      {todayExams.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Today's Exams</h2>
          <div className="grid gap-4">
            {todayExams.map((exam) => (
              <div key={exam.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{exam.name}</h3>
                    <p className="text-gray-600">{exam.courseName} ({exam.courseCode})</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <PiCalendar className="w-4 h-4" />
                        {exam.date.toLocaleTimeString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <PiClock className="w-4 h-4" />
                        {exam.duration} minutes
                      </div>
                      <span>📍 {exam.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getExamStatusColor(exam.status)}`}>
                      {getExamStatusIcon(exam.status)}
                      {exam.status.replace('_', ' ').toUpperCase()}
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatTimeUntilExam(exam.date)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  {exam.status === 'upcoming' && canEnterExamEarly(exam) && (
                    <button
                      onClick={() => handleEnterExamEarly(exam)}
                      className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-700 transition-colors"
                    >
                      Enter Exam Mode
                    </button>
                  )}
                  
                  {exam.hasAccess && exam.examFiles && (
                    <button
                      onClick={() => handleDownloadExamFiles(exam)}
                      className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      <PiDownload className="w-4 h-4" />
                      Download Files
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Exams */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">All Exams</h2>
        <div className="grid gap-4">
          {exams.map((exam) => (
            <div key={exam.id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{exam.name}</h3>
                  <p className="text-gray-600">{exam.courseName} ({exam.courseCode})</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <PiCalendar className="w-4 h-4" />
                      {exam.date.toLocaleDateString()} {exam.date.toLocaleTimeString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <PiClock className="w-4 h-4" />
                      {exam.duration} minutes
                    </div>
                    <span>📍 {exam.location}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getExamStatusColor(exam.status)}`}>
                    {getExamStatusIcon(exam.status)}
                    {exam.status.replace('_', ' ').toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Exam Preparation Modal */}
      <Modal 
        isOpen={showExamPreparationModal}
        onClose={() => setShowExamPreparationModal(false)}
        title="Enter Exam Mode"
      >
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <PiWarning className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Exam Mode Guidelines</h4>
                <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                  <li>• Ensure you have a stable internet connection</li>
                  <li>• Close all unnecessary applications</li>
                  <li>• Have your student ID ready</li>
                  <li>• Make sure your device is charged</li>
                </ul>
              </div>
            </div>
          </div>

          {selectedExamForPreparation && (
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Exam Details</h3>
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <p><strong>Exam:</strong> {selectedExamForPreparation.name}</p>
                <p><strong>Course:</strong> {selectedExamForPreparation.courseName}</p>
                <p><strong>Duration:</strong> {selectedExamForPreparation.duration} minutes</p>
                <p><strong>Location:</strong> {selectedExamForPreparation.location}</p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowExamPreparationModal(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmExamEntry}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Enter Exam Mode
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StudentExamsPage;
