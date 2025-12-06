const express = require('express');
const router = express.Router();
const ProductoController = require('../controllers/Producto.Controller');
const { body, param } = require('express-validator');
const { autenticar } = require('../middleware/auth.middleware');
const { verificarPermiso } = require('../middleware/casl.middleware');
const { MODULOS } = require('../utils/constants');

const validacionCrear = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  
  body('descripcion')
    .optional()
    .trim(),
  
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

const validacionId = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID inválido')
];

const validacionIdCategoria = [
  param('idCategoria')
    .isInt({ min: 1 }).withMessage('ID de categoría inválido')
];

// Rutas - Las operaciones de lectura son públicas para clientes
router.post('/', autenticar, verificarPermiso('create', MODULOS.PRODUCTO), validacionCrear, ProductoController.crear);
router.get('/', ProductoController.obtenerTodos);
router.get('/buscar', ProductoController.buscarPorNombre);
router.get('/estadisticas', autenticar, verificarPermiso('read', MODULOS.PRODUCTO), ProductoController.obtenerEstadisticas);
router.get('/categoria/:idCategoria', validacionIdCategoria, ProductoController.obtenerPorCategoria);
router.get('/:id', validacionId, ProductoController.obtenerPorId);
router.put('/:id', autenticar, verificarPermiso('update', MODULOS.PRODUCTO), validacionActualizar, ProductoController.actualizar);
router.patch('/:id/reactivar', autenticar, verificarPermiso('update', MODULOS.PRODUCTO), validacionId, ProductoController.reactivar);
router.delete('/:id', autenticar, verificarPermiso('delete', MODULOS.PRODUCTO), validacionId, ProductoController.eliminar);
router.delete('/:id/permanente', autenticar, verificarPermiso('delete', MODULOS.PRODUCTO), validacionId, ProductoController.eliminarPermanente);

module.exports = router;
