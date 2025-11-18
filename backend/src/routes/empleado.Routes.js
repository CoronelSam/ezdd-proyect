const express = require('express');
const router = express.Router();
const EmpleadoController = require('../controllers/Empleado.Controller');
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
  
  body('telefono')
    .optional()
    .trim()
    .matches(/^[0-9+\-\s()]*$/).withMessage('El teléfono debe contener solo números y símbolos válidos'),
  
  body('puesto')
    .trim()
    .notEmpty().withMessage('El puesto es requerido')
    .isIn(['Gerente', 'Chef', 'Mesero', 'Cajero', 'Cocinero', 'Bartender', 'Ayudante de Cocina', 'Recepcionista'])
    .withMessage('El puesto debe ser uno de los valores permitidos'),
  
  body('fecha_contratacion')
    .optional()
    .isISO8601().withMessage('La fecha de contratación debe ser válida'),
  
  body('salario')
    .notEmpty().withMessage('El salario es requerido')
    .isDecimal({ decimal_digits: '0,2' }).withMessage('El salario debe ser un número válido')
    .custom((value) => {
      if (parseFloat(value) < 0) {
        throw new Error('El salario debe ser mayor o igual a 0');
      }
      return true;
    })
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
  
  body('telefono')
    .optional()
    .trim()
    .matches(/^[0-9+\-\s()]*$/).withMessage('El teléfono debe contener solo números y símbolos válidos'),
  
  body('puesto')
    .optional()
    .trim()
    .isIn(['Gerente', 'Chef', 'Mesero', 'Cajero', 'Cocinero', 'Bartender', 'Ayudante de Cocina', 'Recepcionista'])
    .withMessage('El puesto debe ser uno de los valores permitidos'),
  
  body('fecha_contratacion')
    .optional()
    .isISO8601().withMessage('La fecha de contratación debe ser válida'),
  
  body('salario')
    .optional()
    .isDecimal({ decimal_digits: '0,2' }).withMessage('El salario debe ser un número válido')
    .custom((value) => {
      if (parseFloat(value) < 0) {
        throw new Error('El salario debe ser mayor o igual a 0');
      }
      return true;
    }),
  
  body('activo')
    .optional()
    .isBoolean().withMessage('El campo activo debe ser un booleano')
];

// Validación para actualizar salario
const validacionActualizarSalario = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID inválido'),
  
  body('salario')
    .notEmpty().withMessage('El salario es requerido')
    .isDecimal({ decimal_digits: '0,2' }).withMessage('El salario debe ser un número válido')
    .custom((value) => {
      if (parseFloat(value) < 0) {
        throw new Error('El salario debe ser mayor o igual a 0');
      }
      return true;
    })
];

const validacionId = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID inválido')
];

router.post('/', validacionCrear, EmpleadoController.crear);
router.get('/', EmpleadoController.obtenerTodos);
router.get('/estadisticas', EmpleadoController.obtenerEstadisticas);
router.get('/:id', validacionId, EmpleadoController.obtenerPorId);
router.get('/email/:email', EmpleadoController.obtenerPorEmail);
router.get('/puesto/:puesto', EmpleadoController.obtenerPorPuesto);
router.put('/:id', validacionActualizar, EmpleadoController.actualizar);
router.patch('/:id/salario', validacionActualizarSalario, EmpleadoController.actualizarSalario);
router.patch('/:id/reactivar', validacionId, EmpleadoController.reactivar);
router.delete('/:id', validacionId, EmpleadoController.eliminar);
router.delete('/:id/permanente', validacionId, EmpleadoController.eliminarPermanente);

module.exports = router;
