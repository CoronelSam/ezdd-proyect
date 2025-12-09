const express = require('express');
const router = express.Router();
const ClienteController = require('../controllers/Cliente.Controller');
const { body, param } = require('express-validator');
const { autenticarCliente } = require('../middleware/authCliente.middleware');
const { autenticar } = require('../middleware/auth.middleware');
const { verificarPermiso } = require('../middleware/casl.middleware');

const validacionCrear = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('Debe proporcionar un email válido')
    .normalizeEmail(),
  
  body('clave')
    .notEmpty().withMessage('La clave es requerida')
    .isLength({ min: 6 }).withMessage('La clave debe tener al menos 6 caracteres'),
  
  body('telefono')
    .optional()
    .trim()
    .matches(/^[0-9+\-\s()]*$/).withMessage('El teléfono debe contener solo números y símbolos válidos')
];

const validacionActualizar = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID inválido'),
  
  body('nombre')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Debe proporcionar un email válido')
    .normalizeEmail(),
  
  body('clave')
    .optional()
    .isLength({ min: 6 }).withMessage('La clave debe tener al menos 6 caracteres'),
  
  body('telefono')
    .optional()
    .trim()
    .matches(/^[0-9+\-\s()]*$/).withMessage('El teléfono debe contener solo números y símbolos válidos'),
  
  body('activo')
    .optional()
    .isBoolean().withMessage('El campo activo debe ser un booleano')
];

const validacionLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('Debe proporcionar un email válido')
    .normalizeEmail(),
  
  body('clave')
    .notEmpty().withMessage('La clave es requerida')
];

const validacionCambiarClave = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID inválido'),
  
  body('clave_actual')
    .notEmpty().withMessage('La contraseña actual es requerida'),
  
  body('clave_nueva')
    .notEmpty().withMessage('La contraseña nueva es requerida')
    .isLength({ min: 6 }).withMessage('La contraseña nueva debe tener al menos 6 caracteres')
];

// Validación para cambio de clave desde perfil de cliente (sin ID en params)
const validacionCambiarClavePerfil = [
  body('claveActual')
    .notEmpty().withMessage('La contraseña actual es requerida'),
  
  body('claveNueva')
    .notEmpty().withMessage('La contraseña nueva es requerida')
    .isLength({ min: 6 }).withMessage('La contraseña nueva debe tener al menos 6 caracteres')
];

const validacionId = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID inválido')
];

const validacionRefreshToken = [
  body('refreshToken')
    .notEmpty().withMessage('Refresh token requerido')
];

const validacionActualizarPerfil = [
  body('nombre')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Debe proporcionar un email válido')
    .normalizeEmail(),
  
  body('telefono')
    .optional()
    .trim()
    .matches(/^[0-9+\-\s()]*$/).withMessage('El teléfono debe contener solo números y símbolos válidos')
];

// === RUTAS PÚBLICAS (sin autenticación) ===
router.post('/', validacionCrear, ClienteController.crear); // Registro
router.post('/login', validacionLogin, ClienteController.login); // Login
router.post('/refresh-token', validacionRefreshToken, ClienteController.refreshToken); // Renovar token

// === RUTAS PROTEGIDAS PARA CLIENTES (requieren JWT de cliente) ===
router.get('/perfil/me', autenticarCliente, ClienteController.obtenerPerfil); // Ver mi perfil
router.put('/perfil/me', autenticarCliente, validacionActualizarPerfil, ClienteController.actualizarPerfil); // Actualizar mi perfil
router.patch('/perfil/cambiar-clave', autenticarCliente, validacionCambiarClavePerfil, ClienteController.cambiarClave); // Cambiar mi contraseña

// === RUTAS ADMINISTRATIVAS (solo para empleados/usuarios del sistema) ===
router.get('/', autenticar, verificarPermiso('read', 'CLIENTE'), ClienteController.obtenerTodos);
router.get('/estadisticas', autenticar, verificarPermiso('read', 'CLIENTE'), ClienteController.obtenerEstadisticas);
router.get('/:id', autenticar, verificarPermiso('read', 'CLIENTE'), validacionId, ClienteController.obtenerPorId);
router.get('/email/:email', autenticar, verificarPermiso('read', 'CLIENTE'), ClienteController.obtenerPorEmail);
router.put('/:id', autenticar, verificarPermiso('update', 'CLIENTE'), validacionActualizar, ClienteController.actualizar);
router.patch('/:id/reactivar', autenticar, verificarPermiso('update', 'CLIENTE'), validacionId, ClienteController.reactivar);
router.delete('/:id', autenticar, verificarPermiso('delete', 'CLIENTE'), validacionId, ClienteController.eliminar);
router.delete('/:id/permanente', autenticar, verificarPermiso('delete', 'CLIENTE'), validacionId, ClienteController.eliminarPermanente);

module.exports = router;
