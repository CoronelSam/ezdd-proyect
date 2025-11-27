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
        localStorage.removeItem('usuario');
        localStorage.removeItem('token');
        localStorage.removeItem('id_cliente');
        localStorage.removeItem('usuario_id');
        localStorage.removeItem('id_empleado');
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
