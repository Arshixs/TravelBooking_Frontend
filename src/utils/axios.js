import axiosLib from "axios";
import toast from "react-hot-toast";

const axios = axiosLib.create({
  baseURL: import.meta.env.VITE_BACKEND_URL + "api/",
  timeout: 180000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ========================================================
// == ADD THIS REQUEST INTERCEPTOR BLOCK ==
// This runs BEFORE each request is sent
// ========================================================
axios.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      // If the token exists, add it to the Authorization header
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
// ========================================================

// Your existing response interceptor (no changes needed here)
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    let error_message = "";
    const originalRequest = error.config;
    if (error.response) {
      if (
        error.response.status === 401 &&
        error.response.data?.error === "Invalid JWT Token" &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          try {
            const response = await axios.get("/auth/refresh-accessToken", {
              headers: {
                "X-Refresh-Token": `Bearer ${refreshToken}`,
              },
            });
            const { accessToken } = response.data;
            localStorage.setItem("accessToken", accessToken);
            originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
            return axios(originalRequest);
          } catch (error) {
            return Promise.reject(error);
          }
        } else {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.href = "/login";
          return Promise.reject(error);
        }
      }

      if (
        error.response?.status === 401 &&
        error.response?.data?.error === "Invalid Refresh Token"
      ) {
        toast.error("Your session has expired");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/";
        return Promise.reject(error);
      }

      console.error("Error response:", error.response.data);
      error_message =
        error.response.data.error || "An unexpected error occurred";
    } else {
      console.error("Error:", error.message);
      error_message = error.message;
    }
    toast.error(error_message);
    return Promise.reject(error);
  }
);

export default axios;
