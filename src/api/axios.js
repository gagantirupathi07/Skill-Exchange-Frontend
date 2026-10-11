import axios from "axios";

const api = axios.create({
    baseURL:
        import.meta.env.VITE_API_BASE_URL ||
        "https://skill-exchange-backend-production-3d3c.up.railway.app/api",
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (config.data instanceof FormData) {
            // Let the browser set multipart/form-data and its boundary.
            delete config.headers["Content-Type"];
            delete config.headers["content-type"];
        } else if (config.data !== undefined && config.data !== null) {
            config.headers["Content-Type"] = "application/json";
        }

        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
