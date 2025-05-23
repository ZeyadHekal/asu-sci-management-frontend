import { useState, useEffect } from "react";
import Modal from "../../../ui/modal/Modal";
import Select from "react-select";

interface AssignAssistantModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (assistantId: number, assistantName: string) => void;
    deviceName: string;
    currentAssistant?: { id: number; name: string } | null;
}

// Mock data for lab assistants
const labAssistants = [
    { value: 1, label: "Ahmed Mahmoud - Lab Assistant" },
    { value: 2, label: "Sara Ali - Lab Assistant" },
    { value: 3, label: "Omar Mohamed - Lab Assistant" },
    { value: 4, label: "Fatima Ibrahim - Lab Assistant" },
    { value: 5, label: "Khalid Hassan - Lab Assistant" },
];

const AssignAssistantModal = ({
    isOpen,
    onClose,
    onSave,
    deviceName,
    currentAssistant
}: AssignAssistantModalProps) => {
    const [selectedAssistant, setSelectedAssistant] = useState<{ value: number; label: string } | null>(null);

    useEffect(() => {
        if (isOpen && currentAssistant) {
            // Find the assistant in the lab assistants list
            const assistant = labAssistants.find(a => a.value === currentAssistant.id);
            if (assistant) {
                setSelectedAssistant(assistant);
            } else {
                setSelectedAssistant(null);
            }
        } else if (isOpen) {
            setSelectedAssistant(null);
        }
    }, [isOpen, currentAssistant]);

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
            size="md"
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
                    />
                    <div className="mt-2">
                        <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                            <p className="text-xs text-blue-800">
                                <strong>Note:</strong> The assigned lab assistant will be responsible for
                                maintaining this device and responding to any issues reported by students.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
                <button
                    onClick={onClose}
                    className="w-[95px] h-[30px] flex justify-center items-center rounded-md border border-danger text-danger"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={!selectedAssistant}
                    className={`w-[95px] h-[30px] flex justify-center items-center rounded-md text-white ${selectedAssistant ? 'bg-secondary' : 'bg-gray-300 cursor-not-allowed'}`}
                >
                    Save
                </button>
            </div>
        </Modal>
    );
};

export default AssignAssistantModal; 