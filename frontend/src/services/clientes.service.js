import { http } from './http.service';
import { API_CONFIG } from '../config/api';

/**
 * Servicio para gestionar clientes
 */
export const clientesService = {
    getAll: async (filtros = {}) => {
        const params = new URLSearchParams();
        if (filtros.activo !== undefined) {
            params.append('activo', filtros.activo);
        }
        const queryString = params.toString();
        const url = queryString ? `${API_CONFIG.ENDPOINTS.CLIENTES}?${queryString}` : API_CONFIG.ENDPOINTS.CLIENTES;
        const response = await http.get(url);
        return response.clientes || response;
    },

    getById: async (id) => {
        const response = await http.get(`${API_CONFIG.ENDPOINTS.CLIENTES}/${id}`);
        return response.cliente || response;
    },

    getByEmail: async (email) => {
        const response = await http.get(`${API_CONFIG.ENDPOINTS.CLIENTES}/email/${email}`);
        return response.cliente || response;
    },

    create: async (clienteData) => {
        return await http.post(API_CONFIG.ENDPOINTS.CLIENTES, clienteData);
    },

    update: async (id, clienteData) => {
        return await http.put(`${API_CONFIG.ENDPOINTS.CLIENTES}/${id}`, clienteData);
    },

    cambiarClave: async (id, claveActual, claveNueva) => {
        return await http.patch(`${API_CONFIG.ENDPOINTS.CLIENTES}/${id}/cambiar-clave`, {
            clave_actual: claveActual,
            clave_nueva: claveNueva
        });
    },

    reactivar: async (id) => {
        return await http.patch(`${API_CONFIG.ENDPOINTS.CLIENTES}/${id}/reactivar`);
    },

    delete: async (id) => {
        return await http.delete(`${API_CONFIG.ENDPOINTS.CLIENTES}/${id}`);
    },

    deletePermanente: async (id) => {
        return await http.delete(`${API_CONFIG.ENDPOINTS.CLIENTES}/${id}/permanente`);
    },

    getEstadisticas: async () => {
        return await http.get(`${API_CONFIG.ENDPOINTS.CLIENTES}/estadisticas`);
    },

    login: async (email, clave) => {
        return await http.post(`${API_CONFIG.ENDPOINTS.CLIENTES}/login`, { email, clave });
    }
};

export default clientesService;
