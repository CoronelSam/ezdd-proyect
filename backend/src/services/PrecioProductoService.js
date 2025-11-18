const PrecioProducto = require('../models/PrecioProductoModel');
const Producto = require('../models/ProductoModel');

class PrecioProductoService {

  async crearPrecioProducto(precioData) {
    try {
      // Verificar que el producto exista
      const producto = await Producto.findByPk(precioData.id_producto);
      
      if (!producto) {
        throw new Error('El producto especificado no existe');
      }

      if (!producto.activo) {
        throw new Error('El producto especificado está inactivo');
      }

      const nuevoPrecio = await PrecioProducto.create({
        ...precioData,
        activo: true
      });

      return nuevoPrecio;
    } catch (error) {
      throw error;
    }
  }

  async obtenerPrecios(filtros = {}) {
    try {
      const where = {};
      
      if (filtros.activo !== undefined) {
        where.activo = filtros.activo;
      }

      if (filtros.id_producto) {
        where.id_producto = filtros.id_producto;
      }

      const precios = await PrecioProducto.findAll({
        where,
        order: [['precio', 'ASC']]
      });

      return precios;
    } catch (error) {
      throw error;
    }
  }

  async obtenerPreciosPorProducto(idProducto, soloActivos = true) {
    try {
      // Verificar que el producto exista
      const producto = await Producto.findByPk(idProducto);
      
      if (!producto) {
        throw new Error('El producto especificado no existe');
      }

      const where = { id_producto: idProducto };
      
      if (soloActivos) {
        where.activo = true;
      }

      const precios = await PrecioProducto.findAll({
        where,
        order: [['precio', 'ASC']]
      });

      return precios;
    } catch (error) {
      throw error;
    }
  }

  async obtenerPrecioPorId(id) {
    try {
      const precio = await PrecioProducto.findByPk(id);

      if (!precio) {
        throw new Error('Precio no encontrado');
      }

      return precio;
    } catch (error) {
      throw error;
    }
  }

  async obtenerPrecioPorPresentacion(idProducto, nombrePresentacion) {
    try {
      const precio = await PrecioProducto.findOne({
        where: {
          id_producto: idProducto,
          nombre_presentacion: nombrePresentacion,
          activo: true
        }
      });

      if (!precio) {
        throw new Error('Precio para esta presentación no encontrado');
      }

      return precio;
    } catch (error) {
      throw error;
    }
  }

  async actualizarPrecio(id, datosActualizados) {
    try {
      const precio = await PrecioProducto.findByPk(id);

      if (!precio) {
        throw new Error('Precio no encontrado');
      }

      await precio.update(datosActualizados);

      return precio;
    } catch (error) {
      throw error;
    }
  }

  async eliminarPrecio(id) {
    try {
      const precio = await PrecioProducto.findByPk(id);

      if (!precio) {
        throw new Error('Precio no encontrado');
      }

      // Soft delete: cambiar el estado a inactivo
      await precio.update({ activo: false });

      return { mensaje: 'Precio desactivado exitosamente' };
    } catch (error) {
      throw error;
    }
  }

  async eliminarPrecioPermanente(id) {
    try {
      const precio = await PrecioProducto.findByPk(id);

      if (!precio) {
        throw new Error('Precio no encontrado');
      }

      await precio.destroy();

      return { mensaje: 'Precio eliminado permanentemente' };
    } catch (error) {
      throw error;
    }
  }

  async reactivarPrecio(id) {
    try {
      const precio = await PrecioProducto.findByPk(id);

      if (!precio) {
        throw new Error('Precio no encontrado');
      }

      // Verificar que el producto esté activo
      const producto = await Producto.findByPk(precio.id_producto);
      
      if (!producto.activo) {
        throw new Error('No se puede reactivar un precio de un producto inactivo');
      }

      await precio.update({ activo: true });

      return precio;
    } catch (error) {
      throw error;
    }
  }

  async obtenerEstadisticas() {
    try {
      const totalPrecios = await PrecioProducto.count();
      const preciosActivos = await PrecioProducto.count({ where: { activo: true } });
      const preciosInactivos = await PrecioProducto.count({ where: { activo: false } });

      return {
        totalPrecios,
        preciosActivos,
        preciosInactivos
      };
    } catch (error) {
      throw error;
    }
  }

  async duplicarPreciosProducto(idProductoOrigen, idProductoDestino) {
    try {
      // Verificar que ambos productos existan
      const productoOrigen = await Producto.findByPk(idProductoOrigen);
      const productoDestino = await Producto.findByPk(idProductoDestino);
      
      if (!productoOrigen || !productoDestino) {
        throw new Error('Uno o ambos productos no existen');
      }

      const preciosOrigen = await PrecioProducto.findAll({
        where: { id_producto: idProductoOrigen, activo: true }
      });

      const preciosNuevos = await Promise.all(
        preciosOrigen.map(precio => 
          PrecioProducto.create({
            id_producto: idProductoDestino,
            nombre_presentacion: precio.nombre_presentacion,
            descripcion: precio.descripcion,
            precio: precio.precio,
            activo: true
          })
        )
      );

      return preciosNuevos;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new PrecioProductoService();
