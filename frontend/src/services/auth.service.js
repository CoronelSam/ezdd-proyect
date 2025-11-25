import { http } from './http.service';

const authService = {
    // Registro de cliente
    registrarCliente: async (datos) => {
        const response = await http.post('/auth/register/cliente', datos);
        return response.data;
    },

    // Login de cliente
    loginCliente: async (email, clave) => {
        const response = await http.post('/auth/login/cliente', { email, clave });
        return response.data;
    },

    // Login de empleado
    loginEmpleado: async (email, clave) => {
        const response = await http.post('/auth/login/empleado', { email, clave });
        return response.data;
    },

    // Registro de empleado
    registrarEmpleado: async (datos) => {
        const response = await http.post('/auth/register/empleado', datos);
        return response.data;
    }
};

export default authService;
