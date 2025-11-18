const IngredienteService = require('../services/IngredienteService');
const { validationResult } = require('express-validator');

class IngredienteController {
  async crear(req, res) {
    try {
      const errores = validationResult(req);
      if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() });
      }

      const ingrediente = await IngredienteService.crearIngrediente(req.body);
      res.status(201).json({
        mensaje: 'Ingrediente creado exitosamente',
        ingrediente
      });
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
          mensaje: 'Ya existe un ingrediente con ese nombre'
        });
      }
      res.status(500).json({
        mensaje: 'Error al crear el ingrediente',
        error: error.message
      });
    }
  }

  async obtenerTodos(req, res) {
    try {
      const filtros = {
        activo: req.query.activo,
        unidad_medida: req.query.unidad_medida,
        busqueda: req.query.busqueda
      };

      const ingredientes = await IngredienteService.obtenerIngredientes(filtros);
      res.status(200).json(ingredientes);
    } catch (error) {
      res.status(500).json({
        mensaje: 'Error al obtener los ingredientes',
        error: error.message
      });
    }
  }

  async obtenerPorId(req, res) {
    try {
      const ingrediente = await IngredienteService.obtenerIngredientePorId(req.params.id);
      res.status(200).json(ingrediente);
    } catch (error) {
      if (error.message === 'Ingrediente no encontrado') {
        return res.status(404).json({ mensaje: error.message });
      }
      res.status(500).json({
        mensaje: 'Error al obtener el ingrediente',
        error: error.message
      });
    }
  }

  async obtenerPorNombre(req, res) {
    try {
      const ingrediente = await IngredienteService.obtenerIngredientePorNombre(req.params.nombre);
      
      if (!ingrediente) {
        return res.status(404).json({ mensaje: 'Ingrediente no encontrado' });
      }

      res.status(200).json(ingrediente);
    } catch (error) {
      res.status(500).json({
        mensaje: 'Error al obtener el ingrediente',
        error: error.message
      });
    }
  }

  async actualizar(req, res) {
    try {
      const errores = validationResult(req);
      if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() });
      }

      const ingrediente = await IngredienteService.actualizarIngrediente(req.params.id, req.body);
      res.status(200).json({
        mensaje: 'Ingrediente actualizado exitosamente',
        ingrediente
      });
    } catch (error) {
      if (error.message === 'Ingrediente no encontrado') {
        return res.status(404).json({ mensaje: error.message });
      }
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
          mensaje: 'Ya existe un ingrediente con ese nombre'
        });
      }
      res.status(500).json({
        mensaje: 'Error al actualizar el ingrediente',
        error: error.message
      });
    }
  }

  async eliminar(req, res) {
    try {
      const resultado = await IngredienteService.eliminarIngrediente(req.params.id);
      res.status(200).json(resultado);
    } catch (error) {
      if (error.message === 'Ingrediente no encontrado') {
        return res.status(404).json({ mensaje: error.message });
      }
      res.status(500).json({
        mensaje: 'Error al eliminar el ingrediente',
        error: error.message
      });
    }
  }

  async eliminarPermanente(req, res) {
    try {
      const resultado = await IngredienteService.eliminarIngredientePermanente(req.params.id);
      res.status(200).json(resultado);
    } catch (error) {
      if (error.message === 'Ingrediente no encontrado') {
        return res.status(404).json({ mensaje: error.message });
      }
      res.status(500).json({
        mensaje: 'Error al eliminar el ingrediente permanentemente',
        error: error.message
      });
    }
  }

  async reactivar(req, res) {
    try {
      const ingrediente = await IngredienteService.reactivarIngrediente(req.params.id);
      res.status(200).json({
        mensaje: 'Ingrediente reactivado exitosamente',
        ingrediente
      });
    } catch (error) {
      if (error.message === 'Ingrediente no encontrado') {
        return res.status(404).json({ mensaje: error.message });
      }
      res.status(500).json({
        mensaje: 'Error al reactivar el ingrediente',
        error: error.message
      });
    }
  }

  async obtenerBajoStock(req, res) {
    try {
      const ingredientes = await IngredienteService.obtenerIngredientesBajoStock();
      res.status(200).json(ingredientes);
    } catch (error) {
      res.status(500).json({
        mensaje: 'Error al obtener los ingredientes con stock bajo',
        error: error.message
      });
    }
  }

  async obtenerEstadisticas(req, res) {
    try {
      const estadisticas = await IngredienteService.obtenerEstadisticas();
      res.status(200).json(estadisticas);
    } catch (error) {
      res.status(500).json({
        mensaje: 'Error al obtener las estadísticas',
        error: error.message
      });
    }
  }
}

module.exports = new IngredienteController();
