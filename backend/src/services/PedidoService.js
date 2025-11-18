const Pedido = require('../models/PedidoModel');
const DetallePedido = require('../models/DetallePedidoModel');
const Cliente = require('../models/ClienteModel');
const Empleado = require('../models/EmpleadoModel');
const Producto = require('../models/ProductoModel');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

class PedidoService {
  async crearPedido(data) {
    const transaction = await sequelize.transaction();
    
    try {
      if (data.id_cliente) {
        const cliente = await Cliente.findByPk(data.id_cliente);
        if (!cliente) {
          throw new Error('Cliente no encontrado');
        }
        if (!cliente.activo) {
          throw new Error('El cliente no está activo');
        }
      }

      // Validar empleado si se proporciona
      if (data.id_empleado) {
        const empleado = await Empleado.findByPk(data.id_empleado);
        if (!empleado) {
          throw new Error('Empleado no encontrado');
        }
        if (!empleado.activo) {
          throw new Error('El empleado no está activo');
        }
      }

      // Validar que haya detalles
      if (!data.detalles || data.detalles.length === 0) {
        throw new Error('El pedido debe tener al menos un detalle');
      }

      // Calcular total y validar productos
      let total = 0;
      const detallesValidados = [];

      for (const detalle of data.detalles) {
        const producto = await Producto.findByPk(detalle.id_producto);
        
        if (!producto) {
          throw new Error(`Producto con ID ${detalle.id_producto} no encontrado`);
        }
        if (!producto.activo) {
          throw new Error(`El producto ${producto.nombre} no está activo`);
        }

        // Usar el precio del detalle o el del producto
        const precioUnitario = detalle.precio_unitario || parseFloat(producto.precio || 0);
        const subtotal = precioUnitario * detalle.cantidad;
        
        detallesValidados.push({
          id_producto: detalle.id_producto,
          cantidad: detalle.cantidad,
          precio_unitario: precioUnitario,
          subtotal: subtotal,
          instrucciones_especiales: detalle.instrucciones_especiales || null
        });

        total += subtotal;
      }

      const pedido = await Pedido.create({
        id_cliente: data.id_cliente || null,
        id_empleado: data.id_empleado || null,
        fecha_pedido: data.fecha_pedido || new Date(),
        estado: data.estado || 'pendiente',
        total: total,
        notas: data.notas || null
      }, { transaction });

      const detalles = await DetallePedido.bulkCreate(
        detallesValidados.map(d => ({
          ...d,
          id_pedido: pedido.id_pedido
        })),
        { transaction }
      );

      await transaction.commit();

      return await this.obtenerPedidoPorId(pedido.id_pedido);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async obtenerPedidos(filtros = {}) {
    try {
      const where = {};

      if (filtros.estado) {
        where.estado = filtros.estado;
      }

      if (filtros.id_cliente) {
        where.id_cliente = filtros.id_cliente;
      }

      if (filtros.id_empleado) {
        where.id_empleado = filtros.id_empleado;
      }

      if (filtros.fecha_desde && filtros.fecha_hasta) {
        where.fecha_pedido = {
          [Op.between]: [filtros.fecha_desde, filtros.fecha_hasta]
        };
      } else if (filtros.fecha_desde) {
        where.fecha_pedido = {
          [Op.gte]: filtros.fecha_desde
        };
      } else if (filtros.fecha_hasta) {
        where.fecha_pedido = {
          [Op.lte]: filtros.fecha_hasta
        };
      }

      const pedidos = await Pedido.findAll({
        where,
        include: [
          {
            model: Cliente,
            as: 'cliente',
            attributes: ['id_cliente', 'nombre', 'email', 'telefono']
          },
          {
            model: Empleado,
            as: 'empleado',
            attributes: ['id_empleado', 'nombre', 'puesto']
          },
          {
            model: DetallePedido,
            as: 'detalles',
            include: [
              {
                model: Producto,
                as: 'producto',
                attributes: ['id_producto', 'nombre', 'descripcion']
              }
            ]
          }
        ],
        order: [['fecha_pedido', 'DESC']]
      });

      return pedidos;
    } catch (error) {
      throw error;
    }
  }

  async obtenerPedidoPorId(id) {
    try {
      const pedido = await Pedido.findByPk(id, {
        include: [
          {
            model: Cliente,
            as: 'cliente',
            attributes: ['id_cliente', 'nombre', 'email', 'telefono']
          },
          {
            model: Empleado,
            as: 'empleado',
            attributes: ['id_empleado', 'nombre', 'puesto']
          },
          {
            model: DetallePedido,
            as: 'detalles',
            include: [
              {
                model: Producto,
                as: 'producto',
                attributes: ['id_producto', 'nombre', 'descripcion', 'precio']
              }
            ]
          }
        ]
      });

      if (!pedido) {
        throw new Error('Pedido no encontrado');
      }

      return pedido;
    } catch (error) {
      throw error;
    }
  }

  async actualizarEstado(id, estado) {
    try {
      const pedido = await Pedido.findByPk(id);

      if (!pedido) {
        throw new Error('Pedido no encontrado');
      }

      const estadosValidos = ['pendiente', 'en_preparacion', 'listo', 'entregado', 'cancelado'];
      if (!estadosValidos.includes(estado)) {
        throw new Error('Estado no válido');
      }

      await pedido.update({ estado });

      return await this.obtenerPedidoPorId(id);
    } catch (error) {
      throw error;
    }
  }

  async actualizarPedido(id, data) {
    try {
      const pedido = await Pedido.findByPk(id);

      if (!pedido) {
        throw new Error('Pedido no encontrado');
      }

      if (data.id_cliente && data.id_cliente !== pedido.id_cliente) {
        const cliente = await Cliente.findByPk(data.id_cliente);
        if (!cliente || !cliente.activo) {
          throw new Error('Cliente no válido o inactivo');
        }
      }

      if (data.id_empleado && data.id_empleado !== pedido.id_empleado) {
        const empleado = await Empleado.findByPk(data.id_empleado);
        if (!empleado || !empleado.activo) {
          throw new Error('Empleado no válido o inactivo');
        }
      }

      await pedido.update(data);

      return await this.obtenerPedidoPorId(id);
    } catch (error) {
      throw error;
    }
  }

  async cancelarPedido(id) {
    try {
      const pedido = await Pedido.findByPk(id);

      if (!pedido) {
        throw new Error('Pedido no encontrado');
      }

      if (pedido.estado === 'entregado') {
        throw new Error('No se puede cancelar un pedido ya entregado');
      }

      if (pedido.estado === 'cancelado') {
        throw new Error('El pedido ya está cancelado');
      }

      await pedido.update({ estado: 'cancelado' });

      return await this.obtenerPedidoPorId(id);
    } catch (error) {
      throw error;
    }
  }

  async eliminarPedido(id) {
    try {
      const pedido = await Pedido.findByPk(id);

      if (!pedido) {
        throw new Error('Pedido no encontrado');
      }

      await pedido.destroy();
      return { mensaje: 'Pedido eliminado exitosamente' };
    } catch (error) {
      throw error;
    }
  }

  async obtenerEstadisticas(filtros = {}) {
    try {
      const where = {};

      if (filtros.fecha_desde && filtros.fecha_hasta) {
        where.fecha_pedido = {
          [Op.between]: [filtros.fecha_desde, filtros.fecha_hasta]
        };
      }

      const total = await Pedido.count({ where });
      
      const porEstado = await Pedido.findAll({
        where,
        attributes: [
          'estado',
          [sequelize.fn('COUNT', sequelize.col('id_pedido')), 'cantidad'],
          [sequelize.fn('SUM', sequelize.col('total')), 'monto_total']
        ],
        group: ['estado']
      });

      const ventasTotal = await Pedido.sum('total', {
        where: {
          ...where,
          estado: { [Op.ne]: 'cancelado' }
        }
      });

      return {
        total_pedidos: total,
        ventas_totales: ventasTotal || 0,
        por_estado: porEstado
      };
    } catch (error) {
      throw error;
    }
  }

  async obtenerPedidosPorCliente(idCliente) {
    try {
      const cliente = await Cliente.findByPk(idCliente);
      if (!cliente) {
        throw new Error('Cliente no encontrado');
      }

      return await this.obtenerPedidos({ id_cliente: idCliente });
    } catch (error) {
      throw error;
    }
  }

  async obtenerPedidosPorEmpleado(idEmpleado) {
    try {
      const empleado = await Empleado.findByPk(idEmpleado);
      if (!empleado) {
        throw new Error('Empleado no encontrado');
      }

      return await this.obtenerPedidos({ id_empleado: idEmpleado });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new PedidoService();
