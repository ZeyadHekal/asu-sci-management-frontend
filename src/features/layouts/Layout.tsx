import { lazy, Suspense } from "react";
import MainContainer from "./MainContainer";
import Sidebar from "./Sidebar";
import ContentAnimation from "./ContentAnimation";
import { Outlet } from "react-router";
import SidebarOverlay from "./SidebarOverlay";
import { useAuth } from "../../global/hooks/useAuth";
import LoadingScreen from "../../routes/components/LoadingScreen";

// Lazy load the ExamPage
const ExamPage = lazy(() => import("../exam/pages/ExamPage"));

const DefaultLayout = () => {
  const { isInExamMode } = useAuth();

  // In exam mode, render only the ExamPage without sidebar and header
  if (isInExamMode()) {
    return (
      <div className="min-h-screen flex flex-col">
        <Suspense fallback={<LoadingScreen />}>
          <ExamPage />
        </Suspense>
      </div>
    );
  }

  // Normal layout with sidebar
  return (
    <div className="relative w-screen">
      <SidebarOverlay />
      <MainContainer>
        <Sidebar />
        <div className="main-content flex min-h-screen flex-col pt-4">
          <ContentAnimation>
            <Outlet />
          </ContentAnimation>
        </div>
      </MainContainer>
    </div>
  );
};

export default DefaultLayout;
