import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { FaUsers, FaUserGraduate, FaCalendarAlt, FaBookOpen, FaClipboardList, FaArrowLeft } from "react-icons/fa";
import { LuCalendarClock } from "react-icons/lu";
import { RiGroupLine } from "react-icons/ri";
import { TbDeviceAnalytics } from "react-icons/tb";
import CourseStudentsTab from "../components/CourseStudentsTab";
import CourseDetailsModal from "../components/CourseDetailsModal";
import CourseEventsTab from "../components/CourseEventsTab";
import { useAuthStore } from "../../../store/authStore";
import { useCourseControllerGetById, CourseDto } from "../../../generated";

interface TabDefinition {
    id: string;
    label: string;
    requiredPrivilege?: string;
    conditionalVisibility?: (course: CourseDto) => boolean;
}

const CourseDashboardPage = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("");
    const [isEditCourseModalOpen, setIsEditCourseModalOpen] = useState(false);
    const hasPrivilege = useAuthStore((state) => state.hasPrivilege);

    // Fetch course data using the generated hook
    const { 
        data: courseData, 
        isLoading, 
        error 
    } = useCourseControllerGetById(courseId!, {
        query: {
            enabled: !!courseId
        }
    });

    const course = courseData?.data;

    // Define available tabs
    const tabs: TabDefinition[] = [
        { id: "students", label: "Students", requiredPrivilege: "MANAGE_COURSES" },
        { 
            id: "groups", 
            label: "Groups", 
            conditionalVisibility: (course) => course.hasLab,
            requiredPrivilege: "MANAGE_COURSES"
        },
        { id: "events", label: "Events", requiredPrivilege: "MANAGE_COURSES" }
    ];

    // Get visible tabs based on user permissions and course conditions
    const getVisibleTabs = (course: CourseDto) => {
        return tabs.filter(tab => {
            const hasRequiredPrivilege = tab.requiredPrivilege ? hasPrivilege(tab.requiredPrivilege) : true;
            const passesCondition = tab.conditionalVisibility ? tab.conditionalVisibility(course) : true;
            return hasRequiredPrivilege && passesCondition;
        });
    };

    useEffect(() => {
        if (course) {
            // Set the first available tab as active
            const visibleTabs = getVisibleTabs(course);
            if (visibleTabs.length > 0 && !activeTab) {
                setActiveTab(visibleTabs[0].id);
            }
        } else if (error) {
            // Handle course not found
            navigate("/courses");
        }
    }, [course, error, navigate, activeTab]);

    // Show error state
    if (error) {
        return (
            <div className="panel mt-6">
                <div className="flex flex-col items-center justify-center h-64">
                    <div className="text-red-500 text-lg font-semibold mb-2">Course not found</div>
                    <div className="text-gray-600 mb-4">The requested course could not be loaded.</div>
                    <button 
                        onClick={() => navigate("/courses")}
                        className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary-dark"
                    >
                        Back to Courses
                    </button>
                </div>
            </div>
        );
    }

    if (!course) {
        return null;
    }

    const handleNavigateToGroups = () => {
        navigate(`/courses/${courseId}/groups`);
    };
    
    const handleEditCourse = () => {
        setIsEditCourseModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setIsEditCourseModalOpen(false);
    };

    // Get visible tabs for current course
    const visibleTabs = getVisibleTabs(course);

    // Create courseCode from subjectCode and courseNumber
    const courseCode = `${course.subjectCode}${course.courseNumber}`;
    const courseType = course.hasLab ? "Practical" : "Theory";

    return (
        <div className="panel mt-6">
            {/* Back Button & Header */}
            <div className="flex flex-col gap-4 mb-6">
                <button
                    onClick={() => navigate("/courses")}
                    className="flex items-center gap-1 text-secondary hover:text-secondary-dark self-start"
                >
                    <FaArrowLeft size={14} />
                    <span>Back to Courses</span>
                </button>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-secondary">{course.name}</h1>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                            <span className="font-semibold">{courseCode}</span>
                            <span>•</span>
                            <span>{courseType} Course</span>
                            <span>•</span>
                            <span>{course.creditHours} Credit Hours</span>
                            {course.hasLab && (
                                <>
                                    <span>•</span>
                                    <span>Lab Duration: {course.labDuration}</span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button 
                            onClick={handleEditCourse}
                            className="px-4 py-2 bg-secondary text-white rounded-md text-sm">
                            Edit Course
                        </button>
                    </div>
                </div>
            </div>

            {/* Course Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Course Details */}
                <div className="bg-white p-4 rounded-md border shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-full bg-gray-200 text-gray-700">
                            <FaBookOpen size={24} />
                        </div>
                        <div>
                            <p className="text-gray-600 text-sm">Course Details</p>
                            <p className="text-lg font-semibold">{courseCode}</p>
                            <p className="text-sm text-gray-500">{course.creditHours} Credits</p>
                        </div>
                    </div>
                </div>

                {/* Attendance Marks */}
                <div className="bg-white p-4 rounded-md border shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-full bg-primary-light text-primary">
                            <FaClipboardList size={24} />
                        </div>
                        <div>
                            <p className="text-gray-600 text-sm">Attendance Marks</p>
                            <p className="text-2xl font-semibold">{course.attendanceMarks}</p>
                        </div>
                    </div>
                </div>

                {/* Course Type */}
                <div className="bg-white p-4 rounded-md border shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-full bg-secondary-light text-secondary">
                            {course.hasLab ? <TbDeviceAnalytics size={24} /> : <FaBookOpen size={24} />}
                        </div>
                        <div>
                            <p className="text-gray-600 text-sm">Course Type</p>
                            <p className="text-xl font-semibold">{courseType}</p>
                            {course.hasLab && (
                                <p className="text-sm text-gray-500">Duration: {course.labDuration}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="mb-6 border-b">
                <div className="flex flex-wrap gap-1">
                    {visibleTabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => tab.id === "groups" ? handleNavigateToGroups() : setActiveTab(tab.id)}
                            className={`px-4 py-2 font-medium text-sm rounded-t-md transition ${activeTab === tab.id
                                ? "text-secondary border-b-2 border-secondary"
                                : "text-gray-500 hover:text-secondary"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="p-1">
                {activeTab === "students" && (
                    <CourseStudentsTab courseId={parseInt(courseId!)} />
                )}

                {activeTab === "events" && (
                    <CourseEventsTab courseId={parseInt(courseId!)} />
                )}
            </div>

            <CourseDetailsModal
                isOpen={isEditCourseModalOpen}
                onClose={handleCloseModal}
                courseToEdit={course ? {
                    id: parseInt(course.id),
                    courseName: course.name,
                    courseCode: courseCode,
                    courseType: courseType,
                    assignedDoctors: "Not available from API", // This data is not available in CourseDto
                    software: "N/A"
                } : null}
            />
        </div>
    );
};

export default CourseDashboardPage; 