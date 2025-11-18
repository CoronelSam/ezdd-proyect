const express = require('express');
const router = express.Router();
const ProductoController = require('../controllers/Producto.Controller');
const { body, param } = require('express-validator');

const validacionCrear = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es requerido')
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
    }),
  
  body('id_categoria')
    .notEmpty().withMessage('La categoría es requerida')
    .isInt({ min: 1 }).withMessage('La categoría debe ser un número válido'),
  
  body('imagen_url')
    .optional()
    .trim()
    .isURL().withMessage('Debe proporcionar una URL válida')
];

const validacionActualizar = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID inválido'),
  
  body('nombre')
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
  
  body('id_categoria')
    .optional()
    .isInt({ min: 1 }).withMessage('La categoría debe ser un número válido'),
  
  body('imagen_url')
    .optional()
    .trim()
    .isURL().withMessage('Debe proporcionar una URL válida'),
  
  body('activo')
    .optional()
    .isBoolean().withMessage('El campo activo debe ser un booleano')
];

const validacionActualizarPrecio = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID inválido'),
  
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

const validacionId = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID inválido')
];

const validacionIdCategoria = [
  param('idCategoria')
    .isInt({ min: 1 }).withMessage('ID de categoría inválido')
];

// Rutas
router.post('/', validacionCrear, ProductoController.crear);
router.get('/', ProductoController.obtenerTodos);
router.get('/buscar', ProductoController.buscarPorNombre);
router.get('/estadisticas', ProductoController.obtenerEstadisticas);
router.get('/categoria/:idCategoria', validacionIdCategoria, ProductoController.obtenerPorCategoria);
router.get('/:id', validacionId, ProductoController.obtenerPorId);
router.put('/:id', validacionActualizar, ProductoController.actualizar);
router.patch('/:id/precio', validacionActualizarPrecio, ProductoController.actualizarPrecio);
router.patch('/:id/reactivar', validacionId, ProductoController.reactivar);
router.delete('/:id', validacionId, ProductoController.eliminar);
router.delete('/:id/permanente', validacionId, ProductoController.eliminarPermanente);

module.exports = router;
