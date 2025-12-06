import { useState, useEffect } from 'react';
import { clientePerfilService } from '../services';

/**
 * Hook para gestionar el perfil del cliente autenticado
 */
export const useClientePerfil = () => {
    const [perfil, setPerfil] = useState(null);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Cargar el perfil del cliente desde el servidor
     */
    const cargarPerfil = async () => {
        setCargando(true);
        setError(null);
        
        const resultado = await clientePerfilService.obtenerPerfil();
        
        if (resultado.success) {
            setPerfil(resultado.data);
        } else {
            setError(resultado.error);
        }
        
        setCargando(false);
        return resultado;
    };

    /**
     * Actualizar el perfil del cliente
     */
    const actualizarPerfil = async (datos) => {
        setCargando(true);
        setError(null);
        
        const resultado = await clientePerfilService.actualizarPerfil(datos);
        
        if (resultado.success) {
            setPerfil(resultado.data);
        } else {
            setError(resultado.error);
        }
        
        setCargando(false);
        return resultado;
    };

    /**
     * Cambiar la contraseña del cliente
     */
    const cambiarClave = async (claveActual, claveNueva) => {
        setCargando(true);
        setError(null);
        
        const resultado = await clientePerfilService.cambiarClave(claveActual, claveNueva);
        
        if (!resultado.success) {
            setError(resultado.error);
        }
        
        setCargando(false);
        return resultado;
    };

    return {
        perfil,
        cargando,
        error,
        cargarPerfil,
        actualizarPerfil,
        cambiarClave
    };
};
