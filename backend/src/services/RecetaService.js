const Receta = require('../models/RecetaModel');
const Producto = require('../models/ProductoModel');
const Ingrediente = require('../models/IngredienteModel');
const { Op } = require('sequelize');

class RecetaService {
  async crearReceta(data) {
    try {
      const producto = await Producto.findByPk(data.id_producto);
      if (!producto) {
        throw new Error('Producto no encontrado');
      }
      if (!producto.activo) {
        throw new Error('El producto no está activo');
      }

      const ingrediente = await Ingrediente.findByPk(data.id_ingrediente);
      if (!ingrediente) {
        throw new Error('Ingrediente no encontrado');
      }
      if (!ingrediente.activo) {
        throw new Error('El ingrediente no está activo');
      }

      const recetaExistente = await Receta.findOne({
        where: {
          id_producto: data.id_producto,
          id_ingrediente: data.id_ingrediente
        }
      });

      if (recetaExistente) {
        throw new Error('Ya existe una receta con este producto e ingrediente');
      }

      const receta = await Receta.create(data);

      return await this.obtenerRecetaPorId(receta.id_receta);
    } catch (error) {
      throw error;
    }
  }

  async obtenerRecetas(filtros = {}) {
    try {
      const where = {};

      if (filtros.id_producto) {
        where.id_producto = filtros.id_producto;
      }

      if (filtros.id_ingrediente) {
        where.id_ingrediente = filtros.id_ingrediente;
      }

      const recetas = await Receta.findAll({
        where,
        include: [
          {
            model: Producto,
            as: 'producto',
            attributes: ['id_producto', 'nombre', 'descripcion']
          },
          {
            model: Ingrediente,
            as: 'ingrediente',
            attributes: ['id_ingrediente', 'nombre', 'unidad_medida', 'precio_compra']
          }
        ],
        order: [['id_producto', 'ASC'], ['id_ingrediente', 'ASC']]
      });

      return recetas;
    } catch (error) {
      throw error;
    }
  }

  async obtenerRecetasPorProducto(idProducto) {
    try {
      const producto = await Producto.findByPk(idProducto);
      if (!producto) {
        throw new Error('Producto no encontrado');
      }

      const recetas = await Receta.findAll({
        where: { id_producto: idProducto },
        include: [
          {
            model: Ingrediente,
            as: 'ingrediente',
            attributes: ['id_ingrediente', 'nombre', 'unidad_medida', 'precio_compra', 'activo']
          }
        ],
        order: [['id_ingrediente', 'ASC']]
      });

      return recetas;
    } catch (error) {
      throw error;
    }
  }

  async obtenerRecetasPorIngrediente(idIngrediente) {
    try {
      const ingrediente = await Ingrediente.findByPk(idIngrediente);
      if (!ingrediente) {
        throw new Error('Ingrediente no encontrado');
      }

      const recetas = await Receta.findAll({
        where: { id_ingrediente: idIngrediente },
        include: [
          {
            model: Producto,
            as: 'producto',
            attributes: ['id_producto', 'nombre', 'descripcion', 'activo']
          }
        ],
        order: [['id_producto', 'ASC']]
      });

      return recetas;
    } catch (error) {
      throw error;
    }
  }

  async obtenerRecetaPorId(id) {
    try {
      const receta = await Receta.findByPk(id, {
        include: [
          {
            model: Producto,
            as: 'producto',
            attributes: ['id_producto', 'nombre', 'descripcion']
          },
          {
            model: Ingrediente,
            as: 'ingrediente',
            attributes: ['id_ingrediente', 'nombre', 'unidad_medida', 'precio_compra']
          }
        ]
      });

      if (!receta) {
        throw new Error('Receta no encontrada');
      }

      return receta;
    } catch (error) {
      throw error;
    }
  }

  async actualizarReceta(id, data) {
    try {
      const receta = await Receta.findByPk(id);
      
      if (!receta) {
        throw new Error('Receta no encontrada');
      }

      if (data.id_ingrediente && data.id_ingrediente !== receta.id_ingrediente) {
        const ingrediente = await Ingrediente.findByPk(data.id_ingrediente);
        if (!ingrediente) {
          throw new Error('Ingrediente no encontrado');
        }
        if (!ingrediente.activo) {
          throw new Error('El ingrediente no está activo');
        }

        const recetaExistente = await Receta.findOne({
          where: {
            id_producto: receta.id_producto,
            id_ingrediente: data.id_ingrediente,
            id_receta: { [Op.ne]: id }
          }
        });

        if (recetaExistente) {
          throw new Error('Ya existe una receta con este producto e ingrediente');
        }
      }

      await receta.update(data);
      return await this.obtenerRecetaPorId(id);
    } catch (error) {
      throw error;
    }
  }

  async eliminarReceta(id) {
    try {
      const receta = await Receta.findByPk(id);

      if (!receta) {
        throw new Error('Receta no encontrada');
      }

      await receta.destroy();
      return { mensaje: 'Receta eliminada exitosamente' };
    } catch (error) {
      throw error;
    }
  }

  async calcularCostoProduccion(idProducto) {
    try {
      const recetas = await this.obtenerRecetasPorProducto(idProducto);

      if (recetas.length === 0) {
        return {
          id_producto: idProducto,
          costo_total: 0,
          ingredientes: [],
          mensaje: 'Este producto no tiene ingredientes asignados'
        };
      }

      let costoTotal = 0;
      const detalleIngredientes = [];

      for (const receta of recetas) {
        const costoIngrediente = parseFloat(receta.ingrediente.precio_compra) * parseFloat(receta.cantidad_necesaria);
        costoTotal += costoIngrediente;

        detalleIngredientes.push({
          id_ingrediente: receta.ingrediente.id_ingrediente,
          nombre: receta.ingrediente.nombre,
          cantidad_necesaria: parseFloat(receta.cantidad_necesaria),
          unidad_medida: receta.ingrediente.unidad_medida,
          precio_unitario: parseFloat(receta.ingrediente.precio_compra),
          costo_total: costoIngrediente.toFixed(2)
        });
      }

      return {
        id_producto: idProducto,
        costo_total: costoTotal.toFixed(2),
        ingredientes: detalleIngredientes
      };
    } catch (error) {
      throw error;
    }
  }

  async duplicarReceta(idProductoOrigen, idProductoDestino) {
    try {
      const productoOrigen = await Producto.findByPk(idProductoOrigen);
      const productoDestino = await Producto.findByPk(idProductoDestino);

      if (!productoOrigen || !productoDestino) {
        throw new Error('Uno o ambos productos no fueron encontrados');
      }

      const recetasOrigen = await Receta.findAll({
        where: { id_producto: idProductoOrigen }
      });

      if (recetasOrigen.length === 0) {
        throw new Error('El producto origen no tiene recetas para duplicar');
      }

      const recetasNuevas = [];
      for (const receta of recetasOrigen) {
        // Verificar que no exista ya
        const existente = await Receta.findOne({
          where: {
            id_producto: idProductoDestino,
            id_ingrediente: receta.id_ingrediente
          }
        });

        if (!existente) {
          const nuevaReceta = await Receta.create({
            id_producto: idProductoDestino,
            id_ingrediente: receta.id_ingrediente,
            cantidad_necesaria: receta.cantidad_necesaria
          });
          recetasNuevas.push(nuevaReceta);
        }
      }

      return {
        mensaje: `${recetasNuevas.length} recetas duplicadas exitosamente`,
        recetas: recetasNuevas
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new RecetaService();
