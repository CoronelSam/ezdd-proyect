import { http } from './http.service';
import { API_CONFIG } from '../config/api';

/**
 * Servicio para gestionar empleados
 */
export const empleadosService = {
    getAll: async (filtros = {}) => {
        const response = await http.get(API_CONFIG.ENDPOINTS.EMPLEADOS, {
            params: filtros
        });
        return response.empleados || [];
    },

    getById: async (id) => {
        const response = await http.get(`${API_CONFIG.ENDPOINTS.EMPLEADOS}/${id}`);
        return response.empleado;
    },

    getByEmail: async (email) => {
        const response = await http.get(`${API_CONFIG.ENDPOINTS.EMPLEADOS}/email/${email}`);
        return response.empleado;
    },

    getByPuesto: async (puesto) => {
        const response = await http.get(`${API_CONFIG.ENDPOINTS.EMPLEADOS}/puesto/${puesto}`);
        return response.empleados || [];
    },

    create: async (empleadoData) => {
        const response = await http.post(API_CONFIG.ENDPOINTS.EMPLEADOS, empleadoData);
        return response.empleado;
    },

    update: async (id, empleadoData) => {
        const response = await http.put(`${API_CONFIG.ENDPOINTS.EMPLEADOS}/${id}`, empleadoData);
        return response.empleado;
    },

    updateSalario: async (id, salario) => {
        const response = await http.patch(`${API_CONFIG.ENDPOINTS.EMPLEADOS}/${id}/salario`, { salario });
        return response.empleado;
    },

    delete: async (id) => {
        return await http.delete(`${API_CONFIG.ENDPOINTS.EMPLEADOS}/${id}`);
    },

    deletePermanente: async (id) => {
        return await http.delete(`${API_CONFIG.ENDPOINTS.EMPLEADOS}/${id}/permanente`);
    },

    reactivar: async (id) => {
        const response = await http.patch(`${API_CONFIG.ENDPOINTS.EMPLEADOS}/${id}/reactivar`);
        return response.empleado;
    },

    getEstadisticas: async () => {
        const response = await http.get(`${API_CONFIG.ENDPOINTS.EMPLEADOS}/estadisticas`);
        return response.estadisticas;
    }
};

export default empleadosService;
