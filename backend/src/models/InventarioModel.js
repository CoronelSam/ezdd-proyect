const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Inventario = sequelize.define('Inventario', {
  id_inventario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  id_ingrediente: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'ingredientes',
      key: 'id_ingrediente'
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT'
  },
  cantidad_actual: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: false,
    defaultValue: 0,
    validate: {
      isDecimal: {
        msg: 'La cantidad actual debe ser un número decimal'
      },
      min: {
        args: [0],
        msg: 'La cantidad actual debe ser mayor o igual a 0'
      }
    }
  },
  fecha_actualizacion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'inventarios',
  timestamps: false,
  indexes: [
    {
      fields: ['id_ingrediente']
    },
    {
      fields: ['fecha_actualizacion']
    }
  ]
});

// Definir relaciones
Inventario.associate = (models) => {
  Inventario.belongsTo(models.Ingrediente, {
    foreignKey: 'id_ingrediente',
    as: 'ingrediente'
  });
};

module.exports = Inventario;
