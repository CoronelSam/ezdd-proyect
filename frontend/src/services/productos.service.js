import { http } from './http.service';
import { API_CONFIG } from '../config/api';

/**
 * Servicio para gestionar productos
 */
export const productosService = {
    getAll: async (params = {}) => {
        const response = await http.get(API_CONFIG.ENDPOINTS.PRODUCTOS, { params });
        return response.productos || [];
    },

    getById: async (id) => {
        const response = await http.get(`${API_CONFIG.ENDPOINTS.PRODUCTOS}/${id}`);
        return response.producto;
    },

    create: async (productoData) => {
        const isFormData = productoData instanceof FormData;
        const config = isFormData ? {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        } : {};
        
        const response = await http.post(
            API_CONFIG.ENDPOINTS.PRODUCTOS, 
            productoData,
            config
        );
        return response.producto;
    },

    update: async (id, productoData) => {
        const isFormData = productoData instanceof FormData;
        const config = isFormData ? {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        } : {};
        
        const response = await http.put(
            `${API_CONFIG.ENDPOINTS.PRODUCTOS}/${id}`, 
            productoData,
            config
        );
        return response.producto;
    },

    delete: async (id) => {
        return await http.delete(`${API_CONFIG.ENDPOINTS.PRODUCTOS}/${id}`);
    },

    search: async (query) => {
        const response = await http.get(`${API_CONFIG.ENDPOINTS.PRODUCTOS}/buscar`, {
            params: { termino: query }
        });
        return response.productos || [];
    },

    getByCategoria: async (categoriaId) => {
        const response = await http.get(`${API_CONFIG.ENDPOINTS.PRODUCTOS}/categoria/${categoriaId}`);
        return response.productos || [];
    }
};

export default productosService;
