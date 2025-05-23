import { useState, useEffect, useMemo } from "react";
import Modal from "../../../ui/modal/Modal";
import Select from "react-select";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.css";
import { formatDate } from "../../../utils/dateUtils";
import { useAuth } from "../../../global/hooks/useAuth";
import { useMaintenanceHistoryControllerCreate } from "../../../generated/hooks/device-maintenance-historyHooks/useMaintenanceHistoryControllerCreate";
import { useMaintenanceHistoryControllerUpdate } from "../../../generated/hooks/device-maintenance-historyHooks/useMaintenanceHistoryControllerUpdate";
import { useDeviceControllerGetSoftwares } from "../../../generated/hooks/devicesHooks/useDeviceControllerGetSoftwares";
import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { deviceControllerGetDeviceMaintenanceHistoryQueryKey } from "../../../generated/hooks/devicesHooks/useDeviceControllerGetDeviceMaintenanceHistory";
import { 
    CreateMaintenanceHistoryDtoMaintenanceTypeEnum, 
    CreateMaintenanceHistoryDtoStatusEnum 
} from "../../../generated/types/CreateMaintenanceHistoryDto";

interface ReportRecord {
    id: string;
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
    deviceId: string;
    deviceName: string;
    isEditMode?: boolean;
    updateData: {
        id: string;
        type: string;
        status: string;
        issue?: string;
        resolution?: string;
        involvedPersonnel: string[];
        reportId?: string;
        completedAt?: string;
    } | null;
    selectedReport?: ReportRecord | null;
    reportRecords?: ReportRecord[];
}

const UpdateModal = ({
    isOpen,
    onClose,
    deviceId,
    deviceName,
    isEditMode = false,
    updateData,
    selectedReport = null,
    reportRecords = []
}: UpdateModalProps) => {
    const today = useMemo(() => new Date(), []);
    const formattedToday = useMemo(() => formatDate(today), [today]);
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const [type, setType] = useState<{ value: string; label: string } | null>(null);
    const [status, setStatus] = useState<{ value: string; label: string } | null>(null);
    const [issue, setIssue] = useState("");
    const [resolution, setResolution] = useState("");
    const [involvedPersonnel, setInvolvedPersonnel] = useState("");
    const [selectedReportOption, setSelectedReportOption] = useState<{ value: string; label: string } | null>(null);
    const [completedAt, setCompletedAt] = useState(formattedToday);

    // New state for software list and selected software
    const [softwareList, setSoftwareList] = useState<{ value: string; label: string }[]>([]);
    const [selectedSoftware, setSelectedSoftware] = useState<{ value: string; label: string } | null>(null);
    const [softwareStatus, setSoftwareStatus] = useState<{ value: string; label: string } | null>(null);
    const [deviceStatus, setDeviceStatus] = useState<{ value: string; label: string } | null>(null);

    // Backend API hooks
    const { mutate: createMaintenanceHistory, isPending: isCreating } = useMaintenanceHistoryControllerCreate({
        mutation: {
            onSuccess: () => {
                toast.success("Maintenance update created successfully");
                queryClient.invalidateQueries({
                    queryKey: deviceControllerGetDeviceMaintenanceHistoryQueryKey(deviceId)
                });
                onClose();
            },
            onError: (error: any) => {
                toast.error(`Failed to create maintenance update: ${error?.response?.data?.message || "An error occurred"}`);
            }
        }
    });

    const { mutate: updateMaintenanceHistory, isPending: isUpdating } = useMaintenanceHistoryControllerUpdate({
        mutation: {
            onSuccess: () => {
                toast.success("Maintenance update updated successfully");
                queryClient.invalidateQueries({
                    queryKey: deviceControllerGetDeviceMaintenanceHistoryQueryKey(deviceId)
                });
                onClose();
            },
            onError: (error: any) => {
                toast.error(`Failed to update maintenance update: ${error?.response?.data?.message || "An error occurred"}`);
            }
        }
    });

    // Fetch software list for the device
    const { data: deviceSoftwareData, isLoading: isLoadingSoftware } = useDeviceControllerGetSoftwares(
        deviceId,
        { limit: 100, page: 0 }, // Get all software for the device
        { 
            query: { 
                enabled: !!deviceId && isOpen,
                staleTime: 5 * 60 * 1000, // 5 minutes
            } 
        }
    );

    // Update software list when data changes
    useEffect(() => {
        if (deviceSoftwareData?.data && Array.isArray(deviceSoftwareData.data) && deviceSoftwareData.data.length > 0) {
            // The response is an array of DeviceSoftwarePagedDto, take the first one
            const pagedData = deviceSoftwareData.data[0];
            if (pagedData?.items) {
                const softwareOptions = pagedData.items.map((sw: any) => ({
                    value: sw.id,
                    label: sw.name
                }));
                setSoftwareList(softwareOptions);
            } else {
                setSoftwareList([]);
                setSelectedSoftware(null);
            }
        } else {
            setSoftwareList([]);
            setSelectedSoftware(null);
        }
    }, [deviceSoftwareData]);

    // Reset form fields when modal opens/closes or edit mode changes
    useEffect(() => {
        if (isOpen) {
            if (isEditMode && updateData) {
                // Populate form with existing data for editing
                setType({ value: updateData.type, label: updateData.type === "USER_REPORT" ? "User report" : updateData.type });
                setStatus({ value: updateData.status, label: updateData.status });
                setIssue(updateData.issue || "");
                setResolution(updateData.resolution || "");
                setInvolvedPersonnel(updateData.involvedPersonnel.join(", "));
                setCompletedAt(updateData.completedAt || formattedToday);
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
                setCompletedAt(formattedToday);
                if (selectedReport) {
                    setType({ value: "USER_REPORT", label: "User report" });
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

    // Map UI types to backend maintenance types
    const updateTypeOptions = useMemo(() => [
        { value: "HARDWARE_REPAIR", label: "Hardware Repair" },
        { value: "SOFTWARE_UPDATE", label: "Software Update" },
        { value: "CLEANING", label: "Cleaning" },
        { value: "REPLACEMENT", label: "Replacement" },
        { value: "INSPECTION", label: "Inspection" },
        { value: "CALIBRATION", label: "Calibration" },
        { value: "USER_REPORT", label: "User report" },
        { value: "OTHER", label: "Other" },
    ], []);

    // Map UI statuses to backend statuses
    const statusOptions = useMemo(() => [
        { value: "SCHEDULED", label: "Scheduled" },
        { value: "IN_PROGRESS", label: "In Progress" },
        { value: "COMPLETED", label: "Completed" },
    ], []);

    // Format report options for select dropdown
    const reportOptions = useMemo(() => reportRecords.map(report => ({
        value: report.id,
        label: `${report.problemType} - ${report.description.substring(0, 30)}${report.description.length > 30 ? '...' : ''}`
    })), [reportRecords]);

    const handleSubmit = () => {
        if (!type || !status) {
            toast.error("Please fill in all required fields.");
            return;
        }

        // Parse the comma-separated personnel names into an array (for legacy onSave callback)
        const personnelArray = involvedPersonnel
            .split(",")
            .map(person => person.trim())
            .filter(person => person.length > 0);

        // Prepare data for backend API
        const maintenanceData = {
            deviceId: deviceId,
            maintenanceType: type.value as CreateMaintenanceHistoryDtoMaintenanceTypeEnum,
            status: status.value as CreateMaintenanceHistoryDtoStatusEnum,
            description: issue || `${type.label} maintenance`,
            resolutionNotes: resolution || undefined,
            relatedReportId: selectedReportOption?.value || undefined,
            completedAt: status.value === "COMPLETED" ? new Date(completedAt).toISOString() : undefined,
            involvedPersonnel: personnelArray.length > 0 ? personnelArray : undefined,
            softwareId: selectedSoftware?.value || undefined,
            softwareHasIssue: softwareStatus?.value ? softwareStatus.value === "not_available" : undefined,
            deviceHasIssue: deviceStatus?.value ? deviceStatus.value === "not_available" : undefined,
        } as any; // Type assertion needed due to mismatch between generated types and actual API expectation

        if (isEditMode && updateData?.id) {
            // Update existing maintenance history
            updateMaintenanceHistory({
                maintenance_history_id: updateData.id,
                data: maintenanceData
            });
        } else {
            // Create new maintenance history
            createMaintenanceHistory({
                data: maintenanceData
            });
        }
    };

    // Handle report selection
    const handleReportChange = (selectedOption: { value: string; label: string } | null) => {
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
        // No need to clear report selection since USER_REPORTED_ISSUE is removed
    };

    // Handle status change
    const handleStatusChange = (selectedOption: { value: string; label: string } | null) => {
        setStatus(selectedOption);

        // Automatically set completion date to today when status is COMPLETED
        if (selectedOption?.value === "COMPLETED") {
            setCompletedAt(formattedToday);
        }
    };

    const isProcessing = isCreating || isUpdating;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`${isEditMode ? 'Edit' : 'New'} Maintenance Update for ${deviceName}`}
            size="lg"
        >
            <div className="flex flex-col gap-5">
                {/* Maintenance Type */}
                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor="maintenanceType"
                        className="font-semibold text-[#0E1726] text-sm"
                    >
                        Maintenance Type <span className="text-danger">*</span>
                    </label>
                    <Select
                        id="maintenanceType"
                        options={updateTypeOptions}
                        placeholder="Select maintenance type"
                        className="basic-single"
                        classNamePrefix="react-select"
                        onChange={handleTypeChange}
                        value={type}
                        isDisabled={isProcessing || !!selectedReport}
                    />
                </div>

                {/* Software Selection Dropdown */}
                {(type?.value === "SOFTWARE_UPDATE" || selectedReport?.problemType === "software issue") && (
                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="softwareSelect"
                            className="font-semibold text-[#0E1726] text-sm"
                        >
                            Select Software
                        </label>
                        <Select
                            id="softwareSelect"
                            options={softwareList}
                            value={selectedSoftware}
                            onChange={(selectedOption) => setSelectedSoftware(selectedOption)}
                            isDisabled={isProcessing || !!selectedReport}
                        />
                    </div>
                )}

                {/* Software Status Dropdown */}
                {(type?.value === "SOFTWARE_UPDATE" || selectedReport?.problemType === "software issue") && (
                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="softwareStatus"
                            className="font-semibold text-[#0E1726] text-sm"
                        >
                            Software Status
                        </label>
                        <Select
                            id="softwareStatus"
                            options={[
                                { value: "available", label: "Working (No Issues)" },
                                { value: "not_available", label: "Has Issues" }
                            ]}
                            value={softwareStatus}
                            onChange={(selectedOption) => setSoftwareStatus(selectedOption)}
                            isDisabled={isProcessing}
                        />
                    </div>
                )}

                {/* Device Status Dropdown */}
                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor="deviceStatus"
                        className="font-semibold text-[#0E1726] text-sm"
                    >
                        Device Status
                    </label>
                    <Select
                        id="deviceStatus"
                        options={[
                            { value: "available", label: "Working (No Issues)" },
                            { value: "not_available", label: "Has Issues" }
                        ]}
                        value={deviceStatus}
                        onChange={(selectedOption) => setDeviceStatus(selectedOption)}
                        isDisabled={isProcessing}
                    />
                </div>

                {/* Report Selection (Only visible when type is USER_REPORT) */}
                {type?.value === "USER_REPORT" && reportRecords.length > 0 && (
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
                            isDisabled={isProcessing || !!selectedReport}
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
                        onChange={handleStatusChange}
                        value={status}
                        isDisabled={isProcessing}
                    />
                </div>

                {/* Completion Date - Only visible when status is COMPLETED */}
                {status?.value === "COMPLETED" && (
                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="completedAt"
                            className="font-semibold text-[#0E1726] text-sm"
                        >
                            Completion Date
                        </label>
                        <Flatpickr
                            value={completedAt}
                            placeholder="Completion Date"
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
                                    setCompletedAt(formatDate(selectedDates[0]));
                                }
                            }}
                            disabled={isProcessing}
                        />
                        <div className="text-xs text-gray-500 mt-1">
                            Date when the maintenance was completed
                        </div>
                    </div>
                )}

                {/* Issue Description */}
                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor="issue"
                        className="font-semibold text-[#0E1726] text-sm"
                    >
                        Issue Description
                    </label>
                    <textarea
                        id="issue"
                        placeholder="Describe the issue or maintenance task"
                        className="form-textarea"
                        rows={3}
                        value={issue}
                        onChange={(e) => setIssue(e.target.value)}
                        disabled={isProcessing}
                    />
                </div>

                {/* Resolution Notes */}
                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor="resolution"
                        className="font-semibold text-[#0E1726] text-sm"
                    >
                        Resolution Notes
                    </label>
                    <textarea
                        id="resolution"
                        placeholder="Describe the resolution or work performed"
                        className="form-textarea"
                        rows={3}
                        value={resolution}
                        onChange={(e) => setResolution(e.target.value)}
                        disabled={isProcessing}
                    />
                </div>

                {/* Involved Personnel - Keep for UI consistency but note that backend only tracks technician */}
                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor="involvedPersonnel"
                        className="font-semibold text-[#0E1726] text-sm"
                    >
                        Additional Personnel (Optional)
                    </label>
                    <textarea
                        id="involvedPersonnel"
                        placeholder="Enter names of additional personnel involved (comma-separated)"
                        className="form-textarea"
                        rows={2}
                        value={involvedPersonnel}
                        onChange={(e) => setInvolvedPersonnel(e.target.value)}
                        disabled={isProcessing}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                        Main technician: {user?.name || "Current user"}. Enter additional personnel if any.
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
                    className="w-[120px] h-[30px] flex justify-center items-center rounded-md bg-secondary text-white disabled:opacity-50"
                    disabled={isProcessing}
                >
                    {isProcessing ? "..." : (isEditMode ? "Update" : "Create")}
                </button>
            </div>
        </Modal>
    );
};

export default UpdateModal; 