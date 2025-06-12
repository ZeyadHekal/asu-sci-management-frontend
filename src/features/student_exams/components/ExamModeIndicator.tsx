import { useExamMode } from '../../../hooks/useExamMode';
import { FiClock, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';

export const ExamModeIndicator = () => {
  const { examModeStatus, loading } = useExamMode();

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading exam status...</span>
        </div>
      </div>
    );
  }

  if (!examModeStatus) return null;

  const { isInExamMode, examStartsIn, examSchedules } = examModeStatus;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'exam_mode_active':
        return 'bg-yellow-100 text-yellow-800';
      case 'started':
        return 'bg-green-100 text-green-800';
      case 'ended':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <FiClock className="w-4 h-4" />;
      case 'exam_mode_active':
        return <FiAlertTriangle className="w-4 h-4" />;
      case 'started':
        return <FiCheckCircle className="w-4 h-4" />;
      case 'ended':
        return <FiCheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <FiAlertTriangle className="w-4 h-4" />;
      default:
        return <FiClock className="w-4 h-4" />;
    }
  };

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').toUpperCase();
  };

  return (
    <div className={`rounded-lg shadow-md p-6 ${isInExamMode ? 'bg-yellow-50 border border-yellow-200' : 'bg-white'}`}>
      {isInExamMode ? (
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <FiAlertTriangle className="w-6 h-6 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-yellow-800">🚨 Exam Mode Active</h3>
              {examStartsIn !== undefined && examStartsIn > 0 ? (
                <p className="text-yellow-700">
                  Exam starts in <span className="font-bold">{examStartsIn} minutes</span>
                </p>
              ) : (
                <p className="text-yellow-700">Exam is in progress</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <FiCheckCircle className="w-6 h-6 text-green-600 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">No Active Exams</h3>
              
            </div>
          </div>
        </div>
      )}
      
      {examSchedules.length > 0 && (
        <div className="mt-6">
          <h4 className="text-base font-semibold text-gray-900 mb-3">Today's Exams:</h4>
          <div className="space-y-3">
            {examSchedules.map((exam) => (
              <div key={exam.eventScheduleId} className="bg-white rounded-lg border p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">{exam.eventName}</h5>
                    {exam.dateTime && (
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(exam.dateTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    )}
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(exam.status)}`}>
                    {getStatusIcon(exam.status)}
                    <span>{formatStatus(exam.status)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 