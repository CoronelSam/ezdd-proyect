const InventarioService = require('../services/InventarioService');
const { validationResult } = require('express-validator');

class InventarioController {
  async crear(req, res) {
    try {
      const errores = validationResult(req);
      if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() });
      }

      const inventario = await InventarioService.crearInventario(req.body);
      res.status(201).json({
        mensaje: 'Inventario creado exitosamente',
        inventario
      });
    } catch (error) {
      if (error.message.includes('no encontrado') || error.message.includes('no está activo')) {
        return res.status(404).json({ mensaje: error.message });
      }
      if (error.message.includes('Ya existe')) {
        return res.status(400).json({ mensaje: error.message });
      }
      res.status(500).json({
        mensaje: 'Error al crear el inventario',
        error: error.message
      });
    }
  }

  async obtenerTodos(req, res) {
    try {
      const filtros = {
        bajo_stock: req.query.bajo_stock === 'true'
      };

      const inventarios = await InventarioService.obtenerInventarios(filtros);
      res.status(200).json(inventarios);
    } catch (error) {
      res.status(500).json({
        mensaje: 'Error al obtener los inventarios',
        error: error.message
      });
    }
  }

  async obtenerPorId(req, res) {
    try {
      const inventario = await InventarioService.obtenerInventarioPorId(req.params.id);
      res.status(200).json(inventario);
    } catch (error) {
      if (error.message === 'Inventario no encontrado') {
        return res.status(404).json({ mensaje: error.message });
      }
      res.status(500).json({
        mensaje: 'Error al obtener el inventario',
        error: error.message
      });
    }
  }

  async obtenerPorIngrediente(req, res) {
    try {
      const inventario = await InventarioService.obtenerInventarioPorIngrediente(req.params.idIngrediente);
      res.status(200).json(inventario);
    } catch (error) {
      if (error.message.includes('no encontrado')) {
        return res.status(404).json({ mensaje: error.message });
      }
      res.status(500).json({
        mensaje: 'Error al obtener el inventario',
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

      const inventario = await InventarioService.actualizarInventario(req.params.id, req.body.cantidad_actual);
      res.status(200).json({
        mensaje: 'Inventario actualizado exitosamente',
        inventario
      });
    } catch (error) {
      if (error.message === 'Inventario no encontrado') {
        return res.status(404).json({ mensaje: error.message });
      }
      res.status(500).json({
        mensaje: 'Error al actualizar el inventario',
        error: error.message
      });
    }
  }

  async agregarCantidad(req, res) {
    try {
      const errores = validationResult(req);
      if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() });
      }

      const inventario = await InventarioService.agregarCantidad(req.params.id, req.body.cantidad);
      res.status(200).json({
        mensaje: 'Cantidad agregada exitosamente',
        inventario
      });
    } catch (error) {
      if (error.message === 'Inventario no encontrado') {
        return res.status(404).json({ mensaje: error.message });
      }
      res.status(500).json({
        mensaje: 'Error al agregar cantidad',
        error: error.message
      });
    }
  }

  async reducirCantidad(req, res) {
    try {
      const errores = validationResult(req);
      if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() });
      }

      const inventario = await InventarioService.reducirCantidad(req.params.id, req.body.cantidad);
      res.status(200).json({
        mensaje: 'Cantidad reducida exitosamente',
        inventario
      });
    } catch (error) {
      if (error.message === 'Inventario no encontrado') {
        return res.status(404).json({ mensaje: error.message });
      }
      if (error.message.includes('No hay suficiente')) {
        return res.status(400).json({ mensaje: error.message });
      }
      res.status(500).json({
        mensaje: 'Error al reducir cantidad',
        error: error.message
      });
    }
  }

  async eliminar(req, res) {
    try {
      const resultado = await InventarioService.eliminarInventario(req.params.id);
      res.status(200).json(resultado);
    } catch (error) {
      if (error.message === 'Inventario no encontrado') {
        return res.status(404).json({ mensaje: error.message });
      }
      res.status(500).json({
        mensaje: 'Error al eliminar el inventario',
        error: error.message
      });
    }
  }

  async obtenerBajoStock(req, res) {
    try {
      const inventarios = await InventarioService.obtenerInventariosBajoStock();
      res.status(200).json(inventarios);
    } catch (error) {
      res.status(500).json({
        mensaje: 'Error al obtener los inventarios con stock bajo',
        error: error.message
      });
    }
  }

  async obtenerEstadisticas(req, res) {
    try {
      const estadisticas = await InventarioService.obtenerEstadisticas();
      res.status(200).json(estadisticas);
    } catch (error) {
      res.status(500).json({
        mensaje: 'Error al obtener las estadísticas',
        error: error.message
      });
    }
  }

  async inicializar(req, res) {
    try {
      const resultado = await InventarioService.inicializarInventarios();
      res.status(200).json(resultado);
    } catch (error) {
      res.status(500).json({
        mensaje: 'Error al inicializar inventarios',
        error: error.message
      });
    }
  }
}

module.exports = new InventarioController();
