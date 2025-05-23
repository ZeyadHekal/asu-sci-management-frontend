import { useState, useEffect } from "react";
import Modal from "../../../ui/modal/Modal";
import Select from "react-select";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.css";
import { formatDate } from "../../../utils/dateUtils";

interface ReportRecord {
    id: number;
    date: string;
    problemType: string;
    description: string;
    status: string;
    urgency: string;
    reportedBy: string;
}

interface UpdateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (update: {
        date: string;
        type: string;
        status: string;
        issue?: string;
        resolution?: string;
        involvedPersonnel: string[];
        reportId?: number;
    }) => void;
    deviceId: number;
    deviceName: string;
    isEditMode?: boolean;
    updateData: {
        id: number;
        date: string;
        type: string;
        status: string;
        issue?: string;
        resolution?: string;
        involvedPersonnel: string[];
        reportId?: number;
    } | null;
    selectedReport?: ReportRecord | null;
    reportRecords?: ReportRecord[];
}

const UpdateModal = ({
    isOpen,
    onClose,
    onSave,
    deviceId,
    deviceName,
    isEditMode = false,
    updateData,
    selectedReport = null,
    reportRecords = []
}: UpdateModalProps) => {
    const today = new Date();
    const formattedToday = formatDate(today);

    const [date, setDate] = useState(formattedToday);
    const [type, setType] = useState<{ value: string; label: string } | null>(null);
    const [status, setStatus] = useState<{ value: string; label: string } | null>(null);
    const [issue, setIssue] = useState("");
    const [resolution, setResolution] = useState("");
    const [involvedPersonnel, setInvolvedPersonnel] = useState("");
    const [selectedReportOption, setSelectedReportOption] = useState<{ value: number; label: string } | null>(null);

    // Reset form fields when modal opens/closes or edit mode changes
    useEffect(() => {
        if (isOpen) {
            if (isEditMode && updateData) {
                // Populate form with existing data for editing
                setDate(updateData.date);
                setType({ value: updateData.type, label: updateData.type });
                setStatus({ value: updateData.status, label: updateData.status });
                setIssue(updateData.issue || "");
                setResolution(updateData.resolution || "");
                setInvolvedPersonnel(updateData.involvedPersonnel.join(", "));

                // Set report if exists
                if (updateData.reportId && reportRecords.length > 0) {
                    const report = reportRecords.find(r => r.id === updateData.reportId);
                    if (report) {
                        setSelectedReportOption({
                            value: report.id,
                            label: `${report.problemType} - ${report.description.substring(0, 30)}...`
                        });
                    }
                } else {
                    setSelectedReportOption(null);
                }
            } else {
                // Reset form for new update
                setDate(formattedToday);

                // If selectedReport is provided, pre-select the type and issue
                if (selectedReport) {
                    setType({ value: "User Reported Issue", label: "User Reported Issue" });
                    setIssue(selectedReport.description);
                    setSelectedReportOption({
                        value: selectedReport.id,
                        label: `${selectedReport.problemType} - ${selectedReport.description.substring(0, 30)}...`
                    });
                } else {
                    setType(null);
                    setSelectedReportOption(null);
                }

                setStatus(null);
                setResolution("");
                setInvolvedPersonnel("");
            }
        }
    }, [isOpen, isEditMode, updateData, formattedToday, selectedReport, reportRecords]);

    const updateTypeOptions = [
        { value: "Regular Update", label: "Regular Update" },
        { value: "Hardware Issue", label: "Hardware Issue" },
        { value: "Software Issue", label: "Software Issue" },
        { value: "Network Issue", label: "Network Issue" },
        { value: "Scheduled Maintenance", label: "Scheduled Maintenance" },
        { value: "User Reported Issue", label: "User Reported Issue" },
    ];

    const statusOptions = [
        { value: "Passed", label: "Passed" },
        { value: "Failed", label: "Failed" },
        { value: "Resolved", label: "Resolved" },
        { value: "Pending", label: "Pending" },
        { value: "In Progress", label: "In Progress" },
    ];

    // Format report options for select dropdown
    const reportOptions = reportRecords.map(report => ({
        value: report.id,
        label: `${report.problemType} - ${report.description.substring(0, 30)}${report.description.length > 30 ? '...' : ''}`
    }));

    const handleSubmit = () => {
        if (!type || !status || !involvedPersonnel.trim()) {
            alert("Please fill in all required fields.");
            return;
        }

        // Parse the comma-separated personnel names into an array
        const personnelArray = involvedPersonnel
            .split(",")
            .map(person => person.trim())
            .filter(person => person.length > 0);

        onSave({
            date,
            type: type.value,
            status: status.value,
            issue: issue || undefined,
            resolution: resolution || undefined,
            involvedPersonnel: personnelArray,
            reportId: selectedReportOption?.value
        });
    };

    // Handle report selection
    const handleReportChange = (selectedOption: { value: number; label: string } | null) => {
        setSelectedReportOption(selectedOption);

        if (selectedOption) {
            const report = reportRecords.find(r => r.id === selectedOption.value);
            if (report) {
                setIssue(report.description);
            }
        }
    };

    // Handle type change
    const handleTypeChange = (selectedOption: { value: string; label: string } | null) => {
        setType(selectedOption);

        // Clear report selection if type is not "User Reported Issue"
        if (selectedOption?.value !== "User Reported Issue") {
            setSelectedReportOption(null);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`${isEditMode ? 'Edit' : 'New'} Update for ${deviceName}`}
            size="lg"
        >
            <div className="flex flex-col gap-5">
                {/* Date */}
                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor="date"
                        className="font-semibold text-[#0E1726] text-sm"
                    >
                        Date
                    </label>
                    <Flatpickr
                        value={date}
                        placeholder="Date"
                        options={{
                            dateFormat: "Y-m-d",
                            altInput: true,
                            altFormat: "Y-m-d",
                            enableTime: false,
                            defaultDate: today,
                        }}
                        className="form-input"
                        onChange={(selectedDates) => {
                            if (selectedDates.length > 0) {
                                setDate(formatDate(selectedDates[0]));
                            }
                        }}
                    />
                </div>

                {/* Update Type */}
                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor="updateType"
                        className="font-semibold text-[#0E1726] text-sm"
                    >
                        Update Type <span className="text-danger">*</span>
                    </label>
                    <Select
                        id="updateType"
                        options={updateTypeOptions}
                        placeholder="Select update type"
                        className="basic-single"
                        classNamePrefix="react-select"
                        onChange={handleTypeChange}
                        value={type}
                    />
                </div>

                {/* Report Selection (Only visible for User Reported Issue) */}
                {type?.value === "User Reported Issue" && reportRecords.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="reportSelect"
                            className="font-semibold text-[#0E1726] text-sm"
                        >
                            Select Report
                        </label>
                        <Select
                            id="reportSelect"
                            options={reportOptions}
                            placeholder="Select a user report"
                            className="basic-single"
                            classNamePrefix="react-select"
                            onChange={handleReportChange}
                            value={selectedReportOption}
                        />
                        <div className="text-xs text-gray-500 mt-1">
                            Only unresolved reports are shown
                        </div>
                    </div>
                )}

                {/* Status */}
                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor="status"
                        className="font-semibold text-[#0E1726] text-sm"
                    >
                        Status <span className="text-danger">*</span>
                    </label>
                    <Select
                        id="status"
                        options={statusOptions}
                        placeholder="Select status"
                        className="basic-single"
                        classNamePrefix="react-select"
                        onChange={(selectedOption) => setStatus(selectedOption)}
                        value={status}
                    />
                </div>

                {/* Issue */}
                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor="issue"
                        className="font-semibold text-[#0E1726] text-sm"
                    >
                        Issue Description
                    </label>
                    <textarea
                        id="issue"
                        placeholder="Describe the issue (if any)"
                        className="form-textarea"
                        rows={3}
                        value={issue}
                        onChange={(e) => setIssue(e.target.value)}
                    />
                </div>

                {/* Resolution */}
                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor="resolution"
                        className="font-semibold text-[#0E1726] text-sm"
                    >
                        Resolution
                    </label>
                    <textarea
                        id="resolution"
                        placeholder="Describe the resolution (if applicable)"
                        className="form-textarea"
                        rows={3}
                        value={resolution}
                        onChange={(e) => setResolution(e.target.value)}
                    />
                </div>

                {/* Involved Personnel */}
                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor="involvedPersonnel"
                        className="font-semibold text-[#0E1726] text-sm"
                    >
                        Involved Personnel <span className="text-danger">*</span>
                    </label>
                    <textarea
                        id="involvedPersonnel"
                        placeholder="Enter names of involved personnel (comma-separated)"
                        className="form-textarea"
                        rows={2}
                        value={involvedPersonnel}
                        onChange={(e) => setInvolvedPersonnel(e.target.value)}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                        Enter names of all personnel involved, separated by commas (e.g., "John Smith, Sarah Johnson")
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
                    className="w-[95px] h-[30px] flex justify-center items-center rounded-md bg-secondary text-white"
                >
                    Save
                </button>
            </div>
        </Modal>
    );
};

export default UpdateModal; 