import { http } from './http.service';
import { API_CONFIG } from '../config/api';

const authService = {
    // Registro de cliente
    registrarCliente: async (datos) => {
        return await http.post(API_CONFIG.ENDPOINTS.CLIENTES, datos);
    },

    // Login de cliente
    loginCliente: async (email, clave) => {
        const response = await http.post(`${API_CONFIG.ENDPOINTS.CLIENTES}/login`, { email, clave });
        
        if (response.mensaje && response.cliente) {
            // Guardar token si existe
            if (response.token) {
                localStorage.setItem('token', response.token);
            }
            
            return {
                success: true,
                data: {
                    tipo: 'cliente',
                    id_cliente: response.cliente.id_cliente,
                    nombre: response.cliente.nombre,
                    email: response.cliente.email,
                    telefono: response.cliente.telefono,
                    activo: response.cliente.activo
                }
            };
        }
        
        return { success: false, error: 'Respuesta inválida del servidor' };
    },

    // Login de empleado (usuario del sistema)
    loginEmpleado: async (username, password) => {
        const response = await http.post(`${API_CONFIG.ENDPOINTS.USUARIOS}/login`, { username, password });
        
        if (response.token && response.usuario) {
            // Guardar token
            localStorage.setItem('token', response.token);
            
            return {
                success: true,
                data: {
                    tipo: 'empleado',
                    usuario_id: response.usuario.usuario_id,
                    username: response.usuario.username,
                    rol: response.usuario.rol,
                    empleado: response.usuario.empleado,
                    id_empleado: response.usuario.empleado.id_empleado,
                    nombre: response.usuario.empleado.nombre,
                    email: response.usuario.empleado.email,
                    puesto: response.usuario.empleado.puesto
                }
            };
        }
        
        return { success: false, error: 'Respuesta inválida del servidor' };
    },

    // Verificar sesión actual
    verificarSesion: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            return { success: false, error: 'No hay sesión activa' };
        }
        
        try {
            // Aquí podrías hacer una llamada al backend para verificar el token
            // Por ahora, solo verificamos que exista
            return { success: true };
        } catch (error) {
            localStorage.removeItem('token');
            return { success: false, error: 'Sesión inválida o expirada' };
        }
    },

    // Cerrar sesión
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        localStorage.removeItem('id_cliente');
    }
};

export default authService;
