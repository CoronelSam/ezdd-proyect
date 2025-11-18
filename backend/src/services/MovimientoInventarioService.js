const MovimientoInventario = require('../models/MovimientoInventarioModel');
const Inventario = require('../models/InventarioModel');
const Ingrediente = require('../models/IngredienteModel');
const Pedido = require('../models/PedidoModel');
const Empleado = require('../models/EmpleadoModel');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

class MovimientoInventarioService {
  async crearMovimiento(data) {
    const transaction = await sequelize.transaction();

    try {
      const ingrediente = await Ingrediente.findByPk(data.id_ingrediente);
      if (!ingrediente) {
        throw new Error('Ingrediente no encontrado');
      }

      if (data.id_pedido) {
        const pedido = await Pedido.findByPk(data.id_pedido);
        if (!pedido) {
          throw new Error('Pedido no encontrado');
        }
      }

      if (data.id_empleado) {
        const empleado = await Empleado.findByPk(data.id_empleado);
        if (!empleado) {
          throw new Error('Empleado no encontrado');
        }
      }

      let inventario = await Inventario.findOne({
        where: { id_ingrediente: data.id_ingrediente }
      });

      if (!inventario) {
        inventario = await Inventario.create({
          id_ingrediente: data.id_ingrediente,
          cantidad_actual: 0,
          fecha_actualizacion: new Date()
        }, { transaction });
      }

      const cantidadActual = parseFloat(inventario.cantidad_actual);
      const cantidadMovimiento = parseFloat(data.cantidad);
      let nuevaCantidad;

      switch (data.tipo_movimiento) {
        case 'entrada':
        case 'ajuste':
          nuevaCantidad = cantidadActual + cantidadMovimiento;
          break;
        case 'salida':
        case 'merma':
          nuevaCantidad = cantidadActual - cantidadMovimiento;
          if (nuevaCantidad < 0) {
            throw new Error('No hay suficiente cantidad en inventario para este movimiento');
          }
          break;
        default:
          throw new Error('Tipo de movimiento no válido');
      }

      const movimiento = await MovimientoInventario.create({
        id_ingrediente: data.id_ingrediente,
        tipo_movimiento: data.tipo_movimiento,
        cantidad: cantidadMovimiento,
        fecha_movimiento: data.fecha_movimiento || new Date(),
        id_pedido: data.id_pedido || null,
        id_empleado: data.id_empleado || null,
        notas: data.notas || null
      }, { transaction });

      await inventario.update({
        cantidad_actual: nuevaCantidad,
        fecha_actualizacion: new Date()
      }, { transaction });

      await transaction.commit();

      return await this.obtenerMovimientoPorId(movimiento.id_movimiento);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async obtenerMovimientos(filtros = {}) {
    try {
      const where = {};

      if (filtros.id_ingrediente) {
        where.id_ingrediente = filtros.id_ingrediente;
      }

      if (filtros.tipo_movimiento) {
        where.tipo_movimiento = filtros.tipo_movimiento;
      }

      if (filtros.id_pedido) {
        where.id_pedido = filtros.id_pedido;
      }

      if (filtros.id_empleado) {
        where.id_empleado = filtros.id_empleado;
      }

      if (filtros.fecha_desde && filtros.fecha_hasta) {
        where.fecha_movimiento = {
          [Op.between]: [filtros.fecha_desde, filtros.fecha_hasta]
        };
      } else if (filtros.fecha_desde) {
        where.fecha_movimiento = {
          [Op.gte]: filtros.fecha_desde
        };
      } else if (filtros.fecha_hasta) {
        where.fecha_movimiento = {
          [Op.lte]: filtros.fecha_hasta
        };
      }

      const movimientos = await MovimientoInventario.findAll({
        where,
        include: [
          {
            model: Ingrediente,
            as: 'ingrediente',
            attributes: ['id_ingrediente', 'nombre', 'unidad_medida']
          },
          {
            model: Pedido,
            as: 'pedido',
            attributes: ['id_pedido', 'estado', 'total']
          },
          {
            model: Empleado,
            as: 'empleado',
            attributes: ['id_empleado', 'nombre', 'puesto']
          }
        ],
        order: [['fecha_movimiento', 'DESC']]
      });

      return movimientos;
    } catch (error) {
      throw error;
    }
  }

  async obtenerMovimientoPorId(id) {
    try {
      const movimiento = await MovimientoInventario.findByPk(id, {
        include: [
          {
            model: Ingrediente,
            as: 'ingrediente',
            attributes: ['id_ingrediente', 'nombre', 'unidad_medida', 'precio_compra']
          },
          {
            model: Pedido,
            as: 'pedido',
            attributes: ['id_pedido', 'estado', 'total', 'fecha_pedido']
          },
          {
            model: Empleado,
            as: 'empleado',
            attributes: ['id_empleado', 'nombre', 'puesto']
          }
        ]
      });

      if (!movimiento) {
        throw new Error('Movimiento no encontrado');
      }

      return movimiento;
    } catch (error) {
      throw error;
    }
  }

  async obtenerMovimientosPorIngrediente(idIngrediente) {
    try {
      const ingrediente = await Ingrediente.findByPk(idIngrediente);
      if (!ingrediente) {
        throw new Error('Ingrediente no encontrado');
      }

      return await this.obtenerMovimientos({ id_ingrediente: idIngrediente });
    } catch (error) {
      throw error;
    }
  }

  async obtenerMovimientosPorPedido(idPedido) {
    try {
      const pedido = await Pedido.findByPk(idPedido);
      if (!pedido) {
        throw new Error('Pedido no encontrado');
      }

      return await this.obtenerMovimientos({ id_pedido: idPedido });
    } catch (error) {
      throw error;
    }
  }

  async obtenerMovimientosPorEmpleado(idEmpleado) {
    try {
      const empleado = await Empleado.findByPk(idEmpleado);
      if (!empleado) {
        throw new Error('Empleado no encontrado');
      }

      return await this.obtenerMovimientos({ id_empleado: idEmpleado });
    } catch (error) {
      throw error;
    }
  }

  async eliminarMovimiento(id) {
    const transaction = await sequelize.transaction();

    try {
      const movimiento = await MovimientoInventario.findByPk(id);

      if (!movimiento) {
        throw new Error('Movimiento no encontrado');
      }

      const inventario = await Inventario.findOne({
        where: { id_ingrediente: movimiento.id_ingrediente }
      });

      if (!inventario) {
        throw new Error('Inventario no encontrado');
      }

      const cantidadActual = parseFloat(inventario.cantidad_actual);
      const cantidadMovimiento = parseFloat(movimiento.cantidad);
      let nuevaCantidad;

      switch (movimiento.tipo_movimiento) {
        case 'entrada':
        case 'ajuste':
          nuevaCantidad = cantidadActual - cantidadMovimiento;
          if (nuevaCantidad < 0) {
            throw new Error('No se puede eliminar este movimiento: resultaría en cantidad negativa');
          }
          break;
        case 'salida':
        case 'merma':
          nuevaCantidad = cantidadActual + cantidadMovimiento;
          break;
        default:
          throw new Error('Tipo de movimiento no válido');
      }

      await inventario.update({
        cantidad_actual: nuevaCantidad,
        fecha_actualizacion: new Date()
      }, { transaction });

      await movimiento.destroy({ transaction });

      await transaction.commit();

      return { mensaje: 'Movimiento eliminado y inventario actualizado' };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async obtenerEstadisticas(filtros = {}) {
    try {
      const where = {};

      if (filtros.fecha_desde && filtros.fecha_hasta) {
        where.fecha_movimiento = {
          [Op.between]: [filtros.fecha_desde, filtros.fecha_hasta]
        };
      }

      const total = await MovimientoInventario.count({ where });

      const porTipo = await MovimientoInventario.findAll({
        where,
        attributes: [
          'tipo_movimiento',
          [sequelize.fn('COUNT', sequelize.col('id_movimiento')), 'cantidad'],
          [sequelize.fn('SUM', sequelize.col('cantidad')), 'total_cantidad']
        ],
        group: ['tipo_movimiento']
      });

      const porIngrediente = await MovimientoInventario.findAll({
        where,
        attributes: [
          'id_ingrediente',
          [sequelize.fn('COUNT', sequelize.col('id_movimiento')), 'cantidad_movimientos']
        ],
        include: [
          {
            model: Ingrediente,
            as: 'ingrediente',
            attributes: ['nombre', 'unidad_medida']
          }
        ],
        group: ['id_ingrediente', 'ingrediente.id_ingrediente'],
        order: [[sequelize.fn('COUNT', sequelize.col('id_movimiento')), 'DESC']],
        limit: 10
      });

      return {
        total_movimientos: total,
        por_tipo: porTipo,
        top_ingredientes: porIngrediente
      };
    } catch (error) {
      throw error;
    }
  }

  async registrarSalidaPorPedido(idPedido, idEmpleado = null) {
    const transaction = await sequelize.transaction();

    try {
      const Pedido = require('../models/PedidoModel');
      const DetallePedido = require('../models/DetallePedidoModel');
      const Producto = require('../models/ProductoModel');
      const Receta = require('../models/RecetaModel');

      const pedido = await Pedido.findByPk(idPedido, {
        include: [
          {
            model: DetallePedido,
            as: 'detalles',
            include: [
              {
                model: Producto,
                as: 'producto'
              }
            ]
          }
        ]
      });

      if (!pedido) {
        throw new Error('Pedido no encontrado');
      }

      const movimientosCreados = [];

      for (const detalle of pedido.detalles) {
        const recetas = await Receta.findAll({
          where: { id_producto: detalle.id_producto }
        });

        for (const receta of recetas) {
          const cantidadNecesaria = parseFloat(receta.cantidad_necesaria) * detalle.cantidad;

          const movimiento = await this.crearMovimiento({
            id_ingrediente: receta.id_ingrediente,
            tipo_movimiento: 'salida',
            cantidad: cantidadNecesaria,
            fecha_movimiento: new Date(),
            id_pedido: idPedido,
            id_empleado: idEmpleado,
            notas: `Salida automática por pedido #${idPedido} - ${detalle.producto.nombre} (${detalle.cantidad} ud.)`
          });

          movimientosCreados.push(movimiento);
        }
      }

      return {
        mensaje: `${movimientosCreados.length} movimientos de inventario registrados`,
        movimientos: movimientosCreados
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new MovimientoInventarioService();
