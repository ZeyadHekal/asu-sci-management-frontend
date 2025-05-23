import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { PiUpload, PiFile, PiTrash, PiEye, PiDownload, PiShuffle, PiUsers } from 'react-icons/pi';
import { toast } from 'react-hot-toast';
import Modal from '../../../ui/modal/Modal';

interface ExamModel {
  id: string;
  name: string;
  version: string;
  description: string;
  fileName: string;
  fileSize: number;
  uploadedAt: Date;
  assignedStudents: number;
  totalStudents: number;
  fileUrl?: string;
}

interface StudentAssignment {
  studentId: string;
  studentName: string;
  seatNo: string;
  examModelId: string;
  examModelVersion: string;
  assignedAt: Date;
}

const ExamModelsManagementPage = () => {
  const [examModels, setExamModels] = useState<ExamModel[]>([]);
  const [studentAssignments, setStudentAssignments] = useState<StudentAssignment[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [showAssignmentsModal, setShowAssignmentsModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  // Form state for exam model details
  const [modelName, setModelName] = useState('');
  const [modelDescription, setModelDescription] = useState('');

  // Mock exam data
  const examInfo = {
    id: 'exam-123',
    name: 'Operating Systems Midterm',
    courseName: 'CS258 - Operating Systems',
    totalStudents: 120,
    scheduledDate: '2024-01-15',
    scheduledTime: '09:00'
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setSelectedFiles(prev => [...prev, ...acceptedFiles]);
    toast.success(`${acceptedFiles.length} file(s) added successfully`);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/zip': ['.zip']
    }
  });

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadModels = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one file');
      return;
    }
    
    if (!modelName.trim()) {
      toast.error('Please enter a model name');
      return;
    }

    setIsUploading(true);
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('examId', examInfo.id);
      formData.append('modelName', modelName);
      formData.append('description', modelDescription);
      
      selectedFiles.forEach((file, index) => {
        formData.append(`models`, file);
      });

      // TODO: Replace with actual API call
      // const response = await examModelsApi.uploadModels(formData);
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful upload
      const newModels: ExamModel[] = selectedFiles.map((file, index) => ({
        id: `model-${Date.now()}-${index}`,
        name: modelName,
        version: `V${index + 1}`,
        description: modelDescription,
        fileName: file.name,
        fileSize: file.size,
        uploadedAt: new Date(),
        assignedStudents: 0,
        totalStudents: examInfo.totalStudents,
        fileUrl: `/files/exam-models/${file.name}`
      }));
      
      setExamModels(prev => [...prev, ...newModels]);
      setSelectedFiles([]);
      setModelName('');
      setModelDescription('');
      setShowUploadModal(false);
      toast.success('Exam models uploaded successfully!');
      
    } catch (error) {
      toast.error('Failed to upload exam models. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRandomAssignment = async () => {
    if (examModels.length === 0) {
      toast.error('Please upload exam models first');
      return;
    }

    setIsAssigning(true);
    
    try {
      // TODO: Replace with actual API call
      // const response = await examModelsApi.assignRandomModels(examInfo.id);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock random assignment
      const mockStudents = Array.from({ length: examInfo.totalStudents }, (_, i) => ({
        id: `student-${i + 1}`,
        name: `Student ${i + 1}`,
        seatNo: `S${String(i + 1).padStart(3, '0')}`
      }));
      
      const assignments: StudentAssignment[] = mockStudents.map(student => {
        const randomModelIndex = Math.floor(Math.random() * examModels.length);
        const selectedModel = examModels[randomModelIndex];
        
        return {
          studentId: student.id,
          studentName: student.name,
          seatNo: student.seatNo,
          examModelId: selectedModel.id,
          examModelVersion: selectedModel.version,
          assignedAt: new Date()
        };
      });
      
      setStudentAssignments(assignments);
      
      // Update assigned students count for each model
      const assignmentCounts = assignments.reduce((acc, assignment) => {
        acc[assignment.examModelId] = (acc[assignment.examModelId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      setExamModels(prev => prev.map(model => ({
        ...model,
        assignedStudents: assignmentCounts[model.id] || 0
      })));
      
      toast.success('Students assigned to exam models successfully!');
      
    } catch (error) {
      toast.error('Failed to assign students. Please try again.');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleDeleteModel = async (modelId: string) => {
    try {
      // TODO: Replace with actual API call
      // await examModelsApi.deleteModel(modelId);
      
      setExamModels(prev => prev.filter(model => model.id !== modelId));
      setStudentAssignments(prev => prev.filter(assignment => assignment.examModelId !== modelId));
      toast.success('Exam model deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete exam model. Please try again.');
    }
  };

  const handleDownloadModel = (model: ExamModel) => {
    // TODO: Implement actual download logic
    toast.success(`Downloading ${model.fileName}...`);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getAssignmentsByModel = (modelId: string) => {
    return studentAssignments.filter(assignment => assignment.examModelId === modelId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exam Models Management</h1>
          <p className="text-gray-600">{examInfo.name} - {examInfo.courseName}</p>
          <p className="text-sm text-gray-500">
            Scheduled: {examInfo.scheduledDate} at {examInfo.scheduledTime} | Total Students: {examInfo.totalStudents}
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <PiUpload className="w-4 h-4" />
            Upload Models
          </button>
          
          {examModels.length > 0 && (
            <>
              <button
                onClick={handleRandomAssignment}
                disabled={isAssigning}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {isAssigning ? (
                  <>Assigning...</>
                ) : (
                  <>
                    <PiShuffle className="w-4 h-4" />
                    Random Assign
                  </>
                )}
              </button>
              
              {studentAssignments.length > 0 && (
                <button
                  onClick={() => setShowAssignmentsModal(true)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <PiUsers className="w-4 h-4" />
                  View Assignments
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Exam Models List */}
      {examModels.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <PiFile className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Exam Models</h3>
          <p className="text-gray-600 mb-4">Upload exam models to get started</p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Upload First Model
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {examModels.map((model) => (
            <div key={model.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{model.name}</h3>
                  <p className="text-sm text-gray-600">{model.version}</p>
                </div>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  {model.assignedStudents}/{model.totalStudents}
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600">
                  <strong>File:</strong> {model.fileName}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Size:</strong> {formatFileSize(model.fileSize)}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Uploaded:</strong> {model.uploadedAt.toLocaleDateString()}
                </p>
                {model.description && (
                  <p className="text-sm text-gray-600">
                    <strong>Description:</strong> {model.description}
                  </p>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownloadModel(model)}
                    className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                    title="Download"
                  >
                    <PiDownload className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => {
                      const assignments = getAssignmentsByModel(model.id);
                      if (assignments.length > 0) {
                        console.log('Model assignments:', assignments);
                        toast.success(`${assignments.length} students assigned to this model`);
                      } else {
                        toast.success('No students assigned to this model yet');
                      }
                    }}
                    className="p-2 bg-green-100 text-green-600 rounded hover:bg-green-200 transition-colors"
                    title="View Assignments"
                  >
                    <PiEye className="w-4 h-4" />
                  </button>
                </div>
                
                <button
                  onClick={() => handleDeleteModel(model.id)}
                  className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                  title="Delete"
                >
                  <PiTrash className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Models Modal */}
      <Modal 
        isOpen={showUploadModal} 
        onClose={() => setShowUploadModal(false)} 
        title="Upload Exam Models"
        size="lg"
      >
        <div className="space-y-6">
          {/* Model Details */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model Name
              </label>
              <input
                type="text"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Midterm Model A"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={modelDescription}
                onChange={(e) => setModelDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Describe this exam model..."
              />
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Exam Model Files
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
              <PiUpload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm mb-1">
                {isDragActive
                  ? 'Drop the files here...'
                  : 'Drag and drop files here, or click to select'
                }
              </p>
              <p className="text-xs text-gray-500">
                PDF, DOC, DOCX, ZIP files supported
              </p>
            </div>
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Files:</h4>
              <div className="space-y-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center gap-2">
                      <PiFile className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{file.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </span>
                      <button
                        onClick={() => handleRemoveFile(index)}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <PiTrash className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowUploadModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              onClick={handleUploadModels}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={isUploading || selectedFiles.length === 0 || !modelName.trim()}
            >
              {isUploading ? 'Uploading...' : 'Upload Models'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Student Assignments Modal */}
      <Modal
        isOpen={showAssignmentsModal}
        onClose={() => setShowAssignmentsModal(false)}
        title="Student Assignments"
        size="xl"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {studentAssignments.length} students have been assigned exam models randomly.
          </p>
          
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left">Student Name</th>
                  <th className="px-4 py-2 text-left">Seat No</th>
                  <th className="px-4 py-2 text-left">Exam Model</th>
                  <th className="px-4 py-2 text-left">Assigned At</th>
                </tr>
              </thead>
              <tbody>
                {studentAssignments.map((assignment, index) => (
                  <tr key={assignment.studentId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-2">{assignment.studentName}</td>
                    <td className="px-4 py-2">{assignment.seatNo}</td>
                    <td className="px-4 py-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {assignment.examModelVersion}
                      </span>
                    </td>
                    <td className="px-4 py-2">{assignment.assignedAt.toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ExamModelsManagementPage; 