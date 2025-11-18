const Cliente = require('../models/ClienteModel');
const bcrypt = require('bcryptjs');

class ClienteService {
  
  async crearCliente(clienteData) {
    try {
      // Encriptar la contraseña antes de guardar
      const salt = await bcrypt.genSalt(10);
      const claveEncriptada = await bcrypt.hash(clienteData.clave, salt);

      const nuevoCliente = await Cliente.create({
        ...clienteData,
        clave: claveEncriptada,
        fecha_registro: new Date(),
        activo: true
      });

      // Retornar el cliente sin la contraseña
      const clienteSinClave = nuevoCliente.toJSON();
      delete clienteSinClave.clave;
      
      return clienteSinClave;
    } catch (error) {
      throw error;
    }
  }

  async obtenerClientes(filtros = {}) {
    try {
      const where = {};
      
      if (filtros.activo !== undefined) {
        where.activo = filtros.activo;
      }

      const clientes = await Cliente.findAll({
        where,
        attributes: { exclude: ['clave'] },
        order: [['fecha_registro', 'DESC']]
      });

      return clientes;
    } catch (error) {
      throw error;
    }
  }

  async obtenerClientePorId(id) {
    try {
      const cliente = await Cliente.findByPk(id, {
        attributes: { exclude: ['clave'] }
      });

      if (!cliente) {
        throw new Error('Cliente no encontrado');
      }

      return cliente;
    } catch (error) {
      throw error;
    }
  }

  async obtenerClientePorEmail(email) {
    try {
      const cliente = await Cliente.findOne({
        where: { email }
      });

      return cliente;
    } catch (error) {
      throw error;
    }
  }

  async actualizarCliente(id, datosActualizados) {
    try {
      const cliente = await Cliente.findByPk(id);

      if (!cliente) {
        throw new Error('Cliente no encontrado');
      }

      // Si se actualiza la contraseña, encriptarla
      if (datosActualizados.clave) {
        const salt = await bcrypt.genSalt(10);
        datosActualizados.clave = await bcrypt.hash(datosActualizados.clave, salt);
      }

      await cliente.update(datosActualizados);

      // Retornar el cliente sin la contraseña
      const clienteActualizado = cliente.toJSON();
      delete clienteActualizado.clave;

      return clienteActualizado;
    } catch (error) {
      throw error;
    }
  }

  async eliminarCliente(id) {
    try {
      const cliente = await Cliente.findByPk(id);

      if (!cliente) {
        throw new Error('Cliente no encontrado');
      }

      await cliente.update({ activo: false });

      return { mensaje: 'Cliente desactivado exitosamente' };
    } catch (error) {
      throw error;
    }
  }

  async eliminarClientePermanente(id) {
    try {
      const cliente = await Cliente.findByPk(id);

      if (!cliente) {
        throw new Error('Cliente no encontrado');
      }

      await cliente.destroy();

      return { mensaje: 'Cliente eliminado permanentemente' };
    } catch (error) {
      throw error;
    }
  }

  async verificarCredenciales(email, clave) {
    try {
      const cliente = await this.obtenerClientePorEmail(email);

      if (!cliente) {
        throw new Error('Credenciales inválidas');
      }

      if (!cliente.activo) {
        throw new Error('Esta cuenta está inactiva');
      }

      const claveValida = await bcrypt.compare(clave, cliente.clave);

      if (!claveValida) {
        throw new Error('Credenciales inválidas');
      }

      // Retornar el cliente sin la contraseña
      const clienteSinClave = cliente.toJSON();
      delete clienteSinClave.clave;

      return clienteSinClave;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ClienteService();
