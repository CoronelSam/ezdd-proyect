const express = require('express');
const router = express.Router();
const RecetaController = require('../controllers/Receta.Controller');
const { body, param, query } = require('express-validator');

// Validaciones
const validacionCrear = [
  body('id_producto')
    .notEmpty().withMessage('El ID del producto es requerido')
    .isInt({ min: 1 }).withMessage('El ID del producto debe ser un número entero positivo'),
  body('id_ingrediente')
    .notEmpty().withMessage('El ID del ingrediente es requerido')
    .isInt({ min: 1 }).withMessage('El ID del ingrediente debe ser un número entero positivo'),
  body('cantidad_necesaria')
    .notEmpty().withMessage('La cantidad necesaria es requerida')
    .isFloat({ min: 0.001 }).withMessage('La cantidad necesaria debe ser mayor a 0')
];

const validacionActualizar = [
  body('id_ingrediente')
    .optional()
    .isInt({ min: 1 }).withMessage('El ID del ingrediente debe ser un número entero positivo'),
  body('cantidad_necesaria')
    .optional()
    .isFloat({ min: 0.001 }).withMessage('La cantidad necesaria debe ser mayor a 0')
];

const validacionDuplicar = [
  body('id_producto_origen')
    .notEmpty().withMessage('El ID del producto origen es requerido')
    .isInt({ min: 1 }).withMessage('El ID del producto origen debe ser un número entero positivo'),
  body('id_producto_destino')
    .notEmpty().withMessage('El ID del producto destino es requerido')
    .isInt({ min: 1 }).withMessage('El ID del producto destino debe ser un número entero positivo')
];

const validacionId = [
  param('id')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
];

const validacionIdProducto = [
  param('idProducto')
    .isInt({ min: 1 }).withMessage('El ID del producto debe ser un número entero positivo')
];

const validacionIdIngrediente = [
  param('idIngrediente')
    .isInt({ min: 1 }).withMessage('El ID del ingrediente debe ser un número entero positivo')
];

// Rutas
router.post('/', validacionCrear, RecetaController.crear);
router.post('/duplicar', validacionDuplicar, RecetaController.duplicar);
router.get('/', RecetaController.obtenerTodas);
router.get('/producto/:idProducto', validacionIdProducto, RecetaController.obtenerPorProducto);
router.get('/producto/:idProducto/costo', validacionIdProducto, RecetaController.calcularCosto);
router.get('/ingrediente/:idIngrediente', validacionIdIngrediente, RecetaController.obtenerPorIngrediente);
router.get('/:id', validacionId, RecetaController.obtenerPorId);
router.put('/:id', validacionId, validacionActualizar, RecetaController.actualizar);
router.delete('/:id', validacionId, RecetaController.eliminar);

module.exports = router;
