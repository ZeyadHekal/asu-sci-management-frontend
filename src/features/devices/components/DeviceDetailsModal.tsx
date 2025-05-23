import { useState, useEffect } from "react";
import Modal from "../../../ui/modal/Modal";
import Select from "react-select";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.css";
import { formatDate } from "../../../utils/dateUtils";
import { IoIosAddCircleOutline } from "react-icons/io";
import { LuPencil } from "react-icons/lu";
import { toast } from "react-hot-toast";
import { useDeviceControllerGetById } from "../../../generated/hooks/devicesHooks/useDeviceControllerGetById";
import { useDeviceControllerCreate } from "../../../generated/hooks/devicesHooks/useDeviceControllerCreate";
import { useDeviceControllerUpdate } from "../../../generated/hooks/devicesHooks/useDeviceControllerUpdate";
import { useLabControllerGetAll } from "../../../generated/hooks/labsHooks/useLabControllerGetAll";
import { CreateDeviceDto } from "../../../generated/types/CreateDeviceDto";
import { UpdateDeviceDto } from "../../../generated/types/UpdateDeviceDto";

interface DeviceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  deviceId?: number | null;
  onAssignAssistant?: (deviceId: number, deviceName: string) => void;
}

interface SpecItem {
  category: string;
  value: string;
}

const DeviceDetailsModal = ({ isOpen, onClose, deviceId, onAssignAssistant }: DeviceDetailsModalProps) => {
  const [deviceName, setDeviceName] = useState("");
  const [ipAddress, setIPAddress] = useState("");
  const [addedSince, setAddedSince] = useState("");
  const [lab, setLab] = useState<{ value: string; label: string } | null>(null);
  const [specs, setSpecs] = useState<SpecItem[]>([]);
  const [installedSoftware, setInstalledSoftware] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [status, setStatus] = useState<"Available" | "Needs Maintenance">("Available");
  const [assistant, setAssistant] = useState<{ id: number; name: string } | null>(null);

  // New state for spec form
  const [newSpecCategory, setNewSpecCategory] = useState<string>("Memory");
  const [newSpecValue, setNewSpecValue] = useState<string>("");

  // Fetch device details when editing
  const { data: deviceData, isLoading: isLoadingDevice } = useDeviceControllerGetById(
    deviceId?.toString() || "", 
    {
      query: {
        enabled: !!deviceId && isOpen
      }
    }
  );

  // Fetch labs for dropdown
  const { data: labsData } = useLabControllerGetAll();

  // Create device mutation
  const { mutate: createDevice, isPending: isCreating } = useDeviceControllerCreate({
    mutation: {
      onSuccess: () => {
        toast.success("Device created successfully");
        onClose();
        resetForm();
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
        onClose();
        resetForm();
      },
      onError: (error: any) => {
        toast.error(`Failed to update device: ${error?.response?.data?.message || "An error occurred"}`);
      }
    }
  });

  // Create lab options from API data
  const labOptions = labsData?.data 
    ? (Array.isArray(labsData.data) ? labsData.data : [labsData.data]).map(lab => ({ 
        value: lab.id, 
        label: lab.name 
      }))
    : [];

  const softwareOptions = [
    { value: "vscode", label: "Visual Studio Code" },
    { value: "mysql", label: "MySQL" },
    { value: "packet-tracer", label: "Cisco Packet Tracer" },
    { value: "unity", label: "Unity" },
    { value: "android-studio", label: "Android Studio" },
  ];

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
    setAddedSince("");
    setInstalledSoftware([]);
    setStatus("Available");
    setAssistant(null);
  };

  // Load device data when editing
  useEffect(() => {
    if (deviceId && deviceData?.data && isOpen) {
      const device = deviceData.data;
      setDeviceName(device.name);
      setIPAddress(device.IPAddress);
      setLab(labOptions.find(option => option.value === device.labId) || null);
      setSpecs(device.specDetails?.map(spec => ({ category: "Specification", value: spec.value })) || []);
      setAddedSince(device.addedSince ? new Date(device.addedSince).toISOString().split('T')[0] : "");
      setStatus(device.status === "Available" ? "Available" : "Needs Maintenance");
      // Assistant data would need additional API call
      setAssistant(null);
    } else if (!deviceId && isOpen) {
      // Reset form for new device
      resetForm();
      setAddedSince(new Date().toISOString().split('T')[0]);
    }
  }, [deviceId, deviceData, isOpen, labOptions]);

  const handleAddSpec = () => {
    if (newSpecValue.trim()) {
      setSpecs([...specs, {
        category: newSpecCategory,
        value: newSpecValue.trim()
      }]);
      setNewSpecValue("");
    }
  };

  const handleRemoveSpec = (index: number) => {
    const updatedSpecs = [...specs];
    updatedSpecs.splice(index, 1);
    setSpecs(updatedSpecs);
  };

  // Format specs for saving
  const formatSpecsForSave = (): string => {
    return specs.map(spec => spec.value).join(', ');
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
        assisstantId: assistant?.id.toString() || "",
        specifications: specifications
      };
      
      updateDevice({
        device_id: deviceId.toString(),
        data: updateData
      });
    } else {
      // Create new device
      const createData: CreateDeviceDto = {
        name: deviceName.trim(),
        IPAddress: ipAddress.trim(),
        labId: lab.value,
        assisstantId: assistant?.id.toString() || "",
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
    if (onAssignAssistant && deviceName && deviceId !== undefined) {
      onAssignAssistant(deviceId || 0, deviceName);
    }
  };

  const isProcessing = isCreating || isUpdating || isLoadingDevice;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
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
          />
        </div>

        {/* Assigned Lab Assistant */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <label
              htmlFor="assistant"
              className="font-semibold text-[#0E1726] text-sm"
            >
              Assigned Lab Assistant
            </label>
            {onAssignAssistant && (
              <button
                onClick={handleAssignClick}
                className="text-secondary hover:text-secondary-dark flex items-center text-sm"
                title="Change assigned assistant"
              >
                <LuPencil size={14} className="mr-1" />
                {assistant ? "Change" : "Assign"}
              </button>
            )}
          </div>
          <div className="border border-[#E0E6ED] rounded-md p-3 bg-gray-50">
            {assistant ? (
              <div className="flex items-center">
                <div className="w-8 h-8 bg-secondary text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {assistant.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="ml-3">
                  <p className="font-medium">{assistant.name}</p>
                  <p className="text-xs text-gray-500">Lab Assistant</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No lab assistant assigned yet</p>
            )}
          </div>
          <div className="mt-1">
            <p className="text-xs text-gray-500">Every device must have an assigned lab assistant who is responsible for its maintenance.</p>
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
                              key={index}
                              className={`px-3 py-1 rounded-full flex items-center gap-1 ${getCategoryColor(spec.category)}`}
                            >
                              <span>{spec.value}</span>
                              <button
                                onClick={() => handleRemoveSpec(specIndex)}
                                className="text-gray-500 hover:text-red-500 ml-1"
                                title="Remove"
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
                    />
                    <button
                      onClick={handleAddSpec}
                      disabled={!newSpecValue.trim()}
                      className={`flex items-center gap-1 px-3 py-2 rounded ${newSpecValue.trim()
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
          />
        </div>

        {/* Added Since */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="addedSince"
            className="font-semibold text-[#0E1726] text-sm"
          >
            Added Since
          </label>
          <Flatpickr
            value={addedSince}
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
                setAddedSince(formatDate(selectedDates[0]));
              }
            }}
          />
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
              />
              <span className="text-sm ml-2">Needs Maintenance</span>
            </label>
          </div>
        </div>

        {/* Installed Software */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="installedSoftware"
            className="font-semibold text-[#0E1726] text-sm"
          >
            Installed Software
          </label>
          <Select
            id="installedSoftware"
            options={softwareOptions}
            placeholder="Select installed software"
            isMulti
            className="basic-multi-select"
            classNamePrefix="react-select"
            onChange={(selectedOptions) => setInstalledSoftware(selectedOptions as any)}
            value={installedSoftware}
          />
          <div className="mt-2">
            <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
              <p className="text-xs text-yellow-800">
                <strong>Note:</strong> The software installed on a device determines
                its compatibility with courses requiring specific software.
              </p>
            </div>
          </div>
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
          {isProcessing ? "..." : deviceId ? "Update" : "Save"}
        </button>
      </div>
    </Modal>
  );
};

export default DeviceDetailsModal;
