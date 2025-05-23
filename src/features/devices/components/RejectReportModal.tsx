import { useState } from "react";
import Modal from "../../../ui/modal/Modal";

interface RejectReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
}

const RejectReportModal = ({ isOpen, onClose, onConfirm }: RejectReportModalProps) => {
    const [reason, setReason] = useState("");

    const handleSubmit = () => {
        if (!reason.trim()) {
            alert("Please provide a reason for rejection.");
            return;
        }

        onConfirm(reason);
        setReason(""); // Reset for next use
    };

    const handleClose = () => {
        setReason(""); // Reset on close
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Reject Report"
            size="md"
        >
            <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor="reason"
                        className="font-semibold text-[#0E1726] text-sm"
                    >
                        Rejection Reason <span className="text-danger">*</span>
                    </label>
                    <textarea
                        id="reason"
                        placeholder="Explain why this report is being rejected"
                        className="form-textarea"
                        rows={4}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                        Please provide a clear explanation for why the report is being rejected.
                        This will be visible to the person who submitted the report.
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
                <button
                    onClick={handleClose}
                    className="w-[95px] h-[30px] flex justify-center items-center rounded-md border border-secondary text-secondary"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    className="w-[95px] h-[30px] flex justify-center items-center rounded-md bg-danger text-white"
                >
                    Reject
                </button>
            </div>
        </Modal>
    );
};

export default RejectReportModal; 