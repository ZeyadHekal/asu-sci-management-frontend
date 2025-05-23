import Modal from "../../../ui/modal/Modal";
import Select from "react-select";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.css";
import { useState } from "react";
import { formatDate } from "../../../utils/dateUtils";

interface SoftwareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SoftwareModal = ({ isOpen, onClose }: SoftwareModalProps) => {
  const [date, setDate] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  const options = [
    { value: "vs-Code", label: "VS Code" },
    { value: "cursor", label: "Cursor" },
  ];

  const handleSubmit = () => {
    // Handle form submission
    console.log({
      date,
      status,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Linked Software" size="lg">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="softwareList">Software List</label>
          <Select
            id="softwareList"
            options={options}
            placeholder="Select software"
            isMulti
            classNamePrefix="react-select"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="installationDate">Installation Date</label>
          <Flatpickr
            value={date}
            placeholder="Enter installation date"
            options={{
              dateFormat: "Y-m-d",
              // Ensure local timezone is used
              altInput: true,
              altFormat: "Y-m-d",
              // Disable time to avoid timezone issues
              enableTime: false,
            }}
            className="form-input"
            onChange={(selectedDates) => {
              if (selectedDates.length > 0) {
                // Use our custom formatting function to avoid timezone issues
                setDate(formatDate(selectedDates[0]));
              }
            }}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="status">Status</label>
          <input
            id="status"
            type="text"
            placeholder="Status"
            className="form-input"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-4">
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
      </div>
    </Modal>
  );
};

export default SoftwareModal;
