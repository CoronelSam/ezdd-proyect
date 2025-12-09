const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const UsuarioSistema = sequelize.define('UsuarioSistema', {
  usuario_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'usuario_id'
  },
  empleado_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'empleados',
      key: 'id_empleado'
    },
    onDelete: 'CASCADE',
    field: 'empleado_id'
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      len: {
        args: [3, 50],
        msg: 'El username debe tener entre 3 y 50 caracteres'
      },
      notEmpty: {
        msg: 'El username no puede estar vacío'
      }
    }
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El password_hash no puede estar vacío'
      }
    }
  },
  rol: {
    type: DataTypes.ENUM('admin', 'gerente', 'cajero', 'mesero', 'cocinero'),
    allowNull: false,
    defaultValue: 'mesero',
    validate: {
      isIn: {
        args: [['admin', 'gerente', 'cajero', 'mesero', 'cocinero']],
        msg: 'El rol debe ser: admin, gerente, cajero, mesero o cocinero'
      }
    }
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'fecha_creacion'
  },
  ultimo_login: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'ultimo_login'
  },
  activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'usuarios_sistema',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['username']
    },
    {
      unique: true,
      fields: ['empleado_id']
    },
    {
      fields: ['rol']
    },
    {
      fields: ['activo']
    }
  ]
});

UsuarioSistema.beforeCreate(async (usuario) => {
  if (usuario.password_hash) {
    const salt = await bcrypt.genSalt(10);
    usuario.password_hash = await bcrypt.hash(usuario.password_hash, salt);
  }
});

UsuarioSistema.beforeUpdate(async (usuario) => {
  if (usuario.changed('password_hash')) {
    const salt = await bcrypt.genSalt(10);
    usuario.password_hash = await bcrypt.hash(usuario.password_hash, salt);
  }
});

UsuarioSistema.prototype.verificarPassword = async function(passwordIngresado) {
  return await bcrypt.compare(passwordIngresado, this.password_hash);
};

UsuarioSistema.associate = (models) => {
  UsuarioSistema.belongsTo(models.Empleado, {
    foreignKey: 'empleado_id',
    as: 'empleado',
    onDelete: 'CASCADE'
  });
};

module.exports = UsuarioSistema;
