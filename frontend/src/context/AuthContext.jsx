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
        localStorage.removeItem('id_cliente');
        localStorage.removeItem('carrito');
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
