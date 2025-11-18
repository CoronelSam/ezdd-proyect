const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pedido = sequelize.define('Pedido', {
  id_pedido: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  id_cliente: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'clientes',
      key: 'id_cliente'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  },
  id_empleado: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'empleados',
      key: 'id_empleado'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  },
  fecha_pedido: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'en_preparacion', 'listo', 'entregado', 'cancelado'),
    allowNull: false,
    defaultValue: 'pendiente',
    validate: {
      notEmpty: {
        msg: 'El estado es requerido'
      }
    }
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      isDecimal: {
        msg: 'El total debe ser un número decimal'
      },
      min: {
        args: [0],
        msg: 'El total debe ser mayor o igual a 0'
      }
    }
  },
  notas: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'pedidos',
  timestamps: true,
  createdAt: 'creado_en',
  updatedAt: 'actualizado_en',
  indexes: [
    {
      fields: ['id_cliente']
    },
    {
      fields: ['id_empleado']
    },
    {
      fields: ['estado']
    },
    {
      fields: ['fecha_pedido']
    }
  ]
});

Pedido.associate = (models) => {
  Pedido.belongsTo(models.Cliente, {
    foreignKey: 'id_cliente',
    as: 'cliente'
  });

  Pedido.belongsTo(models.Empleado, {
    foreignKey: 'id_empleado',
    as: 'empleado'
  });

  Pedido.hasMany(models.DetallePedido, {
    foreignKey: 'id_pedido',
    as: 'detalles'
  });
};

module.exports = Pedido;