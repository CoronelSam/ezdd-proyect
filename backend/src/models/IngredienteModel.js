const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Ingrediente = sequelize.define('Ingrediente', {
  id_ingrediente: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: {
        msg: 'El nombre del ingrediente es requerido'
      },
      len: {
        args: [2, 100],
        msg: 'El nombre debe tener entre 2 y 100 caracteres'
      }
    }
  },
  unidad_medida: {
    type: DataTypes.ENUM('litro', 'pieza', 'libra', 'unidad', 'onza', 'ml', 'g', 'taza'),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'La unidad de medida es requerida'
      }
    }
  },
  precio_compra: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      isDecimal: {
        msg: 'El precio de compra debe ser un número decimal'
      },
      min: {
        args: [0],
        msg: 'El precio de compra debe ser mayor o igual a 0'
      }
    }
  },
  stock_minimo: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      isDecimal: {
        msg: 'El stock mínimo debe ser un número decimal'
      },
      min: {
        args: [0],
        msg: 'El stock mínimo debe ser mayor o igual a 0'
      }
    }
  },
  activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'ingredientes',
  timestamps: true,
  createdAt: 'creado_en',
  updatedAt: 'actualizado_en',
  indexes: [
    {
      fields: ['nombre']
    },
    {
      fields: ['activo']
    }
  ]
});

Ingrediente.associate = (models) => {
  Ingrediente.hasMany(models.Receta, {
    foreignKey: 'id_ingrediente',
    as: 'recetas'
  });
  
  Ingrediente.hasOne(models.Inventario, {
    foreignKey: 'id_ingrediente',
    as: 'inventario'
  });
  
  Ingrediente.hasMany(models.MovimientoInventario, {
    foreignKey: 'id_ingrediente',
    as: 'movimientos'
  });
};

module.exports = Ingrediente;
