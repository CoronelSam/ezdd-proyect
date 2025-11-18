const Ingrediente = require('../models/IngredienteModel');
const { Op } = require('sequelize');

class IngredienteService {
  async crearIngrediente(data) {
    try {
      const ingrediente = await Ingrediente.create(data);
      return ingrediente;
    } catch (error) {
      throw error;
    }
  }

  async obtenerIngredientes(filtros = {}) {
    try {
      const where = {};
      
      if (filtros.activo !== undefined) {
        where.activo = filtros.activo;
      }

      if (filtros.unidad_medida) {
        where.unidad_medida = filtros.unidad_medida;
      }

      if (filtros.busqueda) {
        where.nombre = {
          [Op.like]: `%${filtros.busqueda}%`
        };
      }

      const ingredientes = await Ingrediente.findAll({
        where,
        order: [['nombre', 'ASC']]
      });

      return ingredientes;
    } catch (error) {
      throw error;
    }
  }

  async obtenerIngredientePorId(id) {
    try {
      const ingrediente = await Ingrediente.findByPk(id);
      
      if (!ingrediente) {
        throw new Error('Ingrediente no encontrado');
      }

      return ingrediente;
    } catch (error) {
      throw error;
    }
  }

  async obtenerIngredientePorNombre(nombre) {
    try {
      const ingrediente = await Ingrediente.findOne({
        where: { 
          nombre,
          activo: true
        }
      });

      return ingrediente;
    } catch (error) {
      throw error;
    }
  }

  async actualizarIngrediente(id, data) {
    try {
      const ingrediente = await this.obtenerIngredientePorId(id);

      await ingrediente.update(data);
      return ingrediente;
    } catch (error) {
      throw error;
    }
  }

  async eliminarIngrediente(id) {
    try {
      const ingrediente = await this.obtenerIngredientePorId(id);

      await ingrediente.update({ activo: false });
      return { mensaje: 'Ingrediente eliminado exitosamente' };
    } catch (error) {
      throw error;
    }
  }

  async eliminarIngredientePermanente(id) {
    try {
      const ingrediente = await this.obtenerIngredientePorId(id);

      await ingrediente.destroy();
      return { mensaje: 'Ingrediente eliminado permanentemente' };
    } catch (error) {
      throw error;
    }
  }

  async reactivarIngrediente(id) {
    try {
      const ingrediente = await Ingrediente.findByPk(id);

      if (!ingrediente) {
        throw new Error('Ingrediente no encontrado');
      }

      await ingrediente.update({ activo: true });
      return ingrediente;
    } catch (error) {
      throw error;
    }
  }

  async obtenerIngredientesBajoStock() {
    try {
      const ingredientes = await Ingrediente.findAll({
        where: {
          activo: true,
          // Aquí se compararía con el stock actual cuando se implemente inventario
          // Por ahora solo retorna ingredientes activos
        },
        order: [['nombre', 'ASC']]
      });

      return ingredientes;
    } catch (error) {
      throw error;
    }
  }

  async obtenerEstadisticas() {
    try {
      const total = await Ingrediente.count();
      const activos = await Ingrediente.count({ where: { activo: true } });
      const inactivos = await Ingrediente.count({ where: { activo: false } });

      const porUnidad = await Ingrediente.findAll({
        attributes: [
          'unidad_medida',
          [sequelize.fn('COUNT', sequelize.col('id_ingrediente')), 'cantidad']
        ],
        where: { activo: true },
        group: ['unidad_medida']
      });

      return {
        total,
        activos,
        inactivos,
        por_unidad_medida: porUnidad
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new IngredienteService();
