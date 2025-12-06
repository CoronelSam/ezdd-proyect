import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useCarrito } from '../../hooks/useCarrito';
import pedidosService from '../../services/pedidos.service';

const HistorialPedidos = () => {
    const { usuario } = useAuth();
    const { agregarItem } = useCarrito();
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pedidoExpandido, setPedidoExpandido] = useState(null);
    const [notificacion, setNotificacion] = useState(null);

    useEffect(() => {
        cargarHistorial();
    }, [usuario]);

    const cargarHistorial = async () => {
        try {
            setLoading(true);
            
            if (!usuario || !usuario.id_cliente) {
                setPedidos([]);
                setError('Debes iniciar sesión para ver tu historial');
                setLoading(false);
                return;
            }
            
            // Cargar todos los pedidos del cliente
            const data = await pedidosService.getByCliente(usuario.id_cliente);
            
            // Ordenar por fecha más reciente
            const pedidosOrdenados = data.sort((a, b) => 
                new Date(b.fecha_pedido) - new Date(a.fecha_pedido)
            );
            setPedidos(pedidosOrdenados);
            setError(null);
        } catch (err) {
            console.error('Error al cargar historial:', err);
            setError('Error al cargar el historial de pedidos');
        } finally {
            setLoading(false);
        }
    };

    const formatearFecha = (fecha) => {
        return new Date(fecha).toLocaleString('es-HN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatearPrecio = (precio) => {
        return new Intl.NumberFormat('es-HN', {
            style: 'currency',
            currency: 'HNL'
        }).format(precio);
    };

    const obtenerEstadoInfo = (estado) => {
        const estados = {
            pendiente: {
                texto: 'Pendiente',
                color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
                icono: '⏳'
            },
            en_preparacion: {
                texto: 'En Preparación',
                color: 'bg-blue-100 text-blue-800 border-blue-300',
                icono: '👨‍🍳'
            },
            listo: {
                texto: 'Listo',
                color: 'bg-green-100 text-green-800 border-green-300',
                icono: '✅'
            },
            entregado: {
                texto: 'Entregado',
                color: 'bg-gray-100 text-gray-800 border-gray-300',
                icono: '🎉'
            },
            cancelado: {
                texto: 'Cancelado',
                color: 'bg-red-100 text-red-800 border-red-300',
                icono: '❌'
            }
        };
        return estados[estado] || estados.pendiente;
    };

    const pedirDeNuevo = async (pedido) => {
        try {
            const detalles = pedido.detalles || pedido.DetallePedidos || [];
            
            if (detalles.length === 0) {
                setNotificacion({ tipo: 'error', mensaje: 'No se pudieron cargar los productos del pedido' });
                return;
            }

            // Agregar cada producto al carrito
            let productosAgregados = 0;
            for (const detalle of detalles) {
                const producto = detalle.Producto || detalle.producto;
                const precio = detalle.PrecioProducto || detalle.precioProducto;
                
                if (producto && precio) {
                    agregarItem(producto, precio, detalle.cantidad, detalle.instrucciones_especiales || '');
                    productosAgregados++;
                }
            }

            if (productosAgregados > 0) {
                setNotificacion({ 
                    tipo: 'exito', 
                    mensaje: `✅ ${productosAgregados} producto(s) agregado(s) al carrito` 
                });
                setTimeout(() => setNotificacion(null), 3000);
            }
        } catch (err) {
            console.error('Error al pedir de nuevo:', err);
            setNotificacion({ tipo: 'error', mensaje: 'Error al agregar productos al carrito' });
            setTimeout(() => setNotificacion(null), 3000);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 py-12">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mb-4"></div>
                        <p className="text-gray-600">Cargando historial...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 py-12">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <p className="text-red-600 mb-4">{error}</p>
                        <button
                            onClick={cargarHistorial}
                            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                        >
                            Reintentar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 py-12">
            <div className="max-w-6xl mx-auto px-4">
                {/* Notificación */}
                {notificacion && (
                    <div className="fixed top-4 right-4 z-50 animate-slide-in">
                        <div className={`rounded-lg shadow-lg p-4 max-w-sm ${
                            notificacion.tipo === 'exito' 
                                ? 'bg-green-500 text-white' 
                                : 'bg-red-500 text-white'
                        }`}>
                            <p className="font-medium">{notificacion.mensaje}</p>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-800 mb-2">Historial de Pedidos</h1>
                            <p className="text-gray-600">Consulta todos tus pedidos anteriores</p>
                        </div>
                        <a
                            href="/mis-pedidos"
                            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition shadow-lg flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Pedidos Activos
                        </a>
                    </div>
                </div>

                {/* Lista de pedidos */}
                {pedidos.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <div className="text-6xl mb-4">📦</div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No hay pedidos en tu historial</h3>
                        <p className="text-gray-500 mb-6">Haz tu primer pedido y aparecerá aquí</p>
                        <a
                            href="/menu"
                            className="inline-block px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition"
                        >
                            Ver Menú
                        </a>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pedidos.map((pedido) => {
                            const estadoInfo = obtenerEstadoInfo(pedido.estado);
                            const estaExpandido = pedidoExpandido === pedido.id_pedido;
                            const detalles = pedido.detalles || pedido.DetallePedidos || [];

                            return (
                                <div key={pedido.id_pedido} className="bg-white rounded-lg shadow-md overflow-hidden">
                                    {/* Header compacto */}
                                    <div 
                                        className="p-6 cursor-pointer hover:bg-gray-50 transition"
                                        onClick={() => setPedidoExpandido(estaExpandido ? null : pedido.id_pedido)}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-4">
                                                <div className="text-2xl">{estadoInfo.icono}</div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-800">
                                                        Pedido #{pedido.id_pedido}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">
                                                        {formatearFecha(pedido.fecha_pedido)}
                                                    </p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${estadoInfo.color}`}>
                                                    {estadoInfo.texto}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-500">Total</p>
                                                    <p className="text-xl font-bold text-gray-800">
                                                        {formatearPrecio(pedido.total)}
                                                    </p>
                                                </div>
                                                <svg 
                                                    className={`w-6 h-6 text-gray-400 transition-transform ${estaExpandido ? 'rotate-180' : ''}`} 
                                                    fill="none" 
                                                    viewBox="0 0 24 24" 
                                                    stroke="currentColor"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Detalles expandidos - Factura completa */}
                                    {estaExpandido && (
                                        <div className="border-t bg-gray-50 p-6">
                                            {/* Información del pedido */}
                                            <div className="bg-white rounded-lg p-6 mb-4 border border-gray-200">
                                                <h4 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    Factura del Pedido
                                                </h4>

                                                {/* Productos */}
                                                <div className="space-y-3 mb-4">
                                                    {detalles.map((detalle, index) => (
                                                        <div key={index} className="flex justify-between items-start py-3 border-b border-gray-200 last:border-0">
                                                            <div className="flex-1">
                                                                <p className="font-semibold text-gray-800">
                                                                    {detalle.Producto?.nombre || detalle.producto?.nombre || 'Producto'}
                                                                </p>
                                                                <p className="text-sm text-gray-500">
                                                                    {detalle.PrecioProducto?.nombre_presentacion || detalle.precioProducto?.nombre_presentacion || 'Presentación'}
                                                                </p>
                                                                {detalle.instrucciones_especiales && (
                                                                    <p className="text-sm text-gray-600 italic mt-1 bg-yellow-50 px-2 py-1 rounded">
                                                                        💬 {detalle.instrucciones_especiales}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <div className="text-right ml-4">
                                                                <p className="text-gray-700">
                                                                    {detalle.cantidad} × {formatearPrecio(detalle.precio_unitario)}
                                                                </p>
                                                                <p className="font-bold text-gray-900">
                                                                    {formatearPrecio(detalle.subtotal)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Totales */}
                                                <div className="border-t-2 border-gray-300 pt-4 mt-4">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-gray-600">Subtotal:</span>
                                                        <span className="font-semibold text-gray-800">
                                                            {formatearPrecio(detalles.reduce((sum, d) => sum + parseFloat(d.subtotal), 0))}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-xl font-bold text-gray-900">
                                                        <span>Total:</span>
                                                        <span className="text-orange-600">{formatearPrecio(pedido.total)}</span>
                                                    </div>
                                                </div>

                                                {/* Notas */}
                                                {pedido.notas && (
                                                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                        <p className="text-sm font-semibold text-gray-700 mb-1">Notas del pedido:</p>
                                                        <p className="text-sm text-gray-600">{pedido.notas}</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Botón Pedir de nuevo */}
                                            <button
                                                onClick={() => pedirDeNuevo(pedido)}
                                                className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-red-700 transition shadow-lg flex items-center justify-center gap-2"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                                Pedir de Nuevo
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HistorialPedidos;
