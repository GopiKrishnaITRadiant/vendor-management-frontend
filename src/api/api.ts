import axios from "axios";

// Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
//   withCredentials: true, // remove if you don't use cookies/session auth
});

// Request interceptor → attach token
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("token");

//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }

//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // Response interceptor → global error handling
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     console.error("API Error:", error?.response?.data || error.message);

//     // optional: auto logout on unauthorized
//     if (error?.response?.status === 401) {
//       localStorage.removeItem("token");
//       // window.location.href = "/login";
//     }

//     return Promise.reject(error);
//   }
// );

export default api;