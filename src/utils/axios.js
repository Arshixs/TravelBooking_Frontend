import axiosLib from "axios";
import toast from "react-hot-toast";

const axios = axiosLib.create({
  baseURL: import.meta.env.VITE_BACKEND_URL + "/api/v1",
  timeout: 180000,
  headers: {
    "Content-Type": "application/json",
  },
});

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
            const response = await axios.get("/auth/refresh-token", {
              headers: {
                "X-Refresh-Token": `Bearer ${refreshToken}`,
              },
            });
            const { token } = response.data;
            localStorage.setItem("token", token);
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return axios(originalRequest);
          } catch (error) {
            return Promise.reject(error);
          }
        } else {
          localStorage.removeItem("token");
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
        localStorage.removeItem("token");
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
