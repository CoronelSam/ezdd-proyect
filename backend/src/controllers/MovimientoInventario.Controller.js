const MovimientoInventarioService = require('../services/MovimientoInventarioService');
const { validationResult } = require('express-validator');

class MovimientoInventarioController {
  async crear(req, res) {
    try {
      const errores = validationResult(req);
      if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() });
      }

      const movimiento = await MovimientoInventarioService.crearMovimiento(req.body);
      res.status(201).json({
        mensaje: 'Movimiento de inventario creado exitosamente',
        movimiento
      });
    } catch (error) {
      if (error.message.includes('no encontrado')) {
        return res.status(404).json({ mensaje: error.message });
      }
      if (error.message.includes('No hay suficiente') || error.message.includes('no válido')) {
        return res.status(400).json({ mensaje: error.message });
      }
      res.status(500).json({
        mensaje: 'Error al crear el movimiento de inventario',
        error: error.message
      });
    }
  }

  async obtenerTodos(req, res) {
    try {
      const filtros = {
        id_ingrediente: req.query.id_ingrediente,
        tipo_movimiento: req.query.tipo_movimiento,
        id_pedido: req.query.id_pedido,
        id_empleado: req.query.id_empleado,
        fecha_desde: req.query.fecha_desde,
        fecha_hasta: req.query.fecha_hasta
      };

      const movimientos = await MovimientoInventarioService.obtenerMovimientos(filtros);
      res.status(200).json(movimientos);
    } catch (error) {
      res.status(500).json({
        mensaje: 'Error al obtener los movimientos',
        error: error.message
      });
    }
  }

  async obtenerPorId(req, res) {
    try {
      const movimiento = await MovimientoInventarioService.obtenerMovimientoPorId(req.params.id);
      res.status(200).json(movimiento);
    } catch (error) {
      if (error.message === 'Movimiento no encontrado') {
        return res.status(404).json({ mensaje: error.message });
      }
      res.status(500).json({
        mensaje: 'Error al obtener el movimiento',
        error: error.message
      });
    }
  }

  async obtenerPorIngrediente(req, res) {
    try {
      const movimientos = await MovimientoInventarioService.obtenerMovimientosPorIngrediente(req.params.idIngrediente);
      res.status(200).json(movimientos);
    } catch (error) {
      if (error.message === 'Ingrediente no encontrado') {
        return res.status(404).json({ mensaje: error.message });
      }
      res.status(500).json({
        mensaje: 'Error al obtener los movimientos del ingrediente',
        error: error.message
      });
    }
  }

  async obtenerPorPedido(req, res) {
    try {
      const movimientos = await MovimientoInventarioService.obtenerMovimientosPorPedido(req.params.idPedido);
      res.status(200).json(movimientos);
    } catch (error) {
      if (error.message === 'Pedido no encontrado') {
        return res.status(404).json({ mensaje: error.message });
      }
      res.status(500).json({
        mensaje: 'Error al obtener los movimientos del pedido',
        error: error.message
      });
    }
  }

  async obtenerPorEmpleado(req, res) {
    try {
      const movimientos = await MovimientoInventarioService.obtenerMovimientosPorEmpleado(req.params.idEmpleado);
      res.status(200).json(movimientos);
    } catch (error) {
      if (error.message === 'Empleado no encontrado') {
        return res.status(404).json({ mensaje: error.message });
      }
      res.status(500).json({
        mensaje: 'Error al obtener los movimientos del empleado',
        error: error.message
      });
    }
  }

  async eliminar(req, res) {
    try {
      const resultado = await MovimientoInventarioService.eliminarMovimiento(req.params.id);
      res.status(200).json(resultado);
    } catch (error) {
      if (error.message.includes('no encontrado')) {
        return res.status(404).json({ mensaje: error.message });
      }
      if (error.message.includes('No se puede eliminar')) {
        return res.status(400).json({ mensaje: error.message });
      }
      res.status(500).json({
        mensaje: 'Error al eliminar el movimiento',
        error: error.message
      });
    }
  }

  async obtenerEstadisticas(req, res) {
    try {
      const filtros = {
        fecha_desde: req.query.fecha_desde,
        fecha_hasta: req.query.fecha_hasta
      };

      const estadisticas = await MovimientoInventarioService.obtenerEstadisticas(filtros);
      res.status(200).json(estadisticas);
    } catch (error) {
      res.status(500).json({
        mensaje: 'Error al obtener las estadísticas',
        error: error.message
      });
    }
  }

  async registrarSalidaPorPedido(req, res) {
    try {
      const errores = validationResult(req);
      if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() });
      }

      const resultado = await MovimientoInventarioService.registrarSalidaPorPedido(
        req.body.id_pedido,
        req.body.id_empleado
      );
      
      res.status(201).json(resultado);
    } catch (error) {
      if (error.message.includes('no encontrado')) {
        return res.status(404).json({ mensaje: error.message });
      }
      if (error.message.includes('No hay suficiente')) {
        return res.status(400).json({ mensaje: error.message });
      }
      res.status(500).json({
        mensaje: 'Error al registrar la salida por pedido',
        error: error.message
      });
    }
  }
}

module.exports = new MovimientoInventarioController();
