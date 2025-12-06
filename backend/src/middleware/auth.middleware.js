const jwt = require('jsonwebtoken');
const { UsuarioSistema, Empleado } = require('../models');

/**
 * Middleware de autenticación JWT para empleados/usuarios del sistema
 * Verifica el token y adjunta el usuario al request
 */
const autenticar = async (req, res, next) => {
    try {
        // Obtener el token del header
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No se proporcionó token de autenticación'
            });
        }

        const token = authHeader.substring(7); // Remover 'Bearer '

        // Verificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Buscar el usuario en la base de datos
        const usuario = await UsuarioSistema.findByPk(decoded.usuario_id, {
            include: [{
                model: Empleado,
                as: 'empleado',
                attributes: ['id_empleado', 'nombre', 'email', 'puesto', 'activo']
            }],
            attributes: { exclude: ['password_hash'] }
        });

        if (!usuario) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        if (!usuario.activo) {
            return res.status(403).json({
                success: false,
                message: 'Usuario inactivo'
            });
        }

        // Adjuntar usuario al request
        req.usuario = {
            usuario_id: usuario.usuario_id,
            username: usuario.username,
            rol: usuario.rol,
            activo: usuario.activo,
            empleado_id: usuario.empleado_id,
            empleado: usuario.empleado
        };

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token inválido'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expirado'
            });
        }

        console.error('Error en autenticación:', error);
        res.status(500).json({
            success: false,
            message: 'Error al verificar autenticación'
        });
    }
};

/**
 * Middleware opcional de autenticación
 * Si hay token lo verifica, si no hay, continúa sin usuario
 */
const autenticarOpcional = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            req.usuario = null;
            return next();
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const usuario = await UsuarioSistema.findByPk(decoded.usuario_id, {
            include: [{
                model: Empleado,
                as: 'empleado',
                attributes: ['empleado_id', 'nombre', 'email', 'puesto', 'activo']
            }],
            attributes: { exclude: ['password_hash'] }
        });

        if (usuario && usuario.activo) {
            req.usuario = {
                usuario_id: usuario.usuario_id,
                username: usuario.username,
                rol: usuario.rol,
                activo: usuario.activo,
                empleado_id: usuario.empleado_id,
                empleado: usuario.empleado
            };
        } else {
            req.usuario = null;
        }

        next();
    } catch (error) {
        req.usuario = null;
        next();
    }
};

module.exports = {
    autenticar,
    autenticarOpcional
};
