import React, { useState, useEffect } from 'react';
import { FiX, FiSave } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { 
    useCourseAccessControllerGetUserCourseAccess
} from '../../../generated/hooks/course-accessHooks/useCourseAccessControllerGetUserCourseAccess';
import { 
    useCourseAccessControllerUpdateCourseAccess
} from '../../../generated/hooks/course-accessHooks/useCourseAccessControllerUpdateCourseAccess';
import { 
    createCourseAccessDtoSectionEnum 
} from '../../../generated/types/CreateCourseAccessDto';

interface AssistantPermissionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    courseId: string;
    userId: string;
    assistantName: string;
}

const sectionConfig = [
    { 
        key: createCourseAccessDtoSectionEnum.grades, 
        name: 'Grades', 
        description: 'Access to student grades and assessments' 
    },
    { 
        key: createCourseAccessDtoSectionEnum.events, 
        name: 'Events', 
        description: 'Access to course events and scheduling' 
    },
    { 
        key: createCourseAccessDtoSectionEnum.content, 
        name: 'Content', 
        description: 'Access to course materials and content' 
    },
    { 
        key: createCourseAccessDtoSectionEnum.groups, 
        name: 'Groups', 
        description: 'Access to student groups and management' 
    }
];

const AssistantPermissionsModal: React.FC<AssistantPermissionsModalProps> = ({
    isOpen,
    onClose,
    courseId,
    userId,
    assistantName
}) => {
    const [permissions, setPermissions] = useState<{
        [key: string]: { canView: boolean; canEdit: boolean; canDelete: boolean }
    }>({});

    // Get user's current permissions
    const { 
        data: userPermissionsResponse, 
        isLoading 
    } = useCourseAccessControllerGetUserCourseAccess(userId, courseId);

    const { mutateAsync: updateAccess, isPending: updating } = useCourseAccessControllerUpdateCourseAccess();

    // Initialize permissions when data loads
    useEffect(() => {
        if (userPermissionsResponse?.data) {
            const currentPermissions: { [key: string]: { canView: boolean; canEdit: boolean; canDelete: boolean } } = {};
            
            userPermissionsResponse.data.forEach((permission: any) => {
                currentPermissions[permission.section] = {
                    canView: permission.canView,
                    canEdit: permission.canEdit,
                    canDelete: permission.canDelete
                };
            });

            setPermissions(currentPermissions);
        }
    }, [userPermissionsResponse]);

    const handlePermissionChange = (sectionKey: string, permissionType: 'canView' | 'canEdit' | 'canDelete') => {
        setPermissions(prev => {
            const currentSection = prev[sectionKey] || { canView: false, canEdit: false, canDelete: false };
            let newSection = { ...currentSection };

            if (permissionType === 'canView') {
                newSection.canView = !currentSection.canView;
                if (!newSection.canView) {
                    newSection.canEdit = false;
                    newSection.canDelete = false;
                }
            } else if (permissionType === 'canEdit') {
                newSection.canEdit = !currentSection.canEdit;
                if (newSection.canEdit) {
                    newSection.canView = true;
                }
            } else if (permissionType === 'canDelete') {
                newSection.canDelete = !currentSection.canDelete;
                if (newSection.canDelete) {
                    newSection.canView = true;
                }
            }

            return {
                ...prev,
                [sectionKey]: newSection
            };
        });
    };

    const handleSave = async () => {
        try {
            // Update each section's permissions
            const updates = Object.entries(permissions).map(async ([section, perms]) => {
                if (perms.canView || perms.canEdit || perms.canDelete) {
                    return updateAccess({
                        userId,
                        courseId,
                        section: section as any,
                        data: perms
                    });
                }
            });

            await Promise.all(updates.filter(Boolean));
            
            toast.success('Permissions updated successfully');
            onClose();
        } catch (error) {
            console.error('Error updating permissions:', error);
            toast.error('Failed to update permissions');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Manage Permissions for {assistantName}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        <FiX className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-700">
                                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                                            Section
                                        </th>
                                        <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-white">
                                            View
                                        </th>
                                        <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-white">
                                            Edit
                                        </th>
                                        <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-white">
                                            Delete
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sectionConfig.map(section => {
                                        const sectionPerms = permissions[section.key] || { canView: false, canEdit: false, canDelete: false };
                                        return (
                                            <tr key={section.key} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750">
                                                <td className="py-4 px-4">
                                                    <div>
                                                        <div className="font-medium text-gray-900 dark:text-white">
                                                            {section.name}
                                                        </div>
                                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                                            {section.description}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={sectionPerms.canView}
                                                        onChange={() => handlePermissionChange(section.key, 'canView')}
                                                        className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary dark:focus:ring-primary dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                    />
                                                </td>
                                                <td className="py-4 px-4 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={sectionPerms.canEdit}
                                                        onChange={() => handlePermissionChange(section.key, 'canEdit')}
                                                        className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary dark:focus:ring-primary dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                    />
                                                </td>
                                                <td className="py-4 px-4 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={sectionPerms.canDelete}
                                                        onChange={() => handlePermissionChange(section.key, 'canDelete')}
                                                        className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary dark:focus:ring-primary dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
                            Permission Dependencies:
                        </h4>
                        <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                            <li>• View permission is required for Edit and Delete</li>
                            <li>• Enabling Edit or Delete will automatically enable View</li>
                            <li>• Disabling View will automatically disable Edit and Delete</li>
                        </ul>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={updating}
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {updating ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <FiSave className="w-4 h-4" />
                        )}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssistantPermissionsModal; 