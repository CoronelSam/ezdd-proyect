const Producto = require('../models/ProductoModel');
const CategoriaProducto = require('../models/CategoriaProductoModel');

class ProductoService {

  async crearProducto(productoData) {
    try {
      // Verificar que la categoría exista y esté activa
      const categoria = await CategoriaProducto.findByPk(productoData.id_categoria);
      
      if (!categoria) {
        throw new Error('La categoría especificada no existe');
      }

      if (!categoria.activa) {
        throw new Error('La categoría especificada está inactiva');
      }

      // Excluir el campo 'precio' si viene en los datos (ahora se maneja en PrecioProducto)
      const { precio, ...datosProducto } = productoData;

      const nuevoProducto = await Producto.create({
        ...datosProducto,
        activo: true
      });

      // Obtener el producto con la categoría incluida
      const productoCompleto = await Producto.findByPk(nuevoProducto.id_producto, {
        include: [{
          model: CategoriaProducto,
          as: 'categoria',
          attributes: ['id_categoria', 'nombre']
        }]
      });

      return productoCompleto;
    } catch (error) {
      throw error;
    }
  }

  async obtenerProductos(filtros = {}) {
    try {
      const where = {};
      
      if (filtros.activo !== undefined) {
        where.activo = filtros.activo;
      }

      if (filtros.id_categoria) {
        where.id_categoria = filtros.id_categoria;
      }

      const PrecioProducto = require('./PrecioProductoService');
      const productos = await Producto.findAll({
        where,
        include: [
          {
            model: CategoriaProducto,
            as: 'categoria',
            attributes: ['id_categoria', 'nombre']
          },
          {
            model: require('../models/PrecioProductoModel'),
            as: 'precio_default',
            attributes: ['id_precio', 'nombre_presentacion', 'precio']
          },
          {
            model: require('../models/PrecioProductoModel'),
            as: 'precios',
            attributes: ['id_precio', 'nombre_presentacion', 'descripcion', 'precio', 'es_default', 'activo']
          }
        ],
        order: [['nombre', 'ASC']]
      });

      return productos;
    } catch (error) {
      throw error;
    }
  }

  async obtenerProductoPorId(id) {
    try {
      const producto = await Producto.findByPk(id, {
        include: [
          {
            model: CategoriaProducto,
            as: 'categoria',
            attributes: ['id_categoria', 'nombre', 'descripcion']
          },
          {
            model: require('../models/PrecioProductoModel'),
            as: 'precio_default',
            attributes: ['id_precio', 'nombre_presentacion', 'precio', 'descripcion']
          },
          {
            model: require('../models/PrecioProductoModel'),
            as: 'precios',
            attributes: ['id_precio', 'nombre_presentacion', 'descripcion', 'precio', 'es_default', 'activo']
          }
        ]
      });

      if (!producto) {
        throw new Error('Producto no encontrado');
      }

      return producto;
    } catch (error) {
      throw error;
    }
  }

  async obtenerProductosPorCategoria(idCategoria) {
    try {
      // Verificar que la categoría exista
      const categoria = await CategoriaProducto.findByPk(idCategoria);
      
      if (!categoria) {
        throw new Error('La categoría especificada no existe');
      }

      const productos = await Producto.findAll({
        where: { 
          id_categoria: idCategoria,
          activo: true 
        },
        include: [{
          model: CategoriaProducto,
          as: 'categoria',
          attributes: ['id_categoria', 'nombre']
        }],
        order: [['nombre', 'ASC']]
      });

      return productos;
    } catch (error) {
      throw error;
    }
  }

  async buscarProductosPorNombre(termino) {
    try {
      const { Op } = require('sequelize');
      
      const productos = await Producto.findAll({
        where: {
          nombre: {
            [Op.like]: `%${termino}%`
          },
          activo: true
        },
        include: [{
          model: CategoriaProducto,
          as: 'categoria',
          attributes: ['id_categoria', 'nombre']
        }],
        order: [['nombre', 'ASC']]
      });

      return productos;
    } catch (error) {
      throw error;
    }
  }

  async actualizarProducto(id, datosActualizados) {
    try {
      const producto = await Producto.findByPk(id);

      if (!producto) {
        throw new Error('Producto no encontrado');
      }

      // Excluir el campo 'precio' si viene en los datos (ahora se maneja en PrecioProducto)
      const { precio, ...datosProducto } = datosActualizados;

      // Si se actualiza la categoría, verificar que exista y esté activa
      if (datosProducto.id_categoria) {
        const categoria = await CategoriaProducto.findByPk(datosProducto.id_categoria);
        
        if (!categoria) {
          throw new Error('La categoría especificada no existe');
        }

        if (!categoria.activa) {
          throw new Error('La categoría especificada está inactiva');
        }
      }

      await producto.update(datosProducto);

      // Obtener el producto actualizado con la categoría
      const productoActualizado = await Producto.findByPk(id, {
        include: [{
          model: CategoriaProducto,
          as: 'categoria',
          attributes: ['id_categoria', 'nombre']
        }]
      });

      return productoActualizado;
    } catch (error) {
      throw error;
    }
  }

  async eliminarProducto(id) {
    try {
      const producto = await Producto.findByPk(id);

      if (!producto) {
        throw new Error('Producto no encontrado');
      }

      // Soft delete: cambiar el estado a inactivo
      await producto.update({ activo: false });

      return { mensaje: 'Producto desactivado exitosamente' };
    } catch (error) {
      throw error;
    }
  }

  async eliminarProductoPermanente(id) {
    try {
      const producto = await Producto.findByPk(id);

      if (!producto) {
        throw new Error('Producto no encontrado');
      }

      await producto.destroy();

      return { mensaje: 'Producto eliminado permanentemente' };
    } catch (error) {
      throw error;
    }
  }

  async reactivarProducto(id) {
    try {
      const producto = await Producto.findByPk(id);

      if (!producto) {
        throw new Error('Producto no encontrado');
      }

      // Verificar que la categoría esté activa
      const categoria = await CategoriaProducto.findByPk(producto.id_categoria);
      
      if (!categoria.activa) {
        throw new Error('No se puede reactivar un producto con categoría inactiva');
      }

      await producto.update({ activo: true });

      return producto;
    } catch (error) {
      throw error;
    }
  }

  async obtenerEstadisticas() {
    try {
      const totalProductos = await Producto.count();
      const productosActivos = await Producto.count({ where: { activo: true } });
      const productosInactivos = await Producto.count({ where: { activo: false } });

      return {
        totalProductos,
        productosActivos,
        productosInactivos
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ProductoService();
