import { useEffect, useState, useMemo } from "react";
import Modal from "../../../ui/modal/Modal";
import Select from "react-select";
import { useLabControllerCreate } from "../../../generated/hooks/labsHooks/useLabControllerCreate";
import { useLabControllerUpdate } from "../../../generated/hooks/labsHooks/useLabControllerUpdate";
import { usePrivilegeControllerGetUsersByPrivilege } from "../../../generated/hooks/privilegesHooks/usePrivilegeControllerGetUsersByPrivilege";
import { useQueryClient } from "@tanstack/react-query";
import { labControllerGetPaginatedQueryKey } from "../../../generated/hooks/labsHooks/useLabControllerGetPaginated";
import toast from "react-hot-toast";
import type { LabListDto } from "../../../generated/types/LabListDto";
import type { CreateLabDto } from "../../../generated/types/CreateLabDto";
import type { UpdateLabDto } from "../../../generated/types/UpdateLabDto";

interface LabDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingLab?: LabListDto | null;
}

const LabDetailsModal = ({ isOpen, onClose, editingLab }: LabDetailsModalProps) => {
  const [labName, setLabName] = useState("");
  const [location, setLocation] = useState("");
  const [supervisor, setSupervisor] = useState<{
    value: string;
    label: string;
  } | null>(null);
  const [status, setStatus] = useState<string>("Available");

  const queryClient = useQueryClient();

  // Fetch staff with MANAGE_LABS privilege for supervisor selection
  const { data: staffData } = usePrivilegeControllerGetUsersByPrivilege("MANAGE_LABS");

  // Create lab mutation
  const createMutation = useLabControllerCreate({
    mutation: {
      onSuccess: () => {
        toast.success("Lab created successfully");
        queryClient.invalidateQueries({
          queryKey: labControllerGetPaginatedQueryKey(),
        });
        handleClose();
      },
      onError: (error) => {
        toast.error("Failed to create lab");
        console.error("Create error:", error);
      },
    },
  });

  // Update lab mutation
  const updateMutation = useLabControllerUpdate({
    mutation: {
      onSuccess: () => {
        toast.success("Lab updated successfully");
        queryClient.invalidateQueries({
          queryKey: labControllerGetPaginatedQueryKey(),
        });
        handleClose();
      },
      onError: (error) => {
        toast.error("Failed to update lab");
        console.error("Update error:", error);
      },
    },
  });

  // Transform staff data for select options
  const supervisorOptions = useMemo(() => {
    if (!staffData?.data) return [];
    
    // The privilege endpoint returns an array of users with MANAGE_LABS privilege
    const users = Array.isArray(staffData.data) ? staffData.data : [staffData.data];
    return users.map((staff: any) => ({
      value: staff.id,
      label: staff.name,
    }));
  }, [staffData]);

  // Initialize form with editing lab data
  useEffect(() => {
    if (editingLab) {
      setLabName(editingLab.name);
      setLocation(editingLab.location);
      setStatus(editingLab.status || "Available");
      
      // Only set supervisor if we have both the editing lab data and staff data
      if (editingLab.supervisor && staffData?.data) {
        setSupervisor({
          value: editingLab.supervisorId,
          label: editingLab.supervisor.name,
        });
      } else if (editingLab.supervisorId && staffData?.data) {
        // Try to find supervisor in staff data if supervisor object is missing
        const users = Array.isArray(staffData.data) ? staffData.data : [staffData.data];
        const foundStaff = users.find((staff: any) => staff.id === editingLab.supervisorId);
        if (foundStaff) {
          setSupervisor({
            value: foundStaff.id,
            label: foundStaff.name,
          });
        }
      }
    } else {
      setLabName("");
      setLocation("");
      setStatus("Available");
      setSupervisor(null);
    }
  }, [editingLab, isOpen, staffData]);

  const handleClose = () => {
    setLabName("");
    setLocation("");
    setStatus("Available");
    setSupervisor(null);
    onClose();
  };

  const handleSubmit = () => {
    if (!labName.trim() || !location.trim() || !supervisor) {
      toast.error("Please fill in all fields");
      return;
    }

    const labData = {
      name: labName.trim(),
      location: location.trim(),
      supervisorId: supervisor.value,
    };

    if (editingLab) {
      // Update existing lab
      updateMutation.mutate({
        lab_id: editingLab.id,
        data: labData as UpdateLabDto,
      });
    } else {
      // Create new lab
      createMutation.mutate({
        data: labData as CreateLabDto,
      });
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title={editingLab ? "Edit Lab" : "Add a new lab"} 
      size="lg"
    >
      <div className="flex flex-col gap-5">
        {/* Lab Name */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="labName"
            className="font-semibold text-[#0E1726] text-sm"
          >
            Lab Name
          </label>
          <input
            id="labName"
            type="text"
            placeholder="Enter Lab Name"
            className="form-input"
            value={labName}
            onChange={(e) => setLabName(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* Location */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="location"
            className="font-semibold text-[#0E1726] text-sm"
          >
            Location
          </label>
          <input
            id="location"
            type="text"
            placeholder="Enter Location"
            className="form-input"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* Supervisor */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="supervisor"
            className="font-semibold text-[#0E1726] text-sm"
          >
            Supervisor
          </label>
          <Select
            id="supervisor"
            options={supervisorOptions}
            placeholder="Assign a supervisor"
            className="basic-single"
            classNamePrefix="react-select"
            onChange={(selectedOption) => setSupervisor(selectedOption)}
            value={supervisor}
            isDisabled={isLoading}
            isLoading={!staffData}
          />
          <p className="text-xs text-gray-500">
            Only staff members with lab management privileges are shown.
          </p>
        </div>

        {/* Status (Read-only) */}
        {editingLab && (
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="status"
              className="font-semibold text-[#0E1726] text-sm"
            >
              Status
            </label>
            <input
              id="status"
              type="text"
              className="form-input bg-gray-50"
              value={status}
              readOnly
              disabled
            />
            <p className="text-xs text-gray-500">
              Status is calculated automatically based on device conditions and lab usage.
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-4 mt-6">
        <button
          onClick={handleClose}
          className="w-[95px] h-[30px] flex justify-center items-center rounded-md border border-danger text-danger"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="w-[95px] h-[30px] flex justify-center items-center rounded-md bg-secondary text-white disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? "..." : "Save"}
        </button>
      </div>
    </Modal>
  );
};

export default LabDetailsModal;
