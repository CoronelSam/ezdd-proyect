const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Receta = sequelize.define('Receta', {
  id_receta: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  id_precio: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'precio_productos',
      key: 'id_precio'
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
    comment: 'Vincula la receta a una presentación específica del producto'
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
      fields: ['id_precio']
    },
    {
      fields: ['id_ingrediente']
    },
    {
      unique: true,
      fields: ['id_precio', 'id_ingrediente'],
      name: 'unique_precio_ingrediente'
    }
  ]
});

// Definir relaciones
Receta.associate = (models) => {
  // Una receta pertenece a una presentación/precio específico
  Receta.belongsTo(models.PrecioProducto, {
    foreignKey: 'id_precio',
    as: 'precio'
  });

  // Una receta pertenece a un ingrediente
  Receta.belongsTo(models.Ingrediente, {
    foreignKey: 'id_ingrediente',
    as: 'ingrediente'
  });
};

module.exports = Receta;
