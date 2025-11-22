const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const CategoriaProducto = require('./CategoriaProductoModel');
const PrecioProducto = require('./PrecioProductoModel');

const Producto = sequelize.define('Producto', {
  id_producto: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El nombre es requerido'
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
  id_precio_default: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'precio_productos',
      key: 'id_precio'
    },
    comment: 'Precio por defecto del producto. Todos los productos deben tener al menos un precio en precio_productos'
  },
  id_categoria: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'categoria_productos',
      key: 'id_categoria'
    },
    validate: {
      notEmpty: {
        msg: 'La categoría es requerida'
      }
    }
  },
  imagen_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      isUrl: {
        msg: 'Debe proporcionar una URL válida'
      }
    }
  },
  activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'productos',
  timestamps: false,
  indexes: [
    {
      fields: ['id_categoria']
    },
    {
      fields: ['activo']
    },
    {
      fields: ['nombre']
    },
    {
      fields: ['id_precio_default']
    }
  ]
});

// Definir relaciones
Producto.belongsTo(CategoriaProducto, {
  foreignKey: 'id_categoria',
  as: 'categoria'
});

CategoriaProducto.hasMany(Producto, {
  foreignKey: 'id_categoria',
  as: 'productos'
});

Producto.hasMany(PrecioProducto, {
  foreignKey: 'id_producto',
  as: 'precios'
});

Producto.belongsTo(PrecioProducto, {
  foreignKey: 'id_precio_default',
  as: 'precio_default',
  constraints: false
});

PrecioProducto.belongsTo(Producto, {
  foreignKey: 'id_producto',
  as: 'producto'
});

Producto.associate = (models) => {
  Producto.hasMany(models.Receta, {
    foreignKey: 'id_producto',
    as: 'recetas'
  });
  
  Producto.hasMany(models.DetallePedido, {
    foreignKey: 'id_producto',
    as: 'detalles_pedidos'
  });
};

module.exports = Producto;
