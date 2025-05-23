import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";

interface User {
  id: string;
  privileges: string[];
  name: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  tokenExpiry: number | null;
  examMode: boolean;
  storeAuthData: (
    user: User,
    token: string,
    refreshToken: string,
    tokenExpiry: number,
    examMode?: boolean
  ) => void;
  setExamMode: (isExamMode: boolean) => void;
  logout: () => void;
  hasPrivilege: (privilege: string) => boolean;
  isAuthenticated: () => boolean;
  isTokenExpired: () => boolean;
  isInExamMode: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    devtools(
      (set, get) => ({
        user: null,
        token: null,
        refreshToken: null,
        tokenExpiry: null,
        examMode: false,
        storeAuthData: (
          user,
          token,
          refreshToken,
          tokenExpiry,
          examMode = false
        ) =>
          set(
            { user, token, refreshToken, tokenExpiry, examMode },
            false,
            "storeAuthData"
          ),
        setExamMode: (isExamMode) =>
          set({ examMode: isExamMode }, false, "setExamMode"),
        logout: () =>
          set(
            {
              user: null,
              token: null,
              refreshToken: null,
              tokenExpiry: null,
              examMode: false,
            },
            false,
            "logout"
          ),
        hasPrivilege: (privilege) => {
          const user = get().user;
          return user?.privileges.includes(privilege) ?? false;
        },
        isAuthenticated: () => {
          return !!get().token && !!get().user;
        },
        isTokenExpired: () => {
          const tokenExpiry = get().tokenExpiry;
          if (!tokenExpiry) return true;
          return Date.now() >= tokenExpiry * 1000;
        },
        isInExamMode: () => {
          return get().examMode;
        },
      }),
      { name: "AuthStore" }
    ),
    {
      name: "auth-storage",
    }
  )
);
