require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const sequelize = require('./config/database');
const { Server } = require('socket.io');

const clienteRoutes = require('./routes/cliente.Routes');
const empleadoRoutes = require('./routes/empleado.Routes');
const categoriaProductoRoutes = require('./routes/categoriaProducto.Routes');
const productoRoutes = require('./routes/producto.Routes');
const precioProductoRoutes = require('./routes/precioProducto.Routes');
const ingredienteRoutes = require('./routes/ingrediente.Routes');
const recetaRoutes = require('./routes/receta.Routes');
const inventarioRoutes = require('./routes/inventario.Routes');
const pedidoRoutes = require('./routes/pedido.Routes');
const movimientoInventarioRoutes = require('./routes/movimientoInventario.Routes');
const usuarioSistemaRoutes = require('./routes/usuarioSistema.Routes');

// Inicializar modelos y asociaciones desde archivo centralizado
require('./models');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// Configurar Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
  }
});

// Middleware para adjuntar io a las peticiones
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
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
app.use('/api/movimientos-inventario', movimientoInventarioRoutes);
app.use('/api/usuarios-sistema', usuarioSistemaRoutes);

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
      pedidos: '/api/pedidos',
      movimientos_inventario: '/api/movimientos-inventario',
      usuarios_sistema: '/api/usuarios-sistema'
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
    // Solo sincronizar sin alterar en produccion para evitar problemas con indices
    // Usar migraciones para cambios en esquema
    if (process.env.NODE_ENV === 'development' && process.env.SYNC_ALTER === 'true') {
      console.log('\nSincronizando modelos con la base de datos (alter mode)...');
      await sequelize.sync({ alter: true });
      console.log('Tablas sincronizadas correctamente.');
    } else {
      console.log('\nValidando modelos (sin alterar tablas)...');
      // Solo validar que las tablas existen, no alterarlas
      await sequelize.sync({ force: false });
      console.log('Validación de tablas completada.');
    }

    return true;
  } catch (error) {
    console.error('Error al sincronizar la base de datos:', error);
    return false;
  }
};

// Configurar eventos de Socket.IO
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  // Admin se une a la sala 'admin'
  socket.on('join_admin', () => {
    socket.join('admin');
    console.log(`Socket ${socket.id} se unió a la sala admin`);
  });

  // Cliente se une a su sala personal
  socket.on('join_cliente', (idCliente) => {
    if (idCliente) {
      socket.join(`cliente:${idCliente}`);
      console.log(`Socket ${socket.id} se unió a la sala cliente:${idCliente}`);
    }
  });

  // Unirse a la sala de un pedido específico
  socket.on('join_pedido', (idPedido) => {
    if (idPedido) {
      socket.join(`pedido:${idPedido}`);
      console.log(`Socket ${socket.id} se unió a la sala pedido:${idPedido}`);
    }
  });

  // Desconexión
  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

const startServer = async () => {
  try {
    const dbConnected = await syncDatabase();
    
    if (!dbConnected) {
      console.error('\nNo se pudo conectar a la base de datos. Verifica tu configuración.');
      process.exit(1);
    }

    server.listen(PORT, () => {
      console.log(`\nServidor corriendo en http://localhost:${PORT}`);
      console.log(`Socket.IO habilitado en http://localhost:${PORT}`);
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

module.exports = { app, server, io };
