import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router";
import { FaUsers, FaUserGraduate, FaCalendarAlt, FaBookOpen, FaClipboardList, FaArrowLeft, FaUpload, FaDownload } from "react-icons/fa";
import { LuCalendarClock, LuUsers as LuUsersIcon } from "react-icons/lu";
import { RiGroupLine } from "react-icons/ri";
import { TbDeviceAnalytics, TbAlertTriangle } from "react-icons/tb";
import CourseStudentsTab from "../components/CourseStudentsTab";
import CourseDetailsModal from "../components/CourseDetailsModal";
import CourseEventsTab from "../components/CourseEventsTab";
import CourseContentTab from "../components/CourseContentTab";
import StudentGradesDashboard from "../components/StudentGradesDashboard";
import AssistantGroupsTab from "../components/AssistantGroupsTab";
import StudentGroupDetailsTab from "../components/StudentGroupDetailsTab";
import CourseAccessManagementTab from "../components/CourseAccessManagementTab";
import { useAuthStore } from "../../../store/authStore";
import { useCourseControllerGetById, CourseDetailDto } from "../../../generated";
import { useQuery } from "@tanstack/react-query";
import { client } from "../../../global/api/apiClient";

interface TabDefinition {
    id: string;
    label: string;
    requiredPrivilege?: string;
    conditionalVisibility?: (course: CourseDetailDto) => boolean;
    userTypes: ("professor" | "assistant" | "student")[];
}

const CourseDashboardPage = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState("");
    const [isEditCourseModalOpen, setIsEditCourseModalOpen] = useState(false);
    const hasPrivilege = useAuthStore((state) => state.hasPrivilege);

    // Fetch course data using the generated hook
    const { 
        data: courseData, 
        isLoading, 
        error,
        refetch
    } = useCourseControllerGetById(courseId!, {
        query: {
            enabled: !!courseId
        }
    });

    const course = courseData?.data;

    // Fetch students in default group for practical courses
    const { 
        data: defaultGroupStudents 
    } = useQuery({
        queryKey: ['defaultGroupStudents', courseId],
        queryFn: async () => {
            const response = await client({
                method: 'GET',
                url: `/course-groups/course/${courseId}/default-group-students`
            });
            return response.data;
        },
        enabled: !!courseId && !!course?.hasLab && (hasPrivilege("MANAGE_COURSES") || hasPrivilege("TEACH_COURSE"))
    });

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
        
        // Grades tab - for users who can manage courses or teach courses
        { 
            id: "grades", 
            label: "Student Grades", 
            userTypes: ["professor", "assistant", "student"],
            conditionalVisibility: () => hasPrivilege("MANAGE_COURSES") || hasPrivilege("TEACH_COURSE")
        },
        
        // Groups management tab - for users who can manage courses or teach courses in lab courses
        { 
            id: "groups", 
            label: "Groups", 
            userTypes: ["professor", "assistant", "student"],
            conditionalVisibility: (course) => course.hasLab && (hasPrivilege("MANAGE_COURSES") || hasPrivilege("TEACH_COURSE"))
        },
        
        // Access management tab - for users who can manage courses or teach courses
        { 
            id: "access", 
            label: "Access Management", 
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
            const visibleTabs = getVisibleTabs(course);
            
            // Get tab from URL query parameter
            const tabFromUrl = searchParams.get('tab');
            
            if (tabFromUrl && visibleTabs.some(tab => tab.id === tabFromUrl)) {
                // Use tab from URL if it's valid
                setActiveTab(tabFromUrl);
            } else if (visibleTabs.length > 0 && !activeTab) {
                // Set the first available tab as active and update URL
                const firstTab = visibleTabs[0].id;
                setActiveTab(firstTab);
                setSearchParams({ tab: firstTab });
            }
        } else if (error) {
            // Handle course not found
            navigate("/courses");
        }
    }, [course, error, navigate, activeTab, searchParams, setSearchParams]);

    // Function to handle tab change with URL update
    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
        setSearchParams({ tab: tabId });
    };

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

    const handleModalSuccess = () => {
        refetch(); // Refresh the course data
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

                    <div className="flex items-center gap-2">
                        {/* Edit Course Button - only for MANAGE_COURSES users */}
                        {hasPrivilege("MANAGE_COURSES") && (
                            <button 
                                onClick={handleEditCourse}
                                className="px-4 py-2 bg-secondary text-white rounded-md text-sm hover:bg-secondary-dark">
                                Edit Course
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Warning Banner for Students in Default Group - only for course managers/doctors */}
            {course.hasLab && (hasPrivilege("MANAGE_COURSES") || hasPrivilege("TEACH_COURSE")) && (defaultGroupStudents as {count: number})?.count > 0 && (
                <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-start gap-3">
                        <TbAlertTriangle className="text-orange-600 mt-0.5" size={20} />
                        <div className="flex-1">
                            <h3 className="font-medium text-orange-800 mb-1">
                                Students in Default Group
                            </h3>
                            <p className="text-sm text-orange-700 mb-2">
                                There are <strong>{(defaultGroupStudents as {count: number})?.count} students</strong> assigned to the default group. 
                                The default group is intended as a temporary holding group and cannot be assigned to any lab.
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleNavigateToGroups}
                                    className="text-sm px-3 py-1 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                                >
                                    Manage Groups
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                            onClick={() => tab.id === "groups" ? handleNavigateToGroups() : handleTabChange(tab.id)}
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
                courseName={course.name}
                hasEditAccess={hasPrivilege("MANAGE_COURSES") || hasPrivilege("TEACH_COURSE")}
              />
            )}

            {activeTab === "grades" && (
              <StudentGradesDashboard courseId={courseId!} courseName={course.name} />
            )}

                {activeTab === "access" && (
                    <CourseAccessManagementTab courseId={courseId!} />
                )}

                {activeTab === "my-groups" && (
                    <AssistantGroupsTab courseId={courseId!} />
                )}

                {activeTab === "my-group" && (
                    <StudentGroupDetailsTab courseId={courseId!} />
                )}
            </div>

            {/* Course Edit Modal */}
            {hasPrivilege("MANAGE_COURSES") && (
                <CourseDetailsModal
                    isOpen={isEditCourseModalOpen}
                    onClose={handleCloseModal}
                    courseToEdit={{
                        id: course.id,
                        name: course.name,
                        creditHours: course.creditHours,
                        subjectCode: course.subjectCode,
                        courseNumber: course.courseNumber,
                        hasLab: course.hasLab,
                        labDuration: course.labDuration,
                        attendanceMarks: course.attendanceMarks,
                        assignedDoctors: course.assignedDoctors,
                        requiredSoftware: course.requiredSoftware,
                    }}
                    onSuccess={handleModalSuccess}
                />
            )}
        </div>
    );
};

export default CourseDashboardPage; 