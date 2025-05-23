import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { PiDownload, PiUpload, PiFile, PiFileXls, PiUsers, PiCheckCircle, PiWarning } from 'react-icons/pi';
import { toast } from 'react-hot-toast';
import Modal from '../../../ui/modal/Modal';

interface StudentSubmission {
  studentId: string;
  studentName: string;
  seatNo: string;
  submittedFiles: number;
  submissionTime: Date;
  examModel: string;
  hasSubmitted: boolean;
  currentGrade?: number;
}

interface GradeValidationResult {
  isValid: boolean;
  validGrades: Array<{
    studentName: string;
    seatNo: string;
    grade: number;
  }>;
  errors: Array<{
    row: number;
    studentName: string;
    seatNo: string;
    error: string;
  }>;
  warnings: Array<{
    row: number;
    studentName: string;
    message: string;
  }>;
}

const ExamGradingManagementPage = () => {
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [selectedGradeFile, setSelectedGradeFile] = useState<File | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationResult, setValidationResult] = useState<GradeValidationResult | null>(null);

  // Mock exam data
  const examInfo = {
    id: 'exam-123',
    name: 'Operating Systems Midterm',
    courseName: 'CS258 - Operating Systems',
    totalStudents: 120,
    submittedStudents: 95,
    maxGrade: 30,
    conductedDate: '2024-01-15',
    conductedTime: '09:00'
  };

  // Mock submissions data
  const mockSubmissions: StudentSubmission[] = [
    {
      studentId: 'student-1',
      studentName: 'Ahmed Mohamed',
      seatNo: 'S001',
      submittedFiles: 3,
      submissionTime: new Date('2024-01-15T11:45:00'),
      examModel: 'V1',
      hasSubmitted: true,
      currentGrade: undefined
    },
    {
      studentId: 'student-2',
      studentName: 'Fatma Hassan',
      seatNo: 'S002',
      submittedFiles: 2,
      submissionTime: new Date('2024-01-15T11:30:00'),
      examModel: 'V2',
      hasSubmitted: true,
      currentGrade: undefined
    },
    {
      studentId: 'student-3',
      studentName: 'Mohamed Ali',
      seatNo: 'S003',
      submittedFiles: 0,
      submissionTime: new Date(),
      examModel: 'V1',
      hasSubmitted: false,
      currentGrade: undefined
    }
  ];

  // Initialize with mock data
  useState(() => {
    setSubmissions(mockSubmissions);
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedGradeFile(file);
      toast.success('Grade file selected successfully');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    }
  });

  const handleDownloadAllSubmissions = async () => {
    setIsDownloading(true);
    
    try {
      // TODO: Replace with actual API call
      // const response = await examGradingApi.downloadAllSubmissions(examInfo.id);
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock download - in real implementation, this would trigger a file download
      const fileName = `${examInfo.name.replace(/\s+/g, '_')}_Submissions_${new Date().toISOString().split('T')[0]}.zip`;
      
      // Create mock download link
      const link = document.createElement('a');
      link.href = '#'; // In real implementation, this would be the actual file URL
      link.download = fileName;
      link.click();
      
      toast.success('All submissions downloaded successfully!');
      
    } catch (error) {
      toast.error('Failed to download submissions. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadGradeTemplate = async () => {
    try {
      // Create Excel template data
      const templateData = submissions
        .filter(s => s.hasSubmitted)
        .map(submission => ({
          'Student Name': submission.studentName,
          'Seat No': submission.seatNo,
          'Exam Model': submission.examModel,
          'Submission Time': submission.submissionTime.toLocaleString(),
          'Grade (0-30)': '',
          'Comments': ''
        }));

      // TODO: Replace with actual API call to generate Excel file
      // const response = await examGradingApi.generateGradeTemplate(examInfo.id, templateData);
      
      const fileName = `${examInfo.name.replace(/\s+/g, '_')}_Grade_Template_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      // Mock download
      const link = document.createElement('a');
      link.href = '#'; // In real implementation, this would be the actual file URL
      link.download = fileName;
      link.click();
      
      toast.success('Grade template downloaded successfully!');
      
    } catch (error) {
      toast.error('Failed to download grade template. Please try again.');
    }
  };

  const validateGradeFile = async (file: File): Promise<GradeValidationResult> => {
    // TODO: Replace with actual file parsing and validation
    // This would read the Excel/CSV file and validate the data
    
    // Mock validation logic
    const mockValidGrades = [
      { studentName: 'Ahmed Mohamed', seatNo: 'S001', grade: 28 },
      { studentName: 'Fatma Hassan', seatNo: 'S002', grade: 25 }
    ];
    
    const mockErrors = [
      {
        row: 4,
        studentName: 'Unknown Student',
        seatNo: 'S999',
        error: 'Student not found in exam records'
      }
    ];
    
    const mockWarnings = [
      {
        row: 3,
        studentName: 'Mohamed Ali',
        message: 'Student did not submit any files'
      }
    ];

    return {
      isValid: mockErrors.length === 0,
      validGrades: mockValidGrades,
      errors: mockErrors,
      warnings: mockWarnings
    };
  };

  const handleValidateGrades = async () => {
    if (!selectedGradeFile) {
      toast.error('Please select a grade file first');
      return;
    }

    setIsValidating(true);
    
    try {
      const result = await validateGradeFile(selectedGradeFile);
      setValidationResult(result);
      setShowValidationModal(true);
      
      if (result.isValid) {
        toast.success('Grade file validation successful!');
      } else {
        toast.error(`Validation failed with ${result.errors.length} errors`);
      }
      
    } catch (error) {
      toast.error('Failed to validate grade file. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleUploadGrades = async () => {
    if (!validationResult || !validationResult.isValid) {
      toast.error('Please fix validation errors before uploading');
      return;
    }

    setIsUploading(true);
    
    try {
      // TODO: Replace with actual API call
      // await examGradingApi.uploadGrades(examInfo.id, validationResult.validGrades);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update local state with grades
      setSubmissions(prev => prev.map(submission => {
        const gradeEntry = validationResult.validGrades.find(
          g => g.studentName === submission.studentName && g.seatNo === submission.seatNo
        );
        return gradeEntry 
          ? { ...submission, currentGrade: gradeEntry.grade }
          : submission;
      }));
      
      setSelectedGradeFile(null);
      setValidationResult(null);
      setShowValidationModal(false);
      
      toast.success(`Grades uploaded successfully for ${validationResult.validGrades.length} students!`);
      
    } catch (error) {
      toast.error('Failed to upload grades. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exam Grading Management</h1>
          <p className="text-gray-600">{examInfo.name} - {examInfo.courseName}</p>
          <p className="text-sm text-gray-500">
            Conducted: {examInfo.conductedDate} at {examInfo.conductedTime} | 
            Submissions: {examInfo.submittedStudents}/{examInfo.totalStudents} students
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleDownloadAllSubmissions}
            disabled={isDownloading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {isDownloading ? (
              <>Downloading...</>
            ) : (
              <>
                <PiDownload className="w-4 h-4" />
                Download All Submissions
              </>
            )}
          </button>
          
          <button
            onClick={handleDownloadGradeTemplate}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <PiFileXls className="w-4 h-4" />
            Download Grade Template
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <PiUsers className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{examInfo.totalStudents}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <PiCheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Submitted</p>
              <p className="text-2xl font-bold text-gray-900">{examInfo.submittedStudents}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <PiWarning className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-sm text-gray-600">Not Submitted</p>
              <p className="text-2xl font-bold text-gray-900">{examInfo.totalStudents - examInfo.submittedStudents}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <PiFileXls className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Graded</p>
              <p className="text-2xl font-bold text-gray-900">
                {submissions.filter(s => s.currentGrade !== undefined).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grade Upload Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Grades</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Grade File
            </label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <PiFileXls className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm mb-1">
                {isDragActive
                  ? 'Drop the grade file here...'
                  : 'Drag and drop grade file here, or click to select'
                }
              </p>
              <p className="text-xs text-gray-500">
                Excel (.xlsx, .xls) or CSV files supported
              </p>
            </div>
            
            {selectedGradeFile && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <PiFile className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">{selectedGradeFile.name}</span>
                  <span className="text-xs text-gray-500">
                    ({formatFileSize(selectedGradeFile.size)})
                  </span>
                </div>
              </div>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex flex-col justify-center space-y-3">
            <button
              onClick={handleValidateGrades}
              disabled={!selectedGradeFile || isValidating}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition-colors"
            >
              {isValidating ? 'Validating...' : 'Validate Grades'}
            </button>
            
            {validationResult && validationResult.isValid && (
              <button
                onClick={handleUploadGrades}
                disabled={isUploading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {isUploading ? 'Uploading...' : 'Upload Grades'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Student Submissions</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Student Name</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Seat No</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Exam Model</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Files</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Submission Time</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Grade</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {submissions.map((submission, index) => (
                <tr key={submission.studentId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 font-medium text-gray-900">{submission.studentName}</td>
                  <td className="px-6 py-4 text-gray-600">{submission.seatNo}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {submission.examModel}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {submission.hasSubmitted ? submission.submittedFiles : 'No files'}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {submission.hasSubmitted 
                      ? submission.submissionTime.toLocaleString()
                      : 'Not submitted'
                    }
                  </td>
                  <td className="px-6 py-4">
                    {submission.currentGrade !== undefined ? (
                      <span className="font-medium text-green-600">
                        {submission.currentGrade}/{examInfo.maxGrade}
                      </span>
                    ) : (
                      <span className="text-gray-400">Not graded</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {submission.hasSubmitted ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        Submitted
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                        Not Submitted
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Validation Results Modal */}
      <Modal
        isOpen={showValidationModal}
        onClose={() => setShowValidationModal(false)}
        title="Grade Validation Results"
        size="xl"
      >
        {validationResult && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-green-800">Valid Grades</p>
                <p className="text-2xl font-bold text-green-600">{validationResult.validGrades.length}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-red-800">Errors</p>
                <p className="text-2xl font-bold text-red-600">{validationResult.errors.length}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-yellow-800">Warnings</p>
                <p className="text-2xl font-bold text-yellow-600">{validationResult.warnings.length}</p>
              </div>
            </div>

            {/* Errors */}
            {validationResult.errors.length > 0 && (
              <div>
                <h4 className="font-medium text-red-800 mb-2">Errors</h4>
                <div className="space-y-2">
                  {validationResult.errors.map((error, index) => (
                    <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-800">
                        <strong>Row {error.row}:</strong> {error.studentName} ({error.seatNo}) - {error.error}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Warnings */}
            {validationResult.warnings.length > 0 && (
              <div>
                <h4 className="font-medium text-yellow-800 mb-2">Warnings</h4>
                <div className="space-y-2">
                  {validationResult.warnings.map((warning, index) => (
                    <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-sm text-yellow-800">
                        <strong>Row {warning.row}:</strong> {warning.studentName} - {warning.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Valid Grades Preview */}
            {validationResult.validGrades.length > 0 && (
              <div>
                <h4 className="font-medium text-green-800 mb-2">Valid Grades (Preview)</h4>
                <div className="max-h-48 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left">Student Name</th>
                        <th className="px-3 py-2 text-left">Seat No</th>
                        <th className="px-3 py-2 text-left">Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {validationResult.validGrades.map((grade, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-3 py-2">{grade.studentName}</td>
                          <td className="px-3 py-2">{grade.seatNo}</td>
                          <td className="px-3 py-2 font-medium">{grade.grade}/{examInfo.maxGrade}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowValidationModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
              {validationResult.isValid && (
                <button
                  onClick={handleUploadGrades}
                  disabled={isUploading}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {isUploading ? 'Uploading...' : `Upload ${validationResult.validGrades.length} Grades`}
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ExamGradingManagementPage; 