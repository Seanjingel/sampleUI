import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8080', // No trailing slash for consistency
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        } else {
            delete config.headers['Authorization'];
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default axiosInstance;
