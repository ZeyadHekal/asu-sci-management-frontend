import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { LuUpload, LuDownload, LuTrash2, LuArrowLeft, LuFileText, LuUsers } from 'react-icons/lu';
import { toast } from 'react-hot-toast';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useExamModelControllerGetExamModelsForEvent } from '../../../generated/hooks/exam-modelsHooks/useExamModelControllerGetExamModelsForEvent';
import { useExamModelControllerUploadExamModels } from '../../../generated/hooks/exam-modelsHooks/useExamModelControllerUploadExamModels';
import { useExamModelControllerDeleteExamModel } from '../../../generated/hooks/exam-modelsHooks/useExamModelControllerDeleteExamModel';
import { useExamModelControllerAssignExamModelsToStudents } from '../../../generated/hooks/exam-modelsHooks/useExamModelControllerAssignExamModelsToStudents';
import { ExamModelDto } from '../../../generated/types/ExamModelDto';

const ExamModelsPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ExamModelDto | null>(null);

  // API hooks
  const { data: examModelsData, isLoading: modelsLoading } = useExamModelControllerGetExamModelsForEvent(
    eventId || '',
    {
      query: {
        enabled: !!eventId
      }
    }
  );

  const { mutateAsync: uploadExamModels } = useExamModelControllerUploadExamModels();
  const { mutateAsync: deleteExamModel } = useExamModelControllerDeleteExamModel();
  const { mutateAsync: assignExamModels } = useExamModelControllerAssignExamModelsToStudents();

  const examModels = (examModelsData?.data as ExamModelDto[]) || [];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !eventId) return;

    try {
      await uploadExamModels({
        data: {
          name: `Exam Models for Event ${eventId}`,
          description: 'Uploaded exam models',
          eventId: eventId,
          files: Array.from(files)
        }
      });

      toast.success('Exam models uploaded successfully');
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast.error('Failed to upload exam models');
    }
  };

  const handleDeleteModel = async (modelId: string) => {
    if (!confirm('Are you sure you want to delete this exam model?')) return;

    try {
      await deleteExamModel({ modelId });
      toast.success('Exam model deleted successfully');
    } catch (error) {
      toast.error('Failed to delete exam model');
    }
  };

  const handleDownloadModel = async (model: ExamModelDto) => {
    try {
      // For now, just show a toast - we'll implement download later
      toast.success('Download functionality will be implemented');
    } catch (error) {
      toast.error('Failed to download exam model');
    }
  };

  const handleAssignModels = (model: ExamModelDto) => {
    setSelectedModel(model);
    setShowAssignModal(true);
  };

  const handleConfirmAssign = async () => {
    if (!selectedModel || !eventId) return;

    try {
      await assignExamModels({
        data: {
          eventId,
          assignments: [{
            examModelId: selectedModel.id,
            studentIds: [] // This would need to be populated with actual student IDs
          }]
        }
      });
      toast.success('Exam models assigned to students successfully');
      setShowAssignModal(false);
      setSelectedModel(null);
    } catch (error) {
      toast.error('Failed to assign exam models');
    }
  };

  if (modelsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3">Loading exam models...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100"
          >
            <LuArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Exam Models</h1>
            <p className="text-gray-600">Manage exam files and assignments</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-primary"
          >
            <LuUpload className="w-4 h-4 mr-2" />
            Upload Models
          </button>
        </div>
      </div>

      {/* Exam Models Grid */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium">Exam Models ({examModels.length})</h2>
        </div>
        
        {examModels.length === 0 ? (
          <div className="p-12 text-center">
            <LuFileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Exam Models</h3>
            <p className="text-gray-600 mb-4">Upload exam files to get started</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-primary"
            >
              <LuUpload className="w-4 h-4 mr-2" />
              Upload First Model
            </button>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {examModels.map((model) => (
                <div key={model.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <LuFileText className="w-8 h-8 text-blue-500 mr-3" />
                      <div>
                        <h3 className="font-medium text-gray-900 truncate">{model.name}</h3>
                        <p className="text-sm text-gray-600">Version {model.version}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-4">
                    <p>Uploaded: {new Date(model.created_at).toLocaleDateString()}</p>
                    {model.assignedStudentCount !== undefined && (
                      <p>Assigned to: {model.assignedStudentCount} students</p>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleDownloadModel(model)}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                        title="Download"
                      >
                        <LuDownload className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleAssignModels(model)}
                        className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                        title="Assign to Students"
                      >
                        <LuUsers className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteModel(model.id)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <LuTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Assign Models Modal */}
      <Transition appear show={showAssignModal} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setShowAssignModal(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">
                    Assign Exam Model
                  </Dialog.Title>
                  
                  {selectedModel && (
                    <div className="mb-6">
                      <p className="text-sm text-gray-600 mb-2">
                        You are about to assign <strong>{selectedModel.name}</strong> to all students in this event.
                      </p>
                      <p className="text-sm text-gray-500">
                        This will randomly distribute exam models to students based on availability.
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      className="btn btn-outline-gray"
                      onClick={() => setShowAssignModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleConfirmAssign}
                    >
                      Assign to Students
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default ExamModelsPage; 