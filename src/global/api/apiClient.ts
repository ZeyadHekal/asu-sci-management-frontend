import axios from "axios";
import type {
  AxiosError,
  AxiosHeaders,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { useAuthStore } from "../../store/authStore";
import { jwtDecode } from "jwt-decode";

declare const AXIOS_BASE: string;
declare const AXIOS_HEADERS: string;

// Extend AxiosRequestConfig to include retry flag
declare module 'axios' {
  interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

/**
 * Subset of AxiosRequestConfig
 */
export type RequestConfig<TData = unknown> = {
  baseURL?: string;
  url?: string;
  method?: "GET" | "PUT" | "PATCH" | "POST" | "DELETE" | "OPTIONS";
  params?: unknown;
  data?: TData | FormData;
  responseType?:
    | "arraybuffer"
    | "blob"
    | "document"
    | "json"
    | "text"
    | "stream";
  signal?: AbortSignal;
  headers?: AxiosRequestConfig["headers"];
};

/**
 * Subset of AxiosResponse
 */
export type ResponseConfig<TData = unknown> = {
  data: TData;
  status: number;
  statusText: string;
  headers: AxiosResponse["headers"];
};

export type ResponseErrorConfig<TError = unknown> = AxiosError<TError>;

let _config: Partial<RequestConfig> = {
  baseURL: typeof AXIOS_BASE !== "undefined" ? AXIOS_BASE : undefined,
  headers:
    typeof AXIOS_HEADERS !== "undefined"
      ? (JSON.parse(AXIOS_HEADERS) as AxiosHeaders)
      : undefined,
};

export const getConfig = () => _config;

export const setConfig = (config: RequestConfig) => {
  _config = config;
  return getConfig();
};

export const axiosInstance = axios.create(getConfig());

// Track if a refresh token request is in progress to prevent multiple concurrent requests
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: AxiosError) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token!);
    }
  });

  failedQueue = [];
};

// Add request interceptor to include auth token
axiosInstance.interceptors.request.use(
  (config) => {
    // Get auth token from store
    const authToken = useAuthStore.getState().token;

    // If token exists, set Authorization header
    if (authToken) {
      // Set authorization header directly using proper method
      config.headers.set('Authorization', `Bearer ${authToken}`);
    }

    // Debug logging for create-with-groups requests
    if (config.url?.includes('/events/create-with-groups')) {
      console.log('🚀 API Request to create-with-groups:');
      console.log('URL:', config.url);
      console.log('Method:', config.method);
      console.log('Data being sent:', config.data);
      console.log('Data type:', typeof config.data);
      console.log('Data JSON:', JSON.stringify(config.data, null, 2));
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 errors and refresh tokens
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // Check if the error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Check if the request was to the refresh endpoint itself
      if (originalRequest.url?.includes('/auth/refresh')) {
        // If refresh token request failed, log out user
        useAuthStore.getState().logout();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return axiosInstance(originalRequest);
        }).catch((err) => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = useAuthStore.getState().refreshToken;

      if (!refreshToken) {
        useAuthStore.getState().logout();
        processQueue(error, null);
        return Promise.reject(error);
      }

      try {
        // Make refresh token request
        const response = await axiosInstance.post('/auth/refresh', {
          refreshToken
        });

        const newAccessToken = response.data.accessToken;
        const newRefreshToken = response.data.refreshToken;

        if (newAccessToken) {
          // Update the auth store with new tokens
          const { user, tokenExpiry, examMode } = useAuthStore.getState();

          // Decode the new token to get user info and expiry
          const tokenPayload = jwtDecode<{
            user_id: string;
            name: string;
            exp: number;
            privileges: string[];
          }>(newAccessToken);

          useAuthStore.getState().storeAuthData(
            {
              id: tokenPayload.user_id,
              name: tokenPayload.name,
              privileges: tokenPayload.privileges ?? user?.privileges ?? [],
            },
            newAccessToken,
            newRefreshToken,
            tokenPayload.exp,
            examMode
          );

          // Process the queued requests
          processQueue(null, newAccessToken);

          // Retry the original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }

          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, log out user
        useAuthStore.getState().logout();
        processQueue(refreshError as AxiosError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const client = async <TData, TError = unknown, TVariables = unknown>(
  config: RequestConfig<TVariables>
): Promise<ResponseConfig<TData>> => {
  const globalConfig = getConfig();

  return axiosInstance
    .request<TData, ResponseConfig<TData>>({
      ...globalConfig,
      ...config,
      baseURL: import.meta.env.VITE_API_URL,
      headers: {
        ...globalConfig.headers,
        ...config.headers,
      },
    })
    .catch((e: AxiosError<TError>) => {
      throw e;
    });
};

client.getConfig = getConfig;
client.setConfig = setConfig;

export default client;
