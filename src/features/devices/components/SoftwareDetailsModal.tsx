import { useState, useEffect } from "react";
import Modal from "../../../ui/modal/Modal";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.css";
import { formatDate } from "../../../utils/dateUtils";
import { toast } from "react-hot-toast";
import { useSoftwareControllerCreate } from "../../../generated/hooks/softwaresHooks/useSoftwareControllerCreate";
import { useSoftwareControllerUpdate } from "../../../generated/hooks/softwaresHooks/useSoftwareControllerUpdate";
import { useSoftwareControllerGetById } from "../../../generated/hooks/softwaresHooks/useSoftwareControllerGetById";
import { CreateSoftwareDto } from "../../../generated/types/CreateSoftwareDto";
import { UpdateSoftwareDto } from "../../../generated/types/UpdateSoftwareDto";

interface SoftwareDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    softwareId: string | null;
    onSoftwareUpdated?: () => void;
}

const SoftwareDetailsModal = ({
    isOpen,
    onClose,
    softwareId,
    onSoftwareUpdated,
}: SoftwareDetailsModalProps) => {
    const [softwareName, setSoftwareName] = useState("");
    const [requiredMemory, setRequiredMemory] = useState("");
    const [requiredStorage, setRequiredStorage] = useState("");
    const [addedDate, setAddedDate] = useState("");

    // Fetch software details when editing
    const { data: softwareData, isLoading: isLoadingSoftware } = useSoftwareControllerGetById(
        softwareId || "", 
        {
            query: {
                enabled: !!softwareId && isOpen
            }
        }
    );

    // Create software mutation
    const { mutate: createSoftware, isPending: isCreating } = useSoftwareControllerCreate({
        mutation: {
            onSuccess: () => {
                toast.success("Software created successfully");
                onSoftwareUpdated?.();
                resetForm();
            },
            onError: (error: any) => {
                toast.error(`Failed to create software: ${error?.response?.data?.message || "An error occurred"}`);
            }
        }
    });

    // Update software mutation
    const { mutate: updateSoftware, isPending: isUpdating } = useSoftwareControllerUpdate({
        mutation: {
            onSuccess: () => {
                toast.success("Software updated successfully");
                onSoftwareUpdated?.();
                resetForm();
            },
            onError: (error: any) => {
                toast.error(`Failed to update software: ${error?.response?.data?.message || "An error occurred"}`);
            }
        }
    });

    // Reset form
    const resetForm = () => {
        setSoftwareName("");
        setRequiredMemory("");
        setRequiredStorage("");
        setAddedDate("");
    };

    // Load software data when editing
    useEffect(() => {
        if (softwareId && softwareData?.data && isOpen) {
            const software = softwareData.data;
            setSoftwareName(software.name);
            setRequiredMemory(software.requiredMemory);
            setRequiredStorage(software.requiredStorage);
            // Set default values for fields not in API
            setAddedDate(new Date().toISOString().split('T')[0]);
        } else if (!softwareId && isOpen) {
            // Reset form for new software
            resetForm();
            setAddedDate(new Date().toISOString().split('T')[0]);
        }
    }, [softwareId, softwareData, isOpen]);

    const handleSubmit = () => {
        // Validate required fields
        if (!softwareName.trim()) {
            toast.error("Software name is required");
            return;
        }
        if (!requiredMemory.trim()) {
            toast.error("Required memory is required");
            return;
        }
        if (!requiredStorage.trim()) {
            toast.error("Required storage is required");
            return;
        }

        if (softwareId) {
            // Update existing software
            const updateData: UpdateSoftwareDto = {
                name: softwareName.trim(),
                requiredMemory: requiredMemory.trim(),
                requiredStorage: requiredStorage.trim()
            };
            
            updateSoftware({
                software_id: softwareId,
                data: updateData
            });
        } else {
            // Create new software
            const createData: CreateSoftwareDto = {
                name: softwareName.trim(),
                requiredMemory: requiredMemory.trim(),
                requiredStorage: requiredStorage.trim()
            };
            
            createSoftware({
                data: createData
            });
        }
    };

    const isProcessing = isCreating || isUpdating || isLoadingSoftware;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={softwareId ? "Edit Software" : "Add New Software"}
            size="lg"
        >
            <div className="flex flex-col gap-5">
                {/* Software Name */}
                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor="softwareName"
                        className="font-semibold text-[#0E1726] text-sm"
                    >
                        Software Name *
                    </label>
                    <input
                        id="softwareName"
                        type="text"
                        placeholder="Enter Software Name"
                        className="form-input"
                        value={softwareName}
                        onChange={(e) => setSoftwareName(e.target.value)}
                        disabled={isProcessing}
                    />
                </div>

                {/* Required Memory */}
                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor="requiredMemory"
                        className="font-semibold text-[#0E1726] text-sm"
                    >
                        Required Memory *
                    </label>
                    <input
                        id="requiredMemory"
                        type="text"
                        placeholder="e.g., 4GB, 8GB, 16GB"
                        className="form-input"
                        value={requiredMemory}
                        onChange={(e) => setRequiredMemory(e.target.value)}
                        disabled={isProcessing}
                    />
                </div>

                {/* Required Storage */}
                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor="requiredStorage"
                        className="font-semibold text-[#0E1726] text-sm"
                    >
                        Required Storage *
                    </label>
                    <input
                        id="requiredStorage"
                        type="text"
                        placeholder="e.g., 1GB, 5GB, 20GB"
                        className="form-input"
                        value={requiredStorage}
                        onChange={(e) => setRequiredStorage(e.target.value)}
                        disabled={isProcessing}
                    />
                </div>

                {/* Added Date - Display only, not editable for now */}
                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor="addedDate"
                        className="font-semibold text-[#0E1726] text-sm"
                    >
                        Added Date
                    </label>
                    <Flatpickr
                        value={addedDate}
                        placeholder="Date"
                        options={{
                            dateFormat: "Y-m-d",
                            altInput: true,
                            altFormat: "Y-m-d",
                            enableTime: false,
                        }}
                        className="form-input"
                        onChange={(selectedDates) => {
                            if (selectedDates.length > 0) {
                                setAddedDate(formatDate(selectedDates[0]));
                            }
                        }}
                        disabled={isProcessing}
                    />
                </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
                <button
                    onClick={onClose}
                    className="w-[95px] h-[30px] flex justify-center items-center rounded-md border border-danger text-danger"
                    disabled={isProcessing}
                >
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    className="w-[95px] h-[30px] flex justify-center items-center rounded-md bg-secondary text-white disabled:opacity-50"
                    disabled={isProcessing}
                >
                    {isProcessing ? "..." : softwareId ? "Update" : "Save"}
                </button>
            </div>
        </Modal>
    );
};

export default SoftwareDetailsModal; 