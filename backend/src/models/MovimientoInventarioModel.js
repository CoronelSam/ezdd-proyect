const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MovimientoInventario = sequelize.define('MovimientoInventario', {
  id_movimiento: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  id_ingrediente: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'ingredientes',
      key: 'id_ingrediente'
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT'
  },
  tipo_movimiento: {
    type: DataTypes.ENUM('entrada', 'salida', 'ajuste', 'merma'),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El tipo de movimiento es requerido'
      }
    }
  },
  cantidad: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: false,
    validate: {
      isDecimal: {
        msg: 'La cantidad debe ser un número decimal'
      },
      min: {
        args: [0.001],
        msg: 'La cantidad debe ser mayor a 0'
      }
    }
  },
  fecha_movimiento: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  id_pedido: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'pedidos',
      key: 'id_pedido'
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
  notas: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'movimientos_inventario',
  timestamps: true,
  createdAt: 'creado_en',
  updatedAt: 'actualizado_en',
  indexes: [
    {
      fields: ['id_ingrediente']
    },
    {
      fields: ['tipo_movimiento']
    },
    {
      fields: ['fecha_movimiento']
    },
    {
      fields: ['id_pedido']
    },
    {
      fields: ['id_empleado']
    }
  ]
});

MovimientoInventario.associate = (models) => {
  MovimientoInventario.belongsTo(models.Ingrediente, {
    foreignKey: 'id_ingrediente',
    as: 'ingrediente'
  });

  MovimientoInventario.belongsTo(models.Pedido, {
    foreignKey: 'id_pedido',
    as: 'pedido'
  });

  MovimientoInventario.belongsTo(models.Empleado, {
    foreignKey: 'id_empleado',
    as: 'empleado'
  });
};

module.exports = MovimientoInventario;
