const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Receta = sequelize.define('Receta', {
  id_receta: {
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
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT'
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
  cantidad_necesaria: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: false,
    validate: {
      isDecimal: {
        msg: 'La cantidad necesaria debe ser un número decimal'
      },
      min: {
        args: [0.001],
        msg: 'La cantidad necesaria debe ser mayor a 0'
      }
    }
  }
}, {
  tableName: 'recetas',
  timestamps: true,
  createdAt: 'creado_en',
  updatedAt: 'actualizado_en',
  indexes: [
    {
      fields: ['id_producto']
    },
    {
      fields: ['id_ingrediente']
    },
    {
      unique: true,
      fields: ['id_producto', 'id_ingrediente'],
      name: 'unique_producto_ingrediente'
    }
  ]
});

// Definir relaciones
Receta.associate = (models) => {
  // Una receta pertenece a un producto
  Receta.belongsTo(models.Producto, {
    foreignKey: 'id_producto',
    as: 'producto'
  });

  // Una receta pertenece a un ingrediente
  Receta.belongsTo(models.Ingrediente, {
    foreignKey: 'id_ingrediente',
    as: 'ingrediente'
  });
};

module.exports = Receta;
