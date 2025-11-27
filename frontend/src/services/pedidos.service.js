import { http } from './http.service';
import { API_CONFIG } from '../config/api';

export const pedidosService = {
    getAll: async () => {
        return await http.get(API_CONFIG.ENDPOINTS.PEDIDOS);
    },

    getById: async (id) => {
        return await http.get(`${API_CONFIG.ENDPOINTS.PEDIDOS}/${id}`);
    },

    create: async (pedidoData) => {
        return await http.post(API_CONFIG.ENDPOINTS.PEDIDOS, pedidoData);
    },

    updateEstado: async (id, estado) => {
        return await http.patch(`${API_CONFIG.ENDPOINTS.PEDIDOS}/${id}/estado`, { estado });
    },

    actualizarEstado: async (id, body) => {
        return await http.patch(`${API_CONFIG.ENDPOINTS.PEDIDOS}/${id}/estado`, body);
    },

    update: async (id, pedidoData) => {
        return await http.put(`${API_CONFIG.ENDPOINTS.PEDIDOS}/${id}`, pedidoData);
    },

    cancel: async (id) => {
        return await http.patch(`${API_CONFIG.ENDPOINTS.PEDIDOS}/${id}/cancelar`);
    },

    getByCliente: async (clienteId) => {
        return await http.get(`${API_CONFIG.ENDPOINTS.PEDIDOS}/cliente/${clienteId}`);
    },

    getByEstado: async (estado) => {
        return await http.get(`${API_CONFIG.ENDPOINTS.PEDIDOS}/estado/${estado}`);
    },

    getHoy: async () => {
        return await http.get(`${API_CONFIG.ENDPOINTS.PEDIDOS}/hoy`);
    }
};

export default pedidosService;
