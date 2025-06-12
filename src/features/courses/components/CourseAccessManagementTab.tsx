import React, { useState } from 'react';
import { FiUsers, FiPlus, FiSettings, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { 
    useCourseAccessControllerGetAssistantsWithPermissions
} from '../../../generated/hooks/course-accessHooks/useCourseAccessControllerGetAssistantsWithPermissions';
import { 
    useCourseAccessControllerGetAvailableAssistants
} from '../../../generated/hooks/course-accessHooks/useCourseAccessControllerGetAvailableAssistants';
import { 
    useCourseAccessControllerRevokeAllUserAccess
} from '../../../generated/hooks/course-accessHooks/useCourseAccessControllerRevokeAllUserAccess';
import AddAssistantModal from './AddAssistantModal';
import AssistantPermissionsModal from './AssistantPermissionsModal';

interface CourseAccessManagementTabProps {
    courseId: string;
}

const CourseAccessManagementTab: React.FC<CourseAccessManagementTabProps> = ({ courseId }) => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedAssistant, setSelectedAssistant] = useState<{ id: string; name: string } | null>(null);
    const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);

    // API hooks
    const { 
        data: assistantsResponse, 
        isLoading: loadingAssistants, 
        refetch: refetchAssistants 
    } = useCourseAccessControllerGetAssistantsWithPermissions(courseId);

    const { 
        data: availableResponse, 
        refetch: refetchAvailable 
    } = useCourseAccessControllerGetAvailableAssistants(courseId);

    const { mutateAsync: revokeAllAccess, isPending: revokingAccess } = useCourseAccessControllerRevokeAllUserAccess();

    // Extract data from response - the API returns ResponseConfig<T[]>
    const assistantsWithPermissions = assistantsResponse?.data || [];
    const availableAssistants = availableResponse?.data || [];

    const handleRemoveAssistant = async (userId: string, assistantName: string) => {
        if (!confirm(`Are you sure you want to remove all permissions for ${assistantName}?`)) {
            return;
        }

        try {
            await revokeAllAccess({ userId, courseId });
            await refetchAssistants();
            await refetchAvailable();
            toast.success(`Removed all permissions for ${assistantName}`);
        } catch (error) {
            console.error('Error removing assistant access:', error);
            toast.error('Failed to remove assistant access');
        }
    };

    const handleManagePermissions = (userId: string, assistantName: string) => {
        setSelectedAssistant({ id: userId, name: assistantName });
        setIsPermissionsModalOpen(true);
    };

    const handleAssistantAdded = () => {
        setIsAddModalOpen(false);
        refetchAssistants();
        refetchAvailable();
    };

    const handlePermissionsUpdated = () => {
        setIsPermissionsModalOpen(false);
        setSelectedAssistant(null);
        refetchAssistants();
    };

    if (loadingAssistants) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Course Access Management
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Manage assistant permissions for course sections
                    </p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="btn btn-primary flex items-center gap-2"
                >
                    <FiPlus className="w-4 h-4" />
                    Add Assistant
                </button>
            </div>

            {/* Assistants Table */}
            {assistantsWithPermissions.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <FiUsers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No Assistants with Permissions
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        No assistants currently have access to this course.
                    </p>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Assistant
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Permissions Count
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {assistantsWithPermissions.map((assistant: any) => (
                                    <tr key={assistant.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {assistant.name}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {assistant.email}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                                                {assistant.permissions?.length || 0} sections
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleManagePermissions(assistant.id, assistant.name)}
                                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                    title="Manage permissions"
                                                >
                                                    <FiSettings className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleRemoveAssistant(assistant.id, assistant.name)}
                                                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                                    title="Remove all permissions"
                                                    disabled={revokingAccess}
                                                >
                                                    <FiTrash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modals */}
            <AddAssistantModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                courseId={courseId}
                availableAssistants={availableAssistants}
                onAssistantAdded={handleAssistantAdded}
            />

            {selectedAssistant && (
                <AssistantPermissionsModal
                    isOpen={isPermissionsModalOpen}
                    onClose={handlePermissionsUpdated}
                    courseId={courseId}
                    userId={selectedAssistant.id}
                    assistantName={selectedAssistant.name}
                />
            )}
        </div>
    );
};

export default CourseAccessManagementTab; 