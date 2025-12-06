const UsuarioSistemaService = require('../services/UsuarioSistemaService');
const { validationResult } = require('express-validator');

class UsuarioSistemaController {

  async crear(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Errores de validación', 
          detalles: errors.array() 
        });
      }

      const nuevoUsuario = await UsuarioSistemaService.crearUsuario(req.body);
      
      res.status(201).json({
        mensaje: 'Usuario creado exitosamente',
        usuario: nuevoUsuario
      });
    } catch (error) {
      console.error('Error al crear usuario:', error);
      
      if (error.message === 'Empleado no encontrado' ||
          error.message === 'El empleado no está activo' ||
          error.message === 'Este empleado ya tiene un usuario del sistema') {
        return res.status(400).json({ error: error.message });
      }

      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ 
          error: 'El username ya está en uso' 
        });
      }

      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ 
          error: 'Errores de validación', 
          detalles: error.errors.map(e => e.message) 
        });
      }

      res.status(500).json({ 
        error: 'Error al crear el usuario',
        mensaje: error.message 
      });
    }
  }

  async obtenerTodos(req, res) {
    try {
      const filtros = {
        activo: req.query.activo !== undefined ? req.query.activo === 'true' : undefined,
        rol: req.query.rol,
        username: req.query.username
      };

      const usuarios = await UsuarioSistemaService.obtenerUsuarios(filtros);
      
      res.status(200).json({
        total: usuarios.length,
        usuarios
      });
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      res.status(500).json({ 
        error: 'Error al obtener los usuarios',
        mensaje: error.message 
      });
    }
  }

  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      const usuario = await UsuarioSistemaService.obtenerUsuarioPorId(id);
      
      res.status(200).json({
        usuario
      });
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      
      if (error.message === 'Usuario no encontrado') {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      res.status(500).json({ 
        error: 'Error al obtener el usuario',
        mensaje: error.message 
      });
    }
  }

  async obtenerPorUsername(req, res) {
    try {
      const { username } = req.params;
      const usuario = await UsuarioSistemaService.obtenerUsuarioPorUsername(username);
      
      res.status(200).json({
        usuario
      });
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      
      if (error.message === 'Usuario no encontrado') {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      res.status(500).json({ 
        error: 'Error al obtener el usuario',
        mensaje: error.message 
      });
    }
  }

  async actualizar(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Errores de validación', 
          detalles: errors.array() 
        });
      }

      const { id } = req.params;
      const usuarioActualizado = await UsuarioSistemaService.actualizarUsuario(id, req.body);
      
      res.status(200).json({
        mensaje: 'Usuario actualizado exitosamente',
        usuario: usuarioActualizado
      });
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      
      if (error.message === 'Usuario no encontrado') {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      if (error.message === 'Empleado no encontrado' ||
          error.message === 'El empleado no está activo' ||
          error.message === 'Este empleado ya tiene un usuario del sistema') {
        return res.status(400).json({ error: error.message });
      }

      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ 
          error: 'El username ya está en uso' 
        });
      }

      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ 
          error: 'Errores de validación', 
          detalles: error.errors.map(e => e.message) 
        });
      }

      res.status(500).json({ 
        error: 'Error al actualizar el usuario',
        mensaje: error.message 
      });
    }
  }

  async cambiarPassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Errores de validación', 
          detalles: errors.array() 
        });
      }

      const { id } = req.params;
      const { password_actual, password_nuevo } = req.body;

      const resultado = await UsuarioSistemaService.cambiarPassword(
        id,
        password_actual,
        password_nuevo
      );
      
      res.status(200).json(resultado);
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      
      if (error.message === 'Usuario no encontrado') {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      if (error.message === 'La contraseña actual es incorrecta') {
        return res.status(400).json({ error: error.message });
      }

      res.status(500).json({ 
        error: 'Error al cambiar la contraseña',
        mensaje: error.message 
      });
    }
  }

  async desactivar(req, res) {
    try {
      const { id } = req.params;
      const usuario = await UsuarioSistemaService.desactivarUsuario(id);
      
      res.status(200).json({
        mensaje: 'Usuario desactivado exitosamente',
        usuario
      });
    } catch (error) {
      console.error('Error al desactivar usuario:', error);
      
      if (error.message === 'Usuario no encontrado') {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      res.status(500).json({ 
        error: 'Error al desactivar el usuario',
        mensaje: error.message 
      });
    }
  }

  async reactivar(req, res) {
    try {
      const { id } = req.params;
      const usuario = await UsuarioSistemaService.reactivarUsuario(id);
      
      res.status(200).json({
        mensaje: 'Usuario reactivado exitosamente',
        usuario
      });
    } catch (error) {
      console.error('Error al reactivar usuario:', error);
      
      if (error.message === 'Usuario no encontrado') {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      if (error.message === 'No se puede reactivar el usuario porque el empleado está inactivo') {
        return res.status(400).json({ error: error.message });
      }

      res.status(500).json({ 
        error: 'Error al reactivar el usuario',
        mensaje: error.message 
      });
    }
  }

  async eliminar(req, res) {
    try {
      const { id } = req.params;
      const resultado = await UsuarioSistemaService.eliminarUsuario(id);
      
      res.status(200).json(resultado);
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      
      if (error.message === 'Usuario no encontrado') {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      res.status(500).json({ 
        error: 'Error al eliminar el usuario',
        mensaje: error.message 
      });
    }
  }

  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Errores de validación', 
          detalles: errors.array() 
        });
      }

      const { username, password } = req.body;
      const resultado = await UsuarioSistemaService.login(username, password);
      
      res.status(200).json(resultado);
    } catch (error) {
      console.error('Error en login:', error);
      
      if (error.message === 'Credenciales inválidas' ||
          error.message === 'Usuario inactivo' ||
          error.message === 'Empleado inactivo') {
        return res.status(401).json({ error: error.message });
      }

      res.status(500).json({ 
        error: 'Error en el proceso de login',
        mensaje: error.message 
      });
    }
  }

  async obtenerEstadisticas(req, res) {
    try {
      const estadisticas = await UsuarioSistemaService.obtenerEstadisticas();
      
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

module.exports = new UsuarioSistemaController();
