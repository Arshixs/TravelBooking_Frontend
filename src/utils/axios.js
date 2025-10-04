import axiosLib from "axios";
import toast from "react-hot-toast";

const axios = axiosLib.create({
  baseURL: import.meta.env.VITE_BACKEND_URL + "api/",
  timeout: 180000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor - adds access token to requests
axios.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken && !config.headers["Authorization"]) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handles token refresh
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If error is not 401 or request is already retried, handle normally
    if (error.response?.status !== 401 || originalRequest._retry) {
      if (error.response) {
        console.error("Error response:", error.response.data);
        const error_message =
          error.response.data.message ||
          error.response.data.error ||
          "An unexpected error occurred";
        toast.error(error_message);
      } else {
        console.error("Error:", error.message);
        toast.error(error.message);
      }
      return Promise.reject(error);
    }

    // Don't retry refresh token requests
    if (originalRequest.url.includes("/auth/refresh")) {
      console.log("Refresh token expired, logging out");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      toast.error("Your session has expired. Please log in again.");
      window.location.href = "/login";
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      // If already refreshing, queue this request
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers["Authorization"] = `Bearer ${token}`;
          return axios(originalRequest);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    }

    isRefreshing = true;
    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
      console.log("No refresh token found, logging out");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      isRefreshing = false;
      processQueue(error, null);
      window.location.href = "/login";
      return Promise.reject(error);
    }

    try {
      // Call the correct backend endpoint with correct format
      const response = await axiosLib.post(
        `${import.meta.env.VITE_BACKEND_URL}api/auth/refresh`,
        { refreshToken: refreshToken },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success && response.data.data) {
        const { accessToken, refreshToken: newRefreshToken } =
          response.data.data;

        // Store new tokens
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        // Update the failed request with new token
        originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;

        isRefreshing = false;
        processQueue(null, accessToken);

        // Retry the original request
        return axios(originalRequest);
      } else {
        throw new Error("Invalid refresh response");
      }
    } catch (refreshError) {
      console.error("Token refresh failed:", refreshError);
      isRefreshing = false;
      processQueue(refreshError, null);

      // Clear tokens and redirect to login
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      toast.error("Your session has expired. Please log in again.");
      window.location.href = "/login";

      return Promise.reject(refreshError);
    }
  }
);

export default axios;
