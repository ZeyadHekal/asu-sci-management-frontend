import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import client from '../../../global/api/apiClient';
import { FiDownload, FiEye, FiAlertCircle } from 'react-icons/fi';

interface ExamModelViewerProps {
  scheduleId: string;
  examStatus: 'scheduled' | 'exam_mode_active' | 'started' | 'ended' | 'cancelled';
}

interface ExamModelResponse {
  examModel: string;
  examModelUrl: string;
}

export const ExamModelViewer = ({ scheduleId, examStatus }: ExamModelViewerProps) => {
  const [examModel, setExamModel] = useState<ExamModelResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if exam model can be accessed
  const canAccessExamModel = examStatus === 'started';

  const fetchExamModel = async () => {
    if (!canAccessExamModel) return;

    setLoading(true);
    setError(null);
    
    try {
      const response = await client<ExamModelResponse>({
        method: 'GET',
        url: `/events/student/${scheduleId}/exam-model`,
      });

      setExamModel(response.data);
      toast.success(`Exam model assigned: ${response.data.examModel}`);
    } catch (error: any) {
      console.error('Failed to fetch exam model:', error);
      
      // Handle specific error cases as mentioned in documentation
      if (error.response?.status === 404) {
        if (error.response.data?.message?.includes('not enrolled')) {
          setError('You are not enrolled in this exam');
        } else if (error.response.data?.message?.includes('No exam model')) {
          setError('Exam model not yet available');
        } else {
          setError('Exam model not found');
        }
      } else {
        setError('Failed to load exam model. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch when exam starts
  useEffect(() => {
    if (canAccessExamModel) {
      fetchExamModel();
    }
  }, [canAccessExamModel, scheduleId]);

  const handleDownload = () => {
    if (examModel?.examModelUrl) {
      window.open(examModel.examModelUrl, '_blank');
    }
  };

  const handleView = () => {
    if (examModel?.examModelUrl) {
      // Open in new tab/window for viewing
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.location.href = examModel.examModelUrl;
      }
    }
  };

  if (!canAccessExamModel) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <FiAlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-800">Exam Model Not Available</h4>
            <p className="text-sm text-yellow-700">
              Exam models will be available when the exam starts.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Your Exam Model</h3>
        {!loading && !error && examModel && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleView}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              <FiEye className="w-4 h-4" />
              View
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
            >
              <FiDownload className="w-4 h-4" />
              Download
            </button>
          </div>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-600">Loading your exam model...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <FiAlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-800">Unable to Load Exam Model</h4>
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={fetchExamModel}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {examModel && !loading && !error && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-green-600 mt-0.5">📋</span>
            <div className="flex-1">
              <h4 className="font-medium text-green-800">
                Assigned Model: {examModel.examModel}
              </h4>
              <p className="text-sm text-green-700 mt-1">
                Your exam model is ready. Click View to open in a new tab or Download to save locally.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 