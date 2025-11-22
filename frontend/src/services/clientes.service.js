import { http } from './http.service';
import { API_CONFIG } from '../config/api';

/**
 * Servicio para gestionar clientes
 */
export const clientesService = {
    getAll: async () => {
        return await http.get(API_CONFIG.ENDPOINTS.CLIENTES);
    },

    getById: async (id) => {
        return await http.get(`${API_CONFIG.ENDPOINTS.CLIENTES}/${id}`);
    },

    create: async (clienteData) => {
        return await http.post(API_CONFIG.ENDPOINTS.CLIENTES, clienteData);
    },

    update: async (id, clienteData) => {
        return await http.put(`${API_CONFIG.ENDPOINTS.CLIENTES}/${id}`, clienteData);
    },

    delete: async (id) => {
        return await http.delete(`${API_CONFIG.ENDPOINTS.CLIENTES}/${id}`);
    },

    search: async (query) => {
        return await http.get(`${API_CONFIG.ENDPOINTS.CLIENTES}/buscar`, {
            params: { q: query }
        });
    }
};

export default clientesService;
