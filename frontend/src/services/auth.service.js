import { http } from './http.service';
import { API_CONFIG } from '../config/api';

const authService = {
    // Registro de cliente
    registrarCliente: async (datos) => {
        try {
            const response = await http.post(API_CONFIG.ENDPOINTS.CLIENTES, datos);
            
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
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.error || 'Error al registrar usuario' 
            };
        }
    },

    // Login de cliente
    loginCliente: async (email, clave) => {
        try {
            const response = await http.post(`${API_CONFIG.ENDPOINTS.CLIENTES}/login`, { email, clave });
            
            if (response.mensaje && response.cliente) {
                // Guardar token si existe
                if (response.token) {
                    localStorage.setItem('token', response.token);
                }
                
                // Guardar datos del cliente en localStorage
                localStorage.setItem('usuario', JSON.stringify({
                    tipo: 'cliente',
                    ...response.cliente
                }));
                localStorage.setItem('id_cliente', response.cliente.id_cliente);
                
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
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.error || 'Error al iniciar sesión' 
            };
        }
    },

    // Login de empleado (usuario del sistema)
    loginEmpleado: async (username, password) => {
        try {
            const response = await http.post(`${API_CONFIG.ENDPOINTS.USUARIOS}/login`, { username, password });
            
            if (response.token && response.usuario) {
                // Guardar token
                localStorage.setItem('token', response.token);
                
                // Guardar datos del usuario en localStorage
                localStorage.setItem('usuario', JSON.stringify({
                    tipo: 'empleado',
                    ...response.usuario
                }));
                
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
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.error || 'Error al iniciar sesión' 
            };
        }
    },

    // Verificar sesión actual
    verificarSesion: async () => {
        const token = localStorage.getItem('token');
        const usuario = localStorage.getItem('usuario');
        
        if (!token || !usuario) {
            return { success: false, error: 'No hay sesión activa' };
        }
        
        try {
            const usuarioData = JSON.parse(usuario);
            return { 
                success: true, 
                data: usuarioData 
            };
        } catch (error) {
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            localStorage.removeItem('id_cliente');
            return { success: false, error: 'Sesión inválida o expirada' };
        }
    },

    // Obtener usuario actual
    getUsuarioActual: () => {
        try {
            const usuario = localStorage.getItem('usuario');
            return usuario ? JSON.parse(usuario) : null;
        } catch (error) {
            return null;
        }
    },

    // Actualizar datos del usuario en localStorage
    actualizarUsuarioLocal: (datos) => {
        try {
            const usuario = authService.getUsuarioActual();
            if (usuario) {
                const usuarioActualizado = { ...usuario, ...datos };
                localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));
                return true;
            }
            return false;
        } catch (error) {
            return false;
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
