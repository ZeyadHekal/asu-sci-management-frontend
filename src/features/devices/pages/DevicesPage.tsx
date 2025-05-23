import { DataTable } from "mantine-datatable";
import { useEffect, useState } from "react";
import { LuHistory, LuSearch, LuFilter, LuInfo, LuUser, LuCode } from "react-icons/lu";
import { FaRegEdit } from "react-icons/fa";
import { RiDeleteBinLine } from "react-icons/ri";
import { FiAlertTriangle } from "react-icons/fi";
import { Link, useNavigate } from "react-router";
import { cn } from "../../../global/utils/cn";
import DeviceDetailsModal from "../components/DeviceDetailsModal";
import DeviceSoftwareModal from "../components/DeviceSoftwareModal";
import DeleteConfirmationModal from "../../../ui/modal/DeleteConfirmationModal";
import Modal from "../../../ui/modal/Modal";
import Select from "react-select";
import AssignAssistantModal from "../components/AssignAssistantModal";
import { toast } from "react-hot-toast";
import { useDeviceControllerGetPaginated } from "../../../generated/hooks/devicesHooks/useDeviceControllerGetPaginated";
import { useDeviceControllerDelete } from "../../../generated/hooks/devicesHooks/useDeviceControllerDelete";
import { useDeviceControllerUpdate } from "../../../generated/hooks/devicesHooks/useDeviceControllerUpdate";
import { useLabControllerGetAll } from "../../../generated/hooks/labsHooks/useLabControllerGetAll";
import { useUserControllerGetAllAssistants } from "../../../generated/hooks/usersHooks/useUserControllerGetAllAssistants";
import { useSoftwareControllerGetAll } from "../../../generated/hooks/softwaresHooks/useSoftwareControllerGetAll";
import { useQueryClient } from "@tanstack/react-query";
import { deviceControllerGetPaginatedQueryKey } from "../../../generated/hooks/devicesHooks/useDeviceControllerGetPaginated";
import type { DeviceListDto } from "../../../generated/types/DeviceListDto";
import { useAuthStore } from "../../../store/authStore";

// Available statuses for filtering
const availableStatuses = [
  { value: "Available", label: "Available" },
  { value: "Needs Maintenance", label: "Needs Maintenance" }
];

const DevicesPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const hasPrivilege = useAuthStore((state) => state.hasPrivilege);
  
  const [page, setPage] = useState(0); // API uses 0-based pagination
  const PAGE_SIZES = [10, 20, 30, 50, 100];
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [isSoftwareModalOpen, setIsSoftwareModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [editDeviceId, setEditDeviceId] = useState<string | null>(null);
  const [deleteDeviceId, setDeleteDeviceId] = useState<string | null>(null);

  // Filter states
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [softwareFilter, setSoftwareFilter] = useState<{ value: string; label: string } | null>(null);
  const [labFilter, setLabFilter] = useState<{ value: string; label: string } | null>(null);
  const [statusFilter, setStatusFilter] = useState<{ value: string; label: string } | null>(null);
  const [specFilter, setSpecFilter] = useState("");
  const [assistantFilter, setAssistantFilter] = useState<{ value: string; label: string } | null>(null);

  // Add new state for specs modal
  const [isSpecsModalOpen, setIsSpecsModalOpen] = useState(false);
  const [selectedDeviceSpecs, setSelectedDeviceSpecs] = useState<{
    deviceName: string;
    specs: string;
    specDetails: Array<{ category: string; value: string }>;
  } | null>(null);

  const [isAssistantModalOpen, setIsAssistantModalOpen] = useState(false);
  const [deviceForAssistant, setDeviceForAssistant] = useState<{ id: string; name: string } | null>(null);
  const [currentAssistant, setCurrentAssistant] = useState<{ id: string; name: string } | null>(null);

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0); // Reset to first page when searching
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [labFilter, statusFilter, assistantFilter, specFilter, softwareFilter]);

  // Fetch labs for lab name mapping and filtering
  const { data: labsData } = useLabControllerGetAll();

  // Fetch users with LAB_ASSISTANT privilege for assistant filtering
  const { data: assistantsData } = useUserControllerGetAllAssistants();

  // Fetch software for software filtering
  const { data: softwareData } = useSoftwareControllerGetAll();

  // Create lab options for filtering from actual lab data
  const availableLabs = labsData?.data 
    ? (Array.isArray(labsData.data) ? labsData.data : [labsData.data]).map(lab => ({ 
        value: lab.id, 
        label: lab.name 
      }))
    : [];

  // Create assistant options for filtering from actual lab assistants data
  const availableAssistants = assistantsData?.data?.map(assistant => ({
    value: assistant.id,
    label: assistant.name
  })) || [];

  // Create software options for filtering from actual software data
  const availableSoftware = softwareData?.data
    ? (Array.isArray(softwareData.data) ? softwareData.data : [softwareData.data]).map(software => ({
        value: software.name,
        label: software.name
      }))
    : [];

  // Create a map of lab IDs to lab names
  const labMap = new Map<string, string>();
  if (labsData?.data) {
    const labs = Array.isArray(labsData.data) ? labsData.data : [labsData.data];
    labs.forEach(lab => {
      labMap.set(lab.id, lab.name);
    });
  }

  // Fetch devices using the generated hook with server-side filtering
  const { 
    data: devicesData, 
    isLoading, 
    error,
    refetch 
  } = useDeviceControllerGetPaginated({
    page,
    limit: pageSize,
    sortBy: "created_at",
    sortOrder: "desc",
    // Server-side filtering parameters
    deviceName: debouncedSearch || undefined,
    software: softwareFilter?.value || undefined,
    labId: labFilter?.value || undefined,
    status: statusFilter?.value || undefined,
    assistantId: assistantFilter?.value || undefined,
    specValue: specFilter || undefined,
  });

  // Delete device mutation
  const { mutate: deleteDevice, isPending: isDeleting } = useDeviceControllerDelete({
    mutation: {
      onSuccess: () => {
        toast.success("Device deleted successfully");
        queryClient.invalidateQueries({
          queryKey: deviceControllerGetPaginatedQueryKey(),
        });
        setIsDeleteModalOpen(false);
        setDeleteDeviceId(null);
        setSelectedDevice(null);
      },
      onError: (error: any) => {
        toast.error(`Failed to delete device: ${error?.response?.data?.message || "An error occurred"}`);
      }
    }
  });

  // Update device mutation for assistant assignment
  const { mutate: updateDevice, isPending: isUpdatingDevice } = useDeviceControllerUpdate({
    mutation: {
      onSuccess: () => {
        toast.success("Lab assistant assigned successfully");
        queryClient.invalidateQueries({
          queryKey: deviceControllerGetPaginatedQueryKey(),
        });
        setIsAssistantModalOpen(false);
        setDeviceForAssistant(null);
        setCurrentAssistant(null);
      },
      onError: (error: any) => {
        toast.error(`Failed to assign assistant: ${error?.response?.data?.message || "An error occurred"}`);
      }
    }
  });

  const handleOpenSoftwareModal = (id: string, deviceName: string) => {
    setSelectedDevice({ id, name: deviceName });
    setIsSoftwareModalOpen(true);
  };

  const handleEditDevice = (id: string) => {
    setEditDeviceId(id);
    setIsDeviceModalOpen(true);
  };

  const handleAddDevice = () => {
    setEditDeviceId(null);
    setIsDeviceModalOpen(true);
  };

  const handleDeleteDevice = (id: string, deviceName: string) => {
    setDeleteDeviceId(id);
    setSelectedDevice({ id, name: deviceName });
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteDevice = () => {
    if (deleteDeviceId) {
      deleteDevice({
        device_ids: deleteDeviceId
      });
    }
  };

  const handleCloseDeviceModal = () => {
    setIsDeviceModalOpen(false);
    setEditDeviceId(null);
  };

  const handleViewDeviceHistory = (id: string) => {
    navigate(`/devices/${id}/history`);
  };

  const handleViewDeviceReports = (deviceId: string) => {
    navigate(`/devices/${deviceId}/history?tab=reports`);
  };

  const handleAssignAssistant = (deviceId: string, deviceName: string) => {
    // Handle the case where devices might be a single object or array
    let device;
    if (Array.isArray(devicesData?.data?.items)) {
      device = devicesData.data.items.find((d: DeviceListDto) => d.id === deviceId);
    } else if (devicesData?.data?.items?.id === deviceId) {
      device = devicesData.data.items;
    }
    
    setDeviceForAssistant({ id: deviceId, name: deviceName });
    setCurrentAssistant(device?.assisstantId ? { id: device.assisstantId, name: device.labAssistant } : null);
    setIsAssistantModalOpen(true);
  };

  const saveAssistantAssignment = (assistantId: string, assistantName: string) => {
    if (deviceForAssistant) {
      updateDevice({
        device_id: deviceForAssistant.id,
        data: {
          assisstantId: assistantId, // Already a string UUID
        }
      });
    }
  };

  const handleViewSpecs = (deviceName: string, specs: string, specDetails: Array<{ category: string; value: string }>) => {
    setSelectedDeviceSpecs({
      deviceName,
      specs,
      specDetails
    });
    setIsSpecsModalOpen(true);
  };

  const clearAllFilters = () => {
    setSearch("");
    setSoftwareFilter(null);
    setLabFilter(null);
    setStatusFilter(null);
    setAssistantFilter(null);
    setSpecFilter("");
    setPage(0);
  };

  // Show error state
  if (error) {
    return (
      <div className="panel mt-6">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-red-500 text-lg font-semibold mb-2">Error loading devices</div>
          <div className="text-gray-600 mb-4">{error?.message || "Please try again."}</div>
          <button 
            onClick={() => refetch()}
            className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary-dark"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Use server-side filtered data directly
  const devices = Array.isArray(devicesData?.data?.items) 
    ? devicesData.data.items 
    : devicesData?.data?.items 
      ? [devicesData.data.items] 
      : [];
  
  const totalRecords = devicesData?.data?.total || devices.length;

  return (
    <div className="panel mt-6">
      <div className="mb-4.5 flex flex-col gap-5 md:flex-row md:items-center">
        <div className="flex flex-col gap-4 md:gap-0 md:flex-row md:items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold text-secondary">All Devices</h2>
            <Link
              to="/devices/software"
              className="flex items-center gap-1 text-secondary bg-gray-100 px-2 py-1 rounded-md text-sm"
            >
              <LuCode size={14} />
              <span>Manage Software</span>
            </Link>
            <Link
              to="/devices/history"
              className="flex items-center gap-1 text-secondary bg-gray-100 px-2 py-1 rounded-md text-sm"
            >
              <LuHistory size={14} />
              <span>History Log</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative flex items-center flex-1 md:flex-auto">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <LuSearch size={20} className="text-[#0E1726]" />
              </div>
              <input
                type="text"
                placeholder="Search devices by name or IP address"
                className="h-10 pl-10 pr-4 w-[240px] rounded-md border border-[#E0E6ED] text-xs font-medium tracking-wider text-gray-500 outline-none focus:border-secondary transition-colors duration-200"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button
              className={`self-start h-10 px-3 rounded-md flex items-center gap-1 ${isFilterOpen ? "bg-secondary text-white" : "bg-gray-100 text-secondary"}`}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <LuFilter size={16} />
              <span>Filters</span>
            </button>
            {hasPrivilege("MANAGE_LABS") && (
              <button
                className="self-start h-10 px-3 rounded-lg bg-secondary flex items-center text-white"
                onClick={handleAddDevice}
              >
                Add a New Device
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter panel */}
      {isFilterOpen && (
        <div className="mb-6 p-4 bg-gray-50 border rounded-md relative z-10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-gray-700">Filter Devices</h3>
            <button
              onClick={clearAllFilters}
              className="text-sm text-secondary hover:text-secondary-dark"
            >
              Clear all filters
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Software</label>
              <Select
                options={availableSoftware}
                isClearable
                placeholder="Filter by software"
                value={softwareFilter}
                onChange={(option) => setSoftwareFilter(option)}
                className="text-sm"
                isLoading={!softwareData}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Lab</label>
              <Select
                options={availableLabs}
                isClearable
                placeholder="Filter by lab"
                value={labFilter}
                onChange={(option) => setLabFilter(option)}
                className="text-sm"
                isLoading={!labsData}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Status</label>
              <Select
                options={availableStatuses}
                isClearable
                placeholder="Filter by status"
                value={statusFilter}
                onChange={(option) => setStatusFilter(option)}
                className="text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Lab Assistant</label>
              <Select
                options={availableAssistants}
                isClearable
                placeholder="Filter by assistant"
                value={assistantFilter}
                onChange={(option) => setAssistantFilter(option)}
                className="text-sm"
                isLoading={!assistantsData}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Device Specs</label>
              <input
                type="text"
                placeholder="Filter by specs"
                className="h-8 px-3 w-full rounded-md border border-[#E0E6ED] text-xs outline-none focus:border-secondary transition-colors duration-200"
                value={specFilter}
                onChange={(e) => setSpecFilter(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      <div className="datatables relative z-0">
        <DataTable
          highlightOnHover
          withBorder
          className="table-hover whitespace-nowrap"
          records={devices}
          columns={[
            {
              accessor: "name",
              title: "Device Name",
              render: (row) => (
                <span className="text-secondary font-medium">{row.name}</span>
              ),
            },
            { 
              accessor: "IPAddress", 
              title: "IP Address",
              render: (row) => (
                <span className="text-gray-600 text-sm">{row.IPAddress}</span>
              )
            },
            {
              accessor: "labId",
              title: "Lab",
              render: (row) => (
                <span className="text-gray-700">
                  {row.labName || labMap.get(row.labId) || row.labId}
                </span>
              )
            },
            {
              accessor: "specDetails",
              title: "Device Specs",
              render: (row) => {
                // Get the first two spec items for preview
                const specsArray = row.specDetails || [];
                const previewSpecs = specsArray.slice(0, 2).map(spec => spec.value).join(', ');
                const hasMoreSpecs = specsArray.length > 2;

                return (
                  <div className="flex items-center">
                    <div className="max-w-[150px] truncate mr-2">
                      {previewSpecs}{hasMoreSpecs ? '...' : ''}
                    </div>
                    <button
                      onClick={() => handleViewSpecs(
                        row.name, 
                        specsArray.map(spec => spec.value).join(', '),
                        specsArray.map(spec => ({ 
                          category: spec.category || "Specification", 
                          value: spec.value 
                        }))
                      )}
                      className="text-gray-500 hover:text-secondary"
                      title="View full specifications"
                    >
                      <LuInfo size={16} />
                    </button>
                  </div>
                );
              }
            },
            {
              accessor: "labAssistant",
              title: "Lab Assistant",
              render: (row) => (
                <div className="flex items-center gap-2">
                  <span className="text-gray-700">
                    {row.labAssistant || "Not assigned"}
                  </span>
                  <button
                    onClick={() => handleAssignAssistant(row.id, row.name)}
                    className="text-gray-500 hover:text-secondary"
                    title="Assign lab assistant"
                  >
                    <LuUser size={16} />
                  </button>
                </div>
              ),
            },
            {
              accessor: "status",
              title: "Status",
              render: (row) => (
                <div
                  className={cn(
                    "w-32 h-[22px] flex justify-center items-center rounded text-xs font-semibold",
                    {
                      "border border-success text-success":
                        row.status === "Available",
                      "border border-danger text-danger":
                        row.status === "Needs Maintenance",
                    }
                  )}
                >
                  {row.status}
                </div>
              ),
            },
            {
              accessor: "reports",
              title: "Reports",
              render: (row) => {
                const reportCount = row.totalReports || 0;
                return (
                  <button
                    onClick={() => handleViewDeviceReports(row.id)}
                    className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium transition-colors",
                      reportCount > 0 
                        ? "bg-orange-100 text-orange-600 hover:bg-orange-200" 
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    )}
                    title={`${reportCount} report${reportCount !== 1 ? 's' : ''}`}
                  >
                    {reportCount} {reportCount === 1 ? 'Report' : 'Reports'}
                  </button>
                );
              },
            },
            {
              accessor: "actions",
              title: "Actions",
              render: (row) => (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditDevice(row.id)}
                    className="text-gray-500 hover:text-secondary"
                    title="Edit device"
                  >
                    <FaRegEdit size={20} className="text-[#0E1726]" />
                  </button>
                  <button
                    onClick={() => handleViewDeviceHistory(row.id)}
                    className="hover:text-secondary transition-colors"
                    title="View device history"
                  >
                    <LuHistory size={20} className="text-[#0E1726]" />
                  </button>
                  <button
                    onClick={() => handleOpenSoftwareModal(row.id, row.name)}
                    className="hover:text-secondary transition-colors"
                    title="Manage software"
                  >
                    <LuCode size={18} className="text-[#0E1726]" />
                  </button>
                  {hasPrivilege("MANAGE_LABS") && (
                    <button
                      onClick={() => handleDeleteDevice(row.id, row.name)}
                      className="text-gray-500 hover:text-danger"
                      title="Delete device"
                    >
                      <RiDeleteBinLine size={20} className="text-[#0E1726]" />
                    </button>
                  )}
                </div>
              ),
            },
          ]}
          totalRecords={totalRecords}
          recordsPerPage={pageSize}
          onRecordsPerPageChange={(newPageSize) => {
            setPageSize(newPageSize);
            setPage(0); // Reset to first page
          }}
          page={page + 1} // DataTable uses 1-based pagination for display
          onPageChange={(newPage) => setPage(newPage - 1)} // Convert back to 0-based
          recordsPerPageOptions={PAGE_SIZES}
          fetching={isLoading}
          noRecordsText="No devices found"
          emptyState={
            !isLoading && devices.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500 text-lg font-medium">No devices found</div>
                <div className="text-gray-400 text-sm mt-1">
                  {search || labFilter || statusFilter || assistantFilter || specFilter || softwareFilter ? 'Try adjusting your filters' : 'Add your first device to get started'}
                </div>
                {search || labFilter || statusFilter || assistantFilter || specFilter || softwareFilter ? (
                  <button
                    onClick={clearAllFilters}
                    className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200"
                  >
                    Clear Filters
                  </button>
                ) : hasPrivilege("MANAGE_LABS") ? (
                  <button
                    onClick={() => setIsDeviceModalOpen(true)}
                    className="mt-4 px-4 py-2 bg-secondary text-white rounded-md text-sm"
                  >
                    Add Device
                  </button>
                ) : null}
              </div>
            ) : undefined
          }
        />
      </div>

      {/* Device Details Modal */}
      <DeviceDetailsModal
        isOpen={isDeviceModalOpen}
        onClose={handleCloseDeviceModal}
        deviceId={editDeviceId}
        onAssignAssistant={(deviceId: string, deviceName: string) => handleAssignAssistant(deviceId, deviceName)}
      />

      {/* Device Software Modal */}
      <DeviceSoftwareModal
        isOpen={isSoftwareModalOpen}
        onClose={() => setIsSoftwareModalOpen(false)}
        deviceId={selectedDevice?.id}
        deviceName={selectedDevice?.name}
        onDeviceUpdated={refetch}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteDevice}
        title="Delete Device"
        message={`Are you sure you want to delete ${selectedDevice?.name}? This action cannot be undone.`}
      />

      {/* Device Specifications Modal */}
      <Modal
        isOpen={isSpecsModalOpen}
        onClose={() => setIsSpecsModalOpen(false)}
        title={`${selectedDeviceSpecs?.deviceName} - Device Specifications`}
        size="md"
      >
        <div className="p-4">
          {selectedDeviceSpecs?.specDetails && selectedDeviceSpecs.specDetails.length > 0 ? (
            <div className="space-y-3">
              {selectedDeviceSpecs.specDetails.map((spec, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <span className="text-sm font-medium text-gray-600">{spec.category}:</span>
                  <span className="text-sm text-gray-800">{spec.value}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FiAlertTriangle size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No specifications available for this device.</p>
            </div>
          )}
        </div>
      </Modal>

      {/* Assign Assistant Modal */}
      <AssignAssistantModal
        isOpen={isAssistantModalOpen}
        onClose={() => setIsAssistantModalOpen(false)}
        deviceName={deviceForAssistant?.name || ""}
        currentAssistant={currentAssistant}
        onSave={saveAssistantAssignment}
        isSaving={isUpdatingDevice}
      />
    </div>
  );
};

export default DevicesPage;
