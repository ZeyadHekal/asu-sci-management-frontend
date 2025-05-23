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
    softwareName?: string;
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
        involvedPersonnel: string;
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
        deviceId || "",
        {
            page: 0,
            limit: 100, // Get all software for this device
            sortBy: "name",
            sortOrder: "asc"
        }, 
        { 
            query: { 
                enabled: !!deviceId && isOpen,
                staleTime: 5 * 60 * 1000, // 5 minutes
            } 
        }
    );

    // Update software list when data changes
    useEffect(() => {
        console.log('=== Software List Loading Debug ===');
        console.log('deviceSoftwareData:', deviceSoftwareData);
        
        if (deviceSoftwareData?.data) {
            // Handle the response - could be array or single object depending on API generation
            let softwareItems: any[] = [];
            
            if (Array.isArray(deviceSoftwareData.data)) {
                // If it's an array, take the first item
                const firstPage = deviceSoftwareData.data[0];
                console.log('firstPage:', firstPage);
                softwareItems = firstPage?.items || [];
            } else if (deviceSoftwareData.data && typeof deviceSoftwareData.data === 'object' && 'items' in deviceSoftwareData.data) {
                // If it's a single DeviceSoftwarePagedDto object
                const pagedData = deviceSoftwareData.data as { items: any[]; total: number };
                console.log('pagedData:', pagedData);
                softwareItems = pagedData.items || [];
            }
            
            console.log('softwareItems:', softwareItems);
            
            if (softwareItems.length > 0) {
                const softwareOptions = softwareItems.map((sw: any) => ({
                    value: sw.id,
                    label: sw.name
                }));
                console.log('Setting software list:', softwareOptions);
                setSoftwareList(softwareOptions);
            } else {
                console.log('No software items found, clearing software list');
                setSoftwareList([]);
                setSelectedSoftware(null);
            }
        } else {
            console.log('No software data, clearing software list');
            setSoftwareList([]);
            setSelectedSoftware(null);
        }
    }, [deviceSoftwareData]);

    // Handle software pre-selection when software list is loaded or report is selected
    useEffect(() => {
        console.log('=== Software Auto-Selection Debug ===');
        console.log('softwareList.length:', softwareList.length);
        console.log('selectedReport:', selectedReport);
        console.log('selectedReportOption:', selectedReportOption);
        console.log('reportRecords:', reportRecords);
        console.log('type:', type);
        
        if (softwareList.length > 0) {
            let softwareNameToFind = null;
            
            // Check if we need to pre-select software based on selectedReport
            if (selectedReport && selectedReport.softwareName) {
                softwareNameToFind = selectedReport.softwareName;
                console.log('Auto-selecting software from selectedReport:', softwareNameToFind);
            }
            // Check if we need to pre-select software based on selectedReportOption
            else if (selectedReportOption) {
                const report = reportRecords.find(r => r.id === selectedReportOption.value);
                console.log('Found report from selectedReportOption:', report);
                if (report && report.softwareName) {
                    softwareNameToFind = report.softwareName;
                    console.log('Auto-selecting software from selectedReportOption:', softwareNameToFind);
                }
            }
            
            if (softwareNameToFind) {
                const matchingSoftware = softwareList.find(sw => sw.label === softwareNameToFind);
                console.log('Available software list:', softwareList.map(sw => sw.label));
                console.log('Looking for software:', softwareNameToFind);
                console.log('Found matching software:', matchingSoftware);
                
                if (matchingSoftware && (!selectedSoftware || selectedSoftware.value !== matchingSoftware.value)) {
                    setSelectedSoftware(matchingSoftware);
                    console.log('Software auto-selected:', matchingSoftware);
                } else {
                    console.log('Software not auto-selected because:', {
                        matchingSoftware: !!matchingSoftware,
                        selectedSoftware,
                        sameValue: selectedSoftware?.value === matchingSoftware?.value
                    });
                }
            } else {
                console.log('No software name to find');
            }
        } else {
            console.log('Software list is empty or not loaded yet');
        }
        console.log('=== End Debug ===');
    }, [softwareList, selectedReport, selectedReportOption, reportRecords, type]);

    // Reset form fields when modal opens/closes or edit mode changes
    useEffect(() => {
        console.log('=== Form Reset Debug ===');
        console.log('isOpen:', isOpen);
        console.log('isEditMode:', isEditMode);
        console.log('selectedReport in reset:', selectedReport);
        
        if (isOpen) {
            if (isEditMode && updateData) {
                // Populate form with existing data for editing
                setType({ value: updateData.type, label: updateData.type === "USER_REPORT" ? "User report" : updateData.type });
                setStatus({ value: updateData.status, label: updateData.status });
                setIssue(updateData.issue || "");
                setResolution(updateData.resolution || "");
                setInvolvedPersonnel(updateData.involvedPersonnel);
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
                    console.log('Setting up form for selectedReport:', selectedReport);
                    console.log('selectedReport.softwareName:', selectedReport.softwareName);
                    setType({ value: "USER_REPORT", label: "User report" });
                    setIssue(selectedReport.description);
                    setSelectedReportOption({
                        value: selectedReport.id,
                        label: `${selectedReport.problemType} - ${selectedReport.description.substring(0, 30)}...`
                    });
                    
                    // Software auto-selection is handled by the dedicated useEffect above
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

    // Helper function to determine if software fields should be shown
    const shouldShowSoftwareFields = () => {
        // Case 1: Maintenance type is SOFTWARE_UPDATE
        if (type?.value === "SOFTWARE_UPDATE") {
            return true;
        }
        
        // Case 2: Maintenance type is USER_REPORT and the report has softwareName
        if (type?.value === "USER_REPORT") {
            // Check if selected report has software name
            if (selectedReport && (selectedReport as any).softwareName) {
                return true;
            }
            // Check if selected report option corresponds to a report with software name
            if (selectedReportOption) {
                const report = reportRecords.find(r => r.id === selectedReportOption.value);
                return report && (report as any).softwareName;
            }
        }
        
        return false;
    };

    // Helper function to determine if software should be pre-selected and disabled
    const isSoftwarePreSelected = () => {
        // Only pre-select if it's USER_REPORT with softwareName
        if (type?.value === "USER_REPORT") {
            if (selectedReport && (selectedReport as any).softwareName) {
                return true;
            }
            if (selectedReportOption) {
                const report = reportRecords.find(r => r.id === selectedReportOption.value);
                return report && (report as any).softwareName;
            }
        }
        return false;
    };

    const handleSubmit = () => {
        if (!type || !status) {
            toast.error("Please fill in all required fields.");
            return;
        }

        // Validate software fields if they should be shown
        if (shouldShowSoftwareFields()) {
            if (!selectedSoftware) {
                toast.error("Please select a software.");
                return;
            }
            if (!softwareStatus) {
                toast.error("Please select software status.");
                return;
            }
        }

        // Prepare data for backend API
        const maintenanceData = {
            deviceId: deviceId,
            maintenanceType: type.value as CreateMaintenanceHistoryDtoMaintenanceTypeEnum,
            status: status.value as CreateMaintenanceHistoryDtoStatusEnum,
            description: issue || `${type.label} maintenance`,
            resolutionNotes: resolution || undefined,
            relatedReportId: selectedReportOption?.value || undefined,
            completedAt: status.value === "COMPLETED" ? new Date(completedAt).toISOString() : undefined,
            involvedPersonnel,
            softwareId: selectedSoftware?.value || undefined,
            softwareHasIssue: softwareStatus?.value ? softwareStatus.value === "Has Issues" : undefined,
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
                
                // Software auto-selection is handled by the dedicated useEffect above
            }
        } else {
            // Clear software selection when no report is selected (unless it's SOFTWARE_UPDATE type)
            if (type?.value !== "SOFTWARE_UPDATE") {
                setSelectedSoftware(null);
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
                {shouldShowSoftwareFields() && (
                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="softwareSelect"
                            className="font-semibold text-[#0E1726] text-sm"
                        >
                            Select Software <span className="text-danger">*</span>
                        </label>
                        <Select
                            id="softwareSelect"
                            options={softwareList}
                            value={selectedSoftware}
                            onChange={(selectedOption) => setSelectedSoftware(selectedOption)}
                            isDisabled={isProcessing || isSoftwarePreSelected()}
                            placeholder="Select software"
                        />
                        {isSoftwarePreSelected() && (
                            <div className="text-xs text-gray-500 mt-1">
                                Software is pre-selected based on the report
                            </div>
                        )}
                    </div>
                )}

                {/* Software Status Dropdown */}
                {shouldShowSoftwareFields() && (
                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="softwareStatus"
                            className="font-semibold text-[#0E1726] text-sm"
                        >
                            Software Status <span className="text-danger">*</span>
                        </label>
                        <Select
                            id="softwareStatus"
                            options={[
                                { value: "Working", label: "Working" },
                                { value: "Has Issues", label: "Has Issues" }
                            ]}
                            value={softwareStatus}
                            onChange={(selectedOption) => setSoftwareStatus(selectedOption)}
                            isDisabled={isProcessing}
                            placeholder="Select software status"
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