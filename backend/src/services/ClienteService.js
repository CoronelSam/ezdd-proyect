const Cliente = require('../models/ClienteModel');
const { Pedido } = require('../models');
const bcrypt = require('bcryptjs');

class ClienteService {
  
  async crearCliente(clienteData) {
    try {
      const nuevoCliente = await Cliente.create({
        ...clienteData,
        fecha_registro: new Date(),
        activo: true
      });

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
        include: [
          {
            model: Pedido,
            as: 'pedidos',
            attributes: ['id_pedido', 'estado', 'total', 'fecha_pedido']
          }
        ],
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
        attributes: { exclude: ['clave'] },
        include: [
          {
            model: Pedido,
            as: 'pedidos',
            attributes: ['id_pedido', 'estado', 'total', 'fecha_pedido']
          }
        ]
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

      // El hook beforeUpdate se encargará de hashear la contraseña si cambió
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

  async cambiarClave(id, claveActual, claveNueva) {
    try {
      const cliente = await Cliente.findByPk(id);

      if (!cliente) {
        throw new Error('Cliente no encontrado');
      }

      // Verificar la contraseña actual
      const claveValida = await bcrypt.compare(claveActual, cliente.clave);

      if (!claveValida) {
        throw new Error('La contraseña actual es incorrecta');
      }

      // Actualizar con la nueva contraseña (el hook beforeUpdate la hasheará automáticamente)
      await cliente.update({ clave: claveNueva });

      return { mensaje: 'Contraseña actualizada exitosamente' };
    } catch (error) {
      throw error;
    }
  }

  async reactivarCliente(id) {
    try {
      const cliente = await Cliente.findByPk(id);

      if (!cliente) {
        throw new Error('Cliente no encontrado');
      }

      await cliente.update({ activo: true });

      return { mensaje: 'Cliente reactivado exitosamente' };
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

  async obtenerEstadisticas() {
    try {
      const total = await Cliente.count();
      const activos = await Cliente.count({ where: { activo: true } });
      const inactivos = await Cliente.count({ where: { activo: false } });

      return {
        total_clientes: total,
        clientes_activos: activos,
        clientes_inactivos: inactivos
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ClienteService();
