const express = require('express');
const router = express.Router();
const PrecioProductoController = require('../controllers/PrecioProducto.Controller');
const { body, param } = require('express-validator');

const validacionCrear = [
  body('id_producto')
    .notEmpty().withMessage('El ID del producto es requerido')
    .isInt({ min: 1 }).withMessage('El ID del producto debe ser un número válido'),
  
  body('nombre_presentacion')
    .trim()
    .notEmpty().withMessage('El nombre de la presentación es requerido')
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  
  body('descripcion')
    .optional()
    .trim(),
  
  body('precio')
    .notEmpty().withMessage('El precio es requerido')
    .isDecimal({ decimal_digits: '0,2' }).withMessage('El precio debe ser un número válido')
    .custom((value) => {
      if (parseFloat(value) < 0) {
        throw new Error('El precio debe ser mayor o igual a 0');
      }
      return true;
    })
];

const validacionActualizar = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID inválido'),
  
  body('nombre_presentacion')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  
  body('descripcion')
    .optional()
    .trim(),
  
  body('precio')
    .optional()
    .isDecimal({ decimal_digits: '0,2' }).withMessage('El precio debe ser un número válido')
    .custom((value) => {
      if (parseFloat(value) < 0) {
        throw new Error('El precio debe ser mayor o igual a 0');
      }
      return true;
    }),
  
  body('activo')
    .optional()
    .isBoolean().withMessage('El campo activo debe ser un booleano')
];

const validacionId = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID inválido')
];

const validacionIdProducto = [
  param('idProducto')
    .isInt({ min: 1 }).withMessage('ID de producto inválido')
];

// Rutas
router.post('/', validacionCrear, PrecioProductoController.crear);
router.post('/duplicar', PrecioProductoController.duplicarPrecios);
router.get('/', PrecioProductoController.obtenerTodos);
router.get('/estadisticas', PrecioProductoController.obtenerEstadisticas);
router.get('/producto/:idProducto', validacionIdProducto, PrecioProductoController.obtenerPorProducto);
router.get('/producto/:idProducto/presentacion/:nombrePresentacion', PrecioProductoController.obtenerPorPresentacion);
router.get('/:id', validacionId, PrecioProductoController.obtenerPorId);
router.put('/:id', validacionActualizar, PrecioProductoController.actualizar);
router.patch('/:id/reactivar', validacionId, PrecioProductoController.reactivar);
router.delete('/:id', validacionId, PrecioProductoController.eliminar);
router.delete('/:id/permanente', validacionId, PrecioProductoController.eliminarPermanente);

module.exports = router;
