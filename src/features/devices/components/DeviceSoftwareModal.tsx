import { useState, useEffect } from "react";
import Modal from "../../../ui/modal/Modal";
import Select from "react-select";
import { useDeviceControllerGetSoftwares } from "../../../generated/hooks/devicesHooks/useDeviceControllerGetSoftwares";
import { useSoftwareControllerGetAll } from "../../../generated/hooks/softwaresHooks/useSoftwareControllerGetAll";
import { DeviceSoftwareListDto } from "../../../generated/types/DeviceSoftwareListDto";
import { SoftwareListDto } from "../../../generated/types/SoftwareListDto";
import { toast } from "react-hot-toast";

interface DeviceSoftwareModalProps {
    isOpen: boolean;
    onClose: () => void;
    deviceId?: string;
    deviceName?: string;
}

interface SoftwareOption {
    value: string;
    label: string;
}

const DeviceSoftwareModal = ({
    isOpen,
    onClose,
    deviceId,
    deviceName,
}: DeviceSoftwareModalProps) => {
    const [installedSoftware, setInstalledSoftware] = useState<SoftwareOption[]>([]);
    const [deviceSoftwareDetails, setDeviceSoftwareDetails] = useState<DeviceSoftwareListDto[]>([]);
    const [availableSoftwareOptions, setAvailableSoftwareOptions] = useState<SoftwareOption[]>([]);

    // Fetch device software
    const { 
        data: deviceSoftwareData, 
        isLoading: isLoadingDeviceSoftware, 
        error: deviceSoftwareError 
    } = useDeviceControllerGetSoftwares(
        deviceId || "", 
        {}, 
        { 
            query: { 
                enabled: !!deviceId && isOpen 
            } 
        }
    );

    // Fetch all available software
    const { 
        data: allSoftwareData, 
        isLoading: isLoadingAllSoftware, 
        error: allSoftwareError 
    } = useSoftwareControllerGetAll(
        { 
            query: { 
                enabled: isOpen 
            } 
        }
    );

    // Debug API calls
    useEffect(() => {
        console.log("DeviceSoftwareModal opened:", { isOpen, deviceId });
        console.log("Device software query enabled:", !!deviceId && isOpen);
        console.log("All software query enabled:", isOpen);
        console.log("Loading states:", { isLoadingDeviceSoftware, isLoadingAllSoftware });
    }, [isOpen, deviceId, isLoadingDeviceSoftware, isLoadingAllSoftware]);

    // Process device software data
    useEffect(() => {
        console.log("Device software data:", deviceSoftwareData);
        if (deviceSoftwareData?.data) {
            // The response is an array of DeviceSoftwarePagedDto
            const softwareItems = deviceSoftwareData.data.flatMap(page => page.items);
            console.log("Processed software items:", softwareItems);

            setDeviceSoftwareDetails(softwareItems);
            
            // Set installed software as selected options
            const installedOptions = softwareItems.map(item => ({
                value: item.id,
                label: item.name
            }));
            setInstalledSoftware(installedOptions);
        } else if (deviceId) {
            // Clear when no data
            setDeviceSoftwareDetails([]);
            setInstalledSoftware([]);
        }
    }, [deviceSoftwareData, deviceId]);

    // Process all software data for dropdown options
    useEffect(() => {
        console.log("All software data:", allSoftwareData);
        if (allSoftwareData?.data) {
            // Handle the response which should be a single SoftwareListDto or an array
            const softwareList = Array.isArray(allSoftwareData.data) 
                ? allSoftwareData.data 
                : [allSoftwareData.data];
            
            console.log("Processed software list:", softwareList);
            const softwareOptions = softwareList.map((software: SoftwareListDto) => ({
                value: software.id,
                label: software.name
            }));
            setAvailableSoftwareOptions(softwareOptions);
        }
    }, [allSoftwareData]);

    // Handle errors
    useEffect(() => {
        if (deviceSoftwareError) {
            toast.error("Failed to load device software");
        }
        if (allSoftwareError) {
            toast.error("Failed to load available software");
        }
    }, [deviceSoftwareError, allSoftwareError]);

    const handleSoftwareChange = (selectedOptions: SoftwareOption[] | null) => {
        const selected = selectedOptions || [];
        setInstalledSoftware(selected);

        // Update software details based on selection
        if (allSoftwareData?.data) {
            const softwareList = Array.isArray(allSoftwareData.data) 
                ? allSoftwareData.data 
                : [allSoftwareData.data];

            const selectedSoftwareDetails = softwareList
                .filter((software: SoftwareListDto) => 
                    selected.some(option => option.value === software.id)
                )
                .map((software: SoftwareListDto) => ({
                    id: software.id,
                    name: software.name,
                    hasIssue: false // Default to no issues for new selections
                }));
            setDeviceSoftwareDetails(selectedSoftwareDetails);
        }
    };

    const handleSubmit = () => {
        // Since there's no update endpoint available, we can only log the intended changes
        // This would need to be implemented when the backend API supports device software updates
        const softwareIds = installedSoftware.map(s => s.value);
        
        console.log("Device software update intended:", {
            deviceId,
            softwareIds,
            action: "update_device_software"
        });

        toast("Device software update feature is not yet implemented in the backend API", {
            icon: "ℹ️",
            duration: 4000,
        });
        onClose();
    };

    const isLoading = isLoadingDeviceSoftware || isLoadingAllSoftware;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Manage Software for ${deviceName || "Device"}`}
            size="lg"
        >
            <div className="flex flex-col gap-5">
                {isLoading && (
                    <div className="flex justify-center items-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
                    </div>
                )}

                {!isLoading && (
                    <>
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="installedSoftware" className="font-semibold text-[#0E1726] text-sm">
                                Installed Software
                            </label>
                            <Select
                                id="installedSoftware"
                                options={availableSoftwareOptions}
                                placeholder="Select installed software"
                                isMulti
                                classNamePrefix="react-select"
                                onChange={handleSoftwareChange}
                                value={installedSoftware}
                                isDisabled={isLoading}
                            />
                        </div>

                        {deviceSoftwareDetails.length > 0 && (
                            <div className="mt-2">
                                <h3 className="font-semibold text-[#0E1726] text-sm mb-2">Installed Software</h3>
                                <div className="border border-[#E0E6ED] rounded-md overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left">Software Name</th>
                                                <th className="px-4 py-2 text-left">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {deviceSoftwareDetails.map((software) => (
                                                <tr key={software.id} className="border-t border-[#E0E6ED]">
                                                    <td className="px-4 py-2 text-secondary">{software.name}</td>
                                                    <td className="px-4 py-2">
                                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                                            !software.hasIssue
                                                                ? "bg-green-100 text-green-800"
                                                                : "bg-red-100 text-red-800"
                                                        }`}>
                                                            {!software.hasIssue ? "Working" : "Has Issues"}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        <div className="mt-2">
                            <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
                                <p className="text-xs text-yellow-800">
                                    <strong>Note:</strong> Device software management is currently read-only. 
                                    The backend API does not yet support updating device software installations.
                                </p>
                            </div>
                        </div>
                    </>
                )}
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
                    disabled={isLoading}
                    className="w-[95px] h-[30px] flex justify-center items-center rounded-md bg-secondary text-white disabled:opacity-50"
                >
                    {isLoading ? "Loading..." : "Save"}
                </button>
            </div>
        </Modal>
    );
};

export default DeviceSoftwareModal; 