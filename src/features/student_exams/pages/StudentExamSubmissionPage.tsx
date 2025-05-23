import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { PiUpload, PiFile, PiTrash, PiDownload, PiWarning, PiCheckCircle, PiClock } from 'react-icons/pi';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../../store/authStore';
import { useExamStore } from '../../../store/examStore';
import { useStudentExamModeStatus } from '../../../services/examWebSocketService';

interface SubmittedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  url?: string;
}

interface ExamSubmissionData {
  examId: string;
  examName: string;
  courseName: string;
  timeRemaining: number;
  maxFileSize: number;
  allowedFileTypes: string[];
  submittedFiles: SubmittedFile[];
  canSubmit: boolean;
  isSubmitted: boolean;
}

const StudentExamSubmissionPage = () => {
  const { user } = useAuthStore();
  const { currentExamMode } = useExamStore();
  const { examModeStatus } = useStudentExamModeStatus();
  
  const [files, setFiles] = useState<File[]>([]);
  const [submittedFiles, setSubmittedFiles] = useState<SubmittedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmittingExam, setIsSubmittingExam] = useState(false);
  
  // Mock exam data - would come from API
  const examData: ExamSubmissionData = {
    examId: 'exam-123',
    examName: 'Operating Systems Midterm',
    courseName: 'CS258 - Operating Systems',
    timeRemaining: 85, // minutes
    maxFileSize: 50, // MB
    allowedFileTypes: ['.pdf', '.doc', '.docx', '.zip', '.cpp', '.java', '.py'],
    submittedFiles: submittedFiles,
    canSubmit: true,
    isSubmitted: false
  };

  const processFiles = useCallback((inputFiles: File[]) => {
    const validFiles = inputFiles.filter(file => {
      // Check file size
      if (file.size > examData.maxFileSize * 1024 * 1024) {
        toast.error(`File ${file.name} exceeds maximum size of ${examData.maxFileSize}MB`);
        return false;
      }
      
      // Check file type
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!examData.allowedFileTypes.includes(fileExtension)) {
        toast.error(`File type ${fileExtension} is not allowed`);
        return false;
      }
      
      return true;
    });

    setFiles(prev => [...prev, ...validFiles]);
    
    if (validFiles.length > 0) {
      toast.success(`${validFiles.length} file(s) added successfully`);
    }
  }, [examData.maxFileSize, examData.allowedFileTypes]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: processFiles,
    multiple: true,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/zip': ['.zip'],
      'text/x-c++src': ['.cpp'],
      'text/x-java-source': ['.java'],
      'text/x-python': ['.py']
    }
  });

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadFiles = async () => {
    if (files.length === 0) {
      toast.error('No files selected for upload');
      return;
    }

    setIsUploading(true);
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('examId', examData.examId);
      formData.append('studentId', user?.id || '');
      
      files.forEach((file, index) => {
        formData.append(`files`, file);
      });

      // TODO: Replace with actual API call
      // const response = await studentExamSubmissionApi.uploadFiles(formData);
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful upload
      const newSubmittedFiles: SubmittedFile[] = files.map(file => ({
        id: `file-${Date.now()}-${Math.random()}`,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date(),
        url: `/files/submissions/${file.name}`
      }));
      
      setSubmittedFiles(prev => [...prev, ...newSubmittedFiles]);
      setFiles([]);
      toast.success('Files uploaded successfully!');
      
    } catch (error) {
      toast.error('Failed to upload files. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleReplaceFile = async (fileId: string, newFile: File) => {
    try {
      const formData = new FormData();
      formData.append('examId', examData.examId);
      formData.append('studentId', user?.id || '');
      formData.append('fileId', fileId);
      formData.append('file', newFile);

      // TODO: Replace with actual API call
      // await studentExamSubmissionApi.replaceFile(formData);
      
      // Simulate replacement
      setSubmittedFiles(prev => prev.map(file => 
        file.id === fileId 
          ? { ...file, name: newFile.name, size: newFile.size, type: newFile.type, uploadedAt: new Date() }
          : file
      ));
      
      toast.success('File replaced successfully!');
    } catch (error) {
      toast.error('Failed to replace file. Please try again.');
    }
  };

  const handleDeleteSubmittedFile = async (fileId: string) => {
    try {
      // TODO: Replace with actual API call
      // await studentExamSubmissionApi.deleteFile(fileId);
      
      setSubmittedFiles(prev => prev.filter(file => file.id !== fileId));
      toast.success('File deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete file. Please try again.');
    }
  };

  const handleSubmitExam = async () => {
    if (submittedFiles.length === 0) {
      toast.error('Please upload at least one file before submitting');
      return;
    }

    setIsSubmittingExam(true);
    
    try {
      // TODO: Replace with actual API call
      // await studentExamSubmissionApi.submitExam(examData.examId);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Exam submitted successfully!');
      // Redirect or update UI state
      
    } catch (error) {
      toast.error('Failed to submit exam. Please try again.');
    } finally {
      setIsSubmittingExam(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTimeRemaining = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (!currentExamMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <PiWarning className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Exam Mode Not Active</h2>
          <p className="text-gray-600">You need to be in exam mode to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{examData.examName}</h1>
              <p className="text-gray-600">{examData.courseName}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-lg font-semibold text-red-600">
                <PiClock className="w-5 h-5" />
                <span>{formatTimeRemaining(examData.timeRemaining)} remaining</span>
              </div>
              <p className="text-sm text-gray-500">Student: {user?.name}</p>
            </div>
          </div>
          
          {/* Exam Status */}
          <div className="flex items-center gap-4 text-sm">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
              Exam in Progress
            </span>
            <span className="text-gray-600">
              Max file size: {examData.maxFileSize}MB
            </span>
            <span className="text-gray-600">
              Allowed types: {examData.allowedFileTypes.join(', ')}
            </span>
          </div>
        </div>

        {/* File Upload Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Files</h2>
          
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <PiUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg mb-2">
              {isDragActive
                ? 'Drop the files here...'
                : 'Drag and drop files here, or click to select'
              }
            </p>
            <p className="text-sm text-gray-500">
              Maximum file size: {examData.maxFileSize}MB
            </p>
          </div>

          {/* Selected Files Preview */}
          {files.length > 0 && (
            <div className="mt-6">
              <h3 className="font-medium text-gray-900 mb-3">Selected Files ({files.length})</h3>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <PiFile className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveFile(index)}
                      className="p-1 text-red-500 hover:text-red-700 transition-colors"
                    >
                      <PiTrash className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              
              <button
                onClick={handleUploadFiles}
                disabled={isUploading}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isUploading ? 'Uploading...' : 'Upload Files'}
              </button>
            </div>
          )}
        </div>

        {/* Submitted Files Section */}
        {submittedFiles.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Submitted Files ({submittedFiles.length})
            </h2>
            
            <div className="space-y-3">
              {submittedFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <PiFile className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)} • Uploaded {file.uploadedAt.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept={examData.allowedFileTypes.join(',')}
                      onChange={(e) => {
                        const newFile = e.target.files?.[0];
                        if (newFile) {
                          handleReplaceFile(file.id, newFile);
                        }
                      }}
                      className="hidden"
                      id={`replace-${file.id}`}
                    />
                    <label
                      htmlFor={`replace-${file.id}`}
                      className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 cursor-pointer transition-colors"
                    >
                      Replace
                    </label>
                    <button
                      onClick={() => handleDeleteSubmittedFile(file.id)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Exam Button */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Submit Exam</h3>
              <p className="text-sm text-gray-600">
                Make sure you have uploaded all required files before submitting.
              </p>
            </div>
            
            <button
              onClick={handleSubmitExam}
              disabled={isSubmittingExam || submittedFiles.length === 0}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isSubmittingExam ? (
                <>Submitting...</>
              ) : (
                <>
                  <PiCheckCircle className="w-5 h-5" />
                  Submit Exam
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentExamSubmissionPage; 