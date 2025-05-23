import { useState } from "react";
import Modal from "../../../ui/modal/Modal";
import Select from "react-select";

interface LabDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LabDetailsModal = ({ isOpen, onClose }: LabDetailsModalProps) => {
  const [labName, setLabName] = useState("");
  const [location, setLocation] = useState("");
  const [supervisor, setSupervisor] = useState<{
    value: string;
    label: string;
  } | null>(null);

  const supervisorOptions = [
    { value: "Eng. Ahmed Mostafa", label: "Eng. Ahmed Mostafa" },
    { value: "Eng. Mohamed Hassan", label: "Eng. Mohamed Hassan" },
    { value: "Eng. Sara Mahmoud", label: "Eng. Sara Mahmoud" },
  ];

  const handleSubmit = () => {
    // Handle form submission
    console.log({
      labName,
      location,
      supervisor: supervisor?.value ?? "",
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add a new lab" size="lg">
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
          />
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
          className="w-[95px] h-[30px] flex justify-center items-center rounded-md bg-secondary text-white"
        >
          Save
        </button>
      </div>
    </Modal>
  );
};

export default LabDetailsModal;
