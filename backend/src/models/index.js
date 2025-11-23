const Cliente = require('./ClienteModel');
const Empleado = require('./EmpleadoModel');
const CategoriaProducto = require('./CategoriaProductoModel');
const Producto = require('./ProductoModel');
const PrecioProducto = require('./PrecioProductoModel');
const Ingrediente = require('./IngredienteModel');
const Receta = require('./RecetaModel');
const Inventario = require('./InventarioModel');
const Pedido = require('./PedidoModel');
const DetallePedido = require('./DetallePedidoModel');
const MovimientoInventario = require('./MovimientoInventarioModel');
const UsuarioSistema = require('./UsuarioSistemaModel');

const models = {
  Cliente,
  Empleado,
  CategoriaProducto,
  Producto,
  PrecioProducto,
  Ingrediente,
  Receta,
  Inventario,
  Pedido,
  DetallePedido,
  MovimientoInventario,
  UsuarioSistema
};


const initializeAssociations = () => {
  Object.keys(models).forEach(modelName => {
    if (models[modelName].associate) {
      models[modelName].associate(models);
    }
  });
};

initializeAssociations();

module.exports = {
  ...models,
  initializeAssociations
};
