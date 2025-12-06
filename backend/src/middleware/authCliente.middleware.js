const jwt = require('jsonwebtoken');
const { Cliente } = require('../models');

/**
 * Middleware de autenticación JWT para clientes
 * Verifica el token y adjunta el cliente al request
 */
const autenticarCliente = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No se proporcionó token de autenticación'
            });
        }

        const token = authHeader.substring(7);

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.tipo !== 'cliente') {
            return res.status(403).json({
                success: false,
                message: 'Token inválido para este tipo de acceso'
            });
        }

        const cliente = await Cliente.findByPk(decoded.cliente_id, {
            attributes: { exclude: ['clave'] }
        });

        if (!cliente) {
            return res.status(401).json({
                success: false,
                message: 'Cliente no encontrado'
            });
        }

        if (!cliente.activo) {
            return res.status(403).json({
                success: false,
                message: 'Cuenta de cliente inactiva'
            });
        }

        req.cliente = {
            id_cliente: cliente.id_cliente,
            nombre: cliente.nombre,
            email: cliente.email,
            telefono: cliente.telefono,
            activo: cliente.activo
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expirado',
                expired: true
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token inválido'
            });
        }

        console.error('Error en autenticación de cliente:', error);
        return res.status(500).json({
            success: false,
            message: 'Error en la autenticación'
        });
    }
};

/**
 * Middleware opcional - permite acceso con o sin token
 * Útil para endpoints que ofrecen funcionalidad extra a usuarios autenticados
 */
const autenticarClienteOpcional = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            req.cliente = null;
            return next();
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.tipo === 'cliente') {
            const cliente = await Cliente.findByPk(decoded.cliente_id, {
                attributes: { exclude: ['clave'] }
            });

            if (cliente && cliente.activo) {
                req.cliente = {
                    id_cliente: cliente.id_cliente,
                    nombre: cliente.nombre,
                    email: cliente.email,
                    telefono: cliente.telefono,
                    activo: cliente.activo
                };
            }
        }

        next();
    } catch (error) {
        // Si hay error en el token opcional, continuar sin autenticación
        req.cliente = null;
        next();
    }
};

module.exports = {
    autenticarCliente,
    autenticarClienteOpcional
};
