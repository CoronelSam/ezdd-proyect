/**
 * Constantes del sistema
 */

// Roles del sistema
const ROLES = {
    ADMIN: 'admin',
    GERENTE: 'gerente',
    CAJERO: 'cajero',
    MESERO: 'mesero',
    COCINERO: 'cocinero'
};

// Descripciones de roles
const ROLES_DESCRIPCION = {
    [ROLES.ADMIN]: 'Administrador del sistema - Acceso total',
    [ROLES.GERENTE]: 'Gerente - Gestión operativa completa',
    [ROLES.CAJERO]: 'Cajero - Ventas y cobros',
    [ROLES.MESERO]: 'Mesero - Toma de pedidos',
    [ROLES.COCINERO]: 'Cocinero - Preparación de alimentos'
};

// Array de roles válidos
const ROLES_VALIDOS = Object.values(ROLES);

// Módulos del sistema
const MODULOS = {
    PRODUCTO: 'Producto',
    CATEGORIA: 'CategoriaProducto',
    PRECIO: 'PrecioProducto',
    INVENTARIO: 'Inventario',
    INGREDIENTE: 'Ingrediente',
    MOVIMIENTO_INVENTARIO: 'MovimientoInventario',
    PEDIDO: 'Pedido',
    DETALLE_PEDIDO: 'DetallePedido',
    CLIENTE: 'Cliente',
    EMPLEADO: 'Empleado',
    USUARIO_SISTEMA: 'UsuarioSistema',
    RECETA: 'Receta',
    REPORTE: 'Reporte',
    ESTADISTICA: 'Estadistica',
    DASHBOARD: 'Dashboard'
};

// Acciones CRUD
const ACCIONES = {
    CREATE: 'create',
    READ: 'read',
    UPDATE: 'update',
    DELETE: 'delete',
    MANAGE: 'manage' // Todas las acciones
};

module.exports = {
    ROLES,
    ROLES_DESCRIPCION,
    ROLES_VALIDOS,
    MODULOS,
    ACCIONES
};
