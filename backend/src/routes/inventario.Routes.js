const express = require('express');
const router = express.Router();
const InventarioController = require('../controllers/Inventario.Controller');
const { body, param } = require('express-validator');

const validacionCrear = [
  body('id_ingrediente')
    .notEmpty().withMessage('El ID del ingrediente es requerido')
    .isInt({ min: 1 }).withMessage('El ID del ingrediente debe ser un número entero positivo'),
  body('cantidad_actual')
    .notEmpty().withMessage('La cantidad actual es requerida')
    .isFloat({ min: 0 }).withMessage('La cantidad actual debe ser mayor o igual a 0')
];

const validacionActualizar = [
  body('cantidad_actual')
    .notEmpty().withMessage('La cantidad actual es requerida')
    .isFloat({ min: 0 }).withMessage('La cantidad actual debe ser mayor o igual a 0')
];

const validacionCantidad = [
  body('cantidad')
    .notEmpty().withMessage('La cantidad es requerida')
    .isFloat({ min: 0.001 }).withMessage('La cantidad debe ser mayor a 0')
];

const validacionId = [
  param('id')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
];

const validacionIdIngrediente = [
  param('idIngrediente')
    .isInt({ min: 1 }).withMessage('El ID del ingrediente debe ser un número entero positivo')
];

// Rutas
router.post('/', validacionCrear, InventarioController.crear);
router.post('/inicializar', InventarioController.inicializar);
router.get('/', InventarioController.obtenerTodos);
router.get('/estadisticas', InventarioController.obtenerEstadisticas);
router.get('/bajo-stock', InventarioController.obtenerBajoStock);
router.get('/ingrediente/:idIngrediente', validacionIdIngrediente, InventarioController.obtenerPorIngrediente);
router.get('/:id', validacionId, InventarioController.obtenerPorId);
router.put('/:id', validacionId, validacionActualizar, InventarioController.actualizar);
router.patch('/:id/agregar', validacionId, validacionCantidad, InventarioController.agregarCantidad);
router.patch('/:id/reducir', validacionId, validacionCantidad, InventarioController.reducirCantidad);
router.delete('/:id', validacionId, InventarioController.eliminar);

module.exports = router;
