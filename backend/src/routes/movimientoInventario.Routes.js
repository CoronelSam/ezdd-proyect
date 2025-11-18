const express = require('express');
const router = express.Router();
const MovimientoInventarioController = require('../controllers/MovimientoInventario.Controller');
const { body, param } = require('express-validator');

const validacionCrear = [
  body('id_ingrediente')
    .notEmpty().withMessage('El ID del ingrediente es requerido')
    .isInt({ min: 1 }).withMessage('El ID del ingrediente debe ser un número entero positivo'),
  body('tipo_movimiento')
    .notEmpty().withMessage('El tipo de movimiento es requerido')
    .isIn(['entrada', 'salida', 'ajuste', 'merma']).withMessage('Tipo de movimiento no válido'),
  body('cantidad')
    .notEmpty().withMessage('La cantidad es requerida')
    .isFloat({ min: 0.001 }).withMessage('La cantidad debe ser mayor a 0'),
  body('fecha_movimiento')
    .optional()
    .isISO8601().withMessage('La fecha debe ser válida'),
  body('id_pedido')
    .optional()
    .isInt({ min: 1 }).withMessage('El ID del pedido debe ser un número entero positivo'),
  body('id_empleado')
    .optional()
    .isInt({ min: 1 }).withMessage('El ID del empleado debe ser un número entero positivo'),
  body('notas')
    .optional()
    .isString().withMessage('Las notas deben ser texto')
];

const validacionSalidaPedido = [
  body('id_pedido')
    .notEmpty().withMessage('El ID del pedido es requerido')
    .isInt({ min: 1 }).withMessage('El ID del pedido debe ser un número entero positivo'),
  body('id_empleado')
    .optional()
    .isInt({ min: 1 }).withMessage('El ID del empleado debe ser un número entero positivo')
];

const validacionId = [
  param('id')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
];

const validacionIdIngrediente = [
  param('idIngrediente')
    .isInt({ min: 1 }).withMessage('El ID del ingrediente debe ser un número entero positivo')
];

const validacionIdPedido = [
  param('idPedido')
    .isInt({ min: 1 }).withMessage('El ID del pedido debe ser un número entero positivo')
];

const validacionIdEmpleado = [
  param('idEmpleado')
    .isInt({ min: 1 }).withMessage('El ID del empleado debe ser un número entero positivo')
];

// Rutas
router.post('/', validacionCrear, MovimientoInventarioController.crear);
router.post('/salida-pedido', validacionSalidaPedido, MovimientoInventarioController.registrarSalidaPorPedido);
router.get('/', MovimientoInventarioController.obtenerTodos);
router.get('/estadisticas', MovimientoInventarioController.obtenerEstadisticas);
router.get('/ingrediente/:idIngrediente', validacionIdIngrediente, MovimientoInventarioController.obtenerPorIngrediente);
router.get('/pedido/:idPedido', validacionIdPedido, MovimientoInventarioController.obtenerPorPedido);
router.get('/empleado/:idEmpleado', validacionIdEmpleado, MovimientoInventarioController.obtenerPorEmpleado);
router.get('/:id', validacionId, MovimientoInventarioController.obtenerPorId);
router.delete('/:id', validacionId, MovimientoInventarioController.eliminar);

module.exports = router;
