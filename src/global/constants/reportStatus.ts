export enum ReportStatus {
    REPORTED = 'REPORTED',
    PENDING_REVIEW = 'PENDING_REVIEW',
    IN_PROGRESS = 'IN_PROGRESS',
    RESOLVED = 'RESOLVED',
    REJECTED = 'REJECTED',
    CANCELLED = 'CANCELLED'
}

export const REPORT_STATUS_COLORS = {
    [ReportStatus.REPORTED]: 'bg-blue-100 text-blue-800',
    [ReportStatus.PENDING_REVIEW]: 'bg-yellow-100 text-yellow-800',
    [ReportStatus.IN_PROGRESS]: 'bg-purple-100 text-purple-800',
    [ReportStatus.RESOLVED]: 'bg-green-100 text-green-800',
    [ReportStatus.REJECTED]: 'bg-red-100 text-red-800',
    [ReportStatus.CANCELLED]: 'bg-gray-100 text-gray-800'
} as const;

export const REPORT_STATUS_LABELS = {
    [ReportStatus.REPORTED]: 'Reported',
    [ReportStatus.PENDING_REVIEW]: 'Pending Review',
    [ReportStatus.IN_PROGRESS]: 'In Progress',
    [ReportStatus.RESOLVED]: 'Resolved',
    [ReportStatus.REJECTED]: 'Rejected',
    [ReportStatus.CANCELLED]: 'Cancelled'
} as const;

// Helper function to get status badge classes
export const getReportStatusBadge = (status: string) => {
    const normalizedStatus = status.toUpperCase() as ReportStatus;
    return REPORT_STATUS_COLORS[normalizedStatus] || 'bg-gray-100 text-gray-800';
};

// Helper function to get status label
export const getReportStatusLabel = (status: string) => {
    const normalizedStatus = status.toUpperCase() as ReportStatus;
    return REPORT_STATUS_LABELS[normalizedStatus] || status;
};

// Check if report is unresolved
export const isReportUnresolved = (status: string) => {
    const normalizedStatus = status.toUpperCase() as ReportStatus;
    return ![ReportStatus.RESOLVED, ReportStatus.REJECTED, ReportStatus.CANCELLED].includes(normalizedStatus);
}; 