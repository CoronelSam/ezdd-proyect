import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';
import { joinAdmin, off, onEstadoPedido, onNuevoPedido } from '../services/socket.service';
import { APP_CONSTANTS } from '../config/constants';

const { MODULOS } = APP_CONSTANTS;

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { usuario, logout } = useAuth();
    const { puedeVer } = usePermissions();
    const [notificacionPedido, setNotificacionPedido] = useState(null);

    useEffect(() => {
        // Conectar al socket y unirse a la sala admin
        joinAdmin();

        // Escuchar nuevos pedidos
        const handleNuevoPedido = (pedido) => {
            console.log('🆕 Nuevo pedido recibido:', pedido);
            setNotificacionPedido({
                tipo: 'nuevo',
                mensaje: `Nuevo pedido #${pedido.id_pedido}`,
                pedido
            });
            
            // Ocultar notificación después de 5 segundos
            setTimeout(() => setNotificacionPedido(null), 5000);
        };

        // Escuchar cambios de estado
        const handleEstadoPedido = ({ id_pedido, estado }) => {
            console.log('📝 Estado actualizado:', id_pedido, estado);
            setNotificacionPedido({
                tipo: 'estado',
                mensaje: `Pedido #${id_pedido}: ${estado}`,
                id_pedido,
                estado
            });
            
            setTimeout(() => setNotificacionPedido(null), 5000);
        };

        onNuevoPedido(handleNuevoPedido);
        onEstadoPedido(handleEstadoPedido);

        return () => {
            off('pedido:nuevo', handleNuevoPedido);
            off('pedido:estado', handleEstadoPedido);
        };
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        {
            name: 'Dashboard',
            path: '/admin/dashboard',
            permiso: MODULOS.DASHBOARD, // Solo admin y gerente
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            )
        },
        {
            name: 'Pedidos',
            path: '/admin/pedidos',
            permiso: MODULOS.PEDIDO,
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
            )
        },
        {
            name: 'Productos',
            path: '/admin/productos',
            permiso: MODULOS.PRODUCTO,
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            )
        },
        {
            name: 'Categorías',
            path: '/admin/categorias',
            permiso: MODULOS.CATEGORIA,
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
            )
        },
        {
            name: 'Inventario',
            path: '/admin/inventario',
            permiso: MODULOS.INVENTARIO,
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
            )
        },
        {
            name: 'Precios',
            path: '/admin/precios',
            permiso: MODULOS.PRECIO,
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            name: 'Clientes',
            path: '/admin/clientes',
            permiso: MODULOS.CLIENTE,
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            )
        },
        {
            name: 'Empleados',
            path: '/admin/empleados',
            permiso: MODULOS.EMPLEADO,
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            )
        },
        {
            name: 'Usuarios',
            path: '/admin/usuarios',
            permiso: MODULOS.USUARIO_SISTEMA,
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
            )
        }
    ];

    // Filtrar items del menú según permisos
    const navItemsFiltrados = navItems.filter(item => {
        if (!item.permiso) return true; // Dashboard visible para todos
        return puedeVer(item.permiso);
    });

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Notificación de pedidos */}
            {notificacionPedido && (
                <div className="fixed top-20 right-4 z-50 animate-slide-in">
                    <div className={`rounded-lg shadow-lg p-4 max-w-sm ${
                        notificacionPedido.tipo === 'nuevo' 
                            ? 'bg-green-500 text-white' 
                            : 'bg-blue-500 text-white'
                    }`}>
                        <div className="flex items-center gap-3">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <div>
                                <p className="font-semibold">{notificacionPedido.mensaje}</p>
                                <button 
                                    onClick={() => setNotificacionPedido(null)}
                                    className="text-xs underline mt-1"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Top Navigation Bar */}
            <nav className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo and Brand */}
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h1 className="text-xl font-bold text-gray-900">Panel Admin</h1>
                                <p className="text-xs text-gray-500">Gestión del Restaurante</p>
                            </div>
                        </div>

                        {/* Right Section */}
                        <div className="flex items-center gap-4">
                            {usuario && (
                                <div className="flex items-center gap-3">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-sm font-medium text-gray-900">{usuario.nombre}</p>
                                        <p className="text-xs text-gray-500">{usuario.puesto || 'Administrador'}</p>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        <span className="hidden sm:inline">Cerrar Sesión</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <div className="pt-16 flex bg-gray-50 min-h-screen">
                {/* Sidebar */}
                <aside className="w-64 bg-white shadow-lg h-[calc(100vh-4rem)] fixed left-0 top-16 overflow-y-auto">
                    <nav className="p-4 space-y-2">
                        {navItemsFiltrados.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                                    isActive(item.path)
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                {item.icon}
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        ))}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="ml-64 flex-1 bg-gray-50">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
