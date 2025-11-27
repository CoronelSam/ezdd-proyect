const express = require('express');
const router = express.Router();
const ClienteController = require('../controllers/Cliente.Controller');
const { body, param } = require('express-validator');

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

const validacionId = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID inválido')
];

router.post('/', validacionCrear, ClienteController.crear);
router.post('/login', validacionLogin, ClienteController.login);
router.get('/', ClienteController.obtenerTodos);
router.get('/estadisticas', ClienteController.obtenerEstadisticas);
router.get('/:id', validacionId, ClienteController.obtenerPorId);
router.get('/email/:email', ClienteController.obtenerPorEmail);
router.put('/:id', validacionActualizar, ClienteController.actualizar);
router.patch('/:id/cambiar-clave', validacionCambiarClave, ClienteController.cambiarClave);
router.patch('/:id/reactivar', validacionId, ClienteController.reactivar);
router.delete('/:id', validacionId, ClienteController.eliminar);
router.delete('/:id/permanente', validacionId, ClienteController.eliminarPermanente);

module.exports = router;
