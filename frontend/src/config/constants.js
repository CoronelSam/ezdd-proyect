// Constantes globales del sistema de restaurante
const APP_CONSTANTS = {
    ESTADOS_PEDIDO: {
        PENDIENTE: 'Pendiente',
        EN_PREPARACION: 'En Preparación',
        LISTO: 'Listo',
        ENTREGADO: 'Entregado',
        CANCELADO: 'Cancelado'
    },
    
    // Tipos de Movimiento de Inventario
    TIPOS_MOVIMIENTO: {
        ENTRADA: 'Entrada',
        SALIDA: 'Salida',
        AJUSTE: 'Ajuste'
    },
    
    // Tipos de Empleados
    TIPOS_EMPLEADO: {
        ADMIN: 'Administrador',
        MESERO: 'Mesero',
        COCINERO: 'Cocinero',
        CAJERO: 'Cajero',
        GERENTE: 'Gerente'
    },

    // Roles del sistema (para permisos)
    ROLES: {
        ADMIN: 'admin',
        GERENTE: 'gerente',
        CAJERO: 'cajero',
        MESERO: 'mesero',
        COCINERO: 'cocinero'
    },

    // Descripciones de roles
    ROLES_DESCRIPCION: {
        admin: 'Administrador del sistema - Acceso total',
        gerente: 'Gerente - Gestión operativa completa',
        cajero: 'Cajero - Ventas y cobros',
        mesero: 'Mesero - Toma de pedidos',
        cocinero: 'Cocinero - Preparación de alimentos'
    },

    // Módulos del sistema
    MODULOS: {
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
        ESTADISTICA: 'Estadistica'
    },

    // Acciones CRUD
    ACCIONES: {
        CREATE: 'create',
        READ: 'read',
        UPDATE: 'update',
        DELETE: 'delete',
        MANAGE: 'manage'
    },

    UNIDADES_MEDIDA: [
        'Kilogramo (kg)',
        'Gramo (g)',
        'Litro (L)',
        'Mililitro (ml)',
        'Unidad (u)',
        'Porción',
        'Taza',
        'Cucharada',
        'Cucharadita',
        'Pizca'
    ],

    CATEGORIAS_COMUNES: [
        'Entradas',
        'Platos Fuertes',
        'Postres',
        'Bebidas',
        'Bebidas Alcohólicas',
        'Ensaladas',
        'Sopas',
        'Hamburguesas',
        'Pizzas',
        'Pastas',
        'Carnes',
        'Pescados y Mariscos',
        'Vegetarianos',
        'Veganos',
        'Desayunos',
        'Snacks',
        'Cafetería'
    ],

    MENSAJES: {
        EXITO: {
            CLIENTE_CREADO: 'Cliente registrado correctamente',
            CLIENTE_ACTUALIZADO: 'Cliente actualizado correctamente',
            CLIENTE_ELIMINADO: 'Cliente eliminado correctamente',
            
            EMPLEADO_CREADO: 'Empleado registrado correctamente',
            EMPLEADO_ACTUALIZADO: 'Empleado actualizado correctamente',
            EMPLEADO_ELIMINADO: 'Empleado eliminado correctamente',
            
            PRODUCTO_CREADO: 'Producto agregado correctamente',
            PRODUCTO_ACTUALIZADO: 'Producto actualizado correctamente',
            PRODUCTO_ELIMINADO: 'Producto eliminado correctamente',
            
            CATEGORIA_CREADA: 'Categoría creada correctamente',
            CATEGORIA_ACTUALIZADA: 'Categoría actualizada correctamente',
            CATEGORIA_ELIMINADA: 'Categoría eliminada correctamente',
            
            PEDIDO_CREADO: 'Pedido registrado correctamente',
            PEDIDO_ACTUALIZADO: 'Pedido actualizado correctamente',
            PEDIDO_CANCELADO: 'Pedido cancelado correctamente',
            
            INGREDIENTE_CREADO: 'Ingrediente agregado correctamente',
            INGREDIENTE_ACTUALIZADO: 'Ingrediente actualizado correctamente',
            INGREDIENTE_ELIMINADO: 'Ingrediente eliminado correctamente',
            
            RECETA_CREADA: 'Receta creada correctamente',
            RECETA_ACTUALIZADA: 'Receta actualizada correctamente',
            RECETA_ELIMINADA: 'Receta eliminada correctamente',
            
            INVENTARIO_ACTUALIZADO: 'Inventario actualizado correctamente',
            MOVIMIENTO_REGISTRADO: 'Movimiento de inventario registrado correctamente'
        },
        
        ERROR: {
            CAMPO_REQUERIDO: 'Este campo es obligatorio',
            CONEXION_ERROR: 'Error de conexión con el servidor',
            DATOS_INVALIDOS: 'Los datos ingresados no son válidos',
            NO_ENCONTRADO: 'Registro no encontrado',
            SIN_AUTORIZACION: 'No tiene autorización para realizar esta acción',
            ERROR_SERVIDOR: 'Error interno del servidor',
            STOCK_INSUFICIENTE: 'Stock insuficiente para completar la operación',
            PRECIO_INVALIDO: 'El precio debe ser mayor a cero',
            CANTIDAD_INVALIDA: 'La cantidad debe ser mayor a cero'
        },
        
        CONFIRMACION: {
            ELIMINAR_CLIENTE: '¿Está seguro de eliminar este cliente?',
            ELIMINAR_EMPLEADO: '¿Está seguro de eliminar este empleado?',
            ELIMINAR_PRODUCTO: '¿Está seguro de eliminar este producto?',
            ELIMINAR_CATEGORIA: '¿Está seguro de eliminar esta categoría?',
            CANCELAR_PEDIDO: '¿Está seguro de cancelar este pedido?',
            ELIMINAR_INGREDIENTE: '¿Está seguro de eliminar este ingrediente?',
            ELIMINAR_RECETA: '¿Está seguro de eliminar esta receta?'
        }
    },
    
    UI_CONFIG: {
        DEBOUNCE_DELAY: 300,
        NOTIFICATION_DURATION: 5000, // 5 segundos
        MAX_SUGGESTIONS: 8,
        ITEMS_PER_PAGE: 10,
        MAX_ITEMS_PER_PAGE: 50
    },

    VALIDATIONS: {
        NOMBRE_MIN_LENGTH: 2,
        NOMBRE_MAX_LENGTH: 255,
        TELEFONO_LENGTH: 10,
        EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        PRECIO_MIN: 0.01,
        PRECIO_MAX: 999999.99,
        CANTIDAD_MIN: 0.01,
        CANTIDAD_MAX: 999999.99,
        DESCUENTO_MIN: 0,
        DESCUENTO_MAX: 100
    },
    
    MONEDA: {
        CODIGO: 'LPS',
        SIMBOLO: 'L',
        LOCALE: 'es-HN'
    },

    FORMATO_FECHA: {
        CORTO: 'DD/MM/YYYY',
        LARGO: 'DD/MM/YYYY HH:mm',
        COMPLETO: 'DD [de] MMMM [de] YYYY, HH:mm:ss'
    }
};
export { APP_CONSTANTS };
export default APP_CONSTANTS;
