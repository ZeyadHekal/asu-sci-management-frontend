import { useState, useCallback, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import { FiUpload, FiFolder, FiFile, FiClock, FiCheckCircle, FiAlertCircle, FiDownload, FiTrash2, FiLogOut } from "react-icons/fi";
import { IoIosAddCircleOutline } from "react-icons/io";
import { useAuth } from "../../../global/hooks/useAuth";
import { useExamStore } from "../../../store/examStore";
import { useStudentExamModeStatus } from "../../../services/examWebSocketService";

// Define custom types for file objects
interface FileWithPath extends File {
  path?: string;
}

interface UploadedFile {
  file: File;
  path: string;
  preview?: string;
  type: string;
}

interface ExamFiles {
  name: string;
  url: string;
  size: number;
  type: string;
}

const ExamPage = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [submittedFiles, setSubmittedFiles] = useState<ExamFiles[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [countdown, setCountdown] = useState<number>(0);
  const [examFiles, setExamFiles] = useState<ExamFiles[]>([]);
  const folderInputRef = useRef<HTMLInputElement>(null);
  
  const { user, logout } = useAuth();
  const { examModeStatus } = useExamStore();
  const { examModeStatus: realtimeExamStatus } = useStudentExamModeStatus();

  // Reset all state when user changes to ensure clean slate for new user
  useEffect(() => {
    setFiles([]);
    setSubmittedFiles([]);
    setIsUploading(false);
    setCountdown(0);
    setExamFiles([]);
  }, [user?.id]);

  // Use realtime status if available, fallback to store
  const currentExamStatus = realtimeExamStatus || examModeStatus;

  // Get the current exam schedule (assuming first active exam)
  const currentExam = currentExamStatus?.examSchedules?.[0];
  const examStartTime = currentExam ? new Date(currentExam.dateTime) : null;

  // Determine current exam state
  const getExamState = () => {
    if (!currentExam) return 'no_exam';
    
    const now = new Date();
    const examStart = new Date(currentExam.dateTime);
    const isExamStarted = currentExam.status === 'started';
    const isExamEnded = currentExam.status === 'ended';
    
    if (isExamEnded) return 'ended';
    if (isExamStarted) return 'active';
    if (currentExam.status === 'exam_mode_active') return 'preparation';
    
    return 'waiting';
  };

  const examState = getExamState();

  // Countdown timer
  useEffect(() => {
    if (examState === 'preparation' && examStartTime) {
      const timer = setInterval(() => {
        const now = new Date();
        const timeLeft = Math.max(0, Math.ceil((examStartTime.getTime() - now.getTime()) / 1000));
        setCountdown(timeLeft);
        
        if (timeLeft === 0) {
          clearInterval(timer);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [examState, examStartTime]);

  // Format countdown time
  const formatCountdown = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Load exam files when exam becomes active
  useEffect(() => {
    if (examState === 'active') {
      loadExamFiles();
      loadSubmittedFiles();
    }
  }, [examState]);

  const loadExamFiles = async () => {
    try {
      // Mock exam files - replace with actual API call
      const mockExamFiles: ExamFiles[] = [
        {
          name: "exam-instructions.pdf",
          url: "/api/exam-files/instructions.pdf",
          size: 1024 * 1024,
          type: "application/pdf"
        },
        {
          name: "starter-code.zip",
          url: "/api/exam-files/starter.zip",
          size: 2 * 1024 * 1024,
          type: "application/zip"
        }
      ];
      setExamFiles(mockExamFiles);
    } catch (error) {
      console.error('Failed to load exam files:', error);
      toast.error('Failed to load exam files');
    }
  };

  const loadSubmittedFiles = async () => {
    try {
      // Mock submitted files - replace with actual API call
      setSubmittedFiles([]);
    } catch (error) {
      console.error('Failed to load submitted files:', error);
    }
  };

  const processFiles = useCallback((inputFiles: File[]) => {
    const newFiles = inputFiles.map((file) => {
      const fileWithPath = file as FileWithPath;
      const path = file.webkitRelativePath ?? fileWithPath.path ?? file.name;
      const isImage = file.type.startsWith("image/");
      const preview = isImage ? URL.createObjectURL(file) : undefined;

      return {
        file,
        path,
        preview,
        type: file.type || "application/octet-stream",
      };
    });

    setFiles((prevFiles) => [...prevFiles, ...newFiles]);

    if (newFiles.length > 0) {
      toast.success(`${newFiles.length} file(s) added successfully`);
    }
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    processFiles(acceptedFiles);
  }, [processFiles]);

  const handleFolderUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      processFiles(filesArray);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: false,
    noDrag: false,
    multiple: true,
    disabled: examState !== 'active',
  });

  const handleRemoveFile = (index: number) => {
    setFiles((prevFiles) => {
      if (prevFiles[index].preview) {
        URL.revokeObjectURL(prevFiles[index].preview);
      }
      return prevFiles.filter((_, i) => i !== index);
    });
  };

  const handleSubmitFiles = async () => {
    if (files.length === 0) {
      toast.error("No files selected for submission");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      files.forEach((fileObj) => {
        formData.append("files", fileObj.file, fileObj.path);
      });

      // Add exam context
      formData.append("examScheduleId", currentExam?.eventScheduleId || "");
      formData.append("studentId", user?.id || "");

      // Simulate upload
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Convert to submitted files
      const newSubmittedFiles = files.map(file => ({
        name: file.path,
        url: URL.createObjectURL(file.file),
        size: file.file.size,
        type: file.type
      }));

      setSubmittedFiles(prev => [...prev, ...newSubmittedFiles]);
      
      // Clean up and reset
      files.forEach((file) => {
        if (file.preview) URL.revokeObjectURL(file.preview);
      });
      setFiles([]);
      
      toast.success("Files submitted successfully!");
    } catch (error) {
      toast.error("Failed to submit files. Please try again.");
      console.error("Submit error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveSubmittedFile = async (index: number) => {
    try {
      // API call to remove submitted file
      // await removeSubmittedFile(submittedFiles[index].url);
      
      setSubmittedFiles(prev => prev.filter((_, i) => i !== index));
      toast.success("File removed successfully");
    } catch (error) {
      toast.error("Failed to remove file");
    }
  };

  const handleDownloadExamFile = (file: ExamFiles) => {
    window.open(file.url, '_blank');
  };

  const handleLogout = () => {
    // Show contextual confirmation dialog based on exam state
    let confirmMessage = "Are you sure you want to logout from the exam system?";
    
    if (examState === 'active' && files.length > 0) {
      confirmMessage = 
        "You have unsaved files ready for submission!\n\n" +
        "Are you sure you want to logout? All pending uploads will be lost.";
    } else if (examState === 'active') {
      confirmMessage = 
        "You are currently in an active exam.\n\n" +
        "Are you sure you want to logout?";
    } else if (examState === 'preparation') {
      confirmMessage = 
        "Your exam is about to start.\n\n" +
        "Are you sure you want to logout?";
    } else if (examState === 'ended' || examState === 'no_exam') {
      // For ended exams or no exam, just logout without confirmation
    } else {
      confirmMessage += "\n\nAny unsaved work will be lost.";
    }
    
    // Skip confirmation for ended/no_exam states
    if (examState !== 'ended' && examState !== 'no_exam') {
      const confirmed = window.confirm(confirmMessage);
      if (!confirmed) {
        return;
      }
    }
    
    // Clear any pending files before logout
    files.forEach((file) => {
      if (file.preview) URL.revokeObjectURL(file.preview);
    });
    setFiles([]);
    
    // Show confirmation message
    toast.success("Logged out successfully");
    
    // Perform logout
    logout();
  };

  const clearPendingFiles = () => {
    files.forEach((file) => {
      if (file.preview) URL.revokeObjectURL(file.preview);
    });
    setFiles([]);
  };

  // Group files by directory
  const filesByDirectory: Record<string, UploadedFile[]> = {};
  files.forEach((file) => {
    const pathParts = file.path.split(/[/\\]/);
    const directory = pathParts.length > 1 ? pathParts.slice(0, -1).join("/") : "root";

    if (!filesByDirectory[directory]) {
      filesByDirectory[directory] = [];
    }
    filesByDirectory[directory].push(file);
  });

  // Render different states
  const renderContent = () => {
    switch (examState) {
      case 'no_exam':
        return (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <FiAlertCircle className="mx-auto text-6xl text-gray-400 mb-4" />
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Active Exam</h2>
              <p className="text-gray-500 mb-6">You are not currently scheduled for any exams.</p>
              <div className="mt-6">
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  <FiLogOut className="w-4 h-4" />
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        );

      case 'preparation':
        return (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center max-w-md mx-auto">
              <FiClock className="mx-auto text-8xl text-blue-500 mb-6" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Exam Preparation Mode</h2>
              <p className="text-lg text-gray-600 mb-8">
                Your exam: <strong>{currentExam?.eventName}</strong>
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-semibold text-blue-900 mb-2">Exam starts in:</h3>
                <div className="text-5xl font-mono font-bold text-blue-600">
                  {formatCountdown(countdown)}
                </div>
              </div>
              
              <div className="text-left bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Instructions:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Please wait until the exam officially starts</li>
                  <li>• Do not close this window or navigate away</li>
                  <li>• Ensure your internet connection is stable</li>
                  <li>• Have all your tools ready for the exam</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'active':
        return (
          <div className="space-y-6">
            {/* Exam Header */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <FiCheckCircle className="text-2xl text-green-600" />
                <div>
                  <h2 className="text-xl font-semibold text-green-900">Exam Active: {currentExam?.eventName}</h2>
                  <p className="text-green-700">You may now access exam files and submit your work</p>
                </div>
              </div>
            </div>

            {/* Exam Files Section */}
            {examFiles.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FiDownload className="text-blue-500" />
                  Exam Files
                </h3>
                <div className="grid gap-3">
                  {examFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FiFile className="text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{file.name}</p>
                          <p className="text-sm text-gray-500">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDownloadExamFile(file)}
                        className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                      >
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* File Upload Section */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FiUpload className="text-blue-500" />
                Submit Your Work
              </h3>
              
              {/* Dropzone */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed p-8 rounded-lg mb-6 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
                }`}
              >
                <input {...getInputProps()} />
                <FiUpload className="mx-auto text-4xl mb-4 text-blue-500" />
                <p className="text-lg mb-2">
                  {isDragActive
                    ? "Drop the files here..."
                    : "Drag and drop files here, or click to select"}
                </p>
                <p className="text-sm text-gray-500">
                  You can upload individual files or entire folders
                </p>
              </div>

              {/* Pending Files */}
              {files.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Files to Submit ({files.length})</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {Object.entries(filesByDirectory).map(([directory, dirFiles]) => (
                      <div key={directory}>
                        {directory !== "root" && (
                          <p className="text-sm font-medium text-gray-700 mb-1">📁 {directory}</p>
                        )}
                        {dirFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center gap-2">
                              <FiFile className="text-gray-400" />
                              <span className="text-sm">{file.file.name}</span>
                              <span className="text-xs text-gray-500">
                                ({(file.file.size / 1024).toFixed(1)} KB)
                              </span>
                            </div>
                            <button
                              onClick={() => handleRemoveFile(files.indexOf(file))}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={handleSubmitFiles}
                      disabled={isUploading}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isUploading ? "Submitting..." : "Submit Files"}
                    </button>
                    <button
                      onClick={clearPendingFiles}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Submitted Files Section */}
            {submittedFiles.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FiCheckCircle className="text-green-500" />
                  Submitted Files ({submittedFiles.length})
                </h3>
                <div className="space-y-2">
                  {submittedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FiCheckCircle className="text-green-500" />
                        <div>
                          <p className="font-medium text-gray-900">{file.name}</p>
                          <p className="text-sm text-gray-500">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveSubmittedFile(index)}
                        className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'ended':
        return (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <FiCheckCircle className="mx-auto text-6xl text-green-500 mb-4" />
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">Exam Completed</h2>
              <p className="text-gray-500 mb-4">
                Your exam "{currentExam?.eventName}" has ended.
              </p>
              {submittedFiles.length > 0 && (
                <p className="text-green-600 font-medium mb-6">
                  ✓ {submittedFiles.length} file(s) submitted successfully
                </p>
              )}
              <div className="mt-6">
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <FiLogOut className="w-4 h-4" />
                  Exit Exam System
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading exam status...</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Exam System</h1>
            <p className="text-gray-600">
              {user?.name} • Student ID: {user?.id}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-medium text-gray-900 capitalize">
                {examState.replace('_', ' ')}
              </p>
            </div>
            {examState === 'active' && (
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              title="Logout from exam system"
            >
              <FiLogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {renderContent()}
        </div>
      </div>

      {/* Hidden input for folder selection */}
      <input
        type="file"
        ref={folderInputRef}
        onChange={handleFolderUpload}
        style={{ display: "none" }}
        {...({ webkitdirectory: "", directory: "" } as any)}
        multiple
      />
    </div>
  );
};

export default ExamPage;
