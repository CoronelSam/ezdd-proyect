const CategoriaProductoService = require('../services/CategoriaProductoService');
const { validationResult } = require('express-validator');

class CategoriaProductoController {

  async crear(req, res) {
    try {
      // Validar errores de express-validator
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Errores de validación', 
          detalles: errors.array() 
        });
      }

      const nuevaCategoria = await CategoriaProductoService.crearCategoria(req.body);
      
      res.status(201).json({
        mensaje: 'Categoría creada exitosamente',
        categoria: nuevaCategoria
      });
    } catch (error) {
      console.error('Error al crear categoría:', error);
      
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ 
          error: 'Este nombre de categoría ya existe' 
        });
      }
      
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ 
          error: 'Errores de validación', 
          detalles: error.errors.map(e => e.message) 
        });
      }

      res.status(500).json({ 
        error: 'Error al crear la categoría',
        mensaje: error.message 
      });
    }
  }

  async obtenerTodas(req, res) {
    try {
      const filtros = {
        activa: req.query.activa !== undefined ? req.query.activa === 'true' : undefined
      };

      const categorias = await CategoriaProductoService.obtenerCategorias(filtros);
      
      res.status(200).json({
        total: categorias.length,
        categorias
      });
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      res.status(500).json({ 
        error: 'Error al obtener las categorías',
        mensaje: error.message 
      });
    }
  }

  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      const incluirProductos = req.query.incluir_productos === 'true';
      
      const categoria = await CategoriaProductoService.obtenerCategoriaPorId(id, incluirProductos);
      
      res.status(200).json({
        categoria
      });
    } catch (error) {
      console.error('Error al obtener categoría:', error);
      
      if (error.message === 'Categoría no encontrada') {
        return res.status(404).json({ 
          error: 'Categoría no encontrada' 
        });
      }

      res.status(500).json({ 
        error: 'Error al obtener la categoría',
        mensaje: error.message 
      });
    }
  }

  async obtenerConConteo(req, res) {
    try {
      const categorias = await CategoriaProductoService.obtenerCategoriasConConteo();
      
      res.status(200).json({
        total: categorias.length,
        categorias
      });
    } catch (error) {
      console.error('Error al obtener categorías con conteo:', error);
      res.status(500).json({ 
        error: 'Error al obtener las categorías',
        mensaje: error.message 
      });
    }
  }

  async actualizar(req, res) {
    try {
      // Validar errores de express-validator
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Errores de validación', 
          detalles: errors.array() 
        });
      }

      const { id } = req.params;
      const categoriaActualizada = await CategoriaProductoService.actualizarCategoria(id, req.body);
      
      res.status(200).json({
        mensaje: 'Categoría actualizada exitosamente',
        categoria: categoriaActualizada
      });
    } catch (error) {
      console.error('Error al actualizar categoría:', error);
      
      if (error.message === 'Categoría no encontrada') {
        return res.status(404).json({ 
          error: 'Categoría no encontrada' 
        });
      }

      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ 
          error: 'Este nombre de categoría ya existe' 
        });
      }
      
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ 
          error: 'Errores de validación', 
          detalles: error.errors.map(e => e.message) 
        });
      }

      res.status(500).json({ 
        error: 'Error al actualizar la categoría',
        mensaje: error.message 
      });
    }
  }

  async eliminar(req, res) {
    try {
      const { id } = req.params;
      const resultado = await CategoriaProductoService.eliminarCategoria(id);
      
      res.status(200).json(resultado);
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      
      if (error.message === 'Categoría no encontrada') {
        return res.status(404).json({ 
          error: 'Categoría no encontrada' 
        });
      }

      if (error.message === 'No se puede desactivar una categoría con productos activos') {
        return res.status(400).json({ 
          error: error.message 
        });
      }

      res.status(500).json({ 
        error: 'Error al eliminar la categoría',
        mensaje: error.message 
      });
    }
  }

  async eliminarPermanente(req, res) {
    try {
      const { id } = req.params;
      const resultado = await CategoriaProductoService.eliminarCategoriaPermanente(id);
      
      res.status(200).json(resultado);
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      
      if (error.message === 'Categoría no encontrada') {
        return res.status(404).json({ 
          error: 'Categoría no encontrada' 
        });
      }

      if (error.message === 'No se puede eliminar una categoría con productos asociados') {
        return res.status(400).json({ 
          error: error.message 
        });
      }

      res.status(500).json({ 
        error: 'Error al eliminar la categoría permanentemente',
        mensaje: error.message 
      });
    }
  }

  async reactivar(req, res) {
    try {
      const { id } = req.params;
      const categoriaReactivada = await CategoriaProductoService.reactivarCategoria(id);
      
      res.status(200).json({
        mensaje: 'Categoría reactivada exitosamente',
        categoria: categoriaReactivada
      });
    } catch (error) {
      console.error('Error al reactivar categoría:', error);
      
      if (error.message === 'Categoría no encontrada') {
        return res.status(404).json({ 
          error: 'Categoría no encontrada' 
        });
      }

      res.status(500).json({ 
        error: 'Error al reactivar la categoría',
        mensaje: error.message 
      });
    }
  }
}

module.exports = new CategoriaProductoController();
