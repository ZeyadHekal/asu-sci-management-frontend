import { useAuthStore } from "../../../store/authStore";
import DoctorMyCoursesView from "../components/DoctorMyCoursesView";
import AssistantMyCoursesView from "../components/AssistantMyCoursesView";
import StudentMyCoursesView from "../components/StudentMyCoursesView";

const MyCoursesPage = () => {
  const hasPrivilege = useAuthStore((state) => state.hasPrivilege);

  // Determine which view to show based on user privileges
  // Priority: Doctor > Assistant > Student
  if (hasPrivilege("TEACH_COURSE")) {
    return <DoctorMyCoursesView />;
  } else if (hasPrivilege("ASSIST_IN_COURSE")) {
    return <AssistantMyCoursesView />;
  } else if (hasPrivilege("STUDY_COURSE")) {
    return <StudentMyCoursesView />;
  }

  // If user has none of the course-related privileges, show access denied
  return (
    <div className="panel mt-6">
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-red-500 text-lg font-semibold mb-2">Access Denied</div>
        <div className="text-gray-600 mb-4">You don't have permission to view courses.</div>
      </div>
    </div>
  );
};

export default MyCoursesPage; 