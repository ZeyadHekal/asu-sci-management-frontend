import { useState, useEffect, useMemo } from "react";
import Modal from "../../../ui/modal/Modal";
import Select from "react-select";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.css";
import { IoIosAddCircleOutline } from "react-icons/io";
import { LuPencil } from "react-icons/lu";
import { toast } from "react-hot-toast";
import { useDeviceControllerGetById } from "../../../generated/hooks/devicesHooks/useDeviceControllerGetById";
import { useDeviceControllerCreate } from "../../../generated/hooks/devicesHooks/useDeviceControllerCreate";
import { useDeviceControllerUpdate } from "../../../generated/hooks/devicesHooks/useDeviceControllerUpdate";
import { useLabControllerGetAll } from "../../../generated/hooks/labsHooks/useLabControllerGetAll";
import { useUserControllerGetAllAssistants } from "../../../generated/hooks/usersHooks/useUserControllerGetAllAssistants";
import { useQueryClient } from "@tanstack/react-query";
import { deviceControllerGetPaginatedQueryKey } from "../../../generated/hooks/devicesHooks/useDeviceControllerGetPaginated";
import type { CreateDeviceDto } from "../../../generated/types/CreateDeviceDto";
import type { UpdateDeviceDto } from "../../../generated/types/UpdateDeviceDto";

interface DeviceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  deviceId?: string | null;
  onAssignAssistant?: (deviceId: string, deviceName: string) => void;
}

interface SpecItem {
  category: string;
  value: string;
}

const DeviceDetailsModal = ({ isOpen, onClose, deviceId, onAssignAssistant }: DeviceDetailsModalProps) => {
  const [deviceName, setDeviceName] = useState("");
  const [ipAddress, setIPAddress] = useState("");
  const [addedSince, setAddedSince] = useState<Date | null>(null);
  const [lab, setLab] = useState<{ value: string; label: string } | null>(null);
  const [specs, setSpecs] = useState<SpecItem[]>([]);
  const [status, setStatus] = useState<"Available" | "Needs Maintenance">("Available");
  const [assistant, setAssistant] = useState<{ value: string; label: string } | null>(null);

  // New state for spec form
  const [newSpecCategory, setNewSpecCategory] = useState<string>("Memory");
  const [newSpecValue, setNewSpecValue] = useState<string>("");

  const queryClient = useQueryClient();

  // Fetch device details when editing
  const { data: deviceData, isLoading: isLoadingDevice } = useDeviceControllerGetById(
    deviceId || "", 
    {
      query: {
        enabled: !!deviceId && isOpen
      }
    }
  );

  // Fetch labs for dropdown
  const { data: labsData } = useLabControllerGetAll();

  // Fetch users with LAB_ASSISTANT privilege for assistant selection
  const { data: assistantsData } = useUserControllerGetAllAssistants();

  // Create device mutation
  const { mutate: createDevice, isPending: isCreating } = useDeviceControllerCreate({
    mutation: {
      onSuccess: () => {
        toast.success("Device created successfully");
        queryClient.invalidateQueries({
          queryKey: deviceControllerGetPaginatedQueryKey(),
        });
        handleClose();
      },
      onError: (error: any) => {
        toast.error(`Failed to create device: ${error?.response?.data?.message || "An error occurred"}`);
      }
    }
  });

  // Update device mutation  
  const { mutate: updateDevice, isPending: isUpdating } = useDeviceControllerUpdate({
    mutation: {
      onSuccess: () => {
        toast.success("Device updated successfully");
        queryClient.invalidateQueries({
          queryKey: deviceControllerGetPaginatedQueryKey(),
        });
        handleClose();
      },
      onError: (error: any) => {
        toast.error(`Failed to update device: ${error?.response?.data?.message || "An error occurred"}`);
      }
    }
  });

  // Create lab options from API data
  const labOptions = useMemo(() => {
    return labsData?.data 
      ? (Array.isArray(labsData.data) ? labsData.data : [labsData.data]).map(lab => ({ 
          value: lab.id, 
          label: lab.name 
        }))
      : [];
  }, [labsData?.data]);

  // Create assistant options from LAB_ASSISTANT users only
  const assistantOptions = useMemo(() => {
    return assistantsData?.data?.map(assistant => ({
      value: assistant.id,
      label: assistant.name
    })) || [];
  }, [assistantsData?.data]);

  const specCategoryOptions = [
    { value: "Memory", label: "Memory" },
    { value: "Storage", label: "Storage" },
    { value: "Processor", label: "Processor" },
    { value: "Graphics", label: "Graphics" },
    { value: "Other", label: "Other" }
  ];

  // Reset form
  const resetForm = () => {
    setDeviceName("");
    setIPAddress("");
    setLab(null);
    setSpecs([]);
    setAddedSince(new Date());
    setStatus("Available");
    setAssistant(null);
    setNewSpecCategory("Memory");
    setNewSpecValue("");
  };

  // Handle modal close
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Load device data when editing
  useEffect(() => {
    if (!isOpen) return;

    if (deviceId && deviceData?.data) {
      const device = deviceData.data;
      setDeviceName(device.name || "");
      setIPAddress(device.IPAddress || "");
      
      // Find lab option
      const selectedLab = labOptions.find(option => option.value === device.labId);
      setLab(selectedLab || null);
      
      // Set specs
      setSpecs(device.specDetails?.map(spec => ({ 
        category: spec.category || "Other", 
        value: spec.value 
      })) || []);
      
      setAddedSince(device.addedSince ? new Date(device.addedSince) : new Date());
      setStatus(device.status === "Available" ? "Available" : "Needs Maintenance");
      
      // Find assistant option
      const selectedAssistant = assistantOptions.find(option => option.value === device.assisstantId);
      setAssistant(selectedAssistant || null);
    } else if (!deviceId) {
      // Reset form for new device
      resetForm();
    }
  }, [deviceId, deviceData?.data, isOpen, labOptions, assistantOptions]);

  const handleAddSpec = () => {
    if (newSpecValue.trim()) {
      setSpecs(prev => [...prev, {
        category: newSpecCategory,
        value: newSpecValue.trim()
      }]);
      setNewSpecValue("");
    }
  };

  const handleRemoveSpec = (index: number) => {
    setSpecs(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    // Validate required fields
    if (!deviceName.trim()) {
      toast.error("Device name is required");
      return;
    }
    if (!ipAddress.trim()) {
      toast.error("IP address is required");
      return;
    }
    if (!lab) {
      toast.error("Lab selection is required");
      return;
    }
    if (!assistant) {
      toast.error("Assistant assignment is required");
      return;
    }

    const specifications = specs.map(spec => ({
      category: spec.category,
      value: spec.value
    }));

    if (deviceId) {
      // Update existing device
      const updateData: UpdateDeviceDto = {
        name: deviceName.trim(),
        IPAddress: ipAddress.trim(),
        labId: lab.value,
        assisstantId: assistant.value,
        specifications: specifications
      };
      
      updateDevice({
        device_id: deviceId,
        data: updateData
      });
    } else {
      // Create new device
      const createData: CreateDeviceDto = {
        name: deviceName.trim(),
        IPAddress: ipAddress.trim(),
        labId: lab.value,
        assisstantId: assistant.value,
        specifications: specifications
      };
      
      createDevice({
        data: createData
      });
    }
  };

  // Helper function to get example text based on category
  const getExampleText = (category: string): string => {
    switch (category) {
      case "Memory":
        return "Example: DDR4 RAM 16GB";
      case "Storage":
        return "Example: SSD 512GB or HDD 1TB 7200RPM";
      case "Processor":
        return "Example: Intel Core i7-11700 2.5GHz";
      case "Graphics":
        return "Example: NVIDIA RTX 3060 8GB";
      default:
        return "Example: Bluetooth 5.0";
    }
  };

  // Get color for category tag
  const getCategoryColor = (category: string): string => {
    switch (category) {
      case "Memory":
        return "bg-blue-100 text-blue-800";
      case "Storage":
        return "bg-purple-100 text-purple-800";
      case "Processor":
        return "bg-amber-100 text-amber-800";
      case "Graphics":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleAssignClick = () => {
    if (onAssignAssistant && deviceName && deviceId) {
      onAssignAssistant(deviceId, deviceName);
    }
  };

  const isProcessing = isCreating || isUpdating || isLoadingDevice;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={deviceId ? "Edit device" : "Add a new device"}
      size="lg"
    >
      <div className="flex flex-col gap-5">
        {/* Device Name */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="deviceName"
            className="font-semibold text-[#0E1726] text-sm"
          >
            Device Name
          </label>
          <input
            id="deviceName"
            type="text"
            placeholder="Enter Device Name"
            className="form-input"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            disabled={isProcessing}
          />
        </div>

        {/* IP Address */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="ipAddress"
            className="font-semibold text-[#0E1726] text-sm"
          >
            IP Address
          </label>
          <input
            id="ipAddress"
            type="text"
            placeholder="Enter IP Address"
            className="form-input"
            value={ipAddress}
            onChange={(e) => setIPAddress(e.target.value)}
            disabled={isProcessing}
          />
        </div>

        {/* Lab */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="lab" className="font-semibold text-[#0E1726] text-sm">
            Lab
          </label>
          <Select
            id="lab"
            options={labOptions}
            placeholder="Choose Lab"
            className="basic-single"
            classNamePrefix="react-select"
            onChange={(selectedOption) => setLab(selectedOption)}
            value={lab}
            isDisabled={isProcessing}
            isLoading={!labsData}
          />
        </div>

        {/* Assigned Lab Assistant */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="assistant"
            className="font-semibold text-[#0E1726] text-sm"
          >
            Assigned Lab Assistant
          </label>
          <Select
            id="assistant"
            options={assistantOptions}
            placeholder="Assign a lab assistant"
            className="basic-single"
            classNamePrefix="react-select"
            onChange={(selectedOption) => setAssistant(selectedOption)}
            value={assistant}
            isDisabled={isProcessing}
            isLoading={!assistantsData}
          />
          <div className="mt-1">
            <p className="text-xs text-gray-500">Every device must have an assigned lab assistant with LAB_ASSISTANT privilege who is responsible for its maintenance.</p>
          </div>
        </div>

        {/* Device Specs */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="deviceSpecs"
            className="font-semibold text-[#0E1726] text-base"
          >
            Device Specifications
          </label>

          {/* Existing specs display */}
          <div className="border border-[#E0E6ED] rounded-md p-4 mb-3">
            {specs.length === 0 ? (
              <p className="text-sm text-gray-500">No specifications added yet. Use the form below to add device specifications.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {/* Group specs by category */}
                {["Memory", "Storage", "Processor", "Graphics", "Other"].map(category => {
                  const categorySpecs = specs.filter(spec => spec.category === category);
                  if (categorySpecs.length === 0) return null;

                  return (
                    <div key={category} className="mb-2">
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">{category}</h4>
                      <div className="flex flex-wrap gap-2">
                        {categorySpecs.map((spec, index) => {
                          const specIndex = specs.findIndex(s => s === spec);
                          return (
                            <div
                              key={`${category}-${index}`}
                              className={`px-3 py-1 rounded-full flex items-center gap-1 ${getCategoryColor(spec.category)}`}
                            >
                              <span>{spec.value}</span>
                              <button
                                onClick={() => handleRemoveSpec(specIndex)}
                                className="text-gray-500 hover:text-red-500 ml-1"
                                title="Remove"
                                disabled={isProcessing}
                              >
                                &times;
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Add spec form */}
          <div className="border border-[#E0E6ED] rounded-md p-4 bg-gray-50">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Add New Specification</h4>
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Category</label>
                  <Select
                    options={specCategoryOptions}
                    value={specCategoryOptions.find(option => option.value === newSpecCategory)}
                    onChange={(option) => setNewSpecCategory(option?.value || "Other")}
                    className="text-sm"
                    isDisabled={isProcessing}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-600 mb-1 block">Specification</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder={getExampleText(newSpecCategory)}
                      className="form-input flex-1 text-sm"
                      value={newSpecValue}
                      onChange={(e) => setNewSpecValue(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddSpec()}
                      disabled={isProcessing}
                    />
                    <button
                      onClick={handleAddSpec}
                      disabled={!newSpecValue.trim() || isProcessing}
                      className={`flex items-center gap-1 px-3 py-2 rounded ${newSpecValue.trim() && !isProcessing
                          ? "bg-secondary text-white hover:bg-secondary-dark"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                    >
                      <IoIosAddCircleOutline size={16} />
                      <span className="text-xs font-medium">Add</span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                <p>{getExampleText(newSpecCategory)}</p>
                <p className="mt-1">
                  <strong>Tip:</strong> For devices with multiple storage options, add each as a separate storage specification.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="status"
            className="font-semibold text-[#0E1726] text-sm"
          >
            Status
          </label>
          <div className="flex items-center gap-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="status"
                checked={status === "Available"}
                onChange={() => setStatus("Available")}
                className="form-radio"
                disabled={isProcessing}
              />
              <span className="text-sm ml-2">Available</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="status"
                checked={status === "Needs Maintenance"}
                onChange={() => setStatus("Needs Maintenance")}
                className="form-radio"
                disabled={isProcessing}
              />
              <span className="text-sm ml-2">Needs Maintenance</span>
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-6">
        <button
          onClick={handleClose}
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
          {isProcessing ? "..." : deviceId ? "Update" : "Save"}
        </button>
      </div>
    </Modal>
  );
};

export default DeviceDetailsModal;
