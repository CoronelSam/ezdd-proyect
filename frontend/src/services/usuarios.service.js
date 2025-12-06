import { http } from './http.service';
import { API_CONFIG } from '../config/api';

/**
 * Servicio para gestionar usuarios del sistema
 */
export const usuariosService = {
    getAll: async (filtros = {}) => {
        const params = new URLSearchParams();
        if (filtros.activo !== undefined) params.append('activo', filtros.activo);
        if (filtros.rol) params.append('rol', filtros.rol);
        if (filtros.username) params.append('username', filtros.username);
        
        const query = params.toString() ? `?${params.toString()}` : '';
        const response = await http.get(`${API_CONFIG.ENDPOINTS.USUARIOS}${query}`);
        return response.usuarios || [];
    },

    getById: async (id) => {
        return await http.get(`${API_CONFIG.ENDPOINTS.USUARIOS}/${id}`);
    },

    getByUsername: async (username) => {
        return await http.get(`${API_CONFIG.ENDPOINTS.USUARIOS}/username/${username}`);
    },

    create: async (usuarioData) => {
        return await http.post(API_CONFIG.ENDPOINTS.USUARIOS, usuarioData);
    },

    update: async (id, usuarioData) => {
        return await http.put(`${API_CONFIG.ENDPOINTS.USUARIOS}/${id}`, usuarioData);
    },

    cambiarPassword: async (id, passwords) => {
        return await http.patch(`${API_CONFIG.ENDPOINTS.USUARIOS}/${id}/cambiar-password`, passwords);
    },

    desactivar: async (id) => {
        return await http.patch(`${API_CONFIG.ENDPOINTS.USUARIOS}/${id}/desactivar`);
    },

    reactivar: async (id) => {
        return await http.patch(`${API_CONFIG.ENDPOINTS.USUARIOS}/${id}/reactivar`);
    },


    delete: async (id) => {
        return await http.delete(`${API_CONFIG.ENDPOINTS.USUARIOS}/${id}`);
    },

    login: async (credentials) => {
        return await http.post(`${API_CONFIG.ENDPOINTS.USUARIOS}/login`, credentials);
    },

    getEstadisticas: async () => {
        return await http.get(`${API_CONFIG.ENDPOINTS.USUARIOS}/estadisticas`);
    }
};

export default usuariosService;
