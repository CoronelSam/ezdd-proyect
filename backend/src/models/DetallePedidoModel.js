const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DetallePedido = sequelize.define('DetallePedido', {
  id_detalle: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  id_pedido: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'pedidos',
      key: 'id_pedido'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  id_producto: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'productos',
      key: 'id_producto'
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT'
  },
  id_precio: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'precio_productos',
      key: 'id_precio'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      isInt: {
        msg: 'La cantidad debe ser un número entero'
      },
      min: {
        args: [1],
        msg: 'La cantidad debe ser mayor a 0'
      }
    }
  },
  precio_unitario: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      isDecimal: {
        msg: 'El precio unitario debe ser un número decimal'
      },
      min: {
        args: [0],
        msg: 'El precio unitario debe ser mayor o igual a 0'
      }
    }
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      isDecimal: {
        msg: 'El subtotal debe ser un número decimal'
      },
      min: {
        args: [0],
        msg: 'El subtotal debe ser mayor o igual a 0'
      }
    }
  },
  instrucciones_especiales: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'detalle_pedidos',
  timestamps: true,
  createdAt: 'creado_en',
  updatedAt: 'actualizado_en',
  indexes: [
    {
      fields: ['id_pedido']
    },
    {
      fields: ['id_producto']
    }
  ]
});

DetallePedido.associate = (models) => {
  // Un detalle pertenece a un pedido
  DetallePedido.belongsTo(models.Pedido, {
    foreignKey: 'id_pedido',
    as: 'pedido'
  });

  // Un detalle pertenece a un producto
  DetallePedido.belongsTo(models.Producto, {
    foreignKey: 'id_producto',
    as: 'producto'
  });

  // Un detalle pertenece a un precio de producto
  DetallePedido.belongsTo(models.PrecioProducto, {
    foreignKey: 'id_precio',
    as: 'precioProducto'
  });
};

module.exports = DetallePedido;
