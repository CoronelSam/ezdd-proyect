import { http } from './http.service';
import { API_CONFIG } from '../config/api';

/**
 * Servicio para gestionar precios de productos
 */
export const preciosService = {
    getAll: async (filtros = {}) => {
        const response = await http.get(API_CONFIG.ENDPOINTS.PRECIOS_PRODUCTOS, {
            params: filtros
        });
        return response.precios || [];
    },

    getById: async (id) => {
        const response = await http.get(`${API_CONFIG.ENDPOINTS.PRECIOS_PRODUCTOS}/${id}`);
        return response.precio;
    },

    getByProducto: async (idProducto, soloActivos = true) => {
        const response = await http.get(`${API_CONFIG.ENDPOINTS.PRECIOS_PRODUCTOS}/producto/${idProducto}`, {
            params: { solo_activos: soloActivos }
        });
        return response.precios || [];
    },

    getByPresentacion: async (idProducto, nombrePresentacion) => {
        const response = await http.get(
            `${API_CONFIG.ENDPOINTS.PRECIOS_PRODUCTOS}/producto/${idProducto}/presentacion/${nombrePresentacion}`
        );
        return response.precio;
    },

    create: async (precioData) => {
        const response = await http.post(API_CONFIG.ENDPOINTS.PRECIOS_PRODUCTOS, precioData);
        return response.precio;
    },

    update: async (id, precioData) => {
        const response = await http.put(`${API_CONFIG.ENDPOINTS.PRECIOS_PRODUCTOS}/${id}`, precioData);
        return response.precio;
    },

    delete: async (id) => {
        return await http.delete(`${API_CONFIG.ENDPOINTS.PRECIOS_PRODUCTOS}/${id}`);
    },

    deletePermanente: async (id) => {
        return await http.delete(`${API_CONFIG.ENDPOINTS.PRECIOS_PRODUCTOS}/${id}/permanente`);
    },

    reactivar: async (id) => {
        const response = await http.patch(`${API_CONFIG.ENDPOINTS.PRECIOS_PRODUCTOS}/${id}/reactivar`);
        return response.precio;
    },

    getEstadisticas: async () => {
        const response = await http.get(`${API_CONFIG.ENDPOINTS.PRECIOS_PRODUCTOS}/estadisticas`);
        return response.estadisticas;
    },

    duplicar: async (idProductoOrigen, idProductoDestino) => {
        return await http.post(`${API_CONFIG.ENDPOINTS.PRECIOS_PRODUCTOS}/duplicar`, {
            idProductoOrigen,
            idProductoDestino
        });
    }
};

export default preciosService;
