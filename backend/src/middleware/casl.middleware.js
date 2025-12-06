const { definirAbilidades } = require('../config/abilities');
const { ForbiddenError } = require('@casl/ability');

/**
 * Middleware para verificar permisos con CASL
 */
const verificarPermiso = (accion, sujeto, obtenerCampos = null) => {
    return async (req, res, next) => {
        try {
            const usuario = req.usuario;
            
            // Verificar que el usuario esté autenticado
            if (!usuario) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
            }

            const habilidad = definirAbilidades(usuario);

            let objeto = sujeto;
            if (obtenerCampos && typeof obtenerCampos === 'function') {
                try {
                    objeto = await obtenerCampos(req);
                    
                    if (!objeto) {
                        return res.status(404).json({
                            success: false,
                            message: 'Recurso no encontrado'
                        });
                    }
                } catch (error) {
                    console.error('Error al obtener campos para verificar permiso:', error);
                    return res.status(500).json({
                        success: false,
                        message: 'Error al verificar permisos'
                    });
                }
            }

            // Verificar si tiene permiso
            const tienePermiso = habilidad.can(accion, objeto);

            if (!tienePermiso) {
                return res.status(403).json({
                    success: false,
                    message: `No tienes permiso para ${accion} ${sujeto}`
                });
            }

            req.habilidad = habilidad;
            
            next();
        } catch (error) {
            if (error instanceof ForbiddenError) {
                return res.status(403).json({
                    success: false,
                    message: error.message
                });
            }
            
            console.error('Error al verificar permisos:', error);
            console.error('Stack:', error.stack);
            res.status(500).json({
                success: false,
                message: 'Error al verificar permisos',
                error: error.message
            });
        }
    };
};

module.exports = {
    verificarPermiso
};
