import { useState, useEffect } from "react";
import Modal from "../../../ui/modal/Modal";
import Select from "react-select";
import { useDeviceControllerGetSoftwares } from "../../../generated/hooks/devicesHooks/useDeviceControllerGetSoftwares";
import { useDeviceControllerUpdateSoftwareList } from "../../../generated/hooks/devicesHooks/useDeviceControllerUpdateSoftwareList";
import { useDeviceControllerUpdateSoftware } from "../../../generated/hooks/devicesHooks/useDeviceControllerUpdateSoftware";
import { useSoftwareControllerGetAll } from "../../../generated/hooks/softwaresHooks/useSoftwareControllerGetAll";
import { DeviceSoftwareListDto } from "../../../generated/types/DeviceSoftwareListDto";
import { SoftwareListDto } from "../../../generated/types/SoftwareListDto";
import { toast } from "react-hot-toast";

interface DeviceSoftwareModalProps {
    isOpen: boolean;
    onClose: () => void;
    deviceId?: string;
    deviceName?: string;
    onDeviceUpdated?: () => void;
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
    onDeviceUpdated,
}: DeviceSoftwareModalProps) => {
    const [installedSoftware, setInstalledSoftware] = useState<SoftwareOption[]>([]);
    const [deviceSoftwareDetails, setDeviceSoftwareDetails] = useState<DeviceSoftwareListDto[]>([]);
    const [availableSoftwareOptions, setAvailableSoftwareOptions] = useState<SoftwareOption[]>([]);

    // Fetch device software with pagination parameters
    const { 
        data: deviceSoftwareData, 
        isLoading: isLoadingDeviceSoftware, 
        error: deviceSoftwareError,
        refetch: refetchDeviceSoftware
    } = useDeviceControllerGetSoftwares(
        deviceId || "", 
        {
            page: 0,
            limit: 100, // Get all software for this device
            sortBy: "name",
            sortOrder: "asc"
        }, 
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

    // Update software list mutation
    const { mutate: updateSoftwareList, isPending: isUpdating } = useDeviceControllerUpdateSoftwareList({
        mutation: {
            onSuccess: () => {
                toast.success("Device software updated successfully");
                refetchDeviceSoftware();
                onDeviceUpdated?.();
                onClose();
            },
            onError: (error: any) => {
                toast.error(`Failed to update device software: ${error?.response?.data?.message || "An error occurred"}`);
            }
        }
    });

    // Update individual software status mutation
    const { mutate: updateSoftwareStatus, isPending: isUpdatingSoftwareStatus } = useDeviceControllerUpdateSoftware({
        mutation: {
            onSuccess: () => {
                toast.success("Software status updated successfully");
                refetchDeviceSoftware();
                onDeviceUpdated?.();
            },
            onError: (error: any) => {
                toast.error(`Failed to update software status: ${error?.response?.data?.message || "An error occurred"}`);
            }
        }
    });

    // Process device software data
    useEffect(() => {
        if (deviceSoftwareData?.data) {
            // Handle the response - could be array or single object depending on API generation
            let softwareItems: DeviceSoftwareListDto[] = [];
            
            if (Array.isArray(deviceSoftwareData.data)) {
                // If it's an array, take the first item or flatten all items
                const firstPage = deviceSoftwareData.data[0];
                softwareItems = firstPage?.items || [];
            } else if (deviceSoftwareData.data && typeof deviceSoftwareData.data === 'object' && 'items' in deviceSoftwareData.data) {
                // If it's a single DeviceSoftwarePagedDto object
                const pagedData = deviceSoftwareData.data as { items: DeviceSoftwareListDto[]; total: number };
                softwareItems = pagedData.items || [];
            }
            
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
        if (allSoftwareData?.data) {
            // Handle the response which should be an array of SoftwareListDto
            const softwareList = Array.isArray(allSoftwareData.data) 
                ? allSoftwareData.data 
                : [allSoftwareData.data];
            
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
                .map((software: SoftwareListDto) => {
                    // Preserve existing hasIssue status if software was already installed
                    const existingSoftware = deviceSoftwareDetails.find(existing => existing.id === software.id);
                    return {
                        id: software.id,
                        name: software.name,
                        hasIssue: existingSoftware?.hasIssue || false // Preserve existing status or default to false
                    };
                });
            setDeviceSoftwareDetails(selectedSoftwareDetails);
        }
    };

    const handleStatusToggle = (softwareId: string) => {
        if (!deviceId) {
            toast.error("Device ID is required");
            return;
        }

        const currentSoftware = deviceSoftwareDetails.find(sw => sw.id === softwareId);
        if (!currentSoftware) {
            toast.error("Software not found");
            return;
        }

        const newStatus = !currentSoftware.hasIssue;

        // Optimistically update the UI
        setDeviceSoftwareDetails(prev => 
            prev.map(software => 
                software.id === softwareId 
                    ? { ...software, hasIssue: newStatus }
                    : software
            )
        );

        // Call the API to update the status
        updateSoftwareStatus({
            device_id: deviceId,
            softwareId: softwareId,
            data: {
                hasIssue: newStatus
            }
        });
    };

    const handleSubmit = () => {
        if (!deviceId) {
            toast.error("Device ID is required");
            return;
        }

        const softwareIds = installedSoftware.map(s => s.value);
        
        updateSoftwareList({
            device_id: deviceId,
            data: {
                softwareIds
            }
        });
    };

    const isLoading = isLoadingDeviceSoftware || isLoadingAllSoftware || isUpdating || isUpdatingSoftwareStatus;

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
                                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                            software.hasIssue 
                                                                ? 'bg-red-100 text-red-800' 
                                                                : 'bg-green-100 text-green-800'
                                                        }`}>
                                                            {software.hasIssue ? 'Has Issues' : 'Working'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}


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
                    className="w-[120px] h-[30px] flex justify-center items-center rounded-md bg-secondary text-white disabled:opacity-50"
                >
                    {isUpdating ? "Updating..." : isLoading ? "Loading..." : "Update Software"}
                </button>
            </div>
        </Modal>
    );
};

export default DeviceSoftwareModal; 