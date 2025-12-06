const express = require('express');
const router = express.Router();
const UsuarioSistemaController = require('../controllers/UsuarioSistema.Controller');
const { body, param } = require('express-validator');
const { autenticar } = require('../middleware/auth.middleware');
const { verificarPermiso } = require('../middleware/casl.middleware');
const { MODULOS } = require('../utils/constants');

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
    .isIn(['admin', 'gerente', 'cajero', 'mesero', 'cocinero']).withMessage('El rol debe ser: admin, gerente, cajero, mesero o cocinero')
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
    .isIn(['admin', 'gerente', 'cajero', 'mesero', 'cocinero']).withMessage('El rol debe ser: admin, gerente, cajero, mesero o cocinero'),
  
  body('password')
    .optional()
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  
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

// Rutas protegidas con permisos CASL
router.post('/', autenticar, verificarPermiso('create', MODULOS.USUARIO_SISTEMA), validacionCrear, UsuarioSistemaController.crear);
router.get('/', autenticar, verificarPermiso('read', MODULOS.USUARIO_SISTEMA), UsuarioSistemaController.obtenerTodos);
router.get('/estadisticas', autenticar, verificarPermiso('read', MODULOS.USUARIO_SISTEMA), UsuarioSistemaController.obtenerEstadisticas);
router.get('/username/:username', autenticar, verificarPermiso('read', MODULOS.USUARIO_SISTEMA), validacionUsername, UsuarioSistemaController.obtenerPorUsername);
router.get('/:id', autenticar, verificarPermiso('read', MODULOS.USUARIO_SISTEMA), validacionId, UsuarioSistemaController.obtenerPorId);
router.put('/:id', autenticar, verificarPermiso('update', MODULOS.USUARIO_SISTEMA), validacionActualizar, UsuarioSistemaController.actualizar);
router.patch('/:id/cambiar-password', autenticar, verificarPermiso('update', MODULOS.USUARIO_SISTEMA), validacionCambiarPassword, UsuarioSistemaController.cambiarPassword);
router.patch('/:id/desactivar', autenticar, verificarPermiso('update', MODULOS.USUARIO_SISTEMA), validacionId, UsuarioSistemaController.desactivar);
router.patch('/:id/reactivar', autenticar, verificarPermiso('update', MODULOS.USUARIO_SISTEMA), validacionId, UsuarioSistemaController.reactivar);
router.delete('/:id', autenticar, verificarPermiso('delete', MODULOS.USUARIO_SISTEMA), validacionId, UsuarioSistemaController.eliminar);

module.exports = router;
