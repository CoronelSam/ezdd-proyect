const ProductoService = require('../services/ProductoService');
const { validationResult } = require('express-validator');

class ProductoController {

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

      const nuevoProducto = await ProductoService.crearProducto(req.body);
      
      res.status(201).json({
        mensaje: 'Producto creado exitosamente',
        producto: nuevoProducto
      });
    } catch (error) {
      console.error('Error al crear producto:', error);
      
      if (error.message === 'La categoría especificada no existe' || 
          error.message === 'La categoría especificada está inactiva') {
        return res.status(400).json({ 
          error: error.message 
        });
      }
      
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ 
          error: 'Errores de validación', 
          detalles: error.errors.map(e => e.message) 
        });
      }

      res.status(500).json({ 
        error: 'Error al crear el producto',
        mensaje: error.message 
      });
    }
  }

  async obtenerTodos(req, res) {
    try {
      const filtros = {
        activo: req.query.activo !== undefined ? req.query.activo === 'true' : undefined,
        id_categoria: req.query.id_categoria
      };

      const productos = await ProductoService.obtenerProductos(filtros);
      
      res.status(200).json({
        total: productos.length,
        productos
      });
    } catch (error) {
      console.error('Error al obtener productos:', error);
      res.status(500).json({ 
        error: 'Error al obtener los productos',
        mensaje: error.message 
      });
    }
  }

  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      const producto = await ProductoService.obtenerProductoPorId(id);
      
      res.status(200).json({
        producto
      });
    } catch (error) {
      console.error('Error al obtener producto:', error);
      
      if (error.message === 'Producto no encontrado') {
        return res.status(404).json({ 
          error: 'Producto no encontrado' 
        });
      }

      res.status(500).json({ 
        error: 'Error al obtener el producto',
        mensaje: error.message 
      });
    }
  }

  async obtenerPorCategoria(req, res) {
    try {
      const { idCategoria } = req.params;
      const productos = await ProductoService.obtenerProductosPorCategoria(idCategoria);
      
      res.status(200).json({
        total: productos.length,
        productos
      });
    } catch (error) {
      console.error('Error al obtener productos:', error);
      
      if (error.message === 'La categoría especificada no existe') {
        return res.status(404).json({ 
          error: error.message 
        });
      }

      res.status(500).json({ 
        error: 'Error al obtener los productos',
        mensaje: error.message 
      });
    }
  }

  async buscarPorNombre(req, res) {
    try {
      const { termino } = req.query;
      
      if (!termino) {
        return res.status(400).json({ 
          error: 'El término de búsqueda es requerido' 
        });
      }

      const productos = await ProductoService.buscarProductosPorNombre(termino);
      
      res.status(200).json({
        total: productos.length,
        productos
      });
    } catch (error) {
      console.error('Error al buscar productos:', error);
      res.status(500).json({ 
        error: 'Error al buscar los productos',
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
      const productoActualizado = await ProductoService.actualizarProducto(id, req.body);
      
      res.status(200).json({
        mensaje: 'Producto actualizado exitosamente',
        producto: productoActualizado
      });
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      
      if (error.message === 'Producto no encontrado') {
        return res.status(404).json({ 
          error: 'Producto no encontrado' 
        });
      }

      if (error.message === 'La categoría especificada no existe' || 
          error.message === 'La categoría especificada está inactiva') {
        return res.status(400).json({ 
          error: error.message 
        });
      }
      
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ 
          error: 'Errores de validación', 
          detalles: error.errors.map(e => e.message) 
        });
      }

      res.status(500).json({ 
        error: 'Error al actualizar el producto',
        mensaje: error.message 
      });
    }
  }

  async eliminar(req, res) {
    try {
      const { id } = req.params;
      const resultado = await ProductoService.eliminarProducto(id);
      
      res.status(200).json(resultado);
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      
      if (error.message === 'Producto no encontrado') {
        return res.status(404).json({ 
          error: 'Producto no encontrado' 
        });
      }

      res.status(500).json({ 
        error: 'Error al eliminar el producto',
        mensaje: error.message 
      });
    }
  }

  async eliminarPermanente(req, res) {
    try {
      const { id } = req.params;
      const resultado = await ProductoService.eliminarProductoPermanente(id);
      
      res.status(200).json(resultado);
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      
      if (error.message === 'Producto no encontrado') {
        return res.status(404).json({ 
          error: 'Producto no encontrado' 
        });
      }

      res.status(500).json({ 
        error: 'Error al eliminar el producto permanentemente',
        mensaje: error.message 
      });
    }
  }

  async reactivar(req, res) {
    try {
      const { id } = req.params;
      const productoReactivado = await ProductoService.reactivarProducto(id);
      
      res.status(200).json({
        mensaje: 'Producto reactivado exitosamente',
        producto: productoReactivado
      });
    } catch (error) {
      console.error('Error al reactivar producto:', error);
      
      if (error.message === 'Producto no encontrado') {
        return res.status(404).json({ 
          error: 'Producto no encontrado' 
        });
      }

      if (error.message === 'No se puede reactivar un producto con categoría inactiva') {
        return res.status(400).json({ 
          error: error.message 
        });
      }

      res.status(500).json({ 
        error: 'Error al reactivar el producto',
        mensaje: error.message 
      });
    }
  }

  async obtenerEstadisticas(req, res) {
    try {
      const estadisticas = await ProductoService.obtenerEstadisticas();
      
      res.status(200).json({
        estadisticas
      });
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({ 
        error: 'Error al obtener las estadísticas',
        mensaje: error.message 
      });
    }
  }
}

module.exports = new ProductoController();
