import axios from 'axios';
import { API_CONFIG } from '../config/api';

const httpClient = axios.create({
    baseURL: API_CONFIG.API_URL,
    timeout: API_CONFIG.REQUEST_CONFIG.timeout,
    headers: API_CONFIG.REQUEST_CONFIG.headers
});

httpClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

httpClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            const isLoginRequest = error.config?.url?.includes('/login');
            
            switch (error.response.status) {
                case 401:
                    if (!isLoginRequest) {
                        console.error('No autorizado. Por favor inicie sesión.');
                    }
                    break;
                case 404:
                    console.error('Recurso no encontrado.');
                    break;
                case 500:
                    console.error('Error interno del servidor.');
                    break;
                default:
                    console.error('Error en la petición:', error.response.data);
            }
        } else if (error.request) {
            console.error('Error de conexión con el servidor.');
        } else {
            console.error('Error:', error.message);
        }
        return Promise.reject(error);
    }
);

export const http = {
    get: async (url, config = {}) => {
        try {
            const response = await httpClient.get(url, config);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    post: async (url, data = {}, config = {}) => {
        try {
            const response = await httpClient.post(url, data, config);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    put: async (url, data = {}, config = {}) => {
        try {
            const response = await httpClient.put(url, data, config);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    patch: async (url, data = {}, config = {}) => {
        try {
            const response = await httpClient.patch(url, data, config);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    delete: async (url, config = {}) => {
        try {
            const response = await httpClient.delete(url, config);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default httpClient;
