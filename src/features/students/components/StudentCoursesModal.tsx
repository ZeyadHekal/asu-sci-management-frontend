import { useState, useEffect } from "react";
import Modal from "../../../ui/modal/Modal";
import { StudentDto } from "../../../generated/types/StudentDto";
import { DataTable } from "mantine-datatable";
import { RiDeleteBinLine } from "react-icons/ri";
import Select from "react-select";

// Mock course data - in a real app this would come from the API
interface CourseOption {
    value: string;
    label: string;
}

interface EnrolledCourse {
    id: string;
    code: string;
    name: string;
    credits: number;
    enrolledDate: string;
}

const availableCourses: CourseOption[] = [
    { value: "MATH101", label: "MATH101 - Calculus I" },
    { value: "COMP101", label: "COMP101 - Introduction to Programming" },
    { value: "STAT101", label: "STAT101 - Statistics Fundamentals" },
    { value: "PHYS101", label: "PHYS101 - Physics I" },
];

// Mock enrolled courses
const mockEnrolledCourses: EnrolledCourse[] = [
    {
        id: "1",
        code: "MATH201",
        name: "Calculus II",
        credits: 3,
        enrolledDate: "2023-09-01",
    },
    {
        id: "2",
        code: "COMP201",
        name: "Data Structures",
        credits: 4,
        enrolledDate: "2023-09-01",
    },
];

interface StudentCoursesModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: StudentDto | null;
}

const StudentCoursesModal = ({ isOpen, onClose, student }: StudentCoursesModalProps) => {
    const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<CourseOption | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch enrolled courses when student changes
    useEffect(() => {
        if (student) {
            // In a real app, this would be an API call to get the student's enrolled courses
            setEnrolledCourses(mockEnrolledCourses);
        }
    }, [student]);

    const handleEnrollCourse = async () => {
        if (!selectedCourse) return;

        setIsSubmitting(true);
        try {
            // In a real app, this would be an API call to enroll the student in the selected course
            console.log(`Enrolling student ${student?.id} in course ${selectedCourse.value}`);

            // Simulate adding a new course to the list
            const newCourse: EnrolledCourse = {
                id: Math.random().toString(),
                code: selectedCourse.value,
                name: selectedCourse.label.split(" - ")[1],
                credits: 3, // Default credits, would come from the API in a real app
                enrolledDate: new Date().toISOString().split("T")[0],
            };

            setEnrolledCourses([...enrolledCourses, newCourse]);
            setSelectedCourse(null);
        } catch (error) {
            console.error("Error enrolling in course:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveCourse = async (courseId: string) => {
        try {
            // In a real app, this would be an API call to remove the enrollment
            console.log(`Removing course ${courseId} from student ${student?.id}`);

            // Update the local state to remove the course
            setEnrolledCourses(enrolledCourses.filter((course) => course.id !== courseId));
        } catch (error) {
            console.error("Error removing course:", error);
        }
    };

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
                                options={availableCourses}
                                value={selectedCourse}
                                onChange={setSelectedCourse}
                                placeholder="Select a course"
                                isClearable
                                className="w-full"
                            />
                        </div>
                        <button
                            onClick={handleEnrollCourse}
                            disabled={!selectedCourse || isSubmitting}
                            className="px-4 py-2 bg-secondary text-white rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Enrolling..." : "Enroll"}
                        </button>
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-medium mb-2">Enrolled Courses</h3>
                    <DataTable
                        highlightOnHover
                        withBorder
                        className="table-hover whitespace-nowrap"
                        records={enrolledCourses}
                        columns={[
                            {
                                accessor: "code",
                                title: "Course Code",
                                render: (row) => (
                                    <span className="font-medium">{row.code}</span>
                                ),
                            },
                            { accessor: "name", title: "Course Name" },
                            { accessor: "credits", title: "Credits" },
                            { accessor: "enrolledDate", title: "Enrolled Date" },
                            {
                                accessor: "actions",
                                title: "Actions",
                                render: (row) => (
                                    <button
                                        onClick={() => handleRemoveCourse(row.id)}
                                        className="text-gray-500 hover:text-danger"
                                        title="Remove course"
                                    >
                                        <RiDeleteBinLine size={20} className="text-[#0E1726]" />
                                    </button>
                                ),
                            },
                        ]}
                    />
                    {enrolledCourses.length === 0 && (
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