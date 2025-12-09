const express = require('express');
const router = express.Router();
const CategoriaProductoController = require('../controllers/CategoriaProducto.Controller');
const { body, param } = require('express-validator');

const validacionCrear = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 50 }).withMessage('El nombre debe tener entre 2 y 50 caracteres'),
  
  body('descripcion')
    .optional({ checkFalsy: true })
    .trim()
];

const validacionActualizar = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID inválido'),
  
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 50 }).withMessage('El nombre debe tener entre 2 y 50 caracteres'),
  
  body('descripcion')
    .optional({ checkFalsy: true })
    .trim(),
  
  body('activa')
    .optional()
    .isBoolean().withMessage('El campo activa debe ser un booleano')
];

const validacionId = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID inválido')
];

// Rutas
router.post('/', validacionCrear, CategoriaProductoController.crear);
router.get('/', CategoriaProductoController.obtenerTodas);
router.get('/con-conteo', CategoriaProductoController.obtenerConConteo);
router.get('/:id', validacionId, CategoriaProductoController.obtenerPorId);
router.put('/:id', validacionActualizar, CategoriaProductoController.actualizar);
router.patch('/:id/reactivar', validacionId, CategoriaProductoController.reactivar);
router.delete('/:id', validacionId, CategoriaProductoController.eliminar);
router.delete('/:id/permanente', validacionId, CategoriaProductoController.eliminarPermanente);

module.exports = router;
