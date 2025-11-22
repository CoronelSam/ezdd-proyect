import { http } from './http.service';
import { API_CONFIG } from '../config/api';

/**
 * Servicio para gestionar categorías de productos
 */
export const categoriasService = {
    getAll: async (filtros = {}) => {
        const response = await http.get(API_CONFIG.ENDPOINTS.CATEGORIAS_PRODUCTOS, {
            params: filtros
        });
        return response.categorias || [];
    },

    getAllConConteo: async () => {
        const response = await http.get(`${API_CONFIG.ENDPOINTS.CATEGORIAS_PRODUCTOS}/conteo`);
        return response.categorias || [];
    },

    getById: async (id, incluirProductos = false) => {
        const response = await http.get(`${API_CONFIG.ENDPOINTS.CATEGORIAS_PRODUCTOS}/${id}`, {
            params: { incluir_productos: incluirProductos }
        });
        return response.categoria;
    },

    create: async (categoriaData) => {
        const response = await http.post(API_CONFIG.ENDPOINTS.CATEGORIAS_PRODUCTOS, categoriaData);
        return response.categoria;
    },

    update: async (id, categoriaData) => {
        const response = await http.put(`${API_CONFIG.ENDPOINTS.CATEGORIAS_PRODUCTOS}/${id}`, categoriaData);
        return response.categoria;
    },

    delete: async (id) => {
        return await http.delete(`${API_CONFIG.ENDPOINTS.CATEGORIAS_PRODUCTOS}/${id}`);
    },

    deletePermanente: async (id) => {
        return await http.delete(`${API_CONFIG.ENDPOINTS.CATEGORIAS_PRODUCTOS}/${id}/permanente`);
    },

    reactivar: async (id) => {
        const response = await http.patch(`${API_CONFIG.ENDPOINTS.CATEGORIAS_PRODUCTOS}/${id}/reactivar`);
        return response.categoria;
    }
};

export default categoriasService;
