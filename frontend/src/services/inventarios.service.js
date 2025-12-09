import { http } from './http.service';
import { API_CONFIG } from '../config/api';

/**
 * Servicio para gestionar inventarios
 */
export const inventariosService = {
    getAll: async () => {
        return await http.get(API_CONFIG.ENDPOINTS.INVENTARIOS);
    },

    getByIngrediente: async (ingredienteId) => {
        return await http.get(`${API_CONFIG.ENDPOINTS.INVENTARIOS}/ingrediente/${ingredienteId}`);
    },

    create: async (data) => {
        return await http.post(API_CONFIG.ENDPOINTS.INVENTARIOS, data);
    },

    update: async (id, data) => {
        return await http.put(`${API_CONFIG.ENDPOINTS.INVENTARIOS}/${id}`, data);
    },

    getStockBajo: async () => {
        return await http.get(`${API_CONFIG.ENDPOINTS.INVENTARIOS}/stock-bajo`);
    },

    getMovimientos: async () => {
        return await http.get(API_CONFIG.ENDPOINTS.MOVIMIENTOS_INVENTARIO);
    },

    registrarMovimiento: async (movimientoData) => {
        return await http.post(API_CONFIG.ENDPOINTS.MOVIMIENTOS_INVENTARIO, movimientoData);
    }
};

export default inventariosService;
