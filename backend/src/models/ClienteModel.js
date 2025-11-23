const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const Cliente = sequelize.define('Cliente', {
  id_cliente: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El nombre es requerido'
      },
      len: {
        args: [2, 100],
        msg: 'El nombre debe tener entre 2 y 100 caracteres'
      }
    }
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      is: {
        args: /^[0-9+\-\s()]*$/,
        msg: 'El teléfono debe contener solo números y símbolos válidos'
      }
    }
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: {
      msg: 'Este email ya está registrado'
    },
    validate: {
      notEmpty: {
        msg: 'El email es requerido'
      },
      isEmail: {
        msg: 'Debe proporcionar un email válido'
      }
    }
  },
  clave: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'La clave es requerida'
      }
    }
  },
  fecha_registro: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'clientes',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['email']
    },
    {
      fields: ['activo']
    }
  ]
});

Cliente.beforeCreate(async (cliente) => {
  if (cliente.clave) {
    const salt = await bcrypt.genSalt(10);
    cliente.clave = await bcrypt.hash(cliente.clave, salt);
  }
});

Cliente.beforeUpdate(async (cliente) => {
  if (cliente.changed('clave')) {
    const salt = await bcrypt.genSalt(10);
    cliente.clave = await bcrypt.hash(cliente.clave, salt);
  }
});

Cliente.prototype.verificarClave = async function(claveIngresada) {
  return await bcrypt.compare(claveIngresada, this.clave);
};

Cliente.associate = (models) => {
  Cliente.hasMany(models.Pedido, {
    foreignKey: 'id_cliente',
    as: 'pedidos'
  });
};

module.exports = Cliente;
