import React, { useState } from 'react';
import { FiX, FiPlus, FiUser } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { 
    useCourseAccessControllerGrantMultipleSectionsAccess
} from '../../../generated/hooks/course-accessHooks/useCourseAccessControllerGrantMultipleSectionsAccess';
import { 
    createCourseAccessDtoSectionEnum 
} from '../../../generated/types/CreateCourseAccessDto';
import type { AssistantListDto } from '../../../generated/types/AssistantListDto';

interface AddAssistantModalProps {
    isOpen: boolean;
    onClose: () => void;
    courseId: string;
    availableAssistants: AssistantListDto[];
    onAssistantAdded: () => void;
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

const AddAssistantModal: React.FC<AddAssistantModalProps> = ({
    isOpen,
    onClose,
    courseId,
    availableAssistants,
    onAssistantAdded
}) => {
    const [selectedAssistant, setSelectedAssistant] = useState<string>('');
    const [selectedSections, setSelectedSections] = useState<{
        [key: string]: { canView: boolean; canEdit: boolean; canDelete: boolean }
    }>({});

    const { mutateAsync: grantAccess, isPending } = useCourseAccessControllerGrantMultipleSectionsAccess();

    const handleSectionToggle = (sectionKey: string, permission: 'canView' | 'canEdit' | 'canDelete') => {
        setSelectedSections(prev => {
            const currentSection = prev[sectionKey] || { canView: false, canEdit: false, canDelete: false };
            let newSection = { ...currentSection };

            if (permission === 'canView') {
                newSection.canView = !currentSection.canView;
                if (!newSection.canView) {
                    newSection.canEdit = false;
                    newSection.canDelete = false;
                }
            } else if (permission === 'canEdit') {
                newSection.canEdit = !currentSection.canEdit;
                if (newSection.canEdit) {
                    newSection.canView = true;
                }
            } else if (permission === 'canDelete') {
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

    const handleSubmit = async () => {
        if (!selectedAssistant) {
            toast.error('Please select an assistant');
            return;
        }

        const sectionsWithPermissions = Object.entries(selectedSections)
            .filter(([_, permissions]) => 
                permissions.canView || permissions.canEdit || permissions.canDelete
            )
            .map(([section, permissions]) => ({
                userId: selectedAssistant,
                courseId,
                section: section as any,
                ...permissions
            }));

        if (sectionsWithPermissions.length === 0) {
            toast.error('Please select at least one section with permissions');
            return;
        }

        try {
            await grantAccess({
                data: {
                    userId: selectedAssistant,
                    courseId,
                    sections: sectionsWithPermissions
                }
            });

            toast.success('Assistant added successfully');
            setSelectedAssistant('');
            setSelectedSections({});
            onAssistantAdded();
        } catch (error) {
            console.error('Error adding assistant:', error);
            toast.error('Failed to add assistant');
        }
    };

    const handleClose = () => {
        setSelectedAssistant('');
        setSelectedSections({});
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Add Assistant
                    </h3>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        <FiX className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Assistant Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Select Assistant
                        </label>
                        {availableAssistants.length === 0 ? (
                            <div className="w-full px-3 py-8 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-center">
                                <FiUser className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                    No available assistants found.
                                </p>
                                <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                                    All users with assistant privileges already have access to this course, or no users have the ASSIST_IN_COURSE privilege.
                                </p>
                            </div>
                        ) : (
                            <select
                                value={selectedAssistant}
                                onChange={(e) => setSelectedAssistant(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                <option value="">Choose an assistant...</option>
                                {availableAssistants.map(assistant => (
                                    <option key={assistant.id} value={assistant.id}>
                                        {assistant.name} ({assistant.email})
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Section Permissions */}
                    {availableAssistants.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                Grant Access to Sections
                            </label>
                            <div className="space-y-4">
                                {sectionConfig.map(section => {
                                    const permissions = selectedSections[section.key] || { canView: false, canEdit: false, canDelete: false };
                                    return (
                                        <div key={section.key} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <div>
                                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                                        {section.name}
                                                    </h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {section.description}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-4 mt-3">
                                                <label className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={permissions.canView}
                                                        onChange={() => handleSectionToggle(section.key, 'canView')}
                                                        className="rounded border-gray-300 text-primary focus:ring-primary"
                                                    />
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">View</span>
                                                </label>
                                                <label className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={permissions.canEdit}
                                                        onChange={() => handleSectionToggle(section.key, 'canEdit')}
                                                        className="rounded border-gray-300 text-primary focus:ring-primary"
                                                    />
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">Edit</span>
                                                </label>
                                                <label className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={permissions.canDelete}
                                                        onChange={() => handleSectionToggle(section.key, 'canDelete')}
                                                        className="rounded border-gray-300 text-primary focus:ring-primary"
                                                    />
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">Delete</span>
                                                </label>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                        {availableAssistants.length === 0 ? 'Close' : 'Cancel'}
                    </button>
                    {availableAssistants.length > 0 && (
                        <button
                            onClick={handleSubmit}
                            disabled={isPending || !selectedAssistant}
                            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isPending ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <FiPlus className="w-4 h-4" />
                            )}
                            Add Assistant
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddAssistantModal; 