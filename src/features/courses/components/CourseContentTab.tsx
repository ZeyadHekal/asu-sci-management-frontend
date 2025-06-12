import { useState } from "react";
import { DataTable } from "mantine-datatable";
import { LuUpload, LuDownload, LuTrash2, LuEye, LuEyeOff } from "react-icons/lu";
import { FaRegFile } from "react-icons/fa";
import Modal from "../../../ui/modal/Modal";
import { toast } from "react-hot-toast";
import { useMaterialControllerGetCourseMaterials } from "../../../generated/hooks/materialsHooks/useMaterialControllerGetCourseMaterials";
import { useMaterialControllerDeleteMaterial } from "../../../generated/hooks/materialsHooks/useMaterialControllerDeleteMaterial";
import { useMaterialControllerGetMaterialDownloadUrl } from "../../../generated/hooks/materialsHooks/useMaterialControllerGetMaterialDownloadUrl";
import { useMaterialControllerToggleMaterialVisibility } from "../../../generated/hooks/materialsHooks/useMaterialControllerToggleMaterialVisibility";
import { useAuthStore } from "../../../store/authStore";
import { MaterialListDto } from "../../../generated/types/MaterialListDto";
import client from "../../../global/api/apiClient";
import { useMutation } from "@tanstack/react-query";

interface CourseContentTabProps {
  courseId: string;
}

const CourseContentTab = ({ courseId }: CourseContentTabProps) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [materialName, setMaterialName] = useState("");
  const [materialDescription, setMaterialDescription] = useState("");
  const [isHidden, setIsHidden] = useState(false);
  
  const hasPrivilege = useAuthStore((state) => state.hasPrivilege);

  // Determine user permissions
  const canUpload = hasPrivilege("MANAGE_COURSES") || hasPrivilege("TEACH_COURSE");
  const canDelete = hasPrivilege("MANAGE_COURSES") || hasPrivilege("TEACH_COURSE");
  const isStudent = hasPrivilege("STUDY_COURSE") && !hasPrivilege("MANAGE_COURSES") && !hasPrivilege("TEACH_COURSE") && !hasPrivilege("ASSIST_IN_COURSE");

  // Fetch course materials
  const { 
    data: materialsResponse, 
    isLoading, 
    error,
    refetch 
  } = useMaterialControllerGetCourseMaterials(courseId, {
    query: {
      enabled: !!courseId
    }
  });

  const materials: MaterialListDto[] = materialsResponse?.data || [];

  // Custom upload mutation using direct axios client
  const { mutateAsync: uploadMaterial, isPending: isUploading } = useMutation({
    mutationFn: async (formData: FormData) => {
      return client({
        method: 'POST',
        url: `/materials/course/${courseId}`,
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      toast.success("Material uploaded successfully");
      setSelectedFiles(null);
      setMaterialName("");
      setMaterialDescription("");
      setIsHidden(false);
      setIsUploadModalOpen(false);
      refetch();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to upload material");
    }
  });

  // Delete mutation
  const { mutateAsync: deleteMaterial } = useMaterialControllerDeleteMaterial({
    mutation: {
      onSuccess: () => {
        toast.success("Material deleted successfully");
        refetch();
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || "Failed to delete material");
      }
    }
  });

  // Toggle visibility mutation
  const { mutateAsync: toggleVisibility, isPending: isTogglingVisibility } = useMaterialControllerToggleMaterialVisibility({
    mutation: {
      onSuccess: (data) => {
        const action = data.data.isHidden ? "hidden" : "shown";
        toast.success(`Material ${action} successfully`);
        refetch();
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || "Failed to toggle material visibility");
      }
    }
  });

  const handleDownload = async (materialId: string) => {
    try {
      // Get presigned download URL from backend
      const response: any = await client({
        method: 'GET',
        url: `/materials/${materialId}/download-url`
      });
      const { downloadUrl, fileName } = response.data || response;
      
      // Create a temporary link to trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Download started");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to start download");
    }
  };

  const handleDelete = async (materialId: string, materialName: string) => {
    if (window.confirm(`Are you sure you want to delete "${materialName}"?`)) {
      try {
        await deleteMaterial({ materialId });
      } catch (error) {
        // Error handling is done in the mutation
      }
    }
  };

  const handleToggleVisibility = async (materialId: string, materialName: string, isCurrentlyHidden: boolean) => {
    const action = isCurrentlyHidden ? "show" : "hide";
    if (window.confirm(`Are you sure you want to ${action} "${materialName}"?`)) {
      try {
        await toggleVisibility({ materialId });
      } catch (error) {
        // Error handling is done in the mutation
      }
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

    if (!materialName.trim()) {
      toast.error("Please enter a material name");
      return;
    }

    try {
      // Manually construct FormData to handle files correctly
      const formData = new FormData();
      
      // Add the text fields
      formData.append('name', materialName.trim());
      if (materialDescription.trim()) {
        formData.append('description', materialDescription.trim());
      }
      formData.append('isHidden', isHidden.toString());
      
      // Add each file with the 'files' field name (as expected by backend)
      Array.from(selectedFiles).forEach((file) => {
        formData.append('files', file);
      });

      // Use direct axios client to properly handle FormData
      await uploadMaterial(formData);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-red-600 text-lg font-semibold mb-2">Error Loading Materials</div>
        <div className="text-gray-500 mb-4">Failed to load course materials</div>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary-dark"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
        <div>
          <h3 className="text-lg font-semibold text-secondary">Course Content</h3>
          <p className="text-gray-600 text-sm">
            {isStudent 
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

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
        </div>
      )}

      {/* Content Table */}
      {!isLoading && materials.length === 0 ? (
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
      ) : !isLoading && (
        <div className="bg-white rounded-lg border">
          <DataTable
            highlightOnHover
            className="table-hover whitespace-nowrap"
            records={materials}
            columns={[
              {
                accessor: "name",
                title: "Name",
                render: (row: MaterialListDto) => (
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-gray-100">
                      <FaRegFile size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">{row.name}</div>
                      <div className="text-xs text-gray-500">
                        {row.isHidden && <span className="bg-orange-100 text-orange-800 px-1 rounded text-xs mr-1">Hidden</span>}
                        Material
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                accessor: "fileSize",
                title: "Size",
                render: (row: MaterialListDto) => (
                  <span className="text-sm text-gray-600">{row.fileSize}</span>
                ),
              },
              {
                accessor: "uploadedBy",
                title: "Uploaded By",
                render: (row: MaterialListDto) => (
                  <span className="text-sm">{row.uploadedBy}</span>
                ),
              },
              {
                accessor: "created_at",
                title: "Upload Date",
                render: (row: MaterialListDto) => (
                  <span className="text-sm text-gray-600">
                    {new Date(row.created_at).toLocaleDateString()}
                  </span>
                ),
              },
              {
                accessor: "actions",
                title: "Actions",
                render: (row: MaterialListDto) => (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownload(row.id)}
                      className="text-secondary hover:text-secondary-dark"
                      title="Download"
                    >
                      <LuDownload size={18} />
                    </button>
                    {canUpload && (
                      <button
                        onClick={() => handleToggleVisibility(row.id, row.name, row.isHidden)}
                        className={row.isHidden ? "text-orange-500 hover:text-orange-700" : "text-green-500 hover:text-green-700"}
                        title={row.isHidden ? "Show to students" : "Hide from students"}
                        disabled={isTogglingVisibility}
                      >
                        {row.isHidden ? <LuEyeOff size={18} /> : <LuEye size={18} />}
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(row.id, row.name)}
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
              Material Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={materialName}
              onChange={(e) => setMaterialName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
              placeholder="Enter material name..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={materialDescription}
              onChange={(e) => setMaterialDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
              placeholder="Enter material description..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Files <span className="text-red-500">*</span>
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

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isHidden"
              checked={isHidden}
              onChange={(e) => setIsHidden(e.target.checked)}
              className="h-4 w-4 text-secondary focus:ring-secondary border-gray-300 rounded"
            />
            <div className="ml-2">
              <label htmlFor="isHidden" className="block text-sm text-gray-700">
                Hide from students
              </label>
              <p className="text-xs text-gray-500">
                {isHidden ? "Material will be hidden from students" : "Material will be visible to students"}
              </p>
            </div>
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
              disabled={isUploading || !selectedFiles || selectedFiles.length === 0 || !materialName.trim()}
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