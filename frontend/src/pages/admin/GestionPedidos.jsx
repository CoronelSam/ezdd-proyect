import { useEffect, useState } from 'react';
import { pedidosService } from '../../services';

/**
 * Panel para visualizar y gestionar el estado de las órdenes
 */
function GestionPedidos() {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [actualizando, setActualizando] = useState(null);

    const estados = [
        { value: 'todos', label: 'Todos', color: 'gray' },
        { value: 'pendiente', label: 'Pendiente', color: 'yellow' },
        { value: 'en_preparacion', label: 'En Preparación', color: 'blue' },
        { value: 'listo', label: 'Listo', color: 'green' },
        { value: 'entregado', label: 'Entregado', color: 'purple' },
        { value: 'cancelado', label: 'Cancelado', color: 'red' }
    ];

    useEffect(() => {
        cargarPedidos();
        // Actualizar cada 30 segundos
        const interval = setInterval(cargarPedidos, 30000);
        return () => clearInterval(interval);
    }, []);

    const cargarPedidos = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await pedidosService.getAll();
            setPedidos(response || []);
        } catch (err) {
            console.error('Error al cargar pedidos:', err);
            setError('No se pudieron cargar los pedidos');
        } finally {
            setLoading(false);
        }
    };

    const actualizarEstado = async (idPedido, nuevoEstado) => {
        try {
            setActualizando(idPedido);
            await pedidosService.updateEstado(idPedido, nuevoEstado);
            await cargarPedidos();
        } catch (err) {
            console.error('Error al actualizar estado:', err);
            alert('No se pudo actualizar el estado del pedido');
        } finally {
            setActualizando(null);
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
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getColorEstado = (estado) => {
        const estadoInfo = estados.find(e => e.value === estado);
        return estadoInfo?.color || 'gray';
    };

    const pedidosFiltrados = filtroEstado === 'todos'
        ? pedidos
        : pedidos.filter(p => p.estado === filtroEstado);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-brand-50 to-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-brand-600 mx-auto mb-4"></div>
                    <p className="text-lg text-neutral-600">Cargando pedidos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <h1 className="font-display text-4xl text-brand-700 mb-2">Gestión de Pedidos</h1>
                    <p className="text-neutral-600">Administra el estado de las órdenes en tiempo real</p>
                </div>
            </header>

            {/* Filtros */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <div className="flex flex-wrap gap-2">
                        {estados.map((estado) => (
                            <button
                                key={estado.value}
                                onClick={() => setFiltroEstado(estado.value)}
                                className={`px-4 py-2 rounded-lg font-medium transition ${
                                    filtroEstado === estado.value
                                        ? 'bg-brand-500 text-white'
                                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                                }`}
                            >
                                {estado.label}
                                <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-white bg-opacity-30">
                                    {estado.value === 'todos'
                                        ? pedidos.length
                                        : pedidos.filter(p => p.estado === estado.value).length}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Lista de pedidos */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {pedidosFiltrados.length === 0 ? (
                    <div className="text-center py-16">
                        <svg className="mx-auto h-24 w-24 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No hay pedidos</h3>
                        <p className="text-neutral-500">
                            {filtroEstado === 'todos'
                                ? 'No se encontraron pedidos'
                                : `No hay pedidos en estado "${estados.find(e => e.value === filtroEstado)?.label}"`}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {pedidosFiltrados.map((pedido) => (
                            <div
                                key={pedido.id_pedido}
                                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                            >
                                {/* Header del pedido */}
                                <div className="bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-4 text-white">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-sm opacity-90">Pedido</p>
                                            <p className="text-2xl font-bold">#{pedido.id_pedido}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm opacity-90">Total</p>
                                            <p className="text-xl font-bold">{formatearPrecio(pedido.total)}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Contenido */}
                                <div className="p-6">
                                    {/* Información del pedido */}
                                    <div className="mb-4">
                                        <p className="text-sm text-neutral-500 mb-1">Fecha</p>
                                        <p className="text-gray-800">{formatearFecha(pedido.fecha_pedido)}</p>
                                    </div>

                                    {/* Estado actual */}
                                    <div className="mb-4">
                                        <p className="text-sm text-neutral-500 mb-2">Estado actual</p>
                                        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium bg-${getColorEstado(pedido.estado)}-100 text-${getColorEstado(pedido.estado)}-800`}>
                                            {estados.find(e => e.value === pedido.estado)?.label || pedido.estado}
                                        </span>
                                    </div>

                                    {/* Detalles del pedido */}
                                    {pedido.detalles && pedido.detalles.length > 0 && (
                                        <div className="mb-4">
                                            <p className="text-sm text-neutral-500 mb-2">Productos ({pedido.detalles.length})</p>
                                            <div className="space-y-2">
                                                {pedido.detalles.slice(0, 3).map((detalle, index) => (
                                                    <div key={index} className="flex justify-between text-sm">
                                                        <div className="flex-1">
                                                            <span className="text-gray-700">
                                                                {detalle.cantidad}x {detalle.producto?.nombre || detalle.Producto?.nombre || 'Producto'}
                                                            </span>
                                                            {(detalle.precioProducto?.nombre_presentacion || detalle.PrecioProducto?.nombre_presentacion) && (
                                                                <span className="text-xs text-gray-500 ml-2">
                                                                    ({detalle.precioProducto?.nombre_presentacion || detalle.PrecioProducto?.nombre_presentacion})
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-gray-600">
                                                            {formatearPrecio(detalle.subtotal)}
                                                        </span>
                                                    </div>
                                                ))}
                                                {pedido.detalles.length > 3 && (
                                                    <p className="text-xs text-neutral-500">
                                                        +{pedido.detalles.length - 3} más...
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Notas */}
                                    {pedido.notas && (
                                        <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
                                            <p className="text-xs text-neutral-500 mb-1">Notas</p>
                                            <p className="text-sm text-gray-700">{pedido.notas}</p>
                                        </div>
                                    )}

                                    {/* Acciones - Cambiar estado */}
                                    {pedido.estado !== 'entregado' && pedido.estado !== 'cancelado' && (
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium text-gray-700 mb-2">Cambiar estado:</p>
                                            <div className="grid grid-cols-2 gap-2">
                                                {pedido.estado === 'pendiente' && (
                                                    <button
                                                        onClick={() => actualizarEstado(pedido.id_pedido, 'en_preparacion')}
                                                        disabled={actualizando === pedido.id_pedido}
                                                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-medium disabled:opacity-50"
                                                    >
                                                        En Preparación
                                                    </button>
                                                )}
                                                {pedido.estado === 'en_preparacion' && (
                                                    <button
                                                        onClick={() => actualizarEstado(pedido.id_pedido, 'listo')}
                                                        disabled={actualizando === pedido.id_pedido}
                                                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm font-medium disabled:opacity-50"
                                                    >
                                                        Marcar Listo
                                                    </button>
                                                )}
                                                {pedido.estado === 'listo' && (
                                                    <button
                                                        onClick={() => actualizarEstado(pedido.id_pedido, 'entregado')}
                                                        disabled={actualizando === pedido.id_pedido}
                                                        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition text-sm font-medium disabled:opacity-50"
                                                    >
                                                        Entregar
                                                    </button>
                                                )}
                                                {pedido.estado !== 'cancelado' && (
                                                    <button
                                                        onClick={() => actualizarEstado(pedido.id_pedido, 'cancelado')}
                                                        disabled={actualizando === pedido.id_pedido}
                                                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm font-medium disabled:opacity-50"
                                                    >
                                                        Cancelar
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default GestionPedidos;
