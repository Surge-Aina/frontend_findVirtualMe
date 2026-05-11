import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_API || 'http://localhost:5173';

const handymanAPI = axios.create({ baseURL: API_URL });

handymanAPI.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default handymanAPI;