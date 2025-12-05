import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            localStorage.removeItem('token');
            localStorage.removeItem('shopName');
            window.location.href = '/'; // Redirect to login
        }
        return Promise.reject(error);
    }
);

export const login = async (email, password, shopifyDomain) => {
    const response = await api.post('/auth/login', { email, password, shopifyDomain });
    return response.data;
};

export const getStats = async (startDate, endDate) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await api.get('/dashboard/stats', { params });
    return response.data;
};

export const triggerSync = async () => {
    const response = await api.post('/sync/sync');
    return response.data;
};

export default api;
