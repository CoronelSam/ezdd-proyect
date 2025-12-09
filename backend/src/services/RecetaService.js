const Receta = require('../models/RecetaModel');
const PrecioProducto = require('../models/PrecioProductoModel');
const Producto = require('../models/ProductoModel');
const Ingrediente = require('../models/IngredienteModel');
const { Op } = require('sequelize');

class RecetaService {
  async crearReceta(data) {
    try {
      // Validar que el precio exista
      const precio = await PrecioProducto.findByPk(data.id_precio, {
        include: [{
          model: Producto,
          as: 'producto'
        }]
      });
      
      if (!precio) {
        throw new Error('Presentación/Precio no encontrado');
      }
      
      if (!precio.activo) {
        throw new Error('La presentación no está activa');
      }

      const ingrediente = await Ingrediente.findByPk(data.id_ingrediente);
      if (!ingrediente) {
        throw new Error('Ingrediente no encontrado');
      }
      if (!ingrediente.activo) {
        throw new Error('El ingrediente no está activo');
      }

      // Verificar que no exista ya esta combinación precio-ingrediente
      const recetaExistente = await Receta.findOne({
        where: {
          id_precio: data.id_precio,
          id_ingrediente: data.id_ingrediente
        }
      });

      if (recetaExistente) {
        throw new Error('Ya existe una receta con esta presentación e ingrediente');
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

      if (filtros.id_precio) {
        where.id_precio = filtros.id_precio;
      }

      if (filtros.id_ingrediente) {
        where.id_ingrediente = filtros.id_ingrediente;
      }

      const recetas = await Receta.findAll({
        where,
        include: [
          {
            model: PrecioProducto,
            as: 'precio',
            attributes: ['id_precio', 'nombre_presentacion', 'precio', 'id_producto'],
            include: [{
              model: Producto,
              as: 'producto',
              attributes: ['id_producto', 'nombre', 'descripcion']
            }]
          },
          {
            model: Ingrediente,
            as: 'ingrediente',
            attributes: ['id_ingrediente', 'nombre', 'unidad_medida', 'precio_compra']
          }
        ],
        order: [['id_precio', 'ASC'], ['id_ingrediente', 'ASC']]
      });

      return recetas;
    } catch (error) {
      throw error;
    }
  }

  // Obtener recetas por precio/presentación específica
  async obtenerRecetasPorPrecio(idPrecio) {
    try {
      const precio = await PrecioProducto.findByPk(idPrecio);
      if (!precio) {
        throw new Error('Presentación/Precio no encontrado');
      }

      const recetas = await Receta.findAll({
        where: { id_precio: idPrecio },
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

  // Obtener todas las recetas de un producto (todas sus presentaciones)
  async obtenerRecetasPorProducto(idProducto) {
    try {
      const producto = await Producto.findByPk(idProducto);
      if (!producto) {
        throw new Error('Producto no encontrado');
      }

      // Obtener todos los precios del producto
      const precios = await PrecioProducto.findAll({
        where: { id_producto: idProducto },
        attributes: ['id_precio', 'nombre_presentacion']
      });

      if (precios.length === 0) {
        return [];
      }

      const precioIds = precios.map(p => p.id_precio);

      const recetas = await Receta.findAll({
        where: { 
          id_precio: { [Op.in]: precioIds }
        },
        include: [
          {
            model: PrecioProducto,
            as: 'precio',
            attributes: ['id_precio', 'nombre_presentacion', 'precio']
          },
          {
            model: Ingrediente,
            as: 'ingrediente',
            attributes: ['id_ingrediente', 'nombre', 'unidad_medida', 'precio_compra', 'activo']
          }
        ],
        order: [['id_precio', 'ASC'], ['id_ingrediente', 'ASC']]
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
            model: PrecioProducto,
            as: 'precio',
            attributes: ['id_precio', 'nombre_presentacion', 'precio', 'id_producto', 'activo'],
            include: [{
              model: Producto,
              as: 'producto',
              attributes: ['id_producto', 'nombre', 'descripcion', 'activo']
            }]
          }
        ],
        order: [[{model: PrecioProducto, as: 'precio'}, 'id_producto', 'ASC']]
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
            model: PrecioProducto,
            as: 'precio',
            attributes: ['id_precio', 'nombre_presentacion', 'precio', 'id_producto'],
            include: [{
              model: Producto,
              as: 'producto',
              attributes: ['id_producto', 'nombre', 'descripcion']
            }]
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

        // Verificar que no exista ya esta combinación precio-ingrediente
        const recetaExistente = await Receta.findOne({
          where: {
            id_precio: receta.id_precio,
            id_ingrediente: data.id_ingrediente,
            id_receta: { [Op.ne]: id }
          }
        });

        if (recetaExistente) {
          throw new Error('Ya existe una receta con esta presentación e ingrediente');
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

  // Calcular costo de producción por presentación/precio específico
  async calcularCostoProduccionPorPrecio(idPrecio) {
    try {
      const recetas = await this.obtenerRecetasPorPrecio(idPrecio);

      if (recetas.length === 0) {
        return {
          id_precio: idPrecio,
          costo_total: 0,
          ingredientes: [],
          mensaje: 'Esta presentación no tiene ingredientes asignados'
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
        id_precio: idPrecio,
        costo_total: costoTotal.toFixed(2),
        ingredientes: detalleIngredientes
      };
    } catch (error) {
      throw error;
    }
  }

  // Calcular costo de producción de todas las presentaciones de un producto
  async calcularCostoProduccion(idProducto) {
    try {
      const producto = await Producto.findByPk(idProducto);
      if (!producto) {
        throw new Error('Producto no encontrado');
      }

      // Obtener todos los precios del producto
      const precios = await PrecioProducto.findAll({
        where: { id_producto: idProducto },
        attributes: ['id_precio', 'nombre_presentacion', 'precio']
      });

      if (precios.length === 0) {
        return {
          id_producto: idProducto,
          presentaciones: [],
          mensaje: 'Este producto no tiene presentaciones configuradas'
        };
      }

      const presentaciones = [];

      for (const precio of precios) {
        const costoPresentacion = await this.calcularCostoProduccionPorPrecio(precio.id_precio);
        presentaciones.push({
          id_precio: precio.id_precio,
          nombre_presentacion: precio.nombre_presentacion,
          precio_venta: parseFloat(precio.precio),
          costo_produccion: parseFloat(costoPresentacion.costo_total),
          margen: (parseFloat(precio.precio) - parseFloat(costoPresentacion.costo_total)).toFixed(2),
          porcentaje_margen: precio.precio > 0 
            ? (((parseFloat(precio.precio) - parseFloat(costoPresentacion.costo_total)) / parseFloat(precio.precio)) * 100).toFixed(2)
            : 0,
          ingredientes: costoPresentacion.ingredientes
        });
      }

      return {
        id_producto: idProducto,
        nombre_producto: producto.nombre,
        presentaciones
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
