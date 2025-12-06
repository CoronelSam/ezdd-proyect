import { AbilityBuilder, Ability } from '@casl/ability';
import { APP_CONSTANTS } from './constants';

const { ROLES, MODULOS } = APP_CONSTANTS;

/**
 * Define las habilidades (permisos) de un usuario basándose en su rol
 * Implementación de RBAC (Role-Based Access Control) usando CASL
 */
export function definirAbilidades(usuario) {
    const { can, cannot, build } = new AbilityBuilder(Ability);

    // Usuario no autenticado o inactivo
    if (!usuario || !usuario.activo) {
        return build();
    }

    // ==================== ADMIN ====================
    if (usuario.rol === ROLES.ADMIN) {
        // Admin tiene acceso total a todo
        can('manage', 'all');
        return build();
    }

    // ==================== GERENTE ====================
    if (usuario.rol === ROLES.GERENTE) {
        // Productos y precios
        can('manage', MODULOS.PRODUCTO);
        can('manage', MODULOS.CATEGORIA);
        can('manage', MODULOS.PRECIO);
        can('manage', MODULOS.RECETA);
        
        // Inventario completo
        can('manage', MODULOS.INVENTARIO);
        can('manage', MODULOS.INGREDIENTE);
        can('manage', MODULOS.MOVIMIENTO_INVENTARIO);
        
        // Pedidos
        can('manage', MODULOS.PEDIDO);
        can('manage', MODULOS.DETALLE_PEDIDO);
        
        // Empleados (solo lectura - no puede crear/editar/eliminar)
        can('read', MODULOS.EMPLEADO);
        
        // Clientes
        can('manage', MODULOS.CLIENTE);
        
        // Reportes y estadísticas
        can('read', MODULOS.REPORTE);
        can('read', MODULOS.ESTADISTICA);
    }

    // ==================== CAJERO ====================
    if (usuario.rol === ROLES.CAJERO) {
        // Productos (solo lectura para consultar precios)
        can('read', MODULOS.PRODUCTO);
        can('read', MODULOS.CATEGORIA);
        can('read', MODULOS.PRECIO);
        
        // Pedidos (gestión completa de caja)
        can('create', MODULOS.PEDIDO);
        can('read', MODULOS.PEDIDO);
        can('update', MODULOS.PEDIDO);
        can('create', MODULOS.DETALLE_PEDIDO);
        can('read', MODULOS.DETALLE_PEDIDO);
        can('update', MODULOS.DETALLE_PEDIDO);
        
        // Clientes
        can('create', MODULOS.CLIENTE);
        can('read', MODULOS.CLIENTE);
        can('update', MODULOS.CLIENTE);
        
        // Inventario (solo lectura)
        can('read', MODULOS.INVENTARIO);
        can('read', MODULOS.INGREDIENTE);
        
        // Estadísticas básicas
        can('read', MODULOS.ESTADISTICA);
    }

    // ==================== MESERO ====================
    if (usuario.rol === ROLES.MESERO) {
        // Productos (solo lectura para mostrar menú)
        can('read', MODULOS.PRODUCTO);
        can('read', MODULOS.CATEGORIA);
        can('read', MODULOS.PRECIO);
        
        // Pedidos (crear y ver)
        can('create', MODULOS.PEDIDO);
        can('read', MODULOS.PEDIDO);
        can('create', MODULOS.DETALLE_PEDIDO);
        can('read', MODULOS.DETALLE_PEDIDO);
        
        // Puede actualizar solo observaciones de pedidos
        can('update', MODULOS.PEDIDO, ['observaciones']);
        
        // Clientes (registro básico)
        can('create', MODULOS.CLIENTE);
        can('read', MODULOS.CLIENTE);
    }

    // ==================== COCINERO ====================
    if (usuario.rol === ROLES.COCINERO) {
        // Pedidos (ver y actualizar estado)
        can('read', MODULOS.PEDIDO);
        can('read', MODULOS.DETALLE_PEDIDO);
        can('update', MODULOS.PEDIDO);
        
        // Productos (ver recetas)
        can('read', MODULOS.PRODUCTO);
        can('read', MODULOS.RECETA);
        
        // Inventario (consultar disponibilidad)
        can('read', MODULOS.INVENTARIO);
        can('read', MODULOS.INGREDIENTE);
        
        // Puede reportar uso de ingredientes
        can('create', MODULOS.MOVIMIENTO_INVENTARIO);
        can('read', MODULOS.MOVIMIENTO_INVENTARIO);
    }

    // ==================== PERMISOS COMUNES ====================
    // IMPORTANTE: No dar permiso 'read' general en USUARIO_SISTEMA
    // Solo ADMIN debe tener acceso al módulo de gestión de usuarios
    // Los usuarios pueden cambiar su propia contraseña a través de su perfil

    // Todos pueden ver su información de empleado (solo lectura)
    if (usuario.empleado_id) {
        can('read', MODULOS.EMPLEADO, { empleado_id: usuario.empleado_id });
    }

    return build();
}

/**
 * Verifica si un usuario tiene un permiso específico
 */
export function verificarPermiso(usuario, accion, sujeto, condiciones = {}) {
    const habilidad = definirAbilidades(usuario);
    return habilidad.can(accion, sujeto, condiciones);
}
