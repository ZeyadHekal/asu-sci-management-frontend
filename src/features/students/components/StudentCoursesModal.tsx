import React, { useState, useEffect } from "react";
import Modal from "../../../ui/modal/Modal";
import { StudentDto } from "../../../generated/types/StudentDto";
import { EnrollStudentDto } from "../../../generated/types/EnrollStudentDto";
import { DataTable } from "mantine-datatable";
import { RiDeleteBinLine } from "react-icons/ri";
import Select from "react-select";
import { useStudentCourseControllerGetAvailableCourses } from "../../../generated/hooks/student-coursesHooks/useStudentCourseControllerGetAvailableCourses";
import { useStudentCourseControllerGetStudentCourses } from "../../../generated/hooks/student-coursesHooks/useStudentCourseControllerGetStudentCourses";
import { useStudentCourseControllerEnrollStudent } from "../../../generated/hooks/student-coursesHooks/useStudentCourseControllerEnrollStudent";
import { useStudentCourseControllerRemoveStudentFromCourse } from "../../../generated/hooks/student-coursesHooks/useStudentCourseControllerRemoveStudentFromCourse";
import toast from "react-hot-toast";

// Mock course data - in a real app this would come from the API
interface CourseOption {
    value: string;
    label: string;
}

interface EnrolledCourse {
    id: string;
    courseId: string;
    courseName: string;
    courseCode: string;
    credits: number;
    enrolledDate: string;
}

interface StudentCoursesModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: StudentDto | null;
}

const StudentCoursesModal = ({ isOpen, onClose, student }: StudentCoursesModalProps) => {
    const [selectedCourse, setSelectedCourse] = useState<CourseOption | null>(null);

    // Debug the student object
    console.log("StudentCoursesModal - student object:", student);
    console.log("StudentCoursesModal - isOpen:", isOpen);

    // API hooks for fetching data
    const { data: availableCoursesData, isLoading: loadingAvailableCourses } = useStudentCourseControllerGetAvailableCourses(
        {
            query: {
                enabled: isOpen && !!student,
                refetchOnWindowFocus: false
            }
        }
    );

    const { data: studentCoursesData, isLoading: loadingStudentCourses, refetch: refetchStudentCourses } = useStudentCourseControllerGetStudentCourses(
        student?.id || "",
        {
            query: {
                enabled: isOpen && !!student,
                refetchOnWindowFocus: false
            }
        }
    );

    // API hooks for mutations
    const enrollStudentMutation = useStudentCourseControllerEnrollStudent();
    const removeStudentMutation = useStudentCourseControllerRemoveStudentFromCourse();

    // Transform available courses data for react-select
    const availableCourses: CourseOption[] = React.useMemo(() => {
        if (!availableCoursesData?.data) return [];
        
        // Type the course object properly
        return (availableCoursesData.data as any[]).map((course: any) => ({
            value: course.id,
            label: `${course.code} - ${course.name}`
        }));
    }, [availableCoursesData]);

    // Transform enrolled courses data for the table
    const enrolledCourses: EnrolledCourse[] = React.useMemo(() => {
        if (!studentCoursesData?.data) return [];
        
        // Type the enrollment object properly
        return (studentCoursesData.data as any[]).map((enrollment: any) => ({
            id: enrollment.id || enrollment.courseId,
            courseId: enrollment.courseId,
            courseName: enrollment.courseName || "",
            courseCode: enrollment.courseCode || "",
            credits: enrollment.credits || 0,
            enrolledDate: typeof enrollment.enrolledDate === 'string' 
                ? enrollment.enrolledDate 
                : new Date().toISOString().split("T")[0],
        }));
    }, [studentCoursesData]);

    const handleEnrollCourse = async () => {
        if (!selectedCourse || !student) return;

        try {
            console.log("Enrolling student:", { studentId: student.id, courseId: selectedCourse.value });
            
            const enrollmentData: EnrollStudentDto = {
                studentId: student.id,
                courseId: selectedCourse.value,
            };
            
            await enrollStudentMutation.mutateAsync({
                data: enrollmentData
            });

            toast.success("Student enrolled in course successfully");
            setSelectedCourse(null);
            await refetchStudentCourses();
        } catch (error: any) {
            console.error("Error enrolling in course:", error);
            console.error("Error details:", error?.response?.data);
            toast.error(error?.response?.data?.message || "Failed to enroll student in course");
        }
    };

    const handleRemoveCourse = async (courseId: string) => {
        if (!student) return;

        try {
            console.log("Removing student from course:", { studentId: student.id, courseId });
            
            await removeStudentMutation.mutateAsync({
                studentId: student.id,
                courseId: courseId,
            });

            toast.success("Student removed from course successfully");
            await refetchStudentCourses();
        } catch (error: any) {
            console.error("Error removing course:", error);
            console.error("Error details:", error?.response?.data);
            toast.error(error?.response?.data?.message || "Failed to remove student from course");
        }
    };

    // Filter out already enrolled courses from available courses
    const filteredAvailableCourses = React.useMemo(() => {
        const enrolledCourseIds = enrolledCourses.map(course => course.courseId);
        return availableCourses.filter(course => !enrolledCourseIds.includes(course.value));
    }, [availableCourses, enrolledCourses]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Manage Courses for ${student?.name || ""}`}
            size="lg"
        >
            <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="text-sm font-medium mb-2">Enroll in New Course</h3>
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <Select
                                options={filteredAvailableCourses}
                                value={selectedCourse}
                                onChange={setSelectedCourse}
                                placeholder="Select a course"
                                isClearable
                                isLoading={loadingAvailableCourses}
                                className="w-full"
                                isDisabled={filteredAvailableCourses.length === 0}
                            />
                        </div>
                        <button
                            onClick={handleEnrollCourse}
                            disabled={!selectedCourse || enrollStudentMutation.isPending}
                            className="px-4 py-2 bg-secondary text-white rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            {enrollStudentMutation.isPending ? "Enrolling..." : "Enroll"}
                        </button>
                    </div>
                    {filteredAvailableCourses.length === 0 && !loadingAvailableCourses && (
                        <p className="text-sm text-gray-500 mt-2">
                            No available courses to enroll in.
                        </p>
                    )}
                </div>

                <div>
                    <h3 className="text-sm font-medium mb-2">Enrolled Courses</h3>
                    {loadingStudentCourses ? (
                        <div className="text-center py-4">
                            <span className="text-gray-500">Loading courses...</span>
                        </div>
                    ) : (
                        <DataTable
                            highlightOnHover
                            withBorder
                            className="table-hover whitespace-nowrap"
                            records={enrolledCourses}
                            columns={[
                                {
                                    accessor: "courseCode",
                                    title: "Course Code",
                                    render: (row) => (
                                        <span className="font-medium">{row.courseCode}</span>
                                    ),
                                },
                                { 
                                    accessor: "courseName", 
                                    title: "Course Name",
                                    render: (row) => (
                                        <span>{row.courseName}</span>
                                    ),
                                },
                                { 
                                    accessor: "credits", 
                                    title: "Credits",
                                    render: (row) => (
                                        <span>{row.credits}</span>
                                    ),
                                },
                                { 
                                    accessor: "enrolledDate", 
                                    title: "Enrolled Date",
                                    render: (row) => (
                                        <span>{new Date(row.enrolledDate).toLocaleDateString()}</span>
                                    ),
                                },
                                {
                                    accessor: "actions",
                                    title: "Actions",
                                    render: (row) => (
                                        <button
                                            onClick={() => handleRemoveCourse(row.courseId)}
                                            disabled={removeStudentMutation.isPending}
                                            className="text-gray-500 hover:text-danger disabled:opacity-50"
                                            title="Remove course"
                                        >
                                            <RiDeleteBinLine size={20} className="text-[#0E1726]" />
                                        </button>
                                    ),
                                },
                            ]}
                        />
                    )}
                    {enrolledCourses.length === 0 && !loadingStudentCourses && (
                        <div className="text-center py-4 text-gray-500">
                            This student is not enrolled in any courses.
                        </div>
                    )}
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                    >
                        Close
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default StudentCoursesModal; 