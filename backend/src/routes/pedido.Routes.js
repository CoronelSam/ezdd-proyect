const express = require('express');
const router = express.Router();
const PedidoController = require('../controllers/Pedido.Controller');
const { body, param } = require('express-validator');

const validacionCrear = [
  body('id_cliente')
    .optional()
    .isInt({ min: 1 }).withMessage('El ID del cliente debe ser un número entero positivo'),
  body('id_empleado')
    .optional()
    .isInt({ min: 1 }).withMessage('El ID del empleado debe ser un número entero positivo'),
  body('estado')
    .optional()
    .isIn(['pendiente', 'en_preparacion', 'listo', 'entregado', 'cancelado']).withMessage('Estado no válido'),
  body('notas')
    .optional()
    .isString().withMessage('Las notas deben ser texto'),
  body('detalles')
    .isArray({ min: 1 }).withMessage('Debe proporcionar al menos un detalle'),
  body('detalles.*.id_producto')
    .notEmpty().withMessage('El ID del producto es requerido')
    .isInt({ min: 1 }).withMessage('El ID del producto debe ser un número entero positivo'),
  body('detalles.*.cantidad')
    .notEmpty().withMessage('La cantidad es requerida')
    .isInt({ min: 1 }).withMessage('La cantidad debe ser mayor a 0'),
  body('detalles.*.precio_unitario')
    .optional()
    .isFloat({ min: 0 }).withMessage('El precio unitario debe ser mayor o igual a 0'),
  body('detalles.*.instrucciones_especiales')
    .optional()
    .isString().withMessage('Las instrucciones especiales deben ser texto')
];

const validacionActualizar = [
  body('id_cliente')
    .optional()
    .isInt({ min: 1 }).withMessage('El ID del cliente debe ser un número entero positivo'),
  body('id_empleado')
    .optional()
    .isInt({ min: 1 }).withMessage('El ID del empleado debe ser un número entero positivo'),
  body('estado')
    .optional()
    .isIn(['pendiente', 'en_preparacion', 'listo', 'entregado', 'cancelado']).withMessage('Estado no válido'),
  body('total')
    .optional()
    .isFloat({ min: 0 }).withMessage('El total debe ser mayor o igual a 0'),
  body('notas')
    .optional()
    .isString().withMessage('Las notas deben ser texto')
];

const validacionEstado = [
  body('estado')
    .notEmpty().withMessage('El estado es requerido')
    .isIn(['pendiente', 'en_preparacion', 'listo', 'entregado', 'cancelado']).withMessage('Estado no válido')
];

const validacionId = [
  param('id')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
];

const validacionIdCliente = [
  param('idCliente')
    .isInt({ min: 1 }).withMessage('El ID del cliente debe ser un número entero positivo')
];

const validacionIdEmpleado = [
  param('idEmpleado')
    .isInt({ min: 1 }).withMessage('El ID del empleado debe ser un número entero positivo')
];

// Rutas
router.post('/', validacionCrear, PedidoController.crear);
router.get('/', PedidoController.obtenerTodos);
router.get('/estadisticas', PedidoController.obtenerEstadisticas);
router.get('/cliente/:idCliente', validacionIdCliente, PedidoController.obtenerPorCliente);
router.get('/empleado/:idEmpleado', validacionIdEmpleado, PedidoController.obtenerPorEmpleado);
router.get('/:id', validacionId, PedidoController.obtenerPorId);
router.put('/:id', validacionId, validacionActualizar, PedidoController.actualizar);
router.patch('/:id/estado', validacionId, validacionEstado, PedidoController.actualizarEstado);
router.patch('/:id/cancelar', validacionId, PedidoController.cancelar);
router.delete('/:id', validacionId, PedidoController.eliminar);

module.exports = router;
