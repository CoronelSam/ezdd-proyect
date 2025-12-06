import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { clientesService, pedidosService, productosService } from '../../services';

const Dashboard = () => {
    const [stats, setStats] = useState({
        pedidosHoy: 0,
        pedidosPendientes: 0,
        totalVentasHoy: 0,
        productosActivos: 0,
        clientesRegistrados: 0
    });
    const [pedidosRecientes, setPedidosRecientes] = useState([]);
    const [clientesRecientes, setClientesRecientes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarDatos();
        const interval = setInterval(cargarDatos, 30000);
        return () => clearInterval(interval);
    }, []);

    const cargarDatos = async () => {
        try {
            const [pedidos, productos, clientes] = await Promise.all([
                pedidosService.getAll(),
                productosService.getAll(),
                clientesService.getAll()
            ]);

            const hoy = new Date().toDateString();
            const pedidosHoy = pedidos.filter(p => new Date(p.fecha_pedido).toDateString() === hoy);
            const totalVentas = pedidosHoy.reduce((sum, p) => sum + parseFloat(p.total), 0);
            const pendientes = pedidos.filter(p => p.estado === 'pendiente' || p.estado === 'en_preparacion');

            setStats({
                pedidosHoy: pedidosHoy.length,
                pedidosPendientes: pendientes.length,
                totalVentasHoy: totalVentas,
                productosActivos: productos.filter(p => p.activo).length,
                clientesRegistrados: clientes.length
            });

            setPedidosRecientes(pedidos.slice(0, 5));
            setClientesRecientes(clientes.slice(0, 5));
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
                {/* Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="shrink-0 bg-gradient-to-br from-orange-400 to-red-500 rounded-md p-3">
                                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <div className="ml-5">
                                <p className="text-sm font-medium text-gray-500">Pedidos Hoy</p>
                                <p className="text-2xl font-semibold text-gray-900">{stats.pedidosHoy}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="shrink-0 bg-yellow-500 rounded-md p-3">
                                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-5">
                                <p className="text-sm font-medium text-gray-500">Pendientes</p>
                                <p className="text-2xl font-semibold text-gray-900">{stats.pedidosPendientes}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="shrink-0 bg-gradient-to-br from-green-400 to-green-600 rounded-md p-3">
                                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-5">
                                <p className="text-sm font-medium text-gray-500">Ventas Hoy</p>
                                <p className="text-2xl font-semibold text-gray-900">{formatearPrecio(stats.totalVentasHoy)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="shrink-0 bg-gradient-to-br from-orange-500 to-red-600 rounded-md p-3">
                                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                            <div className="ml-5">
                                <p className="text-sm font-medium text-gray-500">Productos</p>
                                <p className="text-2xl font-semibold text-gray-900">{stats.productosActivos}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="shrink-0 bg-gradient-to-br from-pink-400 to-red-500 rounded-md p-3">
                                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <div className="ml-5">
                                <p className="text-sm font-medium text-gray-500">Clientes</p>
                                <p className="text-2xl font-semibold text-gray-900">{stats.clientesRegistrados}</p>
                            </div>
                        </div>
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

                {/* Grid de Pedidos y Clientes */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Pedidos Recientes */}
                    <div className="bg-white rounded-lg shadow">
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
