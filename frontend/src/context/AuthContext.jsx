import { useState } from 'react';
import { AuthContext } from '../hooks/useAuth';

export const AuthProvider = ({ children }) => {
    const [usuario, setUsuario] = useState(() => {
        // Inicializar desde localStorage
        const usuarioGuardado = localStorage.getItem('usuario');
        return usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
    });
    const [cargando] = useState(false);

    const login = (datosUsuario) => {
        setUsuario(datosUsuario);
        localStorage.setItem('usuario', JSON.stringify(datosUsuario));
    };

    const logout = () => {
        setUsuario(null);
        // Limpiar tokens de empleados/usuarios del sistema
        localStorage.removeItem('token');
        // Limpiar tokens de clientes
        localStorage.removeItem('clienteToken');
        localStorage.removeItem('clienteRefreshToken');
        // Limpiar datos de usuario
        localStorage.removeItem('usuario');
        localStorage.removeItem('id_cliente');
        localStorage.removeItem('usuario_id');
        localStorage.removeItem('id_empleado');
        // Limpiar carrito
        localStorage.removeItem('carrito');
    };

    // Actualizar datos del usuario en el contexto
    const actualizarUsuario = (nuevosDatos) => {
        const usuarioActualizado = { ...usuario, ...nuevosDatos };
        setUsuario(usuarioActualizado);
        localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));
    };

    const esAdmin = () => {
        return usuario?.tipo === 'empleado';
    };

    const esCliente = () => {
        return usuario?.tipo === 'cliente';
    };

    const value = {
        usuario,
        cargando,
        login,
        logout,
        actualizarUsuario,
        esAdmin,
        esCliente,
        estaAutenticado: !!usuario
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
