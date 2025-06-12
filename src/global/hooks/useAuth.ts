import { useAuthControllerRefreshPrivilege } from "../../generated/hooks/authenticationHooks/useAuthControllerRefreshPrivilege";
import { useAuthStore } from "../../store/authStore";
import { useEventControllerGetStudentExamModeStatus } from "../../generated/hooks/eventsHooks/useEventControllerGetStudentExamModeStatus";
import { useExamStore } from "../../store/examStore";
import { useQueryClient } from "@tanstack/react-query";
import { useWebSocketStore } from "../../services/websocketService";

export const useAuth = () => {
  const {
    user,
    token,
    refreshToken,
    tokenExpiry,
    examMode,
    logout: authLogout,
    storeAuthData,
    setExamMode,
    isInExamMode,
  } = useAuthStore();
  const { setExamModeStatus, resetExamStore } = useExamStore();
  const queryClient = useQueryClient();
  const now = Math.floor(Date.now() / 1000);

  const { mutateAsync: refreshPrivilegeMutation } = useAuthControllerRefreshPrivilege({
    mutation: {
      onError: () => {
        console.error("Failed to refresh privileges");
      },
    },
  });

  // Import the API client directly for exam mode status refresh
  const { refetch: refetchExamModeStatus } = useEventControllerGetStudentExamModeStatus({
    query: {
      enabled: false, // Don't auto-fetch, we'll call it manually
    },
  });

  const isAuthenticated = !!token && !!user && (tokenExpiry ?? 0) > now;
  const isTokenExpired = tokenExpiry ? tokenExpiry <= now : true;

  const hasPrivilege = (privilege: string) => {
    return user?.privileges.includes(privilege) ?? false;
  };

  const refreshPrivileges = async () => {
    if (!isAuthenticated) {
      return;
    }

    try {
      const response = await refreshPrivilegeMutation();
      if (user && response.data.privileges) {
        storeAuthData(
          {
            ...user,
            privileges: response.data.privileges,
          },
          token!,
          refreshToken!,
          tokenExpiry!,
          examMode
        );
        console.log("Updated user privileges:", response.data.privileges);
      }
    } catch (error) {
      console.error("Error refreshing privileges:", error);
    }
  };

  const refreshExamModeStatus = async () => {
    if (!isAuthenticated) {
      return;
    }

    // Only refresh exam mode status for students
    const isStudent = user?.privileges.includes("STUDY_COURSE") &&
      !user?.privileges.includes("MANAGE_USER_TYPES");

    if (!isStudent) {
      return;
    }

    try {
      const response = await refetchExamModeStatus();
      if (response.data?.data) {
        const examModeStatus = response.data.data;

        // Update exam store with the new status
        setExamModeStatus(examModeStatus);

        // Update auth store exam mode flag
        setExamMode(examModeStatus.isInExamMode);

        console.log("Updated exam mode status:", examModeStatus);
      }
    } catch (error) {
      console.error("Error refreshing exam mode status:", error);
    }
  };

  // Function to toggle exam mode (for testing purposes until backend implements)
  const toggleExamMode = () => {
    setExamMode(!examMode);
  };

  // Enhanced logout function that also resets exam store and clears cache
  const logout = () => {
    // Disconnect WebSocket before clearing auth data
    const { disconnect } = useWebSocketStore.getState();
    disconnect();

    // Reset exam store
    resetExamStore();

    // Clear all React Query cache to ensure no stale data remains
    queryClient.clear();

    // Clear auth store
    authLogout();
  };

  return {
    user,
    token,
    isTokenExpired,
    isAuthenticated,
    hasPrivilege,
    logout,
    refreshPrivileges,
    refreshExamModeStatus,
    isInExamMode,
    setExamMode,
    toggleExamMode,
  };
};
