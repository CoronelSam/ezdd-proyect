import { useAbility } from '../context/AbilityContext';
import { useAuth } from './useAuth';

/**
 * Hook personalizado para gestionar permisos
 */
export const usePermissions = () => {
    const ability = useAbility();
    const { usuario } = useAuth();

    /**
     * Verifica si el usuario tiene un permiso específico
     */
    const tienePermiso = (accion, sujeto, condiciones) => {
        if (!usuario) return false;
        // Si no hay condiciones, solo verificar acción y sujeto
        if (!condiciones || Object.keys(condiciones).length === 0) {
            return ability.can(accion, sujeto);
        }
        return ability.can(accion, sujeto, condiciones);
    };

    /**
     * Verifica si puede crear un recurso
     */
    const puedeCrear = (sujeto) => {
        return tienePermiso('create', sujeto);
    };

    /**
     * Verifica si puede leer/ver un recurso
     */
    const puedeVer = (sujeto, condiciones) => {
        return tienePermiso('read', sujeto, condiciones);
    };

    /**
     * Verifica si puede actualizar/editar un recurso
     */
    const puedeEditar = (sujeto, condiciones) => {
        return tienePermiso('update', sujeto, condiciones);
    };

    /**
     * Verifica si puede eliminar un recurso
     */
    const puedeEliminar = (sujeto, condiciones) => {
        return tienePermiso('delete', sujeto, condiciones);
    };

    /**
     * Verifica si puede gestionar completamente un recurso (todas las acciones)
     */
    const puedeGestionar = (sujeto) => {
        return tienePermiso('manage', sujeto);
    };

    /**
     * Verifica si tiene alguno de los permisos especificados
     */
    const tieneAlgunPermiso = (permisos) => {
        return permisos.some(({ accion, sujeto, condiciones }) => 
            tienePermiso(accion, sujeto, condiciones)
        );
    };

    /**
     * Verifica si tiene todos los permisos especificados
     */
    const tieneTodosLosPermisos = (permisos) => {
        return permisos.every(({ accion, sujeto, condiciones }) => 
            tienePermiso(accion, sujeto, condiciones)
        );
    };

    return {
        // Funciones de verificación de permisos basadas en CASL
        tienePermiso,
        puedeCrear,
        puedeVer,
        puedeEditar,
        puedeEliminar,
        puedeGestionar,
        tieneAlgunPermiso,
        tieneTodosLosPermisos,
        
        // Acceso directo a ability y usuario
        ability,
        usuario
    };
};
