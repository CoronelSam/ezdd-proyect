import { http } from './http.service';
import { API_CONFIG } from '../config/api';

/**
 * Servicio para gestionar recetas
 */
export const recetasService = {
    getAll: async (filtros = {}) => {
        const response = await http.get(API_CONFIG.ENDPOINTS.RECETAS, {
            params: filtros
        });
        return Array.isArray(response) ? response : (response.recetas || []);
    },

    getById: async (id) => {
        const response = await http.get(`${API_CONFIG.ENDPOINTS.RECETAS}/${id}`);
        return response.receta || response;
    },

    getByProducto: async (idProducto) => {
        const response = await http.get(`${API_CONFIG.ENDPOINTS.RECETAS}/producto/${idProducto}`);
        return Array.isArray(response) ? response : (response.recetas || []);
    },

    getByIngrediente: async (idIngrediente) => {
        const response = await http.get(`${API_CONFIG.ENDPOINTS.RECETAS}/ingrediente/${idIngrediente}`);
        return Array.isArray(response) ? response : (response.recetas || []);
    },

    create: async (recetaData) => {
        const response = await http.post(API_CONFIG.ENDPOINTS.RECETAS, recetaData);
        return response.receta;
    },

    update: async (id, recetaData) => {
        const response = await http.put(`${API_CONFIG.ENDPOINTS.RECETAS}/${id}`, recetaData);
        return response.receta;
    },

    delete: async (id) => {
        return await http.delete(`${API_CONFIG.ENDPOINTS.RECETAS}/${id}`);
    },

    calcularCosto: async (idProducto) => {
        const response = await http.get(`${API_CONFIG.ENDPOINTS.RECETAS}/costo/${idProducto}`);
        return response.costo || response;
    },

    duplicar: async (idProductoOrigen, idProductoDestino) => {
        return await http.post(`${API_CONFIG.ENDPOINTS.RECETAS}/duplicar`, {
            id_producto_origen: idProductoOrigen,
            id_producto_destino: idProductoDestino
        });
    }
};

export default recetasService;
