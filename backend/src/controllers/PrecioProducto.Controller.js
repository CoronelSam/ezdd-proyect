const PrecioProductoService = require('../services/PrecioProductoService');
const { validationResult } = require('express-validator');

class PrecioProductoController {

  async crear(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Errores de validación', 
          detalles: errors.array() 
        });
      }

      const nuevoPrecio = await PrecioProductoService.crearPrecioProducto(req.body);
      
      res.status(201).json({
        mensaje: 'Precio creado exitosamente',
        precio: nuevoPrecio
      });
    } catch (error) {
      console.error('Error al crear precio:', error);
      
      if (error.message === 'El producto especificado no existe' || 
          error.message === 'El producto especificado está inactivo') {
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
        error: 'Error al crear el precio',
        mensaje: error.message 
      });
    }
  }

  async obtenerTodos(req, res) {
    try {
      const filtros = {
        activo: req.query.activo !== undefined ? req.query.activo === 'true' : undefined,
        id_producto: req.query.id_producto
      };

      const precios = await PrecioProductoService.obtenerPrecios(filtros);
      
      res.status(200).json({
        total: precios.length,
        precios
      });
    } catch (error) {
      console.error('Error al obtener precios:', error);
      res.status(500).json({ 
        error: 'Error al obtener los precios',
        mensaje: error.message 
      });
    }
  }

  async obtenerPorProducto(req, res) {
    try {
      const { idProducto } = req.params;
      const soloActivos = req.query.solo_activos !== 'false';
      
      const precios = await PrecioProductoService.obtenerPreciosPorProducto(idProducto, soloActivos);
      
      res.status(200).json({
        total: precios.length,
        precios
      });
    } catch (error) {
      console.error('Error al obtener precios:', error);
      
      if (error.message === 'El producto especificado no existe') {
        return res.status(404).json({ 
          error: error.message 
        });
      }

      res.status(500).json({ 
        error: 'Error al obtener los precios',
        mensaje: error.message 
      });
    }
  }

  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      const precio = await PrecioProductoService.obtenerPrecioPorId(id);
      
      res.status(200).json({
        precio
      });
    } catch (error) {
      console.error('Error al obtener precio:', error);
      
      if (error.message === 'Precio no encontrado') {
        return res.status(404).json({ 
          error: 'Precio no encontrado' 
        });
      }

      res.status(500).json({ 
        error: 'Error al obtener el precio',
        mensaje: error.message 
      });
    }
  }

  async obtenerPorPresentacion(req, res) {
    try {
      const { idProducto, nombrePresentacion } = req.params;
      const precio = await PrecioProductoService.obtenerPrecioPorPresentacion(idProducto, nombrePresentacion);
      
      res.status(200).json({
        precio
      });
    } catch (error) {
      console.error('Error al obtener precio:', error);
      
      if (error.message === 'Precio para esta presentación no encontrado') {
        return res.status(404).json({ 
          error: error.message 
        });
      }

      res.status(500).json({ 
        error: 'Error al obtener el precio',
        mensaje: error.message 
      });
    }
  }

  async actualizar(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Errores de validación', 
          detalles: errors.array() 
        });
      }

      const { id } = req.params;
      const precioActualizado = await PrecioProductoService.actualizarPrecio(id, req.body);
      
      res.status(200).json({
        mensaje: 'Precio actualizado exitosamente',
        precio: precioActualizado
      });
    } catch (error) {
      console.error('Error al actualizar precio:', error);
      
      if (error.message === 'Precio no encontrado') {
        return res.status(404).json({ 
          error: 'Precio no encontrado' 
        });
      }
      
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ 
          error: 'Errores de validación', 
          detalles: error.errors.map(e => e.message) 
        });
      }

      res.status(500).json({ 
        error: 'Error al actualizar el precio',
        mensaje: error.message 
      });
    }
  }

  async eliminar(req, res) {
    try {
      const { id } = req.params;
      const resultado = await PrecioProductoService.eliminarPrecio(id);
      
      res.status(200).json(resultado);
    } catch (error) {
      console.error('Error al eliminar precio:', error);
      
      if (error.message === 'Precio no encontrado') {
        return res.status(404).json({ 
          error: 'Precio no encontrado' 
        });
      }

      res.status(500).json({ 
        error: 'Error al eliminar el precio',
        mensaje: error.message 
      });
    }
  }

  async eliminarPermanente(req, res) {
    try {
      const { id } = req.params;
      const resultado = await PrecioProductoService.eliminarPrecioPermanente(id);
      
      res.status(200).json(resultado);
    } catch (error) {
      console.error('Error al eliminar precio:', error);
      
      if (error.message === 'Precio no encontrado') {
        return res.status(404).json({ 
          error: 'Precio no encontrado' 
        });
      }

      res.status(500).json({ 
        error: 'Error al eliminar el precio permanentemente',
        mensaje: error.message 
      });
    }
  }

  async reactivar(req, res) {
    try {
      const { id } = req.params;
      const precioReactivado = await PrecioProductoService.reactivarPrecio(id);
      
      res.status(200).json({
        mensaje: 'Precio reactivado exitosamente',
        precio: precioReactivado
      });
    } catch (error) {
      console.error('Error al reactivar precio:', error);
      
      if (error.message === 'Precio no encontrado') {
        return res.status(404).json({ 
          error: 'Precio no encontrado' 
        });
      }

      if (error.message === 'No se puede reactivar un precio de un producto inactivo') {
        return res.status(400).json({ 
          error: error.message 
        });
      }

      res.status(500).json({ 
        error: 'Error al reactivar el precio',
        mensaje: error.message 
      });
    }
  }

  async obtenerEstadisticas(req, res) {
    try {
      const estadisticas = await PrecioProductoService.obtenerEstadisticas();
      
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

  async duplicarPrecios(req, res) {
    try {
      const { idProductoOrigen, idProductoDestino } = req.body;
      
      if (!idProductoOrigen || !idProductoDestino) {
        return res.status(400).json({ 
          error: 'Se requieren los IDs de producto origen y destino' 
        });
      }

      const preciosNuevos = await PrecioProductoService.duplicarPreciosProducto(
        idProductoOrigen, 
        idProductoDestino
      );
      
      res.status(201).json({
        mensaje: 'Precios duplicados exitosamente',
        total: preciosNuevos.length,
        precios: preciosNuevos
      });
    } catch (error) {
      console.error('Error al duplicar precios:', error);
      
      if (error.message === 'Uno o ambos productos no existen') {
        return res.status(404).json({ 
          error: error.message 
        });
      }

      res.status(500).json({ 
        error: 'Error al duplicar los precios',
        mensaje: error.message 
      });
    }
  }
}

module.exports = new PrecioProductoController();
