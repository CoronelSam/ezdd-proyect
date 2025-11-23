const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Empleado = sequelize.define('Empleado', {
  id_empleado: {
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
  puesto: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El puesto es requerido'
      },
      isIn: {
        args: [['Gerente', 'Chef', 'Mesero', 'Cajero', 'Cocinero', 'Bartender', 'Ayudante de Cocina', 'Recepcionista']],
        msg: 'El puesto debe ser uno de los valores permitidos'
      }
    }
  },
  fecha_contratacion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    validate: {
      isDate: {
        msg: 'Debe proporcionar una fecha válida'
      }
    }
  },
  salario: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El salario es requerido'
      },
      isDecimal: {
        msg: 'El salario debe ser un número válido'
      },
      min: {
        args: [0],
        msg: 'El salario debe ser mayor o igual a 0'
      }
    }
  },
  activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'empleados',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['email']
    },
    {
      fields: ['activo']
    },
    {
      fields: ['puesto']
    }
  ]
});

Empleado.associate = (models) => {
  Empleado.hasMany(models.Pedido, {
    foreignKey: 'id_empleado',
    as: 'pedidos'
  });
  
  Empleado.hasMany(models.MovimientoInventario, {
    foreignKey: 'id_empleado',
    as: 'movimientos_inventario'
  });
  
  Empleado.hasOne(models.UsuarioSistema, {
    foreignKey: 'empleado_id',
    as: 'usuario_sistema',
    onDelete: 'CASCADE'
  });
};

module.exports = Empleado;
