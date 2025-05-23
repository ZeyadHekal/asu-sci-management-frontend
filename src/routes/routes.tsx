import { createBrowserRouter } from "react-router";
import { lazy } from "react";
import SuspenseWrapper from "./components/SuspenseWrapper";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingRedirect from "./components/LandingRedirect";

// Lazily import components
const AuthPage = lazy(() => import("../features/auth/pages/AuthPage"));
const DefaultLayout = lazy(() => import("../features/layouts/Layout"));
const NoAccessPage = lazy(() => import("../features/common/NoAccessPage"));
const CoursesPage = lazy(() => import("../features/courses/pages/CoursesPage"));
const CourseDashboardPage = lazy(() => import("../features/courses/pages/CourseDashboardPage"));
const CourseGroupsPage = lazy(() => import("../features/courses/pages/CourseGroupsPage"));
const CourseGroupDetailPage = lazy(() => import("../features/courses/pages/CourseGroupDetailPage"));
const ViewGroupPage = lazy(() => import("../features/courses/pages/ViewGroupPage"));
const EventDashboardPage = lazy(() => import("../features/courses/pages/EventDashboardPage"));
const EventGroupDetailPage = lazy(() => import("../features/courses/pages/EventGroupDetailPage"));
const EventGroupsPage = lazy(() => import("../features/courses/pages/EventGroupsPage"));
const ExamModelsPage = lazy(() => import("../features/courses/pages/ExamModelsPage"));
const AdminExamsPage = lazy(
  () => import("../features/admin_exams/pages/AdminExamsPage")
);
const LabsPage = lazy(() => import("../features/labs/pages/LabsPage"));
const DevicesPage = lazy(() => import("../features/devices/pages/DevicesPage"));
const DeviceHistoryPage = lazy(() => import("../features/devices/pages/DeviceHistoryPage"));
const AllDevicesHistoryPage = lazy(() => import("../features/devices/pages/AllDevicesHistoryPage"));
const SoftwarePage = lazy(() => import("../features/devices/pages/SoftwarePage"));
const StudentsPage = lazy(() => import("../features/students/pages/StudentsPage"));
const HomePage = lazy(() => import("../features/home/pages/HomePage"));
const SchedulePage = lazy(
  () => import("../features/schedule/pages/SchedulePage")
);
const StudentExamsPage = lazy(
  () => import("../features/student_exams/pages/StudentExamsPage")
);
const StudentGradesPage = lazy(
  () => import("../features/student_grades/pages/StudentGradesPage")
);
const ExamPage = lazy(() => import("../features/exam/pages/ExamPage"));
const StaffRequestAccessPage = lazy(() => import("../features/staff/pages/StaffRequestAccessPage"));
const StaffRequestsPage = lazy(() => import("../features/staff/pages/StaffRequestsPage"));
const StaffManagementPage = lazy(() => import("../features/staff/pages/StaffManagementPage"));
const UserTypesPage = lazy(() => import("../features/staff/pages/UserTypesPage"));
const ReportsPage = lazy(() => import("../features/reports/pages/ReportsPage"));
const AssistantDashboardPage = lazy(() => import("../features/labs/assistants/AssistantDashboardPage"));
const SessionManagementPage = lazy(() => import("../features/labs/assistants/SessionManagementPage"));

const router = createBrowserRouter([
  {
    path: "/login",
    element: <AuthPage />,
  },
  {
    path: "/staff/request-access",
    element: <StaffRequestAccessPage />,
  },
  {
    path: "/exam",
    element: (
      <ProtectedRoute allowedPrivileges={["STUDY_COURSE"]}>
        <SuspenseWrapper>
          <ExamPage />
        </SuspenseWrapper>
      </ProtectedRoute>
    ),
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <DefaultLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <LandingRedirect />,
      },
      {
        path: "no-access",
        element: (
          <SuspenseWrapper>
            <NoAccessPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "courses",
        element: (
          <ProtectedRoute allowedPrivileges={["MANAGE_COURSES", "TEACH_COURSE", "ASSIST_IN_COURSE", "STUDY_COURSE"]}>
            <SuspenseWrapper>
              <CoursesPage />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: "courses/:courseId",
        element: (
          <ProtectedRoute allowedPrivileges={["MANAGE_COURSES", "TEACH_COURSE", "ASSIST_IN_COURSE", "STUDY_COURSE"]}>
            <SuspenseWrapper>
              <CourseDashboardPage />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: "courses/:courseId/groups",
        element: (
          <ProtectedRoute allowedPrivileges={["MANAGE_COURSES", "TEACH_COURSE"]}>
            <SuspenseWrapper>
              <CourseGroupsPage />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: "courses/:courseId/groups/:groupId",
        element: (
          <ProtectedRoute allowedPrivileges={["MANAGE_COURSES", "TEACH_COURSE", "ASSIST_IN_COURSE"]}>
            <SuspenseWrapper>
              <ViewGroupPage />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: "courses/:courseId/events/:eventId",
        element: (
          <ProtectedRoute allowedPrivileges={["MANAGE_COURSES", "TEACH_COURSE"]}>
            <SuspenseWrapper>
              <EventDashboardPage />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: "courses/:courseId/events/:eventId/groups/:groupId",
        element: (
          <ProtectedRoute allowedPrivileges={["MANAGE_COURSES", "TEACH_COURSE", "ASSIST_IN_COURSE"]}>
            <SuspenseWrapper>
              <EventGroupDetailPage />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: "courses/:courseId/events/:eventId/groups",
        element: (
          <ProtectedRoute allowedPrivileges={["MANAGE_COURSES", "TEACH_COURSE", "ASSIST_IN_COURSE"]}>
            <SuspenseWrapper>
              <EventGroupsPage />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: "courses/:courseId/events/:eventId/models",
        element: (
          <ProtectedRoute allowedPrivileges={["MANAGE_COURSES", "TEACH_COURSE"]}>
            <SuspenseWrapper>
              <ExamModelsPage />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: "exams",
        element: (
          <ProtectedRoute allowedPrivileges={["MANAGE_USER_TYPES"]}>
            <SuspenseWrapper>
              <AdminExamsPage />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: "grades",
        element: (
          <ProtectedRoute allowedPrivileges={["STUDY_COURSE"]}>
            <SuspenseWrapper>
              <StudentGradesPage />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: "labs",
        element: (
          <ProtectedRoute allowedPrivileges={["MANAGE_LABS"]}>
            <SuspenseWrapper>
              <LabsPage />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: "devices",
        element: (
          <ProtectedRoute allowedPrivileges={["MANAGE_LABS", "LAB_MAINTENANCE"]}>
            <SuspenseWrapper>
              <DevicesPage />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: "devices/:deviceId/history",
        element: (
          <ProtectedRoute allowedPrivileges={["MANAGE_LABS", "LAB_MAINTENANCE", "LAB_ASSISTANT"]}>
            <SuspenseWrapper>
              <DeviceHistoryPage />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: "devices/software",
        element: (
          <ProtectedRoute allowedPrivileges={["MANAGE_LABS", "LAB_MAINTENANCE"]}>
            <SuspenseWrapper>
              <SoftwarePage />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: "devices/history",
        element: (
          <ProtectedRoute allowedPrivileges={["MANAGE_LABS", "LAB_MAINTENANCE"]}>
            <SuspenseWrapper>
              <AllDevicesHistoryPage />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: "students",
        element: (
          <ProtectedRoute allowedPrivileges={["MANAGE_STUDENTS"]}>
            <SuspenseWrapper>
              <StudentsPage />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: "schedule",
        element: (
          <ProtectedRoute allowedPrivileges={["CREATE_STUDENT", "STUDY_COURSE"]}>
            <SuspenseWrapper>
              <SchedulePage />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: "student/exams",
        element: (
          <ProtectedRoute allowedPrivileges={["STUDY_COURSE"]}>
            <SuspenseWrapper>
              <StudentExamsPage />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: "staff/requests",
        element: (
          <ProtectedRoute allowedPrivileges={["MANAGE_SYSTEM"]}>
            <SuspenseWrapper>
              <StaffRequestsPage />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: "staff",
        element: (
          <ProtectedRoute allowedPrivileges={["MANAGE_SYSTEM"]}>
            <SuspenseWrapper>
              <StaffManagementPage />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: "staff/user-types",
        element: (
          <ProtectedRoute allowedPrivileges={["MANAGE_SYSTEM"]}>
            <SuspenseWrapper>
              <UserTypesPage />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: "reports",
        element: (
          <ProtectedRoute allowedPrivileges={["REPORT_DEVICE", "STUDY_COURSE"]}>
            <SuspenseWrapper>
              <ReportsPage />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: "lab-assistant",
        element: (
          <ProtectedRoute allowedPrivileges={["LAB_ASSISTANT"]}>
            <SuspenseWrapper>
              <AssistantDashboardPage />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: "session-management",
        element: (
          <ProtectedRoute allowedPrivileges={["LAB_ASSISTANT", "ASSIST_IN_COURSE"]}>
            <SuspenseWrapper>
              <SessionManagementPage />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

export default router;
