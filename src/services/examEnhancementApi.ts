import client from '../global/api/apiClient';
import {
    ExamModelDto,
    ExamModelAssignmentDto,
    ExamModelUploadRequest,
    StudentFileSubmissionDto,
    SubmissionUploadRequest,
    SubmissionReplaceRequest,
    ExamSubmissionSummaryDto,
    GradeUploadRequest,
    GradeValidationDto,
    ExamFilesDownloadRequest,
    ExamEarlyEntryDto,
    ExamEarlyEntryRequest
} from '../features/admin_exams/types/examTypes';

// Exam Models API
export const examModelsApi = {
    // Upload multiple exam models
    uploadModels: async (request: ExamModelUploadRequest): Promise<ExamModelDto[]> => {
        const formData = new FormData();
        formData.append('examId', request.examId);
        formData.append('modelName', request.modelName);
        if (request.description) {
            formData.append('description', request.description);
        }

        request.files.forEach((file, index) => {
            formData.append(`models`, file);
        });

        const response = await client<ExamModelDto[]>({
            method: 'POST',
            url: '/exam-models/upload',
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Get all models for an exam
    getExamModels: async (examId: string): Promise<ExamModelDto[]> => {
        const response = await client<ExamModelDto[]>({
            method: 'GET',
            url: `/exam-models/exam/${examId}`,
        });
        return response.data;
    },

    // Randomly assign models to students
    assignRandomModels: async (examId: string): Promise<ExamModelAssignmentDto[]> => {
        const response = await client<ExamModelAssignmentDto[]>({
            method: 'POST',
            url: `/exam-models/assign-random/${examId}`,
        });
        return response.data;
    },

    // Get student assignments for an exam
    getStudentAssignments: async (examId: string): Promise<ExamModelAssignmentDto[]> => {
        const response = await client<ExamModelAssignmentDto[]>({
            method: 'GET',
            url: `/exam-models/assignments/${examId}`,
        });
        return response.data;
    },

    // Delete an exam model
    deleteModel: async (modelId: string): Promise<void> => {
        await client({
            method: 'DELETE',
            url: `/exam-models/${modelId}`,
        });
    },

    // Download a specific model
    downloadModel: async (modelId: string): Promise<Blob> => {
        const response = await client<Blob>({
            method: 'GET',
            url: `/exam-models/download/${modelId}`,
            responseType: 'blob',
        });
        return response.data;
    },
};

// Student Submissions API
export const studentSubmissionsApi = {
    // Upload files for exam submission
    uploadFiles: async (request: SubmissionUploadRequest): Promise<StudentFileSubmissionDto[]> => {
        const formData = new FormData();
        formData.append('examScheduleId', request.examScheduleId);
        formData.append('studentId', request.studentId);

        request.files.forEach((file) => {
            formData.append('files', file);
        });

        const response = await client<StudentFileSubmissionDto[]>({
            method: 'POST',
            url: '/student-submissions/upload',
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Replace a submitted file
    replaceFile: async (request: SubmissionReplaceRequest): Promise<StudentFileSubmissionDto> => {
        const formData = new FormData();
        formData.append('file', request.newFile);

        const response = await client<StudentFileSubmissionDto>({
            method: 'PUT',
            url: `/student-submissions/replace/${request.fileId}`,
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Delete a submitted file
    deleteFile: async (fileId: string): Promise<void> => {
        await client({
            method: 'DELETE',
            url: `/student-submissions/file/${fileId}`,
        });
    },

    // Get student's submitted files for an exam
    getStudentSubmissions: async (examScheduleId: string, studentId: string): Promise<StudentFileSubmissionDto[]> => {
        const response = await client<StudentFileSubmissionDto[]>({
            method: 'GET',
            url: `/student-submissions/${examScheduleId}/student/${studentId}`,
        });
        return response.data;
    },

    // Submit exam (finalize submission)
    submitExam: async (examScheduleId: string, studentId: string): Promise<void> => {
        await client({
            method: 'POST',
            url: `/student-submissions/submit/${examScheduleId}/student/${studentId}`,
        });
    },

    // Get assigned exam model for student
    getStudentExamModel: async (examScheduleId: string, studentId: string): Promise<ExamModelDto> => {
        const response = await client<ExamModelDto>({
            method: 'GET',
            url: `/student-submissions/exam-model/${examScheduleId}/student/${studentId}`,
        });
        return response.data;
    },
};

// Exam Grading API
export const examGradingApi = {
    // Get exam submission summary
    getSubmissionSummary: async (examId: string): Promise<ExamSubmissionSummaryDto> => {
        const response = await client<ExamSubmissionSummaryDto>({
            method: 'GET',
            url: `/exam-grading/summary/${examId}`,
        });
        return response.data;
    },

    // Download all submissions as zip
    downloadAllSubmissions: async (examId: string): Promise<Blob> => {
        const response = await client<Blob>({
            method: 'GET',
            url: `/exam-grading/download-submissions/${examId}`,
            responseType: 'blob',
        });
        return response.data;
    },

    // Generate and download grade template
    generateGradeTemplate: async (examId: string): Promise<Blob> => {
        const response = await client<Blob>({
            method: 'GET',
            url: `/exam-grading/grade-template/${examId}`,
            responseType: 'blob',
        });
        return response.data;
    },

    // Validate grade file
    validateGradeFile: async (examId: string, file: File): Promise<GradeValidationDto> => {
        const formData = new FormData();
        formData.append('gradeFile', file);

        const response = await client<GradeValidationDto>({
            method: 'POST',
            url: `/exam-grading/validate-grades/${examId}`,
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Upload grades
    uploadGrades: async (request: GradeUploadRequest): Promise<void> => {
        await client({
            method: 'POST',
            url: '/exam-grading/upload-grades',
            data: request,
        });
    },

    // Download specific student's submission
    downloadStudentSubmission: async (examId: string, studentId: string): Promise<Blob> => {
        const response = await client<Blob>({
            method: 'GET',
            url: `/exam-grading/download-student/${examId}/student/${studentId}`,
            responseType: 'blob',
        });
        return response.data;
    },
};

// Early Exam Entry API
export const examEarlyEntryApi = {
    // Enter exam mode early
    enterExamModeEarly: async (request: ExamEarlyEntryRequest): Promise<ExamEarlyEntryDto> => {
        const response = await client<ExamEarlyEntryDto>({
            method: 'POST',
            url: '/exam-early-entry/enter',
            data: request,
        });
        return response.data;
    },

    // Check if student can enter exam early
    canEnterEarly: async (examScheduleId: string, studentId: string): Promise<{ canEnter: boolean; minutesUntilStart: number }> => {
        const response = await client<{ canEnter: boolean; minutesUntilStart: number }>({
            method: 'GET',
            url: `/exam-early-entry/can-enter/${examScheduleId}/student/${studentId}`,
        });
        return response.data;
    },

    // Get early entry status
    getEarlyEntryStatus: async (examScheduleId: string, studentId: string): Promise<ExamEarlyEntryDto | null> => {
        try {
            const response = await client<ExamEarlyEntryDto>({
                method: 'GET',
                url: `/exam-early-entry/status/${examScheduleId}/student/${studentId}`,
            });
            return response.data;
        } catch (error) {
            // If no early entry found, return null
            return null;
        }
    },

    // Exit early entry mode
    exitEarlyEntry: async (examScheduleId: string, studentId: string): Promise<void> => {
        await client({
            method: 'DELETE',
            url: `/exam-early-entry/exit/${examScheduleId}/student/${studentId}`,
        });
    },
};

// Exam Statistics API  
export const examStatsApi = {
    // Get real-time exam statistics
    getExamStats: async (examId: string): Promise<{
        totalStudents: number;
        inExamMode: number;
        submitted: number;
        inProgress: number;
        notStarted: number;
    }> => {
        const response = await client<{
            totalStudents: number;
            inExamMode: number;
            submitted: number;
            inProgress: number;
            notStarted: number;
        }>({
            method: 'GET',
            url: `/exam-stats/${examId}`,
        });
        return response.data;
    },

    // Get model distribution stats
    getModelDistribution: async (examId: string): Promise<Array<{
        modelId: string;
        modelVersion: string;
        assignedCount: number;
        submittedCount: number;
    }>> => {
        const response = await client<Array<{
            modelId: string;
            modelVersion: string;
            assignedCount: number;
            submittedCount: number;
        }>>({
            method: 'GET',
            url: `/exam-stats/model-distribution/${examId}`,
        });
        return response.data;
    },
}; 