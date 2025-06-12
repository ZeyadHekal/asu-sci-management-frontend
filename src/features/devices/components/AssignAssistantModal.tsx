import { useState, useEffect, useMemo } from "react";
import Modal from "../../../ui/modal/Modal";
import Select from "react-select";
import { useUserControllerGetAllAssistants } from "../../../generated/hooks/usersHooks/useUserControllerGetAllAssistants";

interface AssignAssistantModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (assistantId: string, assistantName: string) => void;
    deviceName: string;
    currentAssistant?: { id: string; name: string } | null;
    isSaving?: boolean;
}

const AssignAssistantModal = ({
    isOpen,
    onClose,
    onSave,
    deviceName,
    currentAssistant,
    isSaving = false
}: AssignAssistantModalProps) => {
    const [selectedAssistant, setSelectedAssistant] = useState<{ value: string; label: string } | null>(null);

    // Fetch users with LAB_ASSISTANT privilege only
    const { data: assistantsData, isLoading } = useUserControllerGetAllAssistants();

    // Memoize assistant options to prevent recreation on every render
    const labAssistants = useMemo(() => {
        return assistantsData?.data?.map(assistant => ({
            value: assistant.id, // Keep as string UUID
            label: `${assistant.name} - Lab Assistant`
        })) || [];
    }, [assistantsData?.data]);

    useEffect(() => {
        if (isOpen && currentAssistant) {
            // Find the assistant in the lab assistants list
            const assistant = labAssistants.find(a => a.value === currentAssistant.id);
            if (assistant) {
                setSelectedAssistant(assistant);
            } else {
                // Create assistant option if not in list (for existing assignments)
                setSelectedAssistant({
                    value: currentAssistant.id,
                    label: `${currentAssistant.name} - Lab Assistant`
                });
            }
        } else if (isOpen) {
            setSelectedAssistant(null);
        }
    }, [isOpen, currentAssistant, labAssistants]);

    const handleSubmit = () => {
        if (selectedAssistant) {
            // Extract name from label (remove " - Lab Assistant")
            const name = selectedAssistant.label.split(" - ")[0];
            onSave(selectedAssistant.value, name);
            onClose();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Assign Lab Assistant to ${deviceName}`}
            size="lg"
        >
            <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor="assistant"
                        className="font-semibold text-[#0E1726] text-sm"
                    >
                        Lab Assistant
                    </label>
                    <Select
                        id="assistant"
                        options={labAssistants}
                        placeholder="Select a lab assistant"
                        className="basic-single"
                        classNamePrefix="react-select"
                        onChange={(selectedOption) => setSelectedAssistant(selectedOption)}
                        value={selectedAssistant}
                        isLoading={isLoading}
                        isDisabled={isLoading || isSaving}
                        menuPlacement="auto"
                        menuPortalTarget={document.body}
                        styles={{
                            menuPortal: (base) => ({ ...base, zIndex: 9999 })
                        }}
                    />
                    <div className="mt-2">
                        <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                            <p className="text-xs text-blue-800">
                                <strong>Note:</strong> Only users with LAB_ASSISTANT privilege can be assigned to devices. 
                                The assigned lab assistant will be responsible for maintaining this device and responding to any issues reported by students.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
                <button
                    onClick={onClose}
                    className="w-[95px] h-[30px] flex justify-center items-center rounded-md border border-danger text-danger"
                    disabled={isLoading || isSaving}
                >
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={!selectedAssistant || isLoading || isSaving}
                    className={`w-[95px] h-[30px] flex justify-center items-center rounded-md text-white ${selectedAssistant && !isLoading && !isSaving ? 'bg-secondary' : 'bg-gray-300 cursor-not-allowed'}`}
                >
                    {isSaving ? 'Saving...' : 'Save'}
                </button>
            </div>
        </Modal>
    );
};

export default AssignAssistantModal; 