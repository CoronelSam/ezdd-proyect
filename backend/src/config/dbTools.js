const sequelize = require('./database');
const Cliente = require('../models/ClienteModel');
const Empleado = require('../models/EmpleadoModel');
const CategoriaProducto = require('../models/CategoriaProductoModel');
const Producto = require('../models/ProductoModel');
const PrecioProducto = require('../models/PrecioProductoModel');
const Ingrediente = require('../models/IngredienteModel');
const Receta = require('../models/RecetaModel');
const Inventario = require('../models/InventarioModel');
const Pedido = require('../models/PedidoModel');
const DetallePedido = require('../models/DetallePedidoModel');
const MovimientoInventario = require('../models/MovimientoInventarioModel');

const createTables = async () => {
  try {
    console.log('Iniciando creación de tablas...\n');
    await sequelize.authenticate();
    console.log('✓ Conexión a la base de datos establecida.');
    await sequelize.sync({ force: false, alter: true });

    console.log('\nTablas creadas/actualizadas exitosamente:');
    console.log('  - clientes');
    console.log('  - empleados');
    console.log('  - categoria_productos');
    console.log('  - productos');
    console.log('  - precio_productos');
    console.log('  - ingredientes');
    console.log('  - recetas');
    console.log('  - inventarios');
    console.log('  - pedidos');
    console.log('  - detalle_pedidos');
    console.log('  - movimientos_inventario');

    return true;
  } catch (error) {
    console.error('\n✗ Error al crear las tablas:', error);
    throw error;
  }
};

const dropTables = async () => {
  try {
    console.log('Eliminando todas las tablas...\n');
    
    await sequelize.drop();
    
    console.log('✓ Todas las tablas han sido eliminadas.');
    return true;
  } catch (error) {
    console.error('\n✗ Error al eliminar las tablas:', error);
    throw error;
  }
};

const resetDatabase = async () => {
  try {
    console.log('Reseteando base de datos...\n');
    
    await sequelize.sync({ force: true });
    
    console.log('\n✓ Base de datos reseteada exitosamente.');
    return true;
  } catch (error) {
    console.error('\n✗ Error al resetear la base de datos:', error);
    throw error;
  }
};

const seedDatabase = async () => {
  try {
    console.log('Insertando datos de prueba...\n');

    const categorias = await CategoriaProducto.bulkCreate([
      { nombre: 'Entradas', descripcion: 'Platillos de entrada y aperitivos', activa: true },
      { nombre: 'Platos Fuertes', descripcion: 'Platillos principales', activa: true },
      { nombre: 'Postres', descripcion: 'Postres y dulces', activa: true },
      { nombre: 'Bebidas', descripcion: 'Bebidas calientes y frías', activa: true }
    ]);
    console.log(`✓ ${categorias.length} categorías creadas.`);

    const productos = await Producto.bulkCreate([
      { nombre: 'Ensalada César', descripcion: 'Ensalada fresca con aderezo césar', precio: 89.99, id_categoria: 1, imagen_url: 'https://images.unsplash.com/photo-1546793665-c74683f339c1', activo: true },
      { nombre: 'Sopa de Tomate', descripcion: 'Sopa cremosa de tomate', precio: 65.00, id_categoria: 1, imagen_url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd', activo: true },
      { nombre: 'Pollo Frito', descripcion: 'Pollo frito crujiente', precio: null, id_categoria: 2, imagen_url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec', activo: true },
      { nombre: 'Pasta Alfredo', descripcion: 'Pasta con salsa alfredo', precio: 150.00, id_categoria: 2, imagen_url: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9', activo: true },
      { nombre: 'Tiramisú', descripcion: 'Postre italiano tradicional', precio: 85.00, id_categoria: 3, imagen_url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9', activo: true },
      { nombre: 'Café', descripcion: 'Café', precio: null, id_categoria: 4, imagen_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93', activo: true },
      { nombre: 'Jugo de Naranja', descripcion: 'Jugo natural de naranja', precio: 40.00, id_categoria: 4, imagen_url: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba', activo: true }
    ]);
    console.log(`✓ ${productos.length} productos creados.`);

    // Crear precios para productos con variantes
    const precios = await PrecioProducto.bulkCreate([
      // Pollo Frito (id_producto: 3)
      { id_producto: 3, nombre_presentacion: '3 Piezas', descripcion: '3 piezas de pollo frito', precio: 89.00, activo: true },
      { id_producto: 3, nombre_presentacion: '6 Piezas', descripcion: '6 piezas de pollo frito', precio: 159.00, activo: true },
      { id_producto: 3, nombre_presentacion: '9 Piezas', descripcion: '9 piezas de pollo frito', precio: 219.00, activo: true },
      { id_producto: 3, nombre_presentacion: '12 Piezas', descripcion: '12 piezas de pollo frito', precio: 279.00, activo: true },
      
      // Café (id_producto: 6)
      { id_producto: 6, nombre_presentacion: 'Chico', descripcion: 'Café tamaño chico (8 oz)', precio: 25.00, activo: true },
      { id_producto: 6, nombre_presentacion: 'Mediano', descripcion: 'Café tamaño mediano (12 oz)', precio: 35.00, activo: true },
      { id_producto: 6, nombre_presentacion: 'Grande', descripcion: 'Café tamaño grande (16 oz)', precio: 45.00, activo: true }
    ]);
    console.log(`✓ ${precios.length} precios de productos creados.`);

    const empleados = await Empleado.bulkCreate([
      { nombre: 'Juan Pérez', email: 'juan@restaurant.com', telefono: '555-0101', puesto: 'Gerente', salario: 15000.00, activo: true },
      { nombre: 'María García', email: 'maria@restaurant.com', telefono: '555-0102', puesto: 'Chef', salario: 12000.00, activo: true },
      { nombre: 'Carlos López', email: 'carlos@restaurant.com', telefono: '555-0103', puesto: 'Mesero', salario: 8000.00, activo: true }
    ]);
    console.log(`✓ ${empleados.length} empleados creados.`);

    // Crear ingredientes
    const ingredientes = await Ingrediente.bulkCreate([
      { nombre: 'Pollo', unidad_medida: 'kg', precio_compra: 85.00, stock_minimo: 10, activo: true },
      { nombre: 'Harina', unidad_medida: 'kg', precio_compra: 25.00, stock_minimo: 20, activo: true },
      { nombre: 'Aceite Vegetal', unidad_medida: 'l', precio_compra: 45.00, stock_minimo: 5, activo: true },
      { nombre: 'Sal', unidad_medida: 'kg', precio_compra: 10.00, stock_minimo: 5, activo: true },
      { nombre: 'Lechuga', unidad_medida: 'kg', precio_compra: 30.00, stock_minimo: 3, activo: true },
      { nombre: 'Tomate', unidad_medida: 'kg', precio_compra: 25.00, stock_minimo: 5, activo: true },
      { nombre: 'Pasta', unidad_medida: 'kg', precio_compra: 35.00, stock_minimo: 10, activo: true },
      { nombre: 'Crema', unidad_medida: 'l', precio_compra: 60.00, stock_minimo: 3, activo: true },
      { nombre: 'Café en Grano', unidad_medida: 'kg', precio_compra: 180.00, stock_minimo: 5, activo: true },
      { nombre: 'Naranja', unidad_medida: 'kg', precio_compra: 20.00, stock_minimo: 10, activo: true }
    ]);
    console.log(`✓ ${ingredientes.length} ingredientes creados.`);

    // Crear recetas
    const recetas = await Receta.bulkCreate([
      // Ensalada César (producto 1)
      { id_producto: 1, id_ingrediente: 5, cantidad_necesaria: 0.150 }, // Lechuga
      { id_producto: 1, id_ingrediente: 6, cantidad_necesaria: 0.050 }, // Tomate
      
      // Sopa de Tomate (producto 2)
      { id_producto: 2, id_ingrediente: 6, cantidad_necesaria: 0.300 }, // Tomate
      { id_producto: 2, id_ingrediente: 8, cantidad_necesaria: 0.100 }, // Crema
      
      // Pollo Frito (producto 3)
      { id_producto: 3, id_ingrediente: 1, cantidad_necesaria: 0.500 }, // Pollo
      { id_producto: 3, id_ingrediente: 2, cantidad_necesaria: 0.100 }, // Harina
      { id_producto: 3, id_ingrediente: 3, cantidad_necesaria: 0.200 }, // Aceite
      { id_producto: 3, id_ingrediente: 4, cantidad_necesaria: 0.010 }, // Sal
      
      // Pasta Alfredo (producto 4)
      { id_producto: 4, id_ingrediente: 7, cantidad_necesaria: 0.200 }, // Pasta
      { id_producto: 4, id_ingrediente: 8, cantidad_necesaria: 0.150 }, // Crema
      
      // Café (producto 6)
      { id_producto: 6, id_ingrediente: 9, cantidad_necesaria: 0.015 }, // Café en grano
      
      // Jugo de Naranja (producto 7)
      { id_producto: 7, id_ingrediente: 10, cantidad_necesaria: 0.300 } // Naranja
    ]);
    console.log(`✓ ${recetas.length} recetas creadas.`);

    // Crear inventarios
    const inventarios = await Inventario.bulkCreate([
      { id_ingrediente: 1, cantidad_actual: 25.500, fecha_actualizacion: new Date() }, // Pollo
      { id_ingrediente: 2, cantidad_actual: 50.000, fecha_actualizacion: new Date() }, // Harina
      { id_ingrediente: 3, cantidad_actual: 8.500, fecha_actualizacion: new Date() },  // Aceite
      { id_ingrediente: 4, cantidad_actual: 12.000, fecha_actualizacion: new Date() }, // Sal
      { id_ingrediente: 5, cantidad_actual: 5.200, fecha_actualizacion: new Date() },  // Lechuga
      { id_ingrediente: 6, cantidad_actual: 8.750, fecha_actualizacion: new Date() },  // Tomate
      { id_ingrediente: 7, cantidad_actual: 30.000, fecha_actualizacion: new Date() }, // Pasta
      { id_ingrediente: 8, cantidad_actual: 6.500, fecha_actualizacion: new Date() },  // Crema
      { id_ingrediente: 9, cantidad_actual: 12.000, fecha_actualizacion: new Date() }, // Café
      { id_ingrediente: 10, cantidad_actual: 15.500, fecha_actualizacion: new Date() } // Naranja
    ]);
    console.log(`✓ ${inventarios.length} inventarios creados.`);

    // Crear clientes de prueba
    const clientes = await Cliente.bulkCreate([
      { nombre: 'Ana Martínez', email: 'ana@email.com', telefono: '555-1234', clave: 'password123', activo: true },
      { nombre: 'Luis Torres', email: 'luis@email.com', telefono: '555-5678', clave: 'password123', activo: true }
    ]);
    console.log(`✓ ${clientes.length} clientes creados.`);

    // Crear pedidos de prueba
    const pedidos = await Pedido.bulkCreate([
      { id_cliente: 1, id_empleado: 3, estado: 'entregado', total: 239.99, notas: 'Sin cebolla' },
      { id_cliente: 2, id_empleado: 3, estado: 'en_preparacion', total: 194.00, notas: null },
      { id_cliente: 1, id_empleado: 3, estado: 'pendiente', total: 120.00, notas: 'Para llevar' }
    ]);
    console.log(`✓ ${pedidos.length} pedidos creados.`);

    // Crear detalles de pedidos
    const detalles = await DetallePedido.bulkCreate([
      // Pedido 1
      { id_pedido: 1, id_producto: 1, cantidad: 1, precio_unitario: 89.99, subtotal: 89.99 },
      { id_pedido: 1, id_producto: 4, cantidad: 1, precio_unitario: 150.00, subtotal: 150.00 },
      
      // Pedido 2
      { id_pedido: 2, id_producto: 3, cantidad: 2, precio_unitario: 89.00, subtotal: 178.00, instrucciones_especiales: 'Bien cocido' },
      { id_pedido: 2, id_producto: 7, cantidad: 1, precio_unitario: 40.00, subtotal: 40.00 },
      
      // Pedido 3
      { id_pedido: 3, id_producto: 5, cantidad: 1, precio_unitario: 85.00, subtotal: 85.00 },
      { id_pedido: 3, id_producto: 6, cantidad: 1, precio_unitario: 35.00, subtotal: 35.00 }
    ]);
    console.log(`✓ ${detalles.length} detalles de pedidos creados.`);

    // Crear movimientos de inventario
    const movimientos = await MovimientoInventario.bulkCreate([
      // Entradas iniciales
      { id_ingrediente: 1, tipo_movimiento: 'entrada', cantidad: 30.000, id_empleado: 1, notas: 'Compra inicial' },
      { id_ingrediente: 2, tipo_movimiento: 'entrada', cantidad: 50.000, id_empleado: 1, notas: 'Compra inicial' },
      { id_ingrediente: 3, tipo_movimiento: 'entrada', cantidad: 10.000, id_empleado: 1, notas: 'Compra inicial' },
      
      // Salidas por pedidos
      { id_ingrediente: 1, tipo_movimiento: 'salida', cantidad: 2.000, id_pedido: 2, id_empleado: 3, notas: 'Salida por pedido' },
      { id_ingrediente: 5, tipo_movimiento: 'salida', cantidad: 0.150, id_pedido: 1, id_empleado: 3, notas: 'Salida por pedido' },
      
      // Ajustes
      { id_ingrediente: 4, tipo_movimiento: 'ajuste', cantidad: 2.000, id_empleado: 2, notas: 'Ajuste de inventario' },
      
      // Mermas
      { id_ingrediente: 6, tipo_movimiento: 'merma', cantidad: 0.500, id_empleado: 2, notas: 'Producto vencido' }
    ]);
    console.log(`✓ ${movimientos.length} movimientos de inventario creados.`);

    console.log('\n✓ Datos de prueba insertados exitosamente.');
    return true;
  } catch (error) {
    console.error('\n✗ Error al insertar datos de prueba:', error);
    throw error;
  }
};

const migrate = async () => {
  try {
    const args = process.argv.slice(2);
    const command = args[0];

    switch (command) {
      case 'create':
        await createTables();
        break;
      case 'drop':
        await dropTables();
        break;
      case 'reset':
        await resetDatabase();
        break;
      case 'seed':
        await seedDatabase();
        break;
      case 'fresh':
        await resetDatabase();
        await seedDatabase();
        break;
      default:
        console.log('Comandos disponibles:');
        console.log('  node src/config/dbTools.js create  - Crear/actualizar tablas');
        console.log('  node src/config/dbTools.js drop    - Eliminar todas las tablas');
        console.log('  node src/config/dbTools.js reset   - Resetear base de datos');
        console.log('  node src/config/dbTools.js seed    - Insertar datos de prueba');
        console.log('  node src/config/dbTools.js fresh   - Resetear e insertar datos');
    }

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Error en migración:', error);
    await sequelize.close();
    process.exit(1);
  }
};

if (require.main === module) {
  migrate();
}

module.exports = {
  createTables,
  dropTables,
  resetDatabase,
  seedDatabase,
  sequelize
};
