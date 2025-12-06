const UsuarioSistema = require('../models/UsuarioSistemaModel');
const Empleado = require('../models/EmpleadoModel');
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');

class UsuarioSistemaService {
  
  async crearUsuario(data) {
    try {
      const empleado = await Empleado.findByPk(data.empleado_id);
      
      if (!empleado) {
        throw new Error('Empleado no encontrado');
      }

      if (!empleado.activo) {
        throw new Error('El empleado no está activo');
      }

      const usuarioExistente = await UsuarioSistema.findOne({
        where: { empleado_id: data.empleado_id }
      });

      if (usuarioExistente) {
        throw new Error('Este empleado ya tiene un usuario del sistema');
      }

      const nuevoUsuario = await UsuarioSistema.create({
        empleado_id: data.empleado_id,
        username: data.username,
        password_hash: data.password || data.password_hash,
        rol: data.rol,
        activo: true
      });

      return await this.obtenerUsuarioPorId(nuevoUsuario.usuario_id);
    } catch (error) {
      throw error;
    }
  }

  async obtenerUsuarios(filtros = {}) {
    try {
      const where = {};

      if (filtros.activo !== undefined) {
        where.activo = filtros.activo;
      }

      if (filtros.rol) {
        where.rol = filtros.rol;
      }

      if (filtros.username) {
        where.username = {
          [Op.like]: `%${filtros.username}%`
        };
      }

      const usuarios = await UsuarioSistema.findAll({
        where,
        include: [
          {
            model: Empleado,
            as: 'empleado',
            attributes: ['id_empleado', 'nombre', 'email', 'puesto', 'activo']
          }
        ],
        attributes: { exclude: ['password_hash'] },
        order: [['fecha_creacion', 'DESC']]
      });

      return usuarios;
    } catch (error) {
      throw error;
    }
  }

  async obtenerUsuarioPorId(id) {
    try {
      const usuario = await UsuarioSistema.findByPk(id, {
        include: [
          {
            model: Empleado,
            as: 'empleado',
            attributes: ['id_empleado', 'nombre', 'email', 'telefono', 'puesto', 'activo']
          }
        ],
        attributes: { exclude: ['password_hash'] }
      });

      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }

      return usuario;
    } catch (error) {
      throw error;
    }
  }

  async obtenerUsuarioPorUsername(username) {
    try {
      const usuario = await UsuarioSistema.findOne({
        where: { username },
        include: [
          {
            model: Empleado,
            as: 'empleado',
            attributes: ['id_empleado', 'nombre', 'email', 'puesto', 'activo']
          }
        ]
      });

      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }

      return usuario;
    } catch (error) {
      throw error;
    }
  }

  async actualizarUsuario(id, data) {
    try {
      const usuario = await UsuarioSistema.findByPk(id);

      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }

      // Si se actualiza el empleado, verificar que exista y esté activo
      if (data.empleado_id && data.empleado_id !== usuario.empleado_id) {
        const empleado = await Empleado.findByPk(data.empleado_id);
        
        if (!empleado) {
          throw new Error('Empleado no encontrado');
        }

        if (!empleado.activo) {
          throw new Error('El empleado no está activo');
        }

        // Verificar que el nuevo empleado no tenga ya un usuario
        const usuarioExistente = await UsuarioSistema.findOne({
          where: { 
            empleado_id: data.empleado_id,
            usuario_id: { [Op.ne]: id }
          }
        });

        if (usuarioExistente) {
          throw new Error('Este empleado ya tiene un usuario del sistema');
        }
      }

      // Preparar datos para actualizar
      const datosActualizar = {};

      if (data.username) datosActualizar.username = data.username;
      if (data.rol) datosActualizar.rol = data.rol;
      if (data.empleado_id) datosActualizar.empleado_id = data.empleado_id;
      if (data.activo !== undefined) datosActualizar.activo = data.activo;
      
      // Permitir actualización de contraseña si se proporciona
      if (data.password && data.password.trim().length > 0) {
        datosActualizar.password_hash = data.password;
      }

      await usuario.update(datosActualizar);

      return await this.obtenerUsuarioPorId(id);
    } catch (error) {
      throw error;
    }
  }

  async cambiarPassword(id, passwordActual, passwordNuevo) {
    try {
      const usuario = await UsuarioSistema.findByPk(id);

      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }

      // Verificar la contraseña actual
      const esValida = await usuario.verificarPassword(passwordActual);

      if (!esValida) {
        throw new Error('La contraseña actual es incorrecta');
      }

      // Actualizar la contraseña (se hasheará automáticamente)
      await usuario.update({ password_hash: passwordNuevo });

      return { mensaje: 'Contraseña actualizada exitosamente' };
    } catch (error) {
      throw error;
    }
  }

  async desactivarUsuario(id) {
    try {
      const usuario = await UsuarioSistema.findByPk(id);

      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }

      await usuario.update({ activo: false });

      return await this.obtenerUsuarioPorId(id);
    } catch (error) {
      throw error;
    }
  }

  async reactivarUsuario(id) {
    try {
      const usuario = await UsuarioSistema.findByPk(id);

      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }

      // Verificar que el empleado asociado esté activo
      const empleado = await Empleado.findByPk(usuario.empleado_id);

      if (!empleado || !empleado.activo) {
        throw new Error('No se puede reactivar el usuario porque el empleado está inactivo');
      }

      await usuario.update({ activo: true });

      return await this.obtenerUsuarioPorId(id);
    } catch (error) {
      throw error;
    }
  }

  async eliminarUsuario(id) {
    try {
      const usuario = await UsuarioSistema.findByPk(id);

      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }

      await usuario.destroy();

      return { mensaje: 'Usuario eliminado exitosamente' };
    } catch (error) {
      throw error;
    }
  }

  async login(username, password) {
    try {
      // Buscar usuario con password_hash incluido
      const usuario = await UsuarioSistema.findOne({
        where: { username },
        include: [
          {
            model: Empleado,
            as: 'empleado',
            attributes: ['id_empleado', 'nombre', 'email', 'puesto', 'activo']
          }
        ]
      });

      if (!usuario) {
        throw new Error('Credenciales inválidas');
      }

      if (!usuario.activo) {
        throw new Error('Usuario inactivo');
      }

      if (!usuario.empleado.activo) {
        throw new Error('Empleado inactivo');
      }

      // Verificar contraseña
      const esValida = await usuario.verificarPassword(password);

      if (!esValida) {
        throw new Error('Credenciales inválidas');
      }

      // Actualizar último login
      await usuario.update({ ultimo_login: new Date() });

      // Generar token JWT
      const token = jwt.sign(
        {
          usuario_id: usuario.usuario_id,
          username: usuario.username,
          rol: usuario.rol,
          empleado_id: usuario.empleado_id
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
      );

      return {
        token,
        usuario: {
          usuario_id: usuario.usuario_id,
          username: usuario.username,
          rol: usuario.rol,
          empleado: usuario.empleado,
          ultimo_login: usuario.ultimo_login
        }
      };
    } catch (error) {
      throw error;
    }
  }

  async obtenerEstadisticas() {
    try {
      const total = await UsuarioSistema.count();
      const activos = await UsuarioSistema.count({ where: { activo: true } });
      const inactivos = await UsuarioSistema.count({ where: { activo: false } });

      const porRol = await UsuarioSistema.findAll({
        attributes: [
          'rol',
          [UsuarioSistema.sequelize.fn('COUNT', UsuarioSistema.sequelize.col('usuario_id')), 'cantidad']
        ],
        group: ['rol']
      });

      return {
        total_usuarios: total,
        usuarios_activos: activos,
        usuarios_inactivos: inactivos,
        por_rol: porRol
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new UsuarioSistemaService();
