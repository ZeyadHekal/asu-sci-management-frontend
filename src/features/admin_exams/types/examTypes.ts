import { EventDto } from '../../../generated/types/EventDto';
import { EventScheduleDto } from '../../../generated/types/EventScheduleDto';
import { CourseGroupDto } from '../../../generated/types/CourseGroupDto';

// Extended exam settings for auto/manual start
export interface ExamSettings {
    autoStart: boolean;
    startTime?: Date;
    endTime?: Date;
    enableExamMode30MinBefore: boolean;
    allowEarlyAccess: boolean;
    lockdownBrowserRequired: boolean;
}

// Exam group allocation for lab-based exams
export interface ExamGroupAllocation {
    groupId: string;
    labId: string;
    scheduleId: string;
    studentCount: number;
    capacity: number;
    examFiles: string;
    assistantId: string;
    startTime: Date;
    endTime: Date;
}

// Enhanced exam with group management
export interface EnhancedExamDto extends EventDto {
    settings: ExamSettings;
    groupAllocations: ExamGroupAllocation[];
    totalStudents: number;
    requiredLabs: number;
    status: 'draft' | 'scheduled' | 'exam_mode' | 'in_progress' | 'completed' | 'cancelled';
    createdBy: string;
    lastModified: Date;
}

// Student exam status for real-time tracking
export interface StudentExamStatus {
    studentId: string;
    examId: string;
    groupId: string;
    status: 'waiting' | 'exam_mode' | 'in_exam' | 'completed' | 'absent';
    joinedAt?: Date;
    startedAt?: Date;
    completedAt?: Date;
    hasAccess: boolean;
}

// Exam mode notification types
export interface ExamModeNotification {
    type: 'exam_mode_start' | 'exam_access_granted' | 'exam_started' | 'exam_ended' | 'exam_warning';
    examId: string;
    groupIds: string[];
    message: string;
    timestamp: Date;
    requiresAction?: boolean;
}

// Group calculation result for admin planning
export interface GroupCalculationResult {
    totalStudents: number;
    requiredGroups: number;
    studentsPerGroup: number;
    availableLabs: Lab[];
    recommendedAllocation: {
        labId: string;
        labName: string;
        capacity: number;
        assignedGroups: number;
        assignedStudents: number;
    }[];
    warnings: string[];
}

// Lab information for group allocation
export interface Lab {
    id: string;
    name: string;
    capacity: number;
    available: boolean;
    equipment: string[];
    location: string;
}

// Real-time exam channels for WebSocket communication
export interface ExamChannelData {
    examId: string;
    groupIds: string[];
    channelName: string;
}

// Exam model management
export interface ExamModelDto {
    id: string;
    examId: string;
    name: string;
    version: string;
    description?: string;
    fileName: string;
    fileSize: number;
    fileUrl: string;
    uploadedAt: Date;
    assignedStudentCount: number;
}

export interface ExamModelAssignmentDto {
    studentId: string;
    studentName: string;
    seatNo: string;
    examModelId: string;
    examModelVersion: string;
    assignedAt: Date;
}

export interface ExamModelUploadRequest {
    examId: string;
    modelName: string;
    description?: string;
    files: File[];
}

// Student file submissions
export interface StudentFileSubmissionDto {
    id: string;
    examScheduleId: string;
    studentId: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    fileUrl: string;
    uploadedAt: Date;
    replacedAt?: Date;
}

export interface SubmissionUploadRequest {
    examScheduleId: string;
    studentId: string;
    files: File[];
}

export interface SubmissionReplaceRequest {
    fileId: string;
    newFile: File;
}

// Grading and download functionality
export interface ExamSubmissionSummaryDto {
    examId: string;
    examName: string;
    totalStudents: number;
    submittedStudents: number;
    gradedStudents: number;
    submissions: StudentSubmissionDto[];
}

export interface StudentSubmissionDto {
    studentId: string;
    studentName: string;
    seatNo: string;
    examModel: string;
    submittedFiles: StudentFileSubmissionDto[];
    submissionTime?: Date;
    hasSubmitted: boolean;
    currentGrade?: number;
    gradedAt?: Date;
    gradedBy?: string;
}

export interface GradeUploadRequest {
    examId: string;
    grades: GradeEntryDto[];
}

export interface GradeEntryDto {
    studentId: string;
    studentName: string;
    seatNo: string;
    grade: number;
    comments?: string;
}

export interface GradeValidationDto {
    isValid: boolean;
    validGrades: GradeEntryDto[];
    errors: ValidationErrorDto[];
    warnings: ValidationWarningDto[];
}

export interface ValidationErrorDto {
    row: number;
    studentName: string;
    seatNo: string;
    field: string;
    error: string;
}

export interface ValidationWarningDto {
    row: number;
    studentName: string;
    message: string;
}

export interface ExamFilesDownloadRequest {
    examId: string;
    includeGradeTemplate?: boolean;
}

// Early exam entry
export interface ExamEarlyEntryDto {
    examScheduleId: string;
    studentId: string;
    enteredAt: Date;
    examStartsAt: Date;
    minutesUntilStart: number;
}

export interface ExamEarlyEntryRequest {
    examScheduleId: string;
    studentId: string;
} 