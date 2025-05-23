import { useState } from "react";
import { DataTable } from "mantine-datatable";
import { LuFile, LuUpload, LuDownload, LuTrash2, LuPlus } from "react-icons/lu";
import { FaRegFile } from "react-icons/fa";
import Modal from "../../../ui/modal/Modal";
import { toast } from "react-hot-toast";

interface CourseContentTabProps {
  courseId: number;
  userType: "doctor" | "assistant" | "student";
}

// Mock content data - in a real app this would come from an API
interface CourseContent {
  id: string;
  name: string;
  type: "file" | "folder";
  size: string;
  uploadedBy: string;
  uploadDate: string;
  downloadUrl?: string;
}

const mockContent: CourseContent[] = [
  {
    id: "1",
    name: "Course Syllabus.pdf",
    type: "file",
    size: "2.3 MB",
    uploadedBy: "Dr. Ahmed Mohamed",
    uploadDate: "2023-09-01",
    downloadUrl: "/files/syllabus.pdf"
  },
  {
    id: "2",
    name: "Lecture 1 - Introduction.pptx",
    type: "file",
    size: "15.7 MB",
    uploadedBy: "Dr. Ahmed Mohamed",
    uploadDate: "2023-09-05",
    downloadUrl: "/files/lecture1.pptx"
  },
  {
    id: "3",
    name: "Lab Assignment 1.pdf",
    type: "file",
    size: "1.2 MB",
    uploadedBy: "TA Sara Ahmed",
    uploadDate: "2023-09-10",
    downloadUrl: "/files/lab1.pdf"
  },
  {
    id: "4",
    name: "Practice Exercises",
    type: "folder",
    size: "12 files",
    uploadedBy: "Dr. Ahmed Mohamed",
    uploadDate: "2023-09-15",
  },
  {
    id: "5",
    name: "Midterm Study Guide.pdf",
    type: "file",
    size: "856 KB",
    uploadedBy: "TA Mohamed Ibrahim",
    uploadDate: "2023-10-20",
    downloadUrl: "/files/midterm-guide.pdf"
  }
];

const CourseContentTab = ({ courseId, userType }: CourseContentTabProps) => {
  const [content, setContent] = useState<CourseContent[]>(mockContent);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploadDescription, setUploadDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const canUpload = userType === "doctor" || userType === "assistant";
  const canDelete = userType === "doctor" || userType === "assistant";

  const handleDownload = (item: CourseContent) => {
    if (item.downloadUrl) {
      // In a real app, this would trigger a download
      console.log(`Downloading: ${item.name}`);
      toast.success(`Downloading ${item.name}`);
    }
  };

  const handleDelete = (item: CourseContent) => {
    if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      setContent(prev => prev.filter(c => c.id !== item.id));
      toast.success(`${item.name} deleted successfully`);
    }
  };

  const handleUpload = () => {
    setIsUploadModalOpen(true);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(event.target.files);
  };

  const handleUploadSubmit = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast.error("Please select at least one file to upload");
      return;
    }

    setIsUploading(true);
    
    try {
      // Simulate upload process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Add uploaded files to content list
      const newContent: CourseContent[] = Array.from(selectedFiles).map((file, index) => ({
        id: `new_${Date.now()}_${index}`,
        name: file.name,
        type: "file" as const,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        uploadedBy: userType === "doctor" ? "Dr. Current User" : "TA Current User",
        uploadDate: new Date().toISOString().split('T')[0],
        downloadUrl: `/files/${file.name}`
      }));

      setContent(prev => [...prev, ...newContent]);
      toast.success(`${selectedFiles.length} file(s) uploaded successfully`);
      
      // Reset form
      setSelectedFiles(null);
      setUploadDescription("");
      setIsUploadModalOpen(false);
    } catch (error) {
      toast.error("Failed to upload files. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
        <div>
          <h3 className="text-lg font-semibold text-secondary">Course Content</h3>
          <p className="text-gray-600 text-sm">
            {userType === "student" 
              ? "Download course materials and resources"
              : "Manage course materials and resources"
            }
          </p>
        </div>

        {canUpload && (
          <button
            onClick={handleUpload}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary-dark"
          >
            <LuUpload size={16} />
            Upload Content
          </button>
        )}
      </div>

      {/* Content Table */}
      {content.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg">
          <FaRegFile size={48} className="text-gray-400 mb-4" />
          <div className="text-gray-600 text-lg font-semibold mb-2">No Content Available</div>
          <div className="text-gray-500">
            {canUpload 
              ? "Upload course materials to get started"
              : "No course materials have been uploaded yet"
            }
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border">
          <DataTable
            highlightOnHover
            className="table-hover whitespace-nowrap"
            records={content}
            columns={[
              {
                accessor: "name",
                title: "Name",
                render: (row) => (
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-gray-100">
                      {row.type === "folder" ? (
                        <LuFile size={20} className="text-gray-600" />
                      ) : (
                        <FaRegFile size={20} className="text-blue-600" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{row.name}</div>
                      <div className="text-xs text-gray-500">{row.type}</div>
                    </div>
                  </div>
                ),
              },
              {
                accessor: "size",
                title: "Size",
                render: (row) => (
                  <span className="text-sm text-gray-600">{row.size}</span>
                ),
              },
              {
                accessor: "uploadedBy",
                title: "Uploaded By",
                render: (row) => (
                  <span className="text-sm">{row.uploadedBy}</span>
                ),
              },
              {
                accessor: "uploadDate",
                title: "Upload Date",
                render: (row) => (
                  <span className="text-sm text-gray-600">
                    {new Date(row.uploadDate).toLocaleDateString()}
                  </span>
                ),
              },
              {
                accessor: "actions",
                title: "Actions",
                render: (row) => (
                  <div className="flex items-center gap-2">
                    {row.downloadUrl && (
                      <button
                        onClick={() => handleDownload(row)}
                        className="text-secondary hover:text-secondary-dark"
                        title="Download"
                      >
                        <LuDownload size={18} />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(row)}
                        className="text-red-500 hover:text-red-700"
                        title="Delete"
                      >
                        <LuTrash2 size={18} />
                      </button>
                    )}
                  </div>
                ),
              },
            ]}
          />
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Course Content"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Files
            </label>
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.rar"
            />
            <p className="text-sm text-gray-500 mt-1">
              Supported formats: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT, ZIP, RAR
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={uploadDescription}
              onChange={(e) => setUploadDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
              rows={3}
              placeholder="Add a description for these files..."
            />
          </div>

          {selectedFiles && selectedFiles.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Files:</h4>
              <div className="space-y-1">
                {Array.from(selectedFiles).map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                    <span className="text-sm">{file.name}</span>
                    <span className="text-xs text-gray-500">
                      {(file.size / (1024 * 1024)).toFixed(1)} MB
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsUploadModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              onClick={handleUploadSubmit}
              className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary-dark disabled:opacity-50"
              disabled={isUploading || !selectedFiles || selectedFiles.length === 0}
            >
              {isUploading ? "Uploading..." : "Upload Files"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CourseContentTab; 