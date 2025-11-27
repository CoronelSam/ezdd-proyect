import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import pedidosService from '../../services/pedidos.service';

const MisPedidos = () => {
    const { usuario } = useAuth();
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtroEstado, setFiltroEstado] = useState('todos');

    useEffect(() => {
        cargarPedidos();
        // Auto-actualizar cada 30 segundos
        const interval = setInterval(cargarPedidos, 30000);
        return () => clearInterval(interval);
    }, [usuario]);

    const cargarPedidos = async () => {
        try {
            setLoading(true);
            
            // Si el usuario no está autenticado o no tiene id_cliente, no cargar pedidos
            if (!usuario || !usuario.id_cliente) {
                setPedidos([]);
                setError('Debes iniciar sesión para ver tus pedidos');
                setLoading(false);
                return;
            }
            
            // Cargar solo los pedidos del cliente autenticado
            const data = await pedidosService.getByCliente(usuario.id_cliente);
            
            // Ordenar por fecha más reciente
            const pedidosOrdenados = data.sort((a, b) => 
                new Date(b.fecha_pedido) - new Date(a.fecha_pedido)
            );
            setPedidos(pedidosOrdenados);
            setError(null);
        } catch (err) {
            console.error('Error al cargar pedidos:', err);
            setError('No se pudieron cargar los pedidos');
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
                icono: '📦'
            },
            cancelado: {
                texto: 'Cancelado',
                color: 'bg-red-100 text-red-800 border-red-300',
                icono: '❌'
            }
        };
        return estados[estado] || estados.pendiente;
    };

    const pedidosFiltrados = filtroEstado === 'todos' 
        ? pedidos 
        : pedidos.filter(p => p.estado === filtroEstado);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 py-12">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
                        <p className="text-gray-600">Cargando tus pedidos...</p>
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
                            onClick={cargarPedidos}
                            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
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
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">Mis Pedidos</h1>
                    <p className="text-gray-600">Revisa el estado de tus pedidos en tiempo real</p>
                </div>

                {/* Filtros */}
                <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setFiltroEstado('todos')}
                            className={`px-4 py-2 rounded-lg transition ${
                                filtroEstado === 'todos'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Todos ({pedidos.length})
                        </button>
                        <button
                            onClick={() => setFiltroEstado('pendiente')}
                            className={`px-4 py-2 rounded-lg transition ${
                                filtroEstado === 'pendiente'
                                    ? 'bg-yellow-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Pendiente
                        </button>
                        <button
                            onClick={() => setFiltroEstado('en_preparacion')}
                            className={`px-4 py-2 rounded-lg transition ${
                                filtroEstado === 'en_preparacion'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            En Preparación
                        </button>
                        <button
                            onClick={() => setFiltroEstado('listo')}
                            className={`px-4 py-2 rounded-lg transition ${
                                filtroEstado === 'listo'
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Listo
                        </button>
                        <button
                            onClick={() => setFiltroEstado('entregado')}
                            className={`px-4 py-2 rounded-lg transition ${
                                filtroEstado === 'entregado'
                                    ? 'bg-gray-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Entregado
                        </button>
                    </div>
                </div>

                {/* Lista de pedidos */}
                {pedidosFiltrados.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <p className="text-gray-500 text-lg mb-2">No tienes pedidos</p>
                        <p className="text-gray-400">¡Realiza tu primer pedido!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pedidosFiltrados.map((pedido) => {
                            const estadoInfo = obtenerEstadoInfo(pedido.estado);
                            return (
                                <div key={pedido.id_pedido} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                                    <div className="p-6">
                                        {/* Header del pedido */}
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-xl font-bold text-gray-800">
                                                        Pedido #{pedido.id_pedido}
                                                    </h3>
                                                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${estadoInfo.color}`}>
                                                        {estadoInfo.icono} {estadoInfo.texto}
                                                    </span>
                                                </div>
                                                <p className="text-gray-500 text-sm">
                                                    {formatearFecha(pedido.fecha_pedido)}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-500 mb-1">Total</p>
                                                <p className="text-2xl font-bold text-blue-600">
                                                    {formatearPrecio(pedido.total)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Notas del pedido */}
                                        {pedido.notas && (
                                            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-medium">Notas:</span> {pedido.notas}
                                                </p>
                                            </div>
                                        )}

                                        {/* Detalles del pedido */}
                                        <div className="border-t pt-4">
                                            <h4 className="font-semibold text-gray-700 mb-3">Productos:</h4>
                                            <div className="space-y-2">
                                                {(pedido.detalles || pedido.DetallePedidos || []).map((detalle, index) => (
                                                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                                                        <div className="flex-1">
                                                            <p className="font-medium text-gray-800">
                                                                {detalle.Producto?.nombre || detalle.producto?.nombre || 'Producto'}
                                                            </p>
                                                            <p className="text-sm text-gray-500">
                                                                {detalle.PrecioProducto?.nombre_presentacion || detalle.precioProducto?.nombre_presentacion || 'Precio no disponible'}
                                                            </p>
                                                            {detalle.instrucciones_especiales && (
                                                                <p className="text-sm text-gray-600 italic mt-1">
                                                                    "{detalle.instrucciones_especiales}"
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-gray-700">
                                                                <span className="font-medium">{detalle.cantidad}x</span> {formatearPrecio(detalle.precio_unitario)}
                                                            </p>
                                                            <p className="text-sm font-semibold text-gray-900">
                                                                {formatearPrecio(detalle.subtotal)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Línea de tiempo del estado */}
                                        <div className="mt-6 pt-4 border-t">
                                            <div className="flex justify-between items-center">
                                                {['pendiente', 'en_preparacion', 'listo', 'entregado'].map((estado, index) => {
                                                    const info = obtenerEstadoInfo(estado);
                                                    const estaCompleto = ['pendiente', 'en_preparacion', 'listo', 'entregado'].indexOf(pedido.estado) >= index;
                                                    const esActual = pedido.estado === estado;
                                                    
                                                    return (
                                                        <div key={estado} className="flex-1 flex items-center">
                                                            <div className="flex flex-col items-center">
                                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                                                                    estaCompleto 
                                                                        ? esActual 
                                                                            ? 'bg-blue-500 text-white ring-4 ring-blue-200' 
                                                                            : 'bg-green-500 text-white'
                                                                        : 'bg-gray-200 text-gray-400'
                                                                }`}>
                                                                    {info.icono}
                                                                </div>
                                                                <p className={`text-xs mt-2 text-center ${
                                                                    estaCompleto ? 'text-gray-700 font-medium' : 'text-gray-400'
                                                                }`}>
                                                                    {info.texto}
                                                                </p>
                                                            </div>
                                                            {index < 3 && (
                                                                <div className={`flex-1 h-1 mx-2 ${
                                                                    estaCompleto && !esActual ? 'bg-green-500' : 'bg-gray-200'
                                                                }`}></div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MisPedidos;
