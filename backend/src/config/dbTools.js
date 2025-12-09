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
const UsuarioSistema = require('../models/UsuarioSistemaModel');

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
    console.log('  - usuarios_sistema');

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
      { nombre: 'Ensalada César', descripcion: 'Ensalada fresca con aderezo césar', id_categoria: 1, imagen_url: 'https://images.unsplash.com/photo-1546793665-c74683f339c1', activo: true },
      { nombre: 'Sopa de Tomate', descripcion: 'Sopa cremosa de tomate', id_categoria: 1, imagen_url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd', activo: true },
      { nombre: 'Pollo Frito', descripcion: 'Pollo frito crujiente', id_categoria: 2, imagen_url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec', activo: true },
      { nombre: 'Pasta Alfredo', descripcion: 'Pasta con salsa alfredo', id_categoria: 2, imagen_url: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9', activo: true },
      { nombre: 'Tiramisú', descripcion: 'Postre italiano tradicional', id_categoria: 3, imagen_url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9', activo: true },
      { nombre: 'Café', descripcion: 'Café', id_categoria: 4, imagen_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93', activo: true },
      { nombre: 'Jugo de Naranja', descripcion: 'Jugo natural de naranja', id_categoria: 4, imagen_url: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba', activo: true }
    ]);
    console.log(`✓ ${productos.length} productos creados.`);

    // Crear precios para todos los productos
    const precios = await PrecioProducto.bulkCreate([
      // Ensalada César (id_producto: 1) - Precio único
      { id_producto: 1, nombre_presentacion: 'Porción individual', descripcion: 'Ensalada César individual', precio: 89.99, es_default: true, activo: true },
      
      // Sopa de Tomate (id_producto: 2) - Precio único
      { id_producto: 2, nombre_presentacion: 'Porción individual', descripcion: 'Sopa de tomate individual', precio: 65.00, es_default: true, activo: true },
      
      // Pollo Frito (id_producto: 3) - Múltiples presentaciones
      { id_producto: 3, nombre_presentacion: '3 Piezas', descripcion: '3 piezas de pollo frito', precio: 89.00, es_default: true, activo: true },
      { id_producto: 3, nombre_presentacion: '6 Piezas', descripcion: '6 piezas de pollo frito', precio: 159.00, es_default: false, activo: true },
      { id_producto: 3, nombre_presentacion: '9 Piezas', descripcion: '9 piezas de pollo frito', precio: 219.00, es_default: false, activo: true },
      { id_producto: 3, nombre_presentacion: '12 Piezas', descripcion: '12 piezas de pollo frito', precio: 279.00, es_default: false, activo: true },
      
      // Pasta Alfredo (id_producto: 4) - Precio único
      { id_producto: 4, nombre_presentacion: 'Porción individual', descripcion: 'Pasta Alfredo individual', precio: 150.00, es_default: true, activo: true },
      
      // Tiramisú (id_producto: 5) - Precio único
      { id_producto: 5, nombre_presentacion: 'Porción individual', descripcion: 'Tiramisú individual', precio: 85.00, es_default: true, activo: true },
      
      // Café (id_producto: 6) - Múltiples tamaños
      { id_producto: 6, nombre_presentacion: 'Chico', descripcion: 'Café tamaño chico (8 oz)', precio: 25.00, es_default: true, activo: true },
      { id_producto: 6, nombre_presentacion: 'Mediano', descripcion: 'Café tamaño mediano (12 oz)', precio: 35.00, es_default: false, activo: true },
      { id_producto: 6, nombre_presentacion: 'Grande', descripcion: 'Café tamaño grande (16 oz)', precio: 45.00, es_default: false, activo: true },
      
      // Jugo de Naranja (id_producto: 7) - Precio único
      { id_producto: 7, nombre_presentacion: 'Vaso 16 oz', descripcion: 'Jugo natural de naranja', precio: 40.00, es_default: true, activo: true }
    ]);
    console.log(`✓ ${precios.length} precios de productos creados.`);

    // Actualizar id_precio_default en productos
    await productos[0].update({ id_precio_default: precios[0].id_precio }); // Ensalada César
    await productos[1].update({ id_precio_default: precios[1].id_precio }); // Sopa de Tomate
    await productos[2].update({ id_precio_default: precios[2].id_precio }); // Pollo Frito -> 3 Piezas
    await productos[3].update({ id_precio_default: precios[6].id_precio }); // Pasta Alfredo
    await productos[4].update({ id_precio_default: precios[7].id_precio }); // Tiramisú
    await productos[5].update({ id_precio_default: precios[8].id_precio }); // Café -> Chico
    await productos[6].update({ id_precio_default: precios[11].id_precio }); // Jugo de Naranja
    console.log(`✓ Referencias de precios predeterminados actualizadas.`);

    const empleados = await Empleado.bulkCreate([
      { nombre: 'Juan Pérez', email: 'juan@restaurant.com', telefono: '555-0101', puesto: 'Gerente', salario: 15000.00, activo: true },
      { nombre: 'María García', email: 'maria@restaurant.com', telefono: '555-0102', puesto: 'Chef', salario: 12000.00, activo: true },
      { nombre: 'Carlos López', email: 'carlos@restaurant.com', telefono: '555-0103', puesto: 'Mesero', salario: 8000.00, activo: true },
      { nombre: 'Ana Rodríguez', email: 'ana@restaurant.com', telefono: '555-0104', puesto: 'Cajero', salario: 8500.00, activo: true },
      { nombre: 'Pedro Martínez', email: 'pedro@restaurant.com', telefono: '555-0105', puesto: 'Cocinero', salario: 10000.00, activo: true }
    ]);
    console.log(`✓ ${empleados.length} empleados creados.`);

    // Crear usuarios del sistema con roles RBAC
    // Las contraseñas se hashearán automáticamente con bcrypt mediante los hooks del modelo
    // IMPORTANTE: Todos usan la contraseña 'password123' para pruebas
    const usuarios = await UsuarioSistema.bulkCreate([
      { 
        empleado_id: empleados[0].id_empleado, 
        username: 'admin', 
        password_hash: 'password123', 
        rol: 'admin',
        activo: true 
      },
      { 
        empleado_id: empleados[1].id_empleado, 
        username: 'gerente', 
        password_hash: 'password123', 
        rol: 'gerente',
        activo: true 
      },
      { 
        empleado_id: empleados[2].id_empleado, 
        username: 'mesero', 
        password_hash: 'password123', 
        rol: 'mesero',
        activo: true 
      },
      { 
        empleado_id: empleados[3].id_empleado, 
        username: 'cajero', 
        password_hash: 'password123', 
        rol: 'cajero',
        activo: true 
      },
      { 
        empleado_id: empleados[4].id_empleado, 
        username: 'cocinero', 
        password_hash: 'password123', 
        rol: 'cocinero',
        activo: true 
      }
    ], { 
      individualHooks: true
    });
    console.log(`✓ ${usuarios.length} usuarios del sistema creados.`);

    // Crear ingredientes
    const ingredientes = await Ingrediente.bulkCreate([
      { nombre: 'Pollo', unidad_medida: 'libra', precio_compra: 38.50, stock_minimo: 20, activo: true },
      { nombre: 'Harina', unidad_medida: 'libra', precio_compra: 11.34, stock_minimo: 40, activo: true },
      { nombre: 'Aceite Vegetal', unidad_medida: 'litro', precio_compra: 45.00, stock_minimo: 5, activo: true },
      { nombre: 'Sal', unidad_medida: 'libra', precio_compra: 4.54, stock_minimo: 10, activo: true },
      { nombre: 'Lechuga', unidad_medida: 'libra', precio_compra: 13.61, stock_minimo: 6, activo: true },
      { nombre: 'Tomate', unidad_medida: 'libra', precio_compra: 11.34, stock_minimo: 10, activo: true },
      { nombre: 'Pasta', unidad_medida: 'libra', precio_compra: 15.88, stock_minimo: 20, activo: true },
      { nombre: 'Crema', unidad_medida: 'litro', precio_compra: 60.00, stock_minimo: 3, activo: true },
      { nombre: 'Café en Grano', unidad_medida: 'libra', precio_compra: 81.65, stock_minimo: 10, activo: true },
      { nombre: 'Naranja', unidad_medida: 'libra', precio_compra: 9.07, stock_minimo: 20, activo: true },
      { nombre: 'Refresco Cola', unidad_medida: 'unidad', precio_compra: 12.00, stock_minimo: 50, activo: true },
      { nombre: 'Agua Embotellada', unidad_medida: 'unidad', precio_compra: 8.00, stock_minimo: 100, activo: true },
      { nombre: 'Queso', unidad_medida: 'libra', precio_compra: 54.43, stock_minimo: 5, activo: true },
      { nombre: 'Mantequilla', unidad_medida: 'libra', precio_compra: 45.36, stock_minimo: 5, activo: true },
      { nombre: 'Huevo', unidad_medida: 'pieza', precio_compra: 2.50, stock_minimo: 100, activo: true }
    ]);
    console.log(`✓ ${ingredientes.length} ingredientes creados.`);

    // Crear recetas vinculadas a precios específicos (presentaciones)
    const recetas = await Receta.bulkCreate([
      // Ensalada César - Porción individual (id_precio: 1)
      { id_precio: 1, id_ingrediente: 5, cantidad_necesaria: 0.33 }, // Lechuga 
      { id_precio: 1, id_ingrediente: 6, cantidad_necesaria: 0.11 }, // Tomate 
      { id_precio: 1, id_ingrediente: 13, cantidad_necesaria: 0.04 }, // Queso
      
      // Sopa de Tomate - Porción individual (id_precio: 2)
      { id_precio: 2, id_ingrediente: 6, cantidad_necesaria: 0.66 }, // Tomate
      { id_precio: 2, id_ingrediente: 8, cantidad_necesaria: 0.10 }, // Crema
      { id_precio: 2, id_ingrediente: 4, cantidad_necesaria: 0.01 }, // Sal
      
      // Pollo Frito - 3 Piezas (id_precio: 3)
      { id_precio: 3, id_ingrediente: 1, cantidad_necesaria: 1.10 }, // Pollo 
      { id_precio: 3, id_ingrediente: 2, cantidad_necesaria: 0.22 }, // Harina 
      { id_precio: 3, id_ingrediente: 3, cantidad_necesaria: 0.20 }, // Aceite 
      { id_precio: 3, id_ingrediente: 4, cantidad_necesaria: 0.02 }, // Sal 
      
      // Pollo Frito - 6 Piezas (id_precio: 4)
      { id_precio: 4, id_ingrediente: 1, cantidad_necesaria: 2.20 }, // Pollo (doble)
      { id_precio: 4, id_ingrediente: 2, cantidad_necesaria: 0.44 }, // Harina (doble)
      { id_precio: 4, id_ingrediente: 3, cantidad_necesaria: 0.40 }, // Aceite (doble)
      { id_precio: 4, id_ingrediente: 4, cantidad_necesaria: 0.04 }, // Sal (doble)
      
      // Pollo Frito - 9 Piezas (id_precio: 5)
      { id_precio: 5, id_ingrediente: 1, cantidad_necesaria: 3.30 }, // Pollo (triple)
      { id_precio: 5, id_ingrediente: 2, cantidad_necesaria: 0.66 }, // Harina (triple)
      { id_precio: 5, id_ingrediente: 3, cantidad_necesaria: 0.60 }, // Aceite (triple)
      { id_precio: 5, id_ingrediente: 4, cantidad_necesaria: 0.06 }, // Sal (triple)
      
      // Pollo Frito - 12 Piezas (id_precio: 6)
      { id_precio: 6, id_ingrediente: 1, cantidad_necesaria: 4.40 }, // Pollo (cuádruple)
      { id_precio: 6, id_ingrediente: 2, cantidad_necesaria: 0.88 }, // Harina (cuádruple)
      { id_precio: 6, id_ingrediente: 3, cantidad_necesaria: 0.80 }, // Aceite (cuádruple)
      { id_precio: 6, id_ingrediente: 4, cantidad_necesaria: 0.08 }, // Sal (cuádruple)
      
      // Pasta Alfredo - Porción individual (id_precio: 7)
      { id_precio: 7, id_ingrediente: 7, cantidad_necesaria: 0.44 }, // Pasta 
      { id_precio: 7, id_ingrediente: 8, cantidad_necesaria: 0.15 }, // Crema 
      { id_precio: 7, id_ingrediente: 13, cantidad_necesaria: 0.11 }, // Queso 
      { id_precio: 7, id_ingrediente: 14, cantidad_necesaria: 0.04 }, // Mantequilla 
      
      // Tiramisú - Porción individual (id_precio: 8)
      // (Sin receta de ingredientes por ahora)
      
      // Café - Chico 8oz (id_precio: 9)
      { id_precio: 9, id_ingrediente: 9, cantidad_necesaria: 0.03 }, // Café en grano 
      
      // Café - Mediano 12oz (id_precio: 10)
      { id_precio: 10, id_ingrediente: 9, cantidad_necesaria: 0.045 }, // Café en grano (1.5x)
      
      // Café - Grande 16oz (id_precio: 11)
      { id_precio: 11, id_ingrediente: 9, cantidad_necesaria: 0.06 }, // Café en grano (2x)
      
      // Jugo de Naranja - Vaso 16oz (id_precio: 12)
      { id_precio: 12, id_ingrediente: 10, cantidad_necesaria: 0.66 } // Naranja
    ]);
    console.log(`✓ ${recetas.length} recetas creadas (vinculadas a presentaciones específicas).`);

    // Crear inventarios
    const inventarios = await Inventario.bulkCreate([
      { id_ingrediente: 1, cantidad_actual: 56.00, fecha_actualizacion: new Date() },  // Pollo - 56 lb
      { id_ingrediente: 2, cantidad_actual: 110.00, fecha_actualizacion: new Date() }, // Harina - 110 lb
      { id_ingrediente: 3, cantidad_actual: 8.50, fecha_actualizacion: new Date() },   // Aceite - 8.5 L
      { id_ingrediente: 4, cantidad_actual: 26.50, fecha_actualizacion: new Date() },  // Sal - 26.5 lb
      { id_ingrediente: 5, cantidad_actual: 11.50, fecha_actualizacion: new Date() },  // Lechuga - 11.5 lb
      { id_ingrediente: 6, cantidad_actual: 19.25, fecha_actualizacion: new Date() },  // Tomate - 19.25 lb
      { id_ingrediente: 7, cantidad_actual: 66.00, fecha_actualizacion: new Date() },  // Pasta - 66 lb
      { id_ingrediente: 8, cantidad_actual: 6.50, fecha_actualizacion: new Date() },   // Crema - 6.5 L
      { id_ingrediente: 9, cantidad_actual: 26.50, fecha_actualizacion: new Date() },  // Café - 26.5 lb
      { id_ingrediente: 10, cantidad_actual: 34.00, fecha_actualizacion: new Date() }, // Naranja - 34 lb
      { id_ingrediente: 11, cantidad_actual: 150.00, fecha_actualizacion: new Date() },// Refresco - 150 unidades
      { id_ingrediente: 12, cantidad_actual: 250.00, fecha_actualizacion: new Date() },// Agua - 250 unidades
      { id_ingrediente: 13, cantidad_actual: 11.00, fecha_actualizacion: new Date() }, // Queso - 11 lb
      { id_ingrediente: 14, cantidad_actual: 8.80, fecha_actualizacion: new Date() },  // Mantequilla - 8.8 lb
      { id_ingrediente: 15, cantidad_actual: 200.00, fecha_actualizacion: new Date() } // Huevo - 200 piezas
    ]);
    console.log(`✓ ${inventarios.length} inventarios creados.`);

    // Crear clientes de prueba
    const clientes = await Cliente.bulkCreate([
      { nombre: 'Ana Martínez', email: 'ana@email.com', telefono: '555-1234', clave: 'password123', activo: true },
      { nombre: 'Luis Torres', email: 'luis@email.com', telefono: '555-5678', clave: 'password123', activo: true }
    ], { 
      individualHooks: true
    });
    console.log(`✓ ${clientes.length} clientes creados.`);

    // Crear pedidos de prueba
    const pedidos = await Pedido.bulkCreate([
      { id_cliente: 1, id_empleado: 3, estado: 'entregado', total: 239.99, notas: 'Sin cebolla' },
      { id_cliente: 2, id_empleado: 3, estado: 'en_preparacion', total: 194.00, notas: null },
      { id_cliente: 1, id_empleado: 3, estado: 'pendiente', total: 120.00, notas: 'Para llevar' }
    ]);
    console.log(`✓ ${pedidos.length} pedidos creados.`);

    // Crear detalles de pedidos (usando los precios de la tabla precio_productos)
    const detalles = await DetallePedido.bulkCreate([
      // Pedido 1
      { id_pedido: 1, id_producto: 1, cantidad: 1, precio_unitario: 89.99, subtotal: 89.99 }, // Ensalada César
      { id_pedido: 1, id_producto: 4, cantidad: 1, precio_unitario: 150.00, subtotal: 150.00 }, // Pasta Alfredo
      
      // Pedido 2
      { id_pedido: 2, id_producto: 3, cantidad: 2, precio_unitario: 89.00, subtotal: 178.00, instrucciones_especiales: 'Bien cocido' }, // Pollo Frito 3 piezas
      { id_pedido: 2, id_producto: 7, cantidad: 1, precio_unitario: 40.00, subtotal: 40.00 }, // Jugo de Naranja
      
      // Pedido 3
      { id_pedido: 3, id_producto: 5, cantidad: 1, precio_unitario: 85.00, subtotal: 85.00 }, // Tiramisú
      { id_pedido: 3, id_producto: 6, cantidad: 1, precio_unitario: 35.00, subtotal: 35.00 } // Café Mediano
    ]);
    console.log(`✓ ${detalles.length} detalles de pedidos creados.`);

    // Crear movimientos de inventario
    const movimientos = await MovimientoInventario.bulkCreate([
      // Entradas iniciales
      { id_ingrediente: 1, tipo_movimiento: 'entrada', cantidad: 66.00, id_empleado: 1, notas: 'Compra inicial de pollo' },
      { id_ingrediente: 2, tipo_movimiento: 'entrada', cantidad: 110.00, id_empleado: 1, notas: 'Compra inicial de harina' },
      { id_ingrediente: 3, tipo_movimiento: 'entrada', cantidad: 10.00, id_empleado: 1, notas: 'Compra inicial de aceite' },
      { id_ingrediente: 11, tipo_movimiento: 'entrada', cantidad: 200.00, id_empleado: 1, notas: 'Compra inicial de refrescos' },
      { id_ingrediente: 12, tipo_movimiento: 'entrada', cantidad: 300.00, id_empleado: 1, notas: 'Compra inicial de agua' },
      
      // Salidas por pedidos (basadas en las recetas)
      { id_ingrediente: 1, tipo_movimiento: 'salida', cantidad: 2.20, id_pedido: 2, id_empleado: 3, notas: 'Salida por pedido #2 - Pollo Frito x2' },
      { id_ingrediente: 5, tipo_movimiento: 'salida', cantidad: 0.33, id_pedido: 1, id_empleado: 3, notas: 'Salida por pedido #1 - Ensalada César' },
      { id_ingrediente: 7, tipo_movimiento: 'salida', cantidad: 0.44, id_pedido: 1, id_empleado: 3, notas: 'Salida por pedido #1 - Pasta Alfredo' },
      
      // Ajustes
      { id_ingrediente: 4, tipo_movimiento: 'ajuste', cantidad: 4.40, id_empleado: 2, notas: 'Ajuste de inventario de sal' },
      { id_ingrediente: 15, tipo_movimiento: 'ajuste', cantidad: 24.00, id_empleado: 2, notas: 'Ajuste de inventario - 2 docenas de huevos' },
      
      // Mermas
      { id_ingrediente: 6, tipo_movimiento: 'merma', cantidad: 1.10, id_empleado: 2, notas: 'Tomates vencidos' },
      { id_ingrediente: 11, tipo_movimiento: 'merma', cantidad: 50.00, id_empleado: 2, notas: 'Refrescos próximos a vencer' }
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
