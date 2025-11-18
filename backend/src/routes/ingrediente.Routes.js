const express = require('express');
const router = express.Router();
const IngredienteController = require('../controllers/Ingrediente.Controller');
const { body, param, query } = require('express-validator');

const validacionCrear = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('unidad_medida')
    .notEmpty().withMessage('La unidad de medida es requerida')
    .isIn(['kg', 'g', 'l', 'ml', 'unidad', 'pieza', 'libra', 'onza', 'taza']).withMessage('Unidad de medida no válida'),
  body('precio_compra')
    .notEmpty().withMessage('El precio de compra es requerido')
    .isFloat({ min: 0 }).withMessage('El precio de compra debe ser mayor o igual a 0'),
  body('stock_minimo')
    .optional()
    .isFloat({ min: 0 }).withMessage('El stock mínimo debe ser mayor o igual a 0'),
  body('activo')
    .optional()
    .isBoolean().withMessage('El campo activo debe ser un valor booleano')
];

const validacionActualizar = [
  body('nombre')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('unidad_medida')
    .optional()
    .isIn(['kg', 'g', 'l', 'ml', 'unidad', 'pieza', 'libra', 'onza', 'taza']).withMessage('Unidad de medida no válida'),
  body('precio_compra')
    .optional()
    .isFloat({ min: 0 }).withMessage('El precio de compra debe ser mayor o igual a 0'),
  body('stock_minimo')
    .optional()
    .isFloat({ min: 0 }).withMessage('El stock mínimo debe ser mayor o igual a 0'),
  body('activo')
    .optional()
    .isBoolean().withMessage('El campo activo debe ser un valor booleano')
];

const validacionId = [
  param('id')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
];

// Rutas
router.post('/', validacionCrear, IngredienteController.crear);
router.get('/', IngredienteController.obtenerTodos);
router.get('/estadisticas', IngredienteController.obtenerEstadisticas);
router.get('/bajo-stock', IngredienteController.obtenerBajoStock);
router.get('/nombre/:nombre', IngredienteController.obtenerPorNombre);
router.get('/:id', validacionId, IngredienteController.obtenerPorId);
router.put('/:id', validacionId, validacionActualizar, IngredienteController.actualizar);
router.patch('/:id/reactivar', validacionId, IngredienteController.reactivar);
router.delete('/:id', validacionId, IngredienteController.eliminar);
router.delete('/:id/permanente', validacionId, IngredienteController.eliminarPermanente);

module.exports = router;
