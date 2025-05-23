import { useState } from "react";
import Modal from "../../../ui/modal/Modal";
import { DataTable } from "mantine-datatable";
import { IoMdCheckmarkCircleOutline, IoMdCloseCircleOutline } from "react-icons/io";
import { FaTools, FaPencilAlt, FaRegClock } from "react-icons/fa";

interface UpdateInfo {
    id: number;
    date: string;
    status: string;
    type?: string;
    issue?: string;
    resolution?: string;
    involvedPersonnel?: string[];
}

interface UpdateHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    updates: UpdateInfo[];
    reportDescription: string;
    reportDate: string;
}

const UpdateHistoryModal = ({
    isOpen,
    onClose,
    updates,
    reportDescription,
    reportDate
}: UpdateHistoryModalProps) => {
    const sortedUpdates = [...updates].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Helper function to get the appropriate icon based on status
    const getStatusIcon = (status: string) => {
        if (status === "Passed" || status === "Resolved") {
            return <IoMdCheckmarkCircleOutline className="text-green-500 text-lg" />;
        } else if (status === "Failed") {
            return <IoMdCloseCircleOutline className="text-red-500 text-lg" />;
        } else if (status === "In Progress") {
            return <FaTools className="text-blue-500 text-lg" />;
        } else if (status === "Pending") {
            return <FaRegClock className="text-yellow-500 text-lg" />;
        } else {
            return <FaPencilAlt className="text-gray-500 text-lg" />;
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Update History"
            size="lg"
        >
            <div className="flex flex-col gap-5">
                {/* Report Info */}
                <div className="bg-gray-50 p-4 rounded-md">
                    <div className="mb-2">
                        <span className="text-sm text-gray-500">Original Report:</span>
                        <p className="font-medium">{reportDescription}</p>
                    </div>
                    <div>
                        <span className="text-sm text-gray-500">Report Date:</span>
                        <p className="font-medium">{reportDate}</p>
                    </div>
                </div>

                {/* Updates Timeline */}
                <div>
                    <h3 className="text-lg font-semibold mb-3">Update Timeline</h3>
                    {sortedUpdates && sortedUpdates.length > 0 ? (
                        <div className="relative">
                            {/* Timeline Line */}
                            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                            {/* Timeline Entries */}
                            <div className="space-y-6">
                                {sortedUpdates.map((update, index) => (
                                    <div key={update.id} className="relative pl-12">
                                        {/* Timeline Dot */}
                                        <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center ${update.status === "Passed" || update.status === "Resolved"
                                            ? "bg-green-100"
                                            : update.status === "In Progress"
                                                ? "bg-blue-100"
                                                : update.status === "Pending"
                                                    ? "bg-yellow-100"
                                                    : "bg-amber-100"
                                            }`}>
                                            <div className={`w-3 h-3 rounded-full ${update.status === "Passed" || update.status === "Resolved"
                                                ? "bg-green-500"
                                                : update.status === "In Progress"
                                                    ? "bg-blue-500"
                                                    : update.status === "Pending"
                                                        ? "bg-yellow-500"
                                                        : "bg-amber-500"
                                                }`}></div>
                                        </div>

                                        {/* Update Content */}
                                        <div className="bg-white border rounded-md p-4 shadow-sm">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center">
                                                    {getStatusIcon(update.status)}
                                                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${update.status === "Passed" || update.status === "Resolved"
                                                        ? "bg-green-100 text-green-800"
                                                        : update.status === "In Progress"
                                                            ? "bg-blue-100 text-blue-800"
                                                            : update.status === "Pending"
                                                                ? "bg-yellow-100 text-yellow-800"
                                                                : "bg-amber-100 text-amber-800"
                                                        }`}>
                                                        {update.status}
                                                    </span>
                                                    {update.type && (
                                                        <span className="ml-2 text-sm text-gray-600">
                                                            - {update.type}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {update.date}
                                                </div>
                                            </div>

                                            {/* Issue Details */}
                                            {update.issue && (
                                                <div className="mb-3 border-l-2 border-blue-300 pl-3">
                                                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Issue:</h4>
                                                    <p className="text-sm text-gray-700">
                                                        {update.issue}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Resolution Details */}
                                            {update.resolution && (
                                                <div className="mb-3 border-l-2 border-green-300 pl-3">
                                                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Resolution:</h4>
                                                    <p className="text-sm text-gray-700">
                                                        {update.resolution}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Personnel Involved */}
                                            {update.involvedPersonnel && update.involvedPersonnel.length > 0 && (
                                                <div className="mt-3 pt-3 border-t border-gray-100">
                                                    <h4 className="text-xs font-semibold text-gray-500 mb-1">Personnel Involved:</h4>
                                                    <p className="text-xs text-gray-600">
                                                        {update.involvedPersonnel.join(", ")}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-6 text-gray-500">
                            No updates available for this report.
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-end mt-6">
                <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-md bg-secondary text-white"
                >
                    Close
                </button>
            </div>
        </Modal>
    );
};

export default UpdateHistoryModal; 