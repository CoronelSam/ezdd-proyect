import { http } from './http.service';
import { API_CONFIG } from '../config/api';

/**
 * Servicio para operaciones del perfil del cliente autenticado
 * Requiere JWT token de cliente
 */
export const clientePerfilService = {
    obtenerPerfil: async () => {
        try {
            const response = await http.get(`${API_CONFIG.ENDPOINTS.CLIENTES}/perfil/me`);
            return {
                success: true,
                data: response.cliente
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Error al obtener el perfil'
            };
        }
    },

    actualizarPerfil: async (datos) => {
        try {
            const response = await http.put(`${API_CONFIG.ENDPOINTS.CLIENTES}/perfil/me`, datos);
            
            // Actualizar usuario en localStorage si cambió
            if (response.cliente) {
                const usuarioActual = JSON.parse(localStorage.getItem('usuario') || '{}');
                const usuarioActualizado = {
                    ...usuarioActual,
                    ...response.cliente,
                    tipo: 'cliente'
                };
                localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));
            }
            
            return {
                success: true,
                data: response.cliente,
                mensaje: response.mensaje
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Error al actualizar el perfil'
            };
        }
    },

    /**
     * Cambia la contraseña del cliente autenticado
     */
    cambiarClave: async (claveActual, claveNueva) => {
        try {
            const response = await http.patch(
                `${API_CONFIG.ENDPOINTS.CLIENTES}/perfil/cambiar-clave`,
                { claveActual, claveNueva }
            );
            
            return {
                success: true,
                mensaje: response.mensaje
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Error al cambiar la contraseña'
            };
        }
    }
};
