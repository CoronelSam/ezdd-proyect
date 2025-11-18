const Empleado = require('../models/EmpleadoModel');

class EmpleadoService {

  async crearEmpleado(empleadoData) {
    try {
      const nuevoEmpleado = await Empleado.create({
        ...empleadoData,
        fecha_contratacion: empleadoData.fecha_contratacion || new Date(),
        activo: true
      });

      return nuevoEmpleado;
    } catch (error) {
      throw error;
    }
  }

  async obtenerEmpleados(filtros = {}) {
    try {
      const where = {};
      
      if (filtros.activo !== undefined) {
        where.activo = filtros.activo;
      }

      if (filtros.puesto) {
        where.puesto = filtros.puesto;
      }

      const empleados = await Empleado.findAll({
        where,
        order: [['fecha_contratacion', 'DESC']]
      });

      return empleados;
    } catch (error) {
      throw error;
    }
  }

  async obtenerEmpleadoPorId(id) {
    try {
      const empleado = await Empleado.findByPk(id);

      if (!empleado) {
        throw new Error('Empleado no encontrado');
      }

      return empleado;
    } catch (error) {
      throw error;
    }
  }

  async obtenerEmpleadoPorEmail(email) {
    try {
      const empleado = await Empleado.findOne({
        where: { email }
      });

      return empleado;
    } catch (error) {
      throw error;
    }
  }

  async obtenerEmpleadosPorPuesto(puesto) {
    try {
      const empleados = await Empleado.findAll({
        where: { 
          puesto,
          activo: true 
        },
        order: [['nombre', 'ASC']]
      });

      return empleados;
    } catch (error) {
      throw error;
    }
  }

  async actualizarEmpleado(id, datosActualizados) {
    try {
      const empleado = await Empleado.findByPk(id);

      if (!empleado) {
        throw new Error('Empleado no encontrado');
      }

      await empleado.update(datosActualizados);

      return empleado;
    } catch (error) {
      throw error;
    }
  }

  async actualizarSalario(id, nuevoSalario) {
    try {
      const empleado = await Empleado.findByPk(id);

      if (!empleado) {
        throw new Error('Empleado no encontrado');
      }

      if (nuevoSalario < 0) {
        throw new Error('El salario debe ser mayor o igual a 0');
      }

      await empleado.update({ salario: nuevoSalario });

      return empleado;
    } catch (error) {
      throw error;
    }
  }

  async eliminarEmpleado(id) {
    try {
      const empleado = await Empleado.findByPk(id);

      if (!empleado) {
        throw new Error('Empleado no encontrado');
      }

      // Soft delete: cambiar el estado a inactivo
      await empleado.update({ activo: false });

      return { mensaje: 'Empleado desactivado exitosamente' };
    } catch (error) {
      throw error;
    }
  }

  async eliminarEmpleadoPermanente(id) {
    try {
      const empleado = await Empleado.findByPk(id);

      if (!empleado) {
        throw new Error('Empleado no encontrado');
      }

      await empleado.destroy();

      return { mensaje: 'Empleado eliminado permanentemente' };
    } catch (error) {
      throw error;
    }
  }

  async reactivarEmpleado(id) {
    try {
      const empleado = await Empleado.findByPk(id);

      if (!empleado) {
        throw new Error('Empleado no encontrado');
      }

      await empleado.update({ activo: true });

      return empleado;
    } catch (error) {
      throw error;
    }
  }

  async obtenerEstadisticas() {
    try {
      const totalEmpleados = await Empleado.count();
      const empleadosActivos = await Empleado.count({ where: { activo: true } });
      const empleadosInactivos = await Empleado.count({ where: { activo: false } });

      // Contar por puesto
      const empleadosPorPuesto = await Empleado.findAll({
        attributes: [
          'puesto',
          [sequelize.fn('COUNT', sequelize.col('id_empleado')), 'total']
        ],
        where: { activo: true },
        group: ['puesto']
      });

      return {
        totalEmpleados,
        empleadosActivos,
        empleadosInactivos,
        empleadosPorPuesto
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new EmpleadoService();
