import { http } from './http.service';
import { API_CONFIG } from '../config/api';

/**
 * Servicio para gestionar ingredientes
 */
export const ingredientesService = {
    getAll: async (filtros = {}) => {
        const response = await http.get(API_CONFIG.ENDPOINTS.INGREDIENTES, {
            params: filtros
        });
        return Array.isArray(response) ? response : (response.ingredientes || []);
    },

    getById: async (id) => {
        const response = await http.get(`${API_CONFIG.ENDPOINTS.INGREDIENTES}/${id}`);
        return response.ingrediente || response;
    },

    getByNombre: async (nombre) => {
        const response = await http.get(`${API_CONFIG.ENDPOINTS.INGREDIENTES}/nombre/${nombre}`);
        return response.ingrediente || response;
    },

    getBajoStock: async () => {
        const response = await http.get(`${API_CONFIG.ENDPOINTS.INGREDIENTES}/stock-bajo`);
        return Array.isArray(response) ? response : (response.ingredientes || []);
    },

    create: async (ingredienteData) => {
        const response = await http.post(API_CONFIG.ENDPOINTS.INGREDIENTES, ingredienteData);
        return response.ingrediente;
    },

    update: async (id, ingredienteData) => {
        const response = await http.put(`${API_CONFIG.ENDPOINTS.INGREDIENTES}/${id}`, ingredienteData);
        return response.ingrediente;
    },

    delete: async (id) => {
        return await http.delete(`${API_CONFIG.ENDPOINTS.INGREDIENTES}/${id}`);
    },

    deletePermanente: async (id) => {
        return await http.delete(`${API_CONFIG.ENDPOINTS.INGREDIENTES}/${id}/permanente`);
    },

    reactivar: async (id) => {
        const response = await http.patch(`${API_CONFIG.ENDPOINTS.INGREDIENTES}/${id}/reactivar`);
        return response.ingrediente;
    },

    getEstadisticas: async () => {
        const response = await http.get(`${API_CONFIG.ENDPOINTS.INGREDIENTES}/estadisticas`);
        return response.estadisticas || response;
    }
};

export default ingredientesService;
