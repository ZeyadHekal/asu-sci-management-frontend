import { useState } from "react";
import { FiEye, FiEyeOff, FiUser, FiLock } from "react-icons/fi";
import { useForm } from "react-hook-form";
import { cn } from "../../../global/utils/cn";
import { useNavigate } from "react-router";
import { useAuthStore } from "../../../store/authStore";
import { jwtDecode } from "jwt-decode";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast"; // Assuming you have react-hot-toast for notifications
import { useWebSocketStore } from "../../../services/websocketService";
import { useExamStore } from "../../../store/examStore";
import { useQueryClient } from "@tanstack/react-query";

import { useAuthControllerLogin } from "../../../generated/hooks/authenticationHooks/useAuthControllerLogin";
import {
  authControllerLoginMutationRequestSchema,
  type AuthControllerLoginMutationRequestSchema,
} from "../../../generated/zod/authenticationSchemas/authControllerLoginSchema";
import { type AuthControllerLoginMutationRequest } from "../../../generated/types/authenticationController/AuthControllerLogin";
import { type ExamModeStatusDto } from "../../../generated/types/ExamModeStatusDto";

interface DecodedAccessToken {
  user_id: string;
  name: string;
  exp: number;
}

const AuthCard = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const storeAuthData = useAuthStore((state) => state.storeAuthData);
  const setExamMode = useAuthStore((state) => state.setExamMode);
  const logout = useAuthStore((state) => state.logout);
  const examStore = useExamStore();
  const { connect: connectWebSocket, disconnect: disconnectWebSocket } = useWebSocketStore();
  const queryClient = useQueryClient();

  const {
    mutate: login,
    isPending,
    error: loginError,
  } = useAuthControllerLogin({
    mutation: {
      onSuccess: (response) => {
        try {
          // First, ensure we disconnect any existing WebSocket connection and clear all state
          disconnectWebSocket();
          logout(); // This clears auth store but keeps the logout from navigating
          examStore.resetExamStore();
          
          // Clear all React Query cache to prevent stale data
          queryClient.clear();
          
          const decodedAccessToken = jwtDecode<DecodedAccessToken>(
            response.data.accessToken
          );

          // Get user info from response
          const user = {
            id: String(decodedAccessToken.user_id),
            name: decodedAccessToken.name,
            privileges: response.data.privileges,
          };

          // Check if user is a student (has study privileges but no admin privileges)
          const isStudent = user.privileges.includes("STUDY_COURSE") && 
                          !user.privileges.includes("MANAGE_USER_TYPES");

          // Handle exam mode status from login response (as per documentation)
          let examModeActive = false;
          if (isStudent && response.data.user?.examModeStatus) {
            const examModeStatus = response.data.user.examModeStatus as ExamModeStatusDto;
            examModeActive = examModeStatus.isInExamMode;
            
            // Store exam mode status in exam store
            examStore.setExamModeStatus(examModeStatus);
            examStore.setExamMode(examModeActive);
            
            // Show exam mode notification if active
            if (examModeActive) {
              if (examModeStatus.examStartsIn && examModeStatus.examStartsIn > 0) {
                toast.success(
                  `Exam mode active! Your exam starts in ${examModeStatus.examStartsIn} minutes.`,
                  { duration: 8000, icon: '🚨' }
                );
              } else {
                toast.success(
                  'Exam mode active! Your exam is in progress.',
                  { duration: 8000, icon: '🚨' }
                );
              }
            }
          }

          // Store auth data with exam mode status
          storeAuthData(
            user,
            response.data.accessToken,
            response.data.refreshToken,
            decodedAccessToken.exp,
            examModeActive
          );

          // Initialize fresh WebSocket connection with new user credentials
          setTimeout(() => {
            connectWebSocket();
          }, 100); // Small delay to ensure auth data is properly stored

          // Navigation based on exam mode and user type
          if (examModeActive && isStudent) {
            // If student is in exam mode, navigate directly to exam page
            navigate("/exam", { replace: true });
            return;
          }

          // Normal navigation based on privileges - use root path for all redirects to trigger LandingRedirect
          navigate("/", { replace: true });
        } catch (error) {
          console.error("Failed to decode access token:", error);
          toast.error("Authentication failed. Please try again.");
        }
      },
      onError: (error: any) => {
        // Handle API error responses
        const errorMessage =
          error?.response?.data?.message ||
          "Failed to sign in. Please try again.";
        toast.error(errorMessage);
      },
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthControllerLoginMutationRequestSchema>({
    resolver: zodResolver(authControllerLoginMutationRequestSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = (data: AuthControllerLoginMutationRequest) => {
    login({ data });
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md px-6 lg:px-0">
      <div className="flex self-start flex-col gap-3 mb-10">
        <h1 className="text-4xl font-bold text-primary">SIGN IN</h1>
        <p className="text-gray-400">
          Enter your username and password to login
        </p>
      </div>
      {loginError && (
        <div className="w-full p-3 mb-4 text-sm text-red-500 bg-red-50 rounded-lg border border-red-200">
          {(loginError as any)?.response?.data?.message ||
            "Authentication failed. Please check your credentials."}
        </div>
      )}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full flex flex-col gap-6"
      >
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-semibold text-dark mb-2"
          >
            Username
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              <FiUser size={18} />
            </span>
            <input
              id="username"
              type="text"
              placeholder="Enter Username"
              className={cn(
                "form-input pl-11 pe-4 py-2.5 w-full border rounded-lg text-sm transition-colors duration-200",
                errors.username
                  ? "border-danger focus:border-danger"
                  : "border-[#e0e6ed] focus:border-primary dark:border-[#17263c]"
              )}
              {...register("username")}
              aria-invalid={errors.username ? "true" : "false"}
            />
          </div>
          {errors.username && (
            <p className="text-danger text-sm mt-1.5">
              {errors.username.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-semibold text-dark mb-2"
          >
            Password
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              <FiLock size={18} />
            </span>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter Password"
              className={cn(
                "form-input pl-11 pe-10 py-2.5 w-full border rounded-lg text-sm transition-colors duration-200",
                errors.password
                  ? "border-danger focus:border-danger"
                  : "border-[#e0e6ed] focus:border-primary dark:border-[#17263c]"
              )}
              {...register("password")}
              aria-invalid={errors.password ? "true" : "false"}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-danger text-sm mt-1.5">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-5 mt-2">
          <button
            type="submit"
            className="btn bg-primary hover:bg-primary-600 active:bg-primary-700 text-white w-full py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={isPending}
          >
            {isPending ? "SIGNING IN..." : "SIGN IN"}
          </button>
          <div className="text-center">
            For Staff{" "}
            <a
              href="/staff/request-access"
              className="text-sm text-primary hover:text-primary-600 underline transition-colors duration-200"
            >
              Request Access
            </a>
          </div>
          <p className="text-center text-xs text-gray-500 mt-4">
            © {new Date().getFullYear()} ASU Science, Math dept. All Rights
            Reserved.
          </p>
        </div>
      </form>
    </div>
  );
};

export default AuthCard;
