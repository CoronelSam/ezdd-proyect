import axios from 'axios';
import { API_CONFIG } from '../config/api';

// Importar API_CONFIG para usar en interceptor de refresh token
const API_URL = API_CONFIG.API_URL;

const httpClient = axios.create({
    baseURL: API_CONFIG.API_URL,
    timeout: API_CONFIG.REQUEST_CONFIG.timeout,
    headers: API_CONFIG.REQUEST_CONFIG.headers
});

httpClient.interceptors.request.use(
    (config) => {
        // Detectar el tipo de usuario actualmente autenticado
        const usuarioStr = localStorage.getItem('usuario');
        let tipoUsuario = null;
        
        if (usuarioStr) {
            try {
                const usuario = JSON.parse(usuarioStr);
                tipoUsuario = usuario.tipo;
            } catch (e) {
                console.error('Error al parsear usuario:', e);
            }
        }
        
        // Usar el token apropiado según el tipo de usuario
        if (tipoUsuario === 'cliente') {
            const tokenCliente = localStorage.getItem('clienteToken');
            if (tokenCliente) {
                config.headers.Authorization = `Bearer ${tokenCliente}`;
            }
        } else {
            // Para empleados/usuarios del sistema o sin tipo definido
            const tokenEmpleado = localStorage.getItem('token');
            if (tokenEmpleado) {
                config.headers.Authorization = `Bearer ${tokenEmpleado}`;
            }
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Variable para evitar múltiples intentos de refresh simultáneos
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    
    failedQueue = [];
};

httpClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        
        if (error.response) {
            const isLoginRequest = error.config?.url?.includes('/login');
            const isRefreshRequest = error.config?.url?.includes('/refresh-token');
            
            switch (error.response.status) {
                case 401:
                    if (!isLoginRequest && !isRefreshRequest && !originalRequest._retry) {
                        // Detectar si es un token de cliente expirado
                        const hasClienteToken = localStorage.getItem('clienteToken');
                        const hasRefreshToken = localStorage.getItem('clienteRefreshToken');
                        
                        if (hasClienteToken && hasRefreshToken) {
                            if (isRefreshing) {
                                // Si ya está refrescando, agregar a la cola
                                return new Promise((resolve, reject) => {
                                    failedQueue.push({ resolve, reject });
                                })
                                .then(token => {
                                    originalRequest.headers.Authorization = `Bearer ${token}`;
                                    return httpClient(originalRequest);
                                })
                                .catch(err => Promise.reject(err));
                            }

                            originalRequest._retry = true;
                            isRefreshing = true;

                            try {
                                // Intentar renovar el token del cliente usando axios directo para evitar recursión
                                const refreshResponse = await axios.post(
                                    `${API_URL}${API_CONFIG.ENDPOINTS.CLIENTES}/refresh-token`,
                                    { refreshToken: hasRefreshToken },
                                    { headers: { 'Content-Type': 'application/json' } }
                                );

                                const { token, refreshToken } = refreshResponse.data;
                                localStorage.setItem('clienteToken', token);
                                localStorage.setItem('clienteRefreshToken', refreshToken);

                                originalRequest.headers.Authorization = `Bearer ${token}`;
                                processQueue(null, token);
                                
                                return httpClient(originalRequest);
                            } catch (refreshError) {
                                processQueue(refreshError, null);
                                
                                // Token refresh falló, hacer logout
                                localStorage.removeItem('clienteToken');
                                localStorage.removeItem('clienteRefreshToken');
                                localStorage.removeItem('usuario');
                                localStorage.removeItem('id_cliente');
                                
                                // Redirigir al login si es necesario
                                if (window.location.pathname !== '/login') {
                                    window.location.href = '/login';
                                }
                                
                                return Promise.reject(refreshError);
                            } finally {
                                isRefreshing = false;
                            }
                        }
                        
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
