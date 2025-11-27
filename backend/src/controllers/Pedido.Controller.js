const PedidoService = require('../services/PedidoService');
const { validationResult } = require('express-validator');

class PedidoController {
  async crear(req, res) {
    try {
      const errores = validationResult(req);
      if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() });
      }

      const pedido = await PedidoService.crearPedido(req.body);
      
      // Emitir evento de nuevo pedido a través de Socket.IO
      if (req.io) {
        // Notificar a admin
        req.io.to('admin').emit('pedido:nuevo', pedido);
        
        // Notificar al cliente si existe
        if (pedido.id_cliente) {
          req.io.to(`cliente:${pedido.id_cliente}`).emit('pedido:nuevo', pedido);
        }
        
        // Emitir a la sala del pedido
        req.io.to(`pedido:${pedido.id_pedido}`).emit('pedido:actualizado', pedido);
      }
      
      res.status(201).json({
        mensaje: 'Pedido creado exitosamente',
        pedido
      });
    } catch (error) {
      if (error.message.includes('no encontrado') || error.message.includes('no está activo')) {
        return res.status(404).json({ mensaje: error.message });
      }
      if (error.message.includes('debe tener')) {
        return res.status(400).json({ mensaje: error.message });
      }
      res.status(500).json({
        mensaje: 'Error al crear el pedido',
        error: error.message
      });
    }
  }

  async obtenerTodos(req, res) {
    try {
      const filtros = {
        estado: req.query.estado,
        id_cliente: req.query.id_cliente,
        id_empleado: req.query.id_empleado,
        fecha_desde: req.query.fecha_desde,
        fecha_hasta: req.query.fecha_hasta
      };

      const pedidos = await PedidoService.obtenerPedidos(filtros);
      res.status(200).json(pedidos);
    } catch (error) {
      res.status(500).json({
        mensaje: 'Error al obtener los pedidos',
        error: error.message
      });
    }
  }

  async obtenerPorId(req, res) {
    try {
      const pedido = await PedidoService.obtenerPedidoPorId(req.params.id);
      res.status(200).json(pedido);
    } catch (error) {
      if (error.message === 'Pedido no encontrado') {
        return res.status(404).json({ mensaje: error.message });
      }
      res.status(500).json({
        mensaje: 'Error al obtener el pedido',
        error: error.message
      });
    }
  }

  async obtenerPorCliente(req, res) {
    try {
      const pedidos = await PedidoService.obtenerPedidosPorCliente(req.params.idCliente);
      res.status(200).json(pedidos);
    } catch (error) {
      if (error.message === 'Cliente no encontrado') {
        return res.status(404).json({ mensaje: error.message });
      }
      res.status(500).json({
        mensaje: 'Error al obtener los pedidos del cliente',
        error: error.message
      });
    }
  }

  async obtenerPorEmpleado(req, res) {
    try {
      const pedidos = await PedidoService.obtenerPedidosPorEmpleado(req.params.idEmpleado);
      res.status(200).json(pedidos);
    } catch (error) {
      if (error.message === 'Empleado no encontrado') {
        return res.status(404).json({ mensaje: error.message });
      }
      res.status(500).json({
        mensaje: 'Error al obtener los pedidos del empleado',
        error: error.message
      });
    }
  }

  async actualizarEstado(req, res) {
    try {
      const errores = validationResult(req);
      if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() });
      }

      const pedido = await PedidoService.actualizarEstado(req.params.id, req.body.estado);
      
      // Emitir evento de cambio de estado (con manejo de errores)
      try {
        if (req.io) {
          const evento = {
            id_pedido: pedido.id_pedido,
            estado: pedido.estado,
            pedido: pedido
          };
          
          // Notificar a admin
          req.io.to('admin').emit('pedido:estado', evento);
          
          // Notificar al cliente si existe
          if (pedido.id_cliente) {
            req.io.to(`cliente:${pedido.id_cliente}`).emit('pedido:estado', evento);
          }
          
          // Emitir a la sala del pedido
          req.io.to(`pedido:${pedido.id_pedido}`).emit('pedido:actualizado', pedido);
        }
      } catch (socketError) {
        console.error('Error al emitir evento Socket.IO:', socketError);
        // No fallar la petición si Socket.IO falla
      }
      
      res.status(200).json({
        mensaje: 'Estado del pedido actualizado exitosamente',
        pedido
      });
    } catch (error) {
      console.error('Error en actualizarEstado:', error);
      if (error.message === 'Pedido no encontrado') {
        return res.status(404).json({ mensaje: error.message });
      }
      if (error.message.includes('no válido')) {
        return res.status(400).json({ mensaje: error.message });
      }
      res.status(500).json({
        mensaje: 'Error al actualizar el estado del pedido',
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  async actualizar(req, res) {
    try {
      const errores = validationResult(req);
      if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() });
      }

      const pedido = await PedidoService.actualizarPedido(req.params.id, req.body);
      res.status(200).json({
        mensaje: 'Pedido actualizado exitosamente',
        pedido
      });
    } catch (error) {
      if (error.message === 'Pedido no encontrado') {
        return res.status(404).json({ mensaje: error.message });
      }
      if (error.message.includes('no válido')) {
        return res.status(400).json({ mensaje: error.message });
      }
      res.status(500).json({
        mensaje: 'Error al actualizar el pedido',
        error: error.message
      });
    }
  }

  async cancelar(req, res) {
    try {
      const pedido = await PedidoService.cancelarPedido(req.params.id);
      
      // Emitir evento de cancelación
      if (req.io) {
        const evento = {
          id_pedido: pedido.id_pedido,
          estado: 'cancelado',
          pedido: pedido
        };
        
        req.io.to('admin').emit('pedido:cancelado', evento);
        
        if (pedido.id_cliente) {
          req.io.to(`cliente:${pedido.id_cliente}`).emit('pedido:cancelado', evento);
        }
        
        req.io.to(`pedido:${pedido.id_pedido}`).emit('pedido:actualizado', pedido);
      }
      
      res.status(200).json({
        mensaje: 'Pedido cancelado exitosamente',
        pedido
      });
    } catch (error) {
      if (error.message === 'Pedido no encontrado') {
        return res.status(404).json({ mensaje: error.message });
      }
      if (error.message.includes('No se puede cancelar') || error.message.includes('ya está cancelado')) {
        return res.status(400).json({ mensaje: error.message });
      }
      res.status(500).json({
        mensaje: 'Error al cancelar el pedido',
        error: error.message
      });
    }
  }

  async eliminar(req, res) {
    try {
      const resultado = await PedidoService.eliminarPedido(req.params.id);
      res.status(200).json(resultado);
    } catch (error) {
      if (error.message === 'Pedido no encontrado') {
        return res.status(404).json({ mensaje: error.message });
      }
      res.status(500).json({
        mensaje: 'Error al eliminar el pedido',
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

      const estadisticas = await PedidoService.obtenerEstadisticas(filtros);
      res.status(200).json(estadisticas);
    } catch (error) {
      res.status(500).json({
        mensaje: 'Error al obtener las estadísticas',
        error: error.message
      });
    }
  }
}

module.exports = new PedidoController();
