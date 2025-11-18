require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');

const clienteRoutes = require('./routes/cliente.Routes');
const empleadoRoutes = require('./routes/empleado.Routes');
const categoriaProductoRoutes = require('./routes/categoriaProducto.Routes');
const productoRoutes = require('./routes/producto.Routes');
const precioProductoRoutes = require('./routes/precioProducto.Routes');
const ingredienteRoutes = require('./routes/ingrediente.Routes');
const recetaRoutes = require('./routes/receta.Routes');
const inventarioRoutes = require('./routes/inventario.Routes');
const pedidoRoutes = require('./routes/pedido.Routes');

require('./models/ClienteModel');
require('./models/EmpleadoModel');
require('./models/CategoriaProductoModel');
require('./models/ProductoModel');
require('./models/PrecioProductoModel');
require('./models/IngredienteModel');
require('./models/RecetaModel');
require('./models/InventarioModel');
require('./models/PedidoModel');
require('./models/DetallePedidoModel');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/clientes', clienteRoutes);
app.use('/api/empleados', empleadoRoutes);
app.use('/api/categorias-productos', categoriaProductoRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/precios-productos', precioProductoRoutes);
app.use('/api/ingredientes', ingredienteRoutes);
app.use('/api/recetas', recetaRoutes);
app.use('/api/inventarios', inventarioRoutes);
app.use('/api/pedidos', pedidoRoutes);

app.get('/', (req, res) => {
  res.json({ 
    mensaje: 'API de Restaurante funcionando correctamente',
    version: '1.0.0',
    endpoints: {
      clientes: '/api/clientes',
      empleados: '/api/empleados',
      categorias: '/api/categorias-productos',
      productos: '/api/productos',
      precios: '/api/precios-productos',
      ingredientes: '/api/ingredientes',
      recetas: '/api/recetas',
      inventarios: '/api/inventarios',
      pedidos: '/api/pedidos'
    }
  });
});

app.get('/api/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ 
      status: 'OK',
      database: 'Conectado',
      mensaje: 'La base de datos está funcionando correctamente'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR',
      database: 'Desconectado',
      mensaje: 'Error al conectar con la base de datos',
      error: error.message
    });
  }
});

app.use((req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    ruta: req.originalUrl
  });
});

// Manejo de errores generales
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const syncDatabase = async () => {
  try {
    console.log('Verificando conexión a la base de datos...');
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');
    console.log('\nSincronizando modelos con la base de datos...');
    await sequelize.sync({ alter: true });
    console.log('Tablas sincronizadas correctamente.');

    return true;
  } catch (error) {
    console.error('Error al sincronizar la base de datos:', error);
    return false;
  }
};

const startServer = async () => {
  try {
    const dbConnected = await syncDatabase();
    
    if (!dbConnected) {
      console.error('\nNo se pudo conectar a la base de datos. Verifica tu configuración.');
      process.exit(1);
    }

    app.listen(PORT, () => {
      console.log(`\nServidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Manejo de cierre graceful
process.on('SIGINT', async () => {
  console.log('\n\nCerrando servidor...');
  try {
    await sequelize.close();
    console.log('✓ Conexión a la base de datos cerrada.');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error al cerrar la conexión:', error);
    process.exit(1);
  }
});

startServer();

module.exports = app;
