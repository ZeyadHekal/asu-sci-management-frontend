import { useAuthControllerRefreshPrivilege } from "../../generated/hooks/authenticationHooks/useAuthControllerRefreshPrivilege";
import { useAuthStore } from "../../store/authStore";

export const useAuth = () => {
  const {
    user,
    token,
    refreshToken,
    tokenExpiry,
    examMode,
    logout,
    storeAuthData,
    setExamMode,
    isInExamMode,
  } = useAuthStore();
  const now = Math.floor(Date.now() / 1000);

  const { mutateAsync: refreshPrivilegeMutation } = useAuthControllerRefreshPrivilege({
    mutation: {
      onError: () => {
        console.error("Failed to refresh privileges");
      },
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

  // Function to toggle exam mode (for testing purposes until backend implements)
  const toggleExamMode = () => {
    setExamMode(!examMode);
  };

  return {
    user,
    token,
    isTokenExpired,
    isAuthenticated,
    hasPrivilege,
    logout,
    refreshPrivileges,
    isInExamMode,
    setExamMode,
    toggleExamMode,
  };
};
