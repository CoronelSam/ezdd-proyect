const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CategoriaProducto = sequelize.define('CategoriaProducto', {
  id_categoria: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  nombre: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: {
      msg: 'Este nombre de categoría ya existe'
    },
    validate: {
      notEmpty: {
        msg: 'El nombre es requerido'
      },
      len: {
        args: [2, 50],
        msg: 'El nombre debe tener entre 2 y 50 caracteres'
      }
    }
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  activa: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'categoria_productos',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['nombre']
    },
    {
      fields: ['activa']
    }
  ]
});

module.exports = CategoriaProducto;
