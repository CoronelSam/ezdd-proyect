const EmpleadoService = require('../services/EmpleadoService');
const { validationResult } = require('express-validator');

class EmpleadoController {

  async crear(req, res) {
    try {
      // Validar errores de express-validator
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Errores de validación', 
          detalles: errors.array() 
        });
      }

      const nuevoEmpleado = await EmpleadoService.crearEmpleado(req.body);
      
      res.status(201).json({
        mensaje: 'Empleado creado exitosamente',
        empleado: nuevoEmpleado
      });
    } catch (error) {
      console.error('Error al crear empleado:', error);
      
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ 
          error: 'El email ya está registrado' 
        });
      }
      
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ 
          error: 'Errores de validación', 
          detalles: error.errors.map(e => e.message) 
        });
      }

      res.status(500).json({ 
        error: 'Error al crear el empleado',
        mensaje: error.message 
      });
    }
  }

  async obtenerTodos(req, res) {
    try {
      const filtros = {
        activo: req.query.activo !== undefined ? req.query.activo === 'true' : undefined,
        puesto: req.query.puesto
      };

      const empleados = await EmpleadoService.obtenerEmpleados(filtros);
      
      res.status(200).json({
        total: empleados.length,
        empleados
      });
    } catch (error) {
      console.error('Error al obtener empleados:', error);
      res.status(500).json({ 
        error: 'Error al obtener los empleados',
        mensaje: error.message 
      });
    }
  }

  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      const empleado = await EmpleadoService.obtenerEmpleadoPorId(id);
      
      res.status(200).json({
        empleado
      });
    } catch (error) {
      console.error('Error al obtener empleado:', error);
      
      if (error.message === 'Empleado no encontrado') {
        return res.status(404).json({ 
          error: 'Empleado no encontrado' 
        });
      }

      res.status(500).json({ 
        error: 'Error al obtener el empleado',
        mensaje: error.message 
      });
    }
  }

  async obtenerPorEmail(req, res) {
    try {
      const { email } = req.params;
      const empleado = await EmpleadoService.obtenerEmpleadoPorEmail(email);
      
      if (!empleado) {
        return res.status(404).json({ 
          error: 'Empleado no encontrado' 
        });
      }
      
      res.status(200).json({
        empleado
      });
    } catch (error) {
      console.error('Error al obtener empleado:', error);
      res.status(500).json({ 
        error: 'Error al obtener el empleado',
        mensaje: error.message 
      });
    }
  }

  async obtenerPorPuesto(req, res) {
    try {
      const { puesto } = req.params;
      const empleados = await EmpleadoService.obtenerEmpleadosPorPuesto(puesto);
      
      res.status(200).json({
        total: empleados.length,
        empleados
      });
    } catch (error) {
      console.error('Error al obtener empleados:', error);
      res.status(500).json({ 
        error: 'Error al obtener los empleados',
        mensaje: error.message 
      });
    }
  }

  async actualizar(req, res) {
    try {
      // Validar errores de express-validator
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Errores de validación', 
          detalles: errors.array() 
        });
      }

      const { id } = req.params;
      const empleadoActualizado = await EmpleadoService.actualizarEmpleado(id, req.body);
      
      res.status(200).json({
        mensaje: 'Empleado actualizado exitosamente',
        empleado: empleadoActualizado
      });
    } catch (error) {
      console.error('Error al actualizar empleado:', error);
      
      if (error.message === 'Empleado no encontrado') {
        return res.status(404).json({ 
          error: 'Empleado no encontrado' 
        });
      }

      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ 
          error: 'El email ya está registrado' 
        });
      }
      
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ 
          error: 'Errores de validación', 
          detalles: error.errors.map(e => e.message) 
        });
      }

      res.status(500).json({ 
        error: 'Error al actualizar el empleado',
        mensaje: error.message 
      });
    }
  }

  async actualizarSalario(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Errores de validación', 
          detalles: errors.array() 
        });
      }

      const { id } = req.params;
      const { salario } = req.body;
      const empleadoActualizado = await EmpleadoService.actualizarSalario(id, salario);
      
      res.status(200).json({
        mensaje: 'Salario actualizado exitosamente',
        empleado: empleadoActualizado
      });
    } catch (error) {
      console.error('Error al actualizar salario:', error);
      
      if (error.message === 'Empleado no encontrado') {
        return res.status(404).json({ 
          error: 'Empleado no encontrado' 
        });
      }

      if (error.message === 'El salario debe ser mayor o igual a 0') {
        return res.status(400).json({ 
          error: error.message 
        });
      }

      res.status(500).json({ 
        error: 'Error al actualizar el salario',
        mensaje: error.message 
      });
    }
  }

  async eliminar(req, res) {
    try {
      const { id } = req.params;
      const resultado = await EmpleadoService.eliminarEmpleado(id);
      
      res.status(200).json(resultado);
    } catch (error) {
      console.error('Error al eliminar empleado:', error);
      
      if (error.message === 'Empleado no encontrado') {
        return res.status(404).json({ 
          error: 'Empleado no encontrado' 
        });
      }

      res.status(500).json({ 
        error: 'Error al eliminar el empleado',
        mensaje: error.message 
      });
    }
  }

  async eliminarPermanente(req, res) {
    try {
      const { id } = req.params;
      const resultado = await EmpleadoService.eliminarEmpleadoPermanente(id);
      
      res.status(200).json(resultado);
    } catch (error) {
      console.error('Error al eliminar empleado:', error);
      
      if (error.message === 'Empleado no encontrado') {
        return res.status(404).json({ 
          error: 'Empleado no encontrado' 
        });
      }

      res.status(500).json({ 
        error: 'Error al eliminar el empleado permanentemente',
        mensaje: error.message 
      });
    }
  }

  async desactivar(req, res) {
    try {
      const { id } = req.params;
      const empleadoDesactivado = await EmpleadoService.desactivarEmpleado(id);
      
      res.status(200).json({
        mensaje: 'Empleado desactivado exitosamente',
        empleado: empleadoDesactivado
      });
    } catch (error) {
      console.error('Error al desactivar empleado:', error);
      
      if (error.message === 'Empleado no encontrado') {
        return res.status(404).json({ 
          error: 'Empleado no encontrado' 
        });
      }

      res.status(500).json({ 
        error: 'Error al desactivar el empleado',
        mensaje: error.message 
      });
    }
  }

  async reactivar(req, res) {
    try {
      const { id } = req.params;
      const empleadoReactivado = await EmpleadoService.reactivarEmpleado(id);
      
      res.status(200).json({
        mensaje: 'Empleado reactivado exitosamente',
        empleado: empleadoReactivado
      });
    } catch (error) {
      console.error('Error al reactivar empleado:', error);
      
      if (error.message === 'Empleado no encontrado') {
        return res.status(404).json({ 
          error: 'Empleado no encontrado' 
        });
      }

      res.status(500).json({ 
        error: 'Error al reactivar el empleado',
        mensaje: error.message 
      });
    }
  }

  async obtenerEstadisticas(req, res) {
    try {
      const estadisticas = await EmpleadoService.obtenerEstadisticas();
      
      res.status(200).json({
        estadisticas
      });
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({ 
        error: 'Error al obtener las estadísticas',
        mensaje: error.message 
      });
    }
  }
}

module.exports = new EmpleadoController();
