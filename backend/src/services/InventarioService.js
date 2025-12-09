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

  /**
   * Valida si hay suficiente stock para los productos de un pedido
   */
  async validarStockParaPedido(detallesPedido) {
    try {
      const Receta = require('../models/RecetaModel');
      const PrecioProducto = require('../models/PrecioProductoModel');
      const faltantes = [];
      let todoDisponible = true;

      const ingredientesNecesarios = {};

      for (const detalle of detallesPedido) {
        let idPrecio = detalle.id_precio;
        
        // Si no se proporciona id_precio, buscar el precio por defecto del producto
        if (!idPrecio) {
          const precioDefault = await PrecioProducto.findOne({
            where: { 
              id_producto: detalle.id_producto,
              es_default: true,
              activo: true
            }
          });
          
          if (precioDefault) {
            idPrecio = precioDefault.id_precio;
          } else {
            // Si no hay precio por defecto, buscar el primer precio activo
            const primerPrecio = await PrecioProducto.findOne({
              where: { 
                id_producto: detalle.id_producto,
                activo: true
              }
            });
            if (primerPrecio) {
              idPrecio = primerPrecio.id_precio;
            }
          }
        }

        // Si no se puede determinar un precio, continuar (no se puede validar stock)
        if (!idPrecio) {
          console.warn(`No se pudo determinar precio para producto ${detalle.id_producto}`);
          continue;
        }

        // Buscar recetas por id_precio en lugar de id_producto
        const recetas = await Receta.findAll({
          where: { id_precio: idPrecio },
          include: [{
            model: Ingrediente,
            as: 'ingrediente',
            attributes: ['id_ingrediente', 'nombre', 'unidad_medida'],
            required: false
          }]
        });

        // Si la presentacion no tiene recetas, continuar (no requiere inventario)
        if (!recetas || recetas.length === 0) {
          continue;
        }

        for (const receta of recetas) {
          // Validar que la receta tenga ingrediente asociado
          if (!receta.ingrediente) {
            console.warn(`Receta ${receta.id_receta} no tiene ingrediente asociado`);
            continue;
          }

          const cantidadNecesaria = parseFloat(receta.cantidad_necesaria) * detalle.cantidad;
          
          if (!ingredientesNecesarios[receta.id_ingrediente]) {
            ingredientesNecesarios[receta.id_ingrediente] = {
              id_ingrediente: receta.id_ingrediente,
              nombre: receta.ingrediente.nombre,
              unidad_medida: receta.ingrediente.unidad_medida,
              cantidad_necesaria: 0
            };
          }
          
          ingredientesNecesarios[receta.id_ingrediente].cantidad_necesaria += cantidadNecesaria;
        }
      }

      // Si no hay ingredientes necesarios, el pedido está disponible
      if (Object.keys(ingredientesNecesarios).length === 0) {
        return {
          disponible: true,
          faltantes: []
        };
      }

      for (const idIngrediente in ingredientesNecesarios) {
        const ingrediente = ingredientesNecesarios[idIngrediente];
        
        const inventario = await Inventario.findOne({
          where: { id_ingrediente: idIngrediente }
        });

        if (!inventario) {
          todoDisponible = false;
          faltantes.push({
            ...ingrediente,
            cantidad_disponible: 0,
            cantidad_faltante: ingrediente.cantidad_necesaria
          });
        } else {
          const cantidadDisponible = parseFloat(inventario.cantidad_actual);
          
          if (cantidadDisponible < ingrediente.cantidad_necesaria) {
            todoDisponible = false;
            faltantes.push({
              ...ingrediente,
              cantidad_disponible: cantidadDisponible,
              cantidad_faltante: ingrediente.cantidad_necesaria - cantidadDisponible
            });
          }
        }
      }

      return {
        disponible: todoDisponible,
        faltantes: faltantes
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Descuenta los ingredientes del inventario según las recetas de los productos del pedido
   */
  async descontarIngredientesPorPedido(detallesPedido, idPedido = null) {
    try {
      const Receta = require('../models/RecetaModel');
      const PrecioProducto = require('../models/PrecioProductoModel');
      const MovimientoInventario = require('../models/MovimientoInventarioModel');
      const movimientos = [];

      const ingredientesNecesarios = {};

      for (const detalle of detallesPedido) {
        // Determinar el id_precio a usar
        let idPrecio = detalle.id_precio;
        
        // Si no se proporciona id_precio, buscar el precio por defecto del producto
        if (!idPrecio) {
          const precioDefault = await PrecioProducto.findOne({
            where: { 
              id_producto: detalle.id_producto,
              es_default: true,
              activo: true
            }
          });
          
          if (precioDefault) {
            idPrecio = precioDefault.id_precio;
          } else {
            // Si no hay precio por defecto, buscar el primer precio activo
            const primerPrecio = await PrecioProducto.findOne({
              where: { 
                id_producto: detalle.id_producto,
                activo: true
              }
            });
            if (primerPrecio) {
              idPrecio = primerPrecio.id_precio;
            }
          }
        }

        // Si no se puede determinar un precio, continuar
        if (!idPrecio) {
          console.warn(`No se pudo determinar precio para producto ${detalle.id_producto}`);
          continue;
        }

        // Buscar recetas por id_precio en lugar de id_producto
        const recetas = await Receta.findAll({
          where: { id_precio: idPrecio },
          include: [{
            model: Ingrediente,
            as: 'ingrediente',
            attributes: ['id_ingrediente', 'nombre'],
            required: false
          }]
        });

        // Si la presentación no tiene recetas, continuar
        if (!recetas || recetas.length === 0) {
          continue;
        }

        for (const receta of recetas) {
          // Validar que la receta tenga ingrediente asociado
          if (!receta.ingrediente) {
            console.warn(`Receta ${receta.id_receta} no tiene ingrediente asociado`);
            continue;
          }

          const cantidadNecesaria = parseFloat(receta.cantidad_necesaria) * detalle.cantidad;
          
          if (!ingredientesNecesarios[receta.id_ingrediente]) {
            ingredientesNecesarios[receta.id_ingrediente] = {
              cantidad: 0,
              nombre: receta.ingrediente.nombre
            };
          }
          
          ingredientesNecesarios[receta.id_ingrediente].cantidad += cantidadNecesaria;
        }
      }

      // Si no hay ingredientes para descontar, retornar array vacío
      if (Object.keys(ingredientesNecesarios).length === 0) {
        return movimientos;
      }

      // Descontar del inventario y crear movimientos
      for (const idIngrediente in ingredientesNecesarios) {
        const { cantidad, nombre } = ingredientesNecesarios[idIngrediente];
        
        const inventario = await Inventario.findOne({
          where: { id_ingrediente: idIngrediente }
        });

        if (!inventario) {
          throw new Error(`No existe inventario para el ingrediente: ${nombre}`);
        }

        const nuevaCantidad = parseFloat(inventario.cantidad_actual) - cantidad;
        
        if (nuevaCantidad < 0) {
          throw new Error(`Stock insuficiente para el ingrediente: ${nombre}`);
        }

        // Actualizar inventario
        await inventario.update({
          cantidad_actual: nuevaCantidad,
          fecha_actualizacion: new Date()
        });

        // Crear movimiento de inventario
        const movimiento = await MovimientoInventario.create({
          id_ingrediente: idIngrediente,
          tipo_movimiento: 'salida',
          cantidad: cantidad,
          id_pedido: idPedido,
          notas: idPedido ? `Consumo automático por pedido #${idPedido}` : 'Consumo por pedido',
          fecha_movimiento: new Date()
        });

        movimientos.push(movimiento);
      }

      return movimientos;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Revierte el descuento de ingredientes (útil cuando se cancela un pedido)
   */
  async revertirDescuentoPorPedido(detallesPedido, idPedido = null) {
    try {
      const Receta = require('../models/RecetaModel');
      const PrecioProducto = require('../models/PrecioProductoModel');
      const MovimientoInventario = require('../models/MovimientoInventarioModel');
      const movimientos = [];

      // Agrupar ingredientes a devolver
      const ingredientesADevolver = {};

      for (const detalle of detallesPedido) {
        // Determinar el id_precio a usar
        let idPrecio = detalle.id_precio;
        
        // Si no se proporciona id_precio, buscar el precio por defecto del producto
        if (!idPrecio) {
          const precioDefault = await PrecioProducto.findOne({
            where: { 
              id_producto: detalle.id_producto,
              es_default: true,
              activo: true
            }
          });
          
          if (precioDefault) {
            idPrecio = precioDefault.id_precio;
          } else {
            // Si no hay precio por defecto, buscar el primer precio activo
            const primerPrecio = await PrecioProducto.findOne({
              where: { 
                id_producto: detalle.id_producto,
                activo: true
              }
            });
            if (primerPrecio) {
              idPrecio = primerPrecio.id_precio;
            }
          }
        }

        // Si no se puede determinar un precio, continuar
        if (!idPrecio) {
          console.warn(`No se pudo determinar precio para producto ${detalle.id_producto}`);
          continue;
        }

        // Buscar recetas por id_precio en lugar de id_producto
        const recetas = await Receta.findAll({
          where: { id_precio: idPrecio },
          include: [{
            model: Ingrediente,
            as: 'ingrediente',
            attributes: ['id_ingrediente', 'nombre'],
            required: false
          }]
        });

        // Si la presentación no tiene recetas, continuar
        if (!recetas || recetas.length === 0) {
          continue;
        }

        for (const receta of recetas) {
          // Validar que la receta tenga ingrediente asociado
          if (!receta.ingrediente) {
            console.warn(`Receta ${receta.id_receta} no tiene ingrediente asociado`);
            continue;
          }

          const cantidadADevolver = parseFloat(receta.cantidad_necesaria) * detalle.cantidad;
          
          if (!ingredientesADevolver[receta.id_ingrediente]) {
            ingredientesADevolver[receta.id_ingrediente] = {
              cantidad: 0,
              nombre: receta.ingrediente.nombre
            };
          }
          
          ingredientesADevolver[receta.id_ingrediente].cantidad += cantidadADevolver;
        }
      }

      // Si no hay ingredientes para devolver, retornar array vacío
      if (Object.keys(ingredientesADevolver).length === 0) {
        return movimientos;
      }

      // Devolver al inventario y crear movimientos
      for (const idIngrediente in ingredientesADevolver) {
        const { cantidad, nombre } = ingredientesADevolver[idIngrediente];
        
        const inventario = await Inventario.findOne({
          where: { id_ingrediente: idIngrediente }
        });

        if (!inventario) {
          throw new Error(`No existe inventario para el ingrediente: ${nombre}`);
        }

        const cantidadAnterior = parseFloat(inventario.cantidad_actual);
        const nuevaCantidad = cantidadAnterior + cantidad;

        // Actualizar inventario
        await inventario.update({
          cantidad_actual: nuevaCantidad,
          fecha_actualizacion: new Date()
        });

        // Crear movimiento de inventario
        const movimiento = await MovimientoInventario.create({
          id_ingrediente: idIngrediente,
          tipo_movimiento: 'entrada',
          cantidad: cantidad,
          id_pedido: idPedido,
          notas: idPedido ? `Reversión automática por cancelación de pedido #${idPedido}` : 'Reversión por cancelación',
          fecha_movimiento: new Date()
        });

        movimientos.push(movimiento);
      }

      return movimientos;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new InventarioService();
