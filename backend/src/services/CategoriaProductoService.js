const CategoriaProducto = require('../models/CategoriaProductoModel');
const Producto = require('../models/ProductoModel');

class CategoriaProductoService {
  
  async crearCategoria(categoriaData) {
    try {
      const nuevaCategoria = await CategoriaProducto.create({
        ...categoriaData,
        activa: true
      });

      return nuevaCategoria;
    } catch (error) {
      throw error;
    }
  }

  async obtenerCategorias(filtros = {}) {
    try {
      const where = {};
      
      if (filtros.activa !== undefined) {
        where.activa = filtros.activa;
      }

      const categorias = await CategoriaProducto.findAll({
        where,
        order: [['nombre', 'ASC']]
      });

      return categorias;
    } catch (error) {
      throw error;
    }
  }

  async obtenerCategoriaPorId(id, incluirProductos = false) {
    try {
      const opciones = {
        where: { id_categoria: id }
      };

      if (incluirProductos) {
        opciones.include = [{
          model: Producto,
          as: 'productos',
          where: { activo: true },
          required: false
        }];
      }

      const categoria = await CategoriaProducto.findOne(opciones);

      if (!categoria) {
        throw new Error('Categoría no encontrada');
      }

      return categoria;
    } catch (error) {
      throw error;
    }
  }

  async obtenerCategoriaPorNombre(nombre) {
    try {
      const categoria = await CategoriaProducto.findOne({
        where: { nombre }
      });

      return categoria;
    } catch (error) {
      throw error;
    }
  }

  async actualizarCategoria(id, datosActualizados) {
    try {
      const categoria = await CategoriaProducto.findByPk(id);

      if (!categoria) {
        throw new Error('Categoría no encontrada');
      }

      await categoria.update(datosActualizados);

      return categoria;
    } catch (error) {
      throw error;
    }
  }

  async eliminarCategoria(id) {
    try {
      const categoria = await CategoriaProducto.findByPk(id);

      if (!categoria) {
        throw new Error('Categoría no encontrada');
      }

      // Contar productos activos (solo para informar)
      const productosActivos = await Producto.count({
        where: { 
          id_categoria: id,
          activo: true 
        }
      });

      // Soft delete: cambiar el estado a inactiva
      // Permitir desactivar incluso con productos activos
      await categoria.update({ activa: false });

      return { 
        mensaje: 'Categoría desactivada exitosamente',
        productos_afectados: productosActivos
      };
    } catch (error) {
      throw error;
    }
  }

  async eliminarCategoriaPermanente(id) {
    try {
      const categoria = await CategoriaProducto.findByPk(id);

      if (!categoria) {
        throw new Error('Categoría no encontrada');
      }

      // Verificar si tiene productos asociados
      const productosAsociados = await Producto.count({
        where: { id_categoria: id }
      });

      if (productosAsociados > 0) {
        throw new Error('No se puede eliminar una categoría con productos asociados');
      }

      await categoria.destroy();

      return { mensaje: 'Categoría eliminada permanentemente' };
    } catch (error) {
      throw error;
    }
  }

  async reactivarCategoria(id) {
    try {
      const categoria = await CategoriaProducto.findByPk(id);

      if (!categoria) {
        throw new Error('Categoría no encontrada');
      }

      await categoria.update({ activa: true });

      return categoria;
    } catch (error) {
      throw error;
    }
  }

  async obtenerCategoriasConConteo() {
    try {
      const categorias = await CategoriaProducto.findAll({
        include: [{
          model: Producto,
          as: 'productos',
          attributes: [],
          where: { activo: true },
          required: false
        }],
        attributes: {
          include: [
            [sequelize.fn('COUNT', sequelize.col('productos.id_producto')), 'total_productos']
          ]
        },
        group: ['CategoriaProducto.id_categoria'],
        order: [['nombre', 'ASC']]
      });

      return categorias;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new CategoriaProductoService();
