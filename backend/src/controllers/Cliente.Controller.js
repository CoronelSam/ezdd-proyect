const ClienteService = require('../services/ClienteService');
const { validationResult } = require('express-validator');

class ClienteController {
  async crear(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Errores de validación', 
          detalles: errors.array() 
        });
      }

      const nuevoCliente = await ClienteService.crearCliente(req.body);
      
      res.status(201).json({
        mensaje: 'Cliente creado exitosamente',
        cliente: nuevoCliente
      });
    } catch (error) {
      console.error('Error al crear cliente:', error);
      
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
        error: 'Error al crear el cliente',
        mensaje: error.message 
      });
    }
  }

  async obtenerTodos(req, res) {
    try {
      const filtros = {
        activo: req.query.activo !== undefined ? req.query.activo === 'true' : undefined
      };

      const clientes = await ClienteService.obtenerClientes(filtros);
      
      res.status(200).json({
        total: clientes.length,
        clientes
      });
    } catch (error) {
      console.error('Error al obtener clientes:', error);
      res.status(500).json({ 
        error: 'Error al obtener los clientes',
        mensaje: error.message 
      });
    }
  }

  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      const cliente = await ClienteService.obtenerClientePorId(id);
      
      res.status(200).json({
        cliente
      });
    } catch (error) {
      console.error('Error al obtener cliente:', error);
      
      if (error.message === 'Cliente no encontrado') {
        return res.status(404).json({ 
          error: 'Cliente no encontrado' 
        });
      }

      res.status(500).json({ 
        error: 'Error al obtener el cliente',
        mensaje: error.message 
      });
    }
  }

  async obtenerPorEmail(req, res) {
    try {
      const { email } = req.params;
      const cliente = await ClienteService.obtenerClientePorEmail(email);
      
      if (!cliente) {
        return res.status(404).json({ 
          error: 'Cliente no encontrado' 
        });
      }

      // No enviar la contraseña
      const clienteSinClave = cliente.toJSON();
      delete clienteSinClave.clave;
      
      res.status(200).json({
        cliente: clienteSinClave
      });
    } catch (error) {
      console.error('Error al obtener cliente:', error);
      res.status(500).json({ 
        error: 'Error al obtener el cliente',
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
      const clienteActualizado = await ClienteService.actualizarCliente(id, req.body);
      
      res.status(200).json({
        mensaje: 'Cliente actualizado exitosamente',
        cliente: clienteActualizado
      });
    } catch (error) {
      console.error('Error al actualizar cliente:', error);
      
      if (error.message === 'Cliente no encontrado') {
        return res.status(404).json({ 
          error: 'Cliente no encontrado' 
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
        error: 'Error al actualizar el cliente',
        mensaje: error.message 
      });
    }
  }

  async eliminar(req, res) {
    try {
      const { id } = req.params;
      const resultado = await ClienteService.eliminarCliente(id);
      
      res.status(200).json(resultado);
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      
      if (error.message === 'Cliente no encontrado') {
        return res.status(404).json({ 
          error: 'Cliente no encontrado' 
        });
      }

      res.status(500).json({ 
        error: 'Error al eliminar el cliente',
        mensaje: error.message 
      });
    }
  }

  async eliminarPermanente(req, res) {
    try {
      const { id } = req.params;
      const resultado = await ClienteService.eliminarClientePermanente(id);
      
      res.status(200).json(resultado);
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      
      if (error.message === 'Cliente no encontrado') {
        return res.status(404).json({ 
          error: 'Cliente no encontrado' 
        });
      }

      res.status(500).json({ 
        error: 'Error al eliminar el cliente permanentemente',
        mensaje: error.message 
      });
    }
  }

  async cambiarClave(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Errores de validación', 
          detalles: errors.array() 
        });
      }

      // Si viene de autenticarCliente, usar req.cliente.id_cliente
      // Si viene de admin, usar req.params.id
      const id = req.cliente ? req.cliente.id_cliente : req.params.id;
      
      // Soportar tanto camelCase (desde perfil) como snake_case (desde admin)
      const clave_actual = req.body.claveActual || req.body.clave_actual;
      const clave_nueva = req.body.claveNueva || req.body.clave_nueva;

      const resultado = await ClienteService.cambiarClave(id, clave_actual, clave_nueva);
      
      res.status(200).json(resultado);
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      
      if (error.message === 'Cliente no encontrado') {
        return res.status(404).json({ error: 'Cliente no encontrado' });
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

  async reactivar(req, res) {
    try {
      const { id } = req.params;
      const resultado = await ClienteService.reactivarCliente(id);
      
      res.status(200).json(resultado);
    } catch (error) {
      console.error('Error al reactivar cliente:', error);
      
      if (error.message === 'Cliente no encontrado') {
        return res.status(404).json({ error: 'Cliente no encontrado' });
      }

      res.status(500).json({ 
        error: 'Error al reactivar el cliente',
        mensaje: error.message 
      });
    }
  }

  async obtenerEstadisticas(req, res) {
    try {
      const estadisticas = await ClienteService.obtenerEstadisticas();
      
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

  async login(req, res) {
    try {
      // Validar errores de express-validator
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Errores de validación', 
          detalles: errors.array() 
        });
      }

      const { email, clave } = req.body;
      const resultado = await ClienteService.autenticarCliente(email, clave);
      
      res.status(200).json({
        mensaje: 'Login exitoso',
        token: resultado.token,
        refreshToken: resultado.refreshToken,
        cliente: resultado.cliente
      });
    } catch (error) {
      console.error('Error en login:', error);
      
      if (error.message === 'Credenciales inválidas' || error.message === 'Esta cuenta está inactiva') {
        return res.status(401).json({ 
          error: error.message 
        });
      }

      res.status(500).json({ 
        error: 'Error al iniciar sesión',
        mensaje: error.message 
      });
    }
  }

  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(400).json({
          error: 'Refresh token requerido'
        });
      }

      const resultado = await ClienteService.renovarToken(refreshToken);
      
      res.status(200).json({
        mensaje: 'Token renovado exitosamente',
        token: resultado.token,
        refreshToken: resultado.refreshToken
      });
    } catch (error) {
      console.error('Error al renovar token:', error);
      
      if (error.message === 'Refresh token inválido o expirado') {
        return res.status(401).json({ 
          error: error.message 
        });
      }

      res.status(500).json({ 
        error: 'Error al renovar el token',
        mensaje: error.message 
      });
    }
  }

  async obtenerPerfil(req, res) {
    try {
      // req.cliente viene del middleware autenticarCliente
      const cliente = await ClienteService.obtenerClientePorId(req.cliente.id_cliente);
      
      res.status(200).json({
        cliente
      });
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      res.status(500).json({ 
        error: 'Error al obtener el perfil',
        mensaje: error.message 
      });
    }
  }

  async actualizarPerfil(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Errores de validación', 
          detalles: errors.array() 
        });
      }

      // req.cliente viene del middleware autenticarCliente
      const clienteActualizado = await ClienteService.actualizarCliente(
        req.cliente.id_cliente, 
        req.body
      );
      
      res.status(200).json({
        mensaje: 'Perfil actualizado exitosamente',
        cliente: clienteActualizado
      });
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ 
          error: 'El email ya está registrado' 
        });
      }

      res.status(500).json({ 
        error: 'Error al actualizar el perfil',
        mensaje: error.message 
      });
    }
  }
}

module.exports = new ClienteController();
