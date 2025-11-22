const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PrecioProducto = sequelize.define('PrecioProducto', {
  id_precio: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  id_producto: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'productos',
      key: 'id_producto'
    },
    validate: {
      notEmpty: {
        msg: 'El producto es requerido'
      }
    }
  },
  nombre_presentacion: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El nombre de la presentación es requerido'
      },
      len: {
        args: [2, 100],
        msg: 'El nombre debe tener entre 2 y 100 caracteres'
      }
    }
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  precio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El precio es requerido'
      },
      isDecimal: {
        msg: 'El precio debe ser un número válido'
      },
      min: {
        args: [0],
        msg: 'El precio debe ser mayor o igual a 0'
      }
    }
  },
  es_default: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Indica si este es el precio por defecto del producto'
  },
  activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'precio_productos',
  timestamps: true,
  createdAt: 'creado_en',
  updatedAt: 'actualizado_en',
  indexes: [
    {
      fields: ['id_producto']
    },
    {
      fields: ['activo']
    },
    {
      fields: ['id_producto', 'activo']
    },
    {
      fields: ['es_default']
    },
    {
      fields: ['id_producto', 'es_default']
    }
  ]
});

module.exports = PrecioProducto;
