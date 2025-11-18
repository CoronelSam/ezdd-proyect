const Inventario = require('../models/InventarioModel');
const Ingrediente = require('../models/IngredienteModel');
const { Op } = require('sequelize');

class InventarioService {
  async crearInventario(data) {
    try {
      const ingrediente = await Ingrediente.findByPk(data.id_ingrediente);
      if (!ingrediente) {
        throw new Error('Ingrediente no encontrado');
      }
      if (!ingrediente.activo) {
        throw new Error('El ingrediente no está activo');
      }

      const inventarioExistente = await Inventario.findOne({
        where: { id_ingrediente: data.id_ingrediente }
      });

      if (inventarioExistente) {
        throw new Error('Ya existe un inventario para este ingrediente');
      }

      const inventario = await Inventario.create({
        ...data,
        fecha_actualizacion: new Date()
      });

      return await this.obtenerInventarioPorId(inventario.id_inventario);
    } catch (error) {
      throw error;
    }
  }

  async obtenerInventarios(filtros = {}) {
    try {
      const where = {};

      if (filtros.bajo_stock) {
        const inventarios = await Inventario.findAll({
          include: [
            {
              model: Ingrediente,
              as: 'ingrediente',
              where: { activo: true },
              attributes: ['id_ingrediente', 'nombre', 'unidad_medida', 'stock_minimo', 'precio_compra']
            }
          ],
          order: [['fecha_actualizacion', 'DESC']]
        });

        return inventarios.filter(inv => 
          parseFloat(inv.cantidad_actual) < parseFloat(inv.ingrediente.stock_minimo)
        );
      }

      const inventarios = await Inventario.findAll({
        where,
        include: [
          {
            model: Ingrediente,
            as: 'ingrediente',
            attributes: ['id_ingrediente', 'nombre', 'unidad_medida', 'stock_minimo', 'precio_compra', 'activo']
          }
        ],
        order: [['fecha_actualizacion', 'DESC']]
      });

      return inventarios;
    } catch (error) {
      throw error;
    }
  }

  async obtenerInventarioPorId(id) {
    try {
      const inventario = await Inventario.findByPk(id, {
        include: [
          {
            model: Ingrediente,
            as: 'ingrediente',
            attributes: ['id_ingrediente', 'nombre', 'unidad_medida', 'stock_minimo', 'precio_compra', 'activo']
          }
        ]
      });

      if (!inventario) {
        throw new Error('Inventario no encontrado');
      }

      return inventario;
    } catch (error) {
      throw error;
    }
  }

  async obtenerInventarioPorIngrediente(idIngrediente) {
    try {
      const inventario = await Inventario.findOne({
        where: { id_ingrediente: idIngrediente },
        include: [
          {
            model: Ingrediente,
            as: 'ingrediente',
            attributes: ['id_ingrediente', 'nombre', 'unidad_medida', 'stock_minimo', 'precio_compra', 'activo']
          }
        ]
      });

      if (!inventario) {
        throw new Error('Inventario no encontrado para este ingrediente');
      }

      return inventario;
    } catch (error) {
      throw error;
    }
  }

  async actualizarInventario(id, cantidad) {
    try {
      const inventario = await Inventario.findByPk(id);

      if (!inventario) {
        throw new Error('Inventario no encontrado');
      }

      await inventario.update({
        cantidad_actual: cantidad,
        fecha_actualizacion: new Date()
      });

      return await this.obtenerInventarioPorId(id);
    } catch (error) {
      throw error;
    }
  }

  async agregarCantidad(id, cantidad) {
    try {
      const inventario = await Inventario.findByPk(id);

      if (!inventario) {
        throw new Error('Inventario no encontrado');
      }

      const nuevaCantidad = parseFloat(inventario.cantidad_actual) + parseFloat(cantidad);

      await inventario.update({
        cantidad_actual: nuevaCantidad,
        fecha_actualizacion: new Date()
      });

      return await this.obtenerInventarioPorId(id);
    } catch (error) {
      throw error;
    }
  }

  async reducirCantidad(id, cantidad) {
    try {
      const inventario = await Inventario.findByPk(id);

      if (!inventario) {
        throw new Error('Inventario no encontrado');
      }

      const nuevaCantidad = parseFloat(inventario.cantidad_actual) - parseFloat(cantidad);

      if (nuevaCantidad < 0) {
        throw new Error('No hay suficiente cantidad en inventario');
      }

      await inventario.update({
        cantidad_actual: nuevaCantidad,
        fecha_actualizacion: new Date()
      });

      return await this.obtenerInventarioPorId(id);
    } catch (error) {
      throw error;
    }
  }

  async eliminarInventario(id) {
    try {
      const inventario = await Inventario.findByPk(id);

      if (!inventario) {
        throw new Error('Inventario no encontrado');
      }

      await inventario.destroy();
      return { mensaje: 'Inventario eliminado exitosamente' };
    } catch (error) {
      throw error;
    }
  }

  async obtenerInventariosBajoStock() {
    try {
      const inventarios = await Inventario.findAll({
        include: [
          {
            model: Ingrediente,
            as: 'ingrediente',
            where: { activo: true },
            attributes: ['id_ingrediente', 'nombre', 'unidad_medida', 'stock_minimo', 'precio_compra']
          }
        ],
        order: [['cantidad_actual', 'ASC']]
      });

      const inventariosBajos = inventarios.filter(inv => 
        parseFloat(inv.cantidad_actual) < parseFloat(inv.ingrediente.stock_minimo)
      );

      return inventariosBajos.map(inv => ({
        ...inv.toJSON(),
        diferencia: parseFloat(inv.ingrediente.stock_minimo) - parseFloat(inv.cantidad_actual),
        porcentaje: (parseFloat(inv.cantidad_actual) / parseFloat(inv.ingrediente.stock_minimo) * 100).toFixed(2)
      }));
    } catch (error) {
      throw error;
    }
  }

  async obtenerEstadisticas() {
    try {
      const inventarios = await Inventario.findAll({
        include: [
          {
            model: Ingrediente,
            as: 'ingrediente',
            attributes: ['id_ingrediente', 'nombre', 'unidad_medida', 'stock_minimo', 'precio_compra', 'activo']
          }
        ]
      });

      const total = inventarios.length;
      let bajoStock = 0;
      let valorTotal = 0;

      inventarios.forEach(inv => {
        if (parseFloat(inv.cantidad_actual) < parseFloat(inv.ingrediente.stock_minimo)) {
          bajoStock++;
        }
        valorTotal += parseFloat(inv.cantidad_actual) * parseFloat(inv.ingrediente.precio_compra);
      });

      return {
        total_items: total,
        items_bajo_stock: bajoStock,
        valor_total_inventario: valorTotal.toFixed(2),
        porcentaje_bajo_stock: total > 0 ? ((bajoStock / total) * 100).toFixed(2) : 0
      };
    } catch (error) {
      throw error;
    }
  }

  async inicializarInventarios() {
    try {
      const ingredientes = await Ingrediente.findAll({
        where: { activo: true }
      });

      const inventariosCreados = [];

      for (const ingrediente of ingredientes) {
        const inventarioExistente = await Inventario.findOne({
          where: { id_ingrediente: ingrediente.id_ingrediente }
        });

        if (!inventarioExistente) {
          const nuevoInventario = await Inventario.create({
            id_ingrediente: ingrediente.id_ingrediente,
            cantidad_actual: 0,
            fecha_actualizacion: new Date()
          });
          inventariosCreados.push(nuevoInventario);
        }
      }

      return {
        mensaje: `${inventariosCreados.length} inventarios inicializados`,
        inventarios: inventariosCreados
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new InventarioService();
