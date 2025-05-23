import { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import { FiUpload, FiFolder, FiFile } from "react-icons/fi";
import { IoIosAddCircleOutline } from "react-icons/io";
import { useAuth } from "../../../global/hooks/useAuth";

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

const ExamPage = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const { setExamMode } = useAuth();

  const handleExitExamMode = () => {
    setExamMode(false);
  };

  const processFiles = useCallback((inputFiles: File[]) => {
    const newFiles = inputFiles.map((file) => {
      // Extract path from file object if available
      const fileWithPath = file as FileWithPath;
      const path = file.webkitRelativePath ?? fileWithPath.path ?? file.name;

      // Create preview URLs for images
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

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      processFiles(acceptedFiles);
    },
    [processFiles]
  );

  const handleFolderUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      processFiles(filesArray);
    }
  };

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    noClick: false,
    noDrag: false,
    multiple: true,
  });

  const handleRemoveFile = (index: number) => {
    setFiles((prevFiles) => {
      // Clean up any preview URLs to avoid memory leaks
      if (prevFiles[index].preview) {
        URL.revokeObjectURL(prevFiles[index].preview);
      }
      return prevFiles.filter((_, i) => i !== index);
    });
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error("No files selected for upload");
      return;
    }

    setIsUploading(true);

    try {
      // Here you would implement the actual file upload logic
      // For example using FormData and axios to send to your backend

      const formData = new FormData();
      files.forEach((fileObj) => {
        // Add the file with its path as a key to preserve folder structure
        formData.append("files", fileObj.file, fileObj.path);
      });

      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Example API call (commented out)
      // const response = await axios.post('/api/upload-exam-files', formData);

      toast.success("Files uploaded successfully!");

      // Clean up preview URLs
      files.forEach((file) => {
        if (file.preview) URL.revokeObjectURL(file.preview);
      });

      // Reset files state after successful upload
      setFiles([]);
    } catch (error) {
      toast.error("Failed to upload files. Please try again.");
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const clearAll = () => {
    // Clean up preview URLs
    files.forEach((file) => {
      if (file.preview) URL.revokeObjectURL(file.preview);
    });
    setFiles([]);
  };

  // Group files by directory
  const filesByDirectory: Record<string, UploadedFile[]> = {};
  files.forEach((file) => {
    // Split path by both / and \ to handle different OS path separators
    const pathParts = file.path.split(/[/\\]/);
    const directory =
      pathParts.length > 1 ? pathParts.slice(0, -1).join("/") : "root";

    if (!filesByDirectory[directory]) {
      filesByDirectory[directory] = [];
    }
    filesByDirectory[directory].push(file);
  });

  const openFolderDialog = () => {
    if (folderInputRef.current) {
      folderInputRef.current.click();
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">Exam File Upload</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Upload exam files and folders. Drag and drop files or folders, or
            click to select.
          </p>
        </div>

        <button
          onClick={handleExitExamMode}
          className="px-4 py-2 rounded-md bg-red-500 hover:bg-red-600 text-white font-medium"
        >
          Exit Exam Mode
        </button>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed p-8 rounded-lg mb-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-primary bg-primary/10"
            : "border-gray-300 hover:border-primary/50"
        }`}
      >
        <input {...getInputProps()} />
        <FiUpload className="mx-auto text-4xl mb-4 text-primary" />
        <p className="text-lg mb-2">
          {isDragActive
            ? "Drop the files or folders here..."
            : "Drag and drop files or folders here, or click to select"}
        </p>
        <p className="text-sm text-gray-500">
          You can upload individual files or entire folders
        </p>
      </div>

      {/* Hidden input for folder selection */}
      <input
        type="file"
        ref={folderInputRef}
        onChange={handleFolderUpload}
        style={{ display: "none" }}
        // Using data attributes for directory selection
        // These will be ignored by TypeScript but work in browsers
        {...({ webkitdirectory: "", directory: "" } as any)}
      />

      {files.length > 0 && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Selected Files ({files.length})
            </h2>
            <button
              onClick={clearAll}
              className="text-red-500 hover:text-red-700 text-sm font-medium"
            >
              Clear All
            </button>
          </div>

          <div className="bg-white dark:bg-black rounded-lg shadow p-4 max-h-96 overflow-y-auto">
            {Object.keys(filesByDirectory).map((directory) => (
              <div key={directory} className="mb-4">
                <div className="flex items-center gap-2 mb-2 text-primary font-medium">
                  <FiFolder />
                  <span>{directory === "root" ? "Files" : directory}</span>
                </div>

                <div className="pl-6 border-l border-gray-200 dark:border-gray-700">
                  {filesByDirectory[directory].map((file, index) => {
                    const fileIndex = files.findIndex((f) => f === file);
                    return (
                      <div
                        key={`${file.path}-${index}`}
                        className="flex items-center justify-between py-2"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          {file.preview ? (
                            <img
                              src={file.preview}
                              alt={file.file.name}
                              className="w-10 h-10 object-cover rounded"
                            />
                          ) : (
                            <FiFile className="text-gray-500" />
                          )}
                          <div className="overflow-hidden">
                            <p
                              className="truncate max-w-md"
                              title={file.file.name}
                            >
                              {file.file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(file.file.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveFile(fileIndex)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <button
            onClick={open}
            className="flex items-center gap-1 text-secondary text-sm font-semibold"
          >
            <IoIosAddCircleOutline size={20} className="text-secondary" />
            Add Files
          </button>

          <button
            onClick={openFolderDialog}
            className="flex items-center gap-1 text-secondary text-sm font-semibold"
          >
            <FiFolder size={18} className="text-secondary" />
            Add Folder
          </button>
        </div>

        <button
          onClick={handleUpload}
          disabled={isUploading || files.length === 0}
          className={`px-6 py-2 rounded-md bg-primary text-white font-medium ${
            isUploading || files.length === 0
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-primary/90"
          }`}
        >
          {isUploading ? "Uploading..." : "Upload Files"}
        </button>
      </div>
    </div>
  );
};

export default ExamPage;
