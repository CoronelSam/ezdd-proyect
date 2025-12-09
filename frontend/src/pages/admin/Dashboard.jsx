import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Can } from '@casl/react';
import { clientesService, pedidosService, productosService, inventariosService, categoriasService } from '../../services';
import { usePermissions } from '../../hooks/usePermissions';
import { APP_CONSTANTS } from '../../config/constants';

const Dashboard = () => {
    const { ability } = usePermissions();
    
    // Verificar si el usuario tiene permiso para ver el Dashboard
    if (!ability.can('read', APP_CONSTANTS.MODULOS.DASHBOARD)) {
        return <Navigate to="/admin/pedidos" replace />;
    }
    
    const [stats, setStats] = useState({
        pedidosHoy: 0,
        pedidosPendientes: 0,
        pedidosEnPreparacion: 0,
        pedidosListos: 0,
        totalVentasHoy: 0,
        totalVentasSemana: 0,
        totalVentasMes: 0,
        promedioVentaDiaria: 0,
        productosActivos: 0,
        productosInactivos: 0,
        clientesRegistrados: 0,
        clientesActivos: 0,
        categorias: 0,
        inventarioBajoStock: 0,
        pedidosCancelados: 0
    });
    const [pedidosRecientes, setPedidosRecientes] = useState([]);
    const [clientesRecientes, setClientesRecientes] = useState([]);
    const [productosMasVendidos, setProductosMasVendidos] = useState([]);
    const [inventarioCritico, setInventarioCritico] = useState([]);
    const [ventasPorEstado, setVentasPorEstado] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarDatos();
        const interval = setInterval(cargarDatos, 30000);
        return () => clearInterval(interval);
    }, []);

    const cargarDatos = async () => {
        try {
            const [pedidos, productos, clientes, inventarios, categorias] = await Promise.all([
                pedidosService.getAll(),
                productosService.getAll(),
                clientesService.getAll(),
                inventariosService.getAll().catch(() => []),
                categoriasService.getAll().catch(() => [])
            ]);

            // Calcular fechas
            const hoy = new Date();
            const inicioSemana = new Date(hoy);
            inicioSemana.setDate(hoy.getDate() - 7);
            const inicioMes = new Date(hoy);
            inicioMes.setDate(1);

            // Filtrar pedidos
            const pedidosHoy = pedidos.filter(p => {
                const fechaPedido = new Date(p.fecha_pedido);
                return fechaPedido.toDateString() === hoy.toDateString();
            });

            const pedidosSemana = pedidos.filter(p => {
                const fechaPedido = new Date(p.fecha_pedido);
                return fechaPedido >= inicioSemana;
            });

            const pedidosMes = pedidos.filter(p => {
                const fechaPedido = new Date(p.fecha_pedido);
                return fechaPedido >= inicioMes;
            });

            // Calcular ventas - SOLO pedidos entregados
            const totalVentasHoy = pedidosHoy
                .filter(p => p.estado === 'entregado')
                .reduce((sum, p) => sum + parseFloat(p.total || 0), 0);
            
            const totalVentasSemana = pedidosSemana
                .filter(p => p.estado === 'entregado')
                .reduce((sum, p) => sum + parseFloat(p.total || 0), 0);
            
            const totalVentasMes = pedidosMes
                .filter(p => p.estado === 'entregado')
                .reduce((sum, p) => sum + parseFloat(p.total || 0), 0);

            const diasDelMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate();
            const promedioVentaDiaria = pedidosMes.length > 0 
                ? totalVentasMes / diasDelMes
                : 0;

            // Filtrar por estados
            const pendientes = pedidos.filter(p => p.estado === 'pendiente');
            const enPreparacion = pedidos.filter(p => p.estado === 'en_preparacion');
            const listos = pedidos.filter(p => p.estado === 'listo');
            const cancelados = pedidos.filter(p => p.estado === 'cancelado');

            // Productos más vendidos - SOLO pedidos entregados
            const productoVentas = {};
            pedidosMes.forEach(pedido => {
                if (pedido.estado === 'entregado' && pedido.detalles) {
                    pedido.detalles.forEach(detalle => {
                        const productoNombre = detalle.producto?.nombre || 'Producto desconocido';
                        if (!productoVentas[productoNombre]) {
                            productoVentas[productoNombre] = {
                                nombre: productoNombre,
                                cantidad: 0,
                                total: 0
                            };
                        }
                        productoVentas[productoNombre].cantidad += detalle.cantidad;
                        productoVentas[productoNombre].total += parseFloat(detalle.subtotal || 0);
                    });
                }
            });

            const topProductos = Object.values(productoVentas)
                .sort((a, b) => b.cantidad - a.cantidad)
                .slice(0, 5);

            // Inventario crítico
            const inventarioBajo = inventarios.filter(inv => {
                const stockActual = parseFloat(inv.cantidad_actual || 0);
                const stockMinimo = parseFloat(inv.ingrediente?.stock_minimo || 0);
                return stockActual < stockMinimo && inv.ingrediente?.activo;
            }).slice(0, 5);

            // Ventas por estado
            const estadosPedidos = [
                { estado: 'Pendiente', cantidad: pendientes.length, color: 'bg-yellow-500' },
                { estado: 'En Preparación', cantidad: enPreparacion.length, color: 'bg-blue-500' },
                { estado: 'Listo', cantidad: listos.length, color: 'bg-green-500' },
                { estado: 'Entregado', cantidad: pedidos.filter(p => p.estado === 'entregado').length, color: 'bg-gray-500' },
                { estado: 'Cancelado', cantidad: cancelados.length, color: 'bg-red-500' }
            ];

            setStats({
                pedidosHoy: pedidosHoy.length,
                pedidosPendientes: pendientes.length,
                pedidosEnPreparacion: enPreparacion.length,
                pedidosListos: listos.length,
                totalVentasHoy,
                totalVentasSemana,
                totalVentasMes,
                promedioVentaDiaria,
                productosActivos: productos.filter(p => p.activo).length,
                productosInactivos: productos.filter(p => !p.activo).length,
                clientesRegistrados: clientes.length,
                clientesActivos: clientes.filter(c => c.activo).length,
                categorias: categorias.filter(c => c.activa).length,
                inventarioBajoStock: inventarioBajo.length,
                pedidosCancelados: cancelados.length
            });

            setPedidosRecientes(pedidos.slice(0, 6));
            setClientesRecientes(clientes.slice(0, 5));
            setProductosMasVendidos(topProductos);
            setInventarioCritico(inventarioBajo);
            setVentasPorEstado(estadosPedidos);
        } catch (error) {
            console.error('Error al cargar datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatearPrecio = (precio) => {
        return new Intl.NumberFormat('es-HN', {
            style: 'currency',
            currency: 'HNL'
        }).format(precio);
    };

    const formatearFecha = (fecha) => {
        return new Date(fecha).toLocaleString('es-HN', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const obtenerEstadoColor = (estado) => {
        const colores = {
            pendiente: 'bg-yellow-100 text-yellow-800',
            en_preparacion: 'bg-blue-100 text-blue-800',
            listo: 'bg-green-100 text-green-800',
            entregado: 'bg-gray-100 text-gray-800',
            cancelado: 'bg-red-100 text-red-800'
        };
        return colores[estado] || colores.pendiente;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50">
            {/* Header */}
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">Panel de Administración</h1>
                    <p className="text-gray-600 mt-1">Gestiona tu restaurante desde aquí</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Estadísticas Principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Ventas Hoy */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Ventas de Hoy</p>
                        <p className="text-3xl font-bold text-gray-900">{formatearPrecio(stats.totalVentasHoy)}</p>
                        <p className="text-xs text-green-600 mt-2">✓ Solo pedidos entregados</p>
                    </div>

                    {/* Ventas del Mes */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Ventas del Mes</p>
                        <p className="text-3xl font-bold text-gray-900">{formatearPrecio(stats.totalVentasMes)}</p>
                        <p className="text-xs text-blue-600 mt-2">Promedio: {formatearPrecio(stats.promedioVentaDiaria)}/día</p>
                    </div>

                    {/* Pedidos Pendientes */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-yellow-100 rounded-lg">
                                <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-sm font-medium text-gray-500 mb-1">En Proceso</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.pedidosPendientes + stats.pedidosEnPreparacion}</p>
                        <p className="text-xs text-gray-500 mt-2">
                            {stats.pedidosPendientes} pendientes · {stats.pedidosEnPreparacion} en cocina
                        </p>
                    </div>

                    {/* Inventario Crítico */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-red-100 rounded-lg">
                                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Inventario Bajo</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.inventarioBajoStock}</p>
                        <p className="text-xs text-red-600 mt-2">⚠️ Requiere atención</p>
                    </div>
                </div>

                {/* Estadísticas Secundarias */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
                    <div className="bg-white rounded-lg shadow p-4 text-center">
                        <p className="text-2xl font-bold text-orange-600">{stats.productosActivos}</p>
                        <p className="text-xs text-gray-500 mt-1">Productos Activos</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4 text-center">
                        <p className="text-2xl font-bold text-pink-600">{stats.clientesActivos}</p>
                        <p className="text-xs text-gray-500 mt-1">Clientes Activos</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4 text-center">
                        <p className="text-2xl font-bold text-purple-600">{stats.categorias}</p>
                        <p className="text-xs text-gray-500 mt-1">Categorías</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4 text-center">
                        <p className="text-2xl font-bold text-green-600">{stats.pedidosListos}</p>
                        <p className="text-xs text-gray-500 mt-1">Listos</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4 text-center">
                        <p className="text-2xl font-bold text-blue-600">{formatearPrecio(stats.totalVentasSemana)}</p>
                        <p className="text-xs text-gray-500 mt-1">Ventas Semana</p>
                        <p className="text-xs text-green-600 mt-0.5">✓ Entregados</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4 text-center">
                        <p className="text-2xl font-bold text-gray-600">{stats.pedidosCancelados}</p>
                        <p className="text-xs text-gray-500 mt-1">Cancelados</p>
                    </div>
                </div>

                {/* Accesos Rápidos */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Link to="/admin/pedidos" className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 flex items-center">
                        <div className="bg-blue-100 rounded-lg p-3 mr-4">
                            <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Pedidos</h3>
                            <p className="text-sm text-gray-500">Gestionar órdenes</p>
                        </div>
                    </Link>

                    <Link to="/admin/productos" className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 flex items-center">
                        <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg p-3 mr-4">
                            <svg className="h-8 w-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Productos</h3>
                            <p className="text-sm text-gray-500">Administrar menú</p>
                        </div>
                    </Link>

                    <Link to="/admin/categorias" className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 flex items-center">
                        <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-lg p-3 mr-4">
                            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Categorías</h3>
                            <p className="text-sm text-gray-500">Organizar productos</p>
                        </div>
                    </Link>

                    <Link to="/admin/inventario" className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 flex items-center">
                        <div className="bg-gradient-to-br from-yellow-100 to-orange-200 rounded-lg p-3 mr-4">
                            <svg className="h-8 w-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Inventario</h3>
                            <p className="text-sm text-gray-500">Control de stock</p>
                        </div>
                    </Link>
                </div>

                {/* Gráfico de Pedidos por Estado */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Distribución de Pedidos</h2>
                    <div className="space-y-4">
                        {ventasPorEstado.map((estado, index) => {
                            const maxCantidad = Math.max(...ventasPorEstado.map(e => e.cantidad));
                            const porcentaje = maxCantidad > 0 ? (estado.cantidad / maxCantidad) * 100 : 0;
                            return (
                                <div key={index}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700">{estado.estado}</span>
                                        <span className="text-sm font-bold text-gray-900">{estado.cantidad}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div 
                                            className={`${estado.color} h-3 rounded-full transition-all duration-500`}
                                            style={{ width: `${porcentaje}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Grid de Contenido */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Productos Más Vendidos */}
                    <div className="bg-white rounded-xl shadow-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">🏆 Productos Más Vendidos</h2>
                            <p className="text-sm text-gray-500 mt-1">Top 5 del mes (pedidos entregados)</p>
                        </div>
                        <div className="p-6">
                            {productosMasVendidos.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                    <p>No hay datos disponibles</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {productosMasVendidos.map((producto, index) => (
                                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                                            <div className="flex items-center gap-3">
                                                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                                                    index === 0 ? 'bg-yellow-400 text-yellow-900' :
                                                    index === 1 ? 'bg-gray-300 text-gray-700' :
                                                    index === 2 ? 'bg-orange-400 text-orange-900' :
                                                    'bg-blue-100 text-blue-700'
                                                } font-bold text-sm`}>
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{producto.nombre}</p>
                                                    <p className="text-sm text-gray-500">{producto.cantidad} unidades vendidas</p>
                                                </div>
                                            </div>
                                            <p className="font-bold text-green-600">{formatearPrecio(producto.total)}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Inventario Crítico */}
                    <div className="bg-white rounded-xl shadow-lg">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">⚠️ Inventario Crítico</h2>
                                <p className="text-sm text-gray-500 mt-1">Ingredientes bajo stock mínimo</p>
                            </div>
                            <Link to="/admin/inventario" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                Ver todo →
                            </Link>
                        </div>
                        <div className="p-6">
                            {inventarioCritico.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <svg className="mx-auto h-12 w-12 text-green-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-green-600 font-medium">✓ Todo el inventario está bien</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {inventarioCritico.map((item, index) => {
                                        const stockActual = parseFloat(item.cantidad_actual || 0);
                                        const stockMinimo = parseFloat(item.ingrediente?.stock_minimo || 0);
                                        const porcentaje = stockMinimo > 0 ? (stockActual / stockMinimo) * 100 : 0;
                                        return (
                                            <div key={index} className="border border-red-200 bg-red-50 rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div>
                                                        <p className="font-medium text-gray-900">{item.ingrediente?.nombre}</p>
                                                        <p className="text-xs text-gray-600">
                                                            Stock: {stockActual.toFixed(2)} / {stockMinimo.toFixed(2)} {item.ingrediente?.unidad_medida}
                                                        </p>
                                                    </div>
                                                    <span className="text-sm font-bold text-red-600">{porcentaje.toFixed(0)}%</span>
                                                </div>
                                                <div className="w-full bg-red-200 rounded-full h-2">
                                                    <div 
                                                        className="bg-red-600 h-2 rounded-full transition-all"
                                                        style={{ width: `${Math.min(porcentaje, 100)}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Grid de Pedidos y Clientes */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Pedidos Recientes */}
                    <div className="bg-white rounded-xl shadow-lg">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">Pedidos Recientes</h2>
                            <Link to="/admin/pedidos" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                Ver todos →
                            </Link>
                        </div>
                        <div className="divide-y divide-gray-200">
                            {pedidosRecientes.length === 0 ? (
                                <div className="p-6 text-center text-gray-500">
                                    No hay pedidos recientes
                                </div>
                            ) : (
                                pedidosRecientes.map((pedido) => (
                                    <div key={pedido.id_pedido} className="p-6 hover:bg-gray-50 transition">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="shrink-0">
                                                    <span className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gray-200 text-gray-600 font-semibold text-lg">
                                                        #{pedido.id_pedido}
                                                    </span>
                                                </div>
                                                <div className="ml-4">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        Pedido #{pedido.id_pedido}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {formatearFecha(pedido.fecha_pedido)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${obtenerEstadoColor(pedido.estado)}`}>
                                                    {pedido.estado.replace('_', ' ')}
                                                </span>
                                                <p className="text-lg font-semibold text-gray-900">
                                                    {formatearPrecio(pedido.total)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Clientes Recientes */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">Clientes Recientes</h2>
                            <Link to="/admin/clientes" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                Ver todos →
                            </Link>
                        </div>
                        <div className="divide-y divide-gray-200">
                            {clientesRecientes.length === 0 ? (
                                <div className="p-6 text-center text-gray-500">
                                    No hay clientes registrados
                                </div>
                            ) : (
                                clientesRecientes.map((cliente) => (
                                    <div key={cliente.id_cliente} className="p-6 hover:bg-gray-50 transition">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="shrink-0">
                                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center">
                                                        <span className="text-white font-semibold text-lg">
                                                            {cliente.nombre.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {cliente.nombre}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {cliente.email}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${cliente.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                    {cliente.activo ? 'Activo' : 'Inactivo'}
                                                </span>
                                                {cliente.telefono && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {cliente.telefono}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
