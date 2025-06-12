import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { FaUsers, FaUserGraduate, FaCalendarAlt, FaBookOpen, FaClipboardList, FaArrowLeft, FaUpload, FaDownload } from "react-icons/fa";
import { LuCalendarClock, LuUsers as LuUsersIcon } from "react-icons/lu";
import { RiGroupLine } from "react-icons/ri";
import { TbDeviceAnalytics } from "react-icons/tb";
import CourseStudentsTab from "../components/CourseStudentsTab";
import CourseEventsTab from "../components/CourseEventsTab";
import CourseContentTab from "../components/CourseContentTab";
import AssistantGroupsTab from "../components/AssistantGroupsTab";
import StudentGroupDetailsTab from "../components/StudentGroupDetailsTab";
import { useAuthStore } from "../../../store/authStore";
import { useCourseControllerGetById, CourseDetailDto } from "../../../generated";

interface TabDefinition {
    id: string;
    label: string;
    requiredPrivilege?: string;
    conditionalVisibility?: (course: CourseDetailDto) => boolean;
    userTypes: ("professor" | "assistant" | "student")[];
}

const MyCourseDashboardPage = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("");
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

    // Define available tabs based on privileges, not user types
    const tabs: TabDefinition[] = [
        // Content tab - visible to all users
        { 
            id: "content", 
            label: "Course Content", 
            userTypes: ["professor", "assistant", "student"] 
        },
        
        // Students tab - for users who can manage courses or teach courses
        { 
            id: "students", 
            label: "Students", 
            userTypes: ["professor", "assistant", "student"],
            conditionalVisibility: () => hasPrivilege("MANAGE_COURSES") || hasPrivilege("TEACH_COURSE")
        },
        
        // Events tab - for users who can manage courses or teach courses
        { 
            id: "events", 
            label: "Events", 
            userTypes: ["professor", "assistant", "student"],
            conditionalVisibility: () => hasPrivilege("MANAGE_COURSES") || hasPrivilege("TEACH_COURSE")
        },
        
        // Assistant-specific tabs - for users who can assist in courses in lab courses
        { 
            id: "my-groups", 
            label: "My Groups", 
            userTypes: ["professor", "assistant", "student"],
            conditionalVisibility: (course) => course.hasLab && hasPrivilege("ASSIST_IN_COURSE") && !hasPrivilege("TEACH_COURSE"),
        },
        
        // Student-only tabs - for users without teaching or assisting privileges in lab courses
        { 
            id: "my-group", 
            label: "My Group", 
            userTypes: ["professor", "assistant", "student"],
            conditionalVisibility: (course) => course.hasLab && !hasPrivilege("TEACH_COURSE") && !hasPrivilege("ASSIST_IN_COURSE"),
        },
    ];

    // Get visible tabs based on privileges only
    const getVisibleTabs = (course: CourseDetailDto) => {
        return tabs.filter(tab => {
            // Check privilege requirements
            if (tab.requiredPrivilege && !hasPrivilege(tab.requiredPrivilege)) return false;
            
            // Check conditional visibility
            if (tab.conditionalVisibility && !tab.conditionalVisibility(course)) return false;
            
            return true;
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
            navigate("/my-courses");
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
                        onClick={() => navigate("/my-courses")}
                        className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary-dark"
                    >
                        Back to My Courses
                    </button>
                </div>
            </div>
        );
    }

    if (!course) {
        return null;
    }

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
                    onClick={() => navigate("/my-courses")}
                    className="flex items-center gap-1 text-secondary hover:text-secondary-dark self-start"
                >
                    <FaArrowLeft size={14} />
                    <span>Back to My Courses</span>
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

                    {/* User type indicator */}
                    <div className="flex items-center gap-2">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                            course.hasLab ? (course.hasLab ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800") :
                            "bg-green-100 text-green-800"
                        }`}>
                            {course.hasLab ? "Lab Course" : "Theory Course"}
                        </div>
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
                            <p className="text-sm text-gray-500">{courseType}</p>
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
                            onClick={() => setActiveTab(tab.id)}
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
                {activeTab === "content" && (
                    <CourseContentTab courseId={courseId!} />
                )}

                {activeTab === "students" && (
                    <CourseStudentsTab courseId={courseId!} />
                )}
                
                {activeTab === "events" && (
                    <CourseEventsTab 
                      courseId={courseId!} 
                      courseName={courseData?.data?.name || ''} 
                      hasEditAccess={hasPrivilege("MANAGE_COURSES") || hasPrivilege("TEACH_COURSE")}
                    />
                )}

                {activeTab === "my-groups" && (
                    <AssistantGroupsTab courseId={courseId!} />
                )}

                {activeTab === "my-group" && (
                    <StudentGroupDetailsTab courseId={courseId!} />
                )}
            </div>
        </div>
    );
};

export default MyCourseDashboardPage; 