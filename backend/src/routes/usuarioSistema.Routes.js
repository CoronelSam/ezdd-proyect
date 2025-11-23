const express = require('express');
const router = express.Router();
const UsuarioSistemaController = require('../controllers/UsuarioSistema.Controller');
const { body, param } = require('express-validator');

const validacionCrear = [
  body('empleado_id')
    .notEmpty().withMessage('El ID del empleado es requerido')
    .isInt({ min: 1 }).withMessage('El ID del empleado debe ser un número válido'),
  
  body('username')
    .trim()
    .notEmpty().withMessage('El username es requerido')
    .isLength({ min: 3, max: 50 }).withMessage('El username debe tener entre 3 y 50 caracteres')
    .matches(/^[a-zA-Z0-9._-]+$/).withMessage('El username solo puede contener letras, números, puntos, guiones y guiones bajos'),
  
  body('password')
    .optional()
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  
  body('password_hash')
    .optional()
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  
  body('rol')
    .notEmpty().withMessage('El rol es requerido')
    .isIn(['mesero', 'cocinero', 'cajero', 'admin']).withMessage('El rol debe ser: mesero, cocinero, cajero o admin')
];

const validacionActualizar = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID inválido'),
  
  body('empleado_id')
    .optional()
    .isInt({ min: 1 }).withMessage('El ID del empleado debe ser un número válido'),
  
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 }).withMessage('El username debe tener entre 3 y 50 caracteres')
    .matches(/^[a-zA-Z0-9._-]+$/).withMessage('El username solo puede contener letras, números, puntos, guiones y guiones bajos'),
  
  body('rol')
    .optional()
    .isIn(['mesero', 'cocinero', 'cajero', 'admin']).withMessage('El rol debe ser: mesero, cocinero, cajero o admin'),
  
  body('activo')
    .optional()
    .isBoolean().withMessage('El campo activo debe ser un booleano')
];

const validacionCambiarPassword = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID inválido'),
  
  body('password_actual')
    .notEmpty().withMessage('La contraseña actual es requerida'),
  
  body('password_nuevo')
    .notEmpty().withMessage('La contraseña nueva es requerida')
    .isLength({ min: 6 }).withMessage('La contraseña nueva debe tener al menos 6 caracteres')
];

const validacionLogin = [
  body('username')
    .trim()
    .notEmpty().withMessage('El username es requerido'),
  
  body('password')
    .notEmpty().withMessage('La contraseña es requerida')
];

const validacionId = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID inválido')
];

const validacionUsername = [
  param('username')
    .trim()
    .notEmpty().withMessage('Username inválido')
];

// Rutas públicas
router.post('/login', validacionLogin, UsuarioSistemaController.login);

// Rutas protegidas (en producción agregar middleware de autenticación)
router.post('/', validacionCrear, UsuarioSistemaController.crear);
router.get('/', UsuarioSistemaController.obtenerTodos);
router.get('/estadisticas', UsuarioSistemaController.obtenerEstadisticas);
router.get('/username/:username', validacionUsername, UsuarioSistemaController.obtenerPorUsername);
router.get('/:id', validacionId, UsuarioSistemaController.obtenerPorId);
router.put('/:id', validacionActualizar, UsuarioSistemaController.actualizar);
router.patch('/:id/cambiar-password', validacionCambiarPassword, UsuarioSistemaController.cambiarPassword);
router.patch('/:id/desactivar', validacionId, UsuarioSistemaController.desactivar);
router.patch('/:id/reactivar', validacionId, UsuarioSistemaController.reactivar);
router.delete('/:id', validacionId, UsuarioSistemaController.eliminar);

module.exports = router;
