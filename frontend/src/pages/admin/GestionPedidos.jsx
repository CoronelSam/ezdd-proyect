import { useEffect, useState } from 'react';
import { pedidosService } from '../../services';
import { joinAdmin, onNuevoPedido, onEstadoPedido, onPedidoCancelado, off } from '../../services/socket.service';

//Panel para visualizar y gestionar el estado de las órdenes
function GestionPedidos() {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [filtroFecha, setFiltroFecha] = useState('hoy');
    const [actualizando, setActualizando] = useState(null);
    const [pedidosExpandidos, setPedidosExpandidos] = useState({});

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
    }, []);

    // Socket.IO para actualizaciones en tiempo real
    useEffect(() => {
        // Unirse a la sala de administradores
        joinAdmin();

        // Manejar nuevo pedido
        const handleNuevoPedido = (pedido) => {
            setPedidos((prev) => [pedido, ...prev]);
        };

        // Manejar cambio de estado
        const handleEstadoPedido = ({ id_pedido, estado, pedido: pedidoActualizado }) => {
            setPedidos((prev) =>
                prev.map((p) =>
                    p.id_pedido === id_pedido
                        ? { ...p, estado, ...(pedidoActualizado && { ...pedidoActualizado }) }
                        : p
                )
            );
        };

        // Manejar cancelación
        const handlePedidoCancelado = ({ id_pedido }) => {
            setPedidos((prev) =>
                prev.map((p) =>
                    p.id_pedido === id_pedido ? { ...p, estado: 'cancelado' } : p
                )
            );
        };

        onNuevoPedido(handleNuevoPedido);
        onEstadoPedido(handleEstadoPedido);
        onPedidoCancelado(handlePedidoCancelado);

        return () => {
            off('pedido:nuevo', handleNuevoPedido);
            off('pedido:estado', handleEstadoPedido);
            off('pedido:cancelado', handlePedidoCancelado);
        };
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
            // No es necesario recargar, Socket.IO actualizará automáticamente
        } catch (err) {
            console.error('Error al actualizar estado:', err);
            // Si hay error, mostrar más detalles
            const errorMsg = err.response?.data?.mensaje || err.message || 'Error desconocido';
            alert(`No se pudo actualizar el estado del pedido: ${errorMsg}`);
            // Si falla, recargar para tener la información correcta
            await cargarPedidos();
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
        const colores = {
            'pendiente': 'bg-yellow-100 text-yellow-800',
            'en_preparacion': 'bg-blue-100 text-blue-800',
            'listo': 'bg-green-100 text-green-800',
            'entregado': 'bg-purple-100 text-purple-800',
            'cancelado': 'bg-red-100 text-red-800'
        };
        return colores[estado] || 'bg-gray-100 text-gray-800';
    };

    const toggleExpandirPedido = (idPedido) => {
        setPedidosExpandidos(prev => ({
            ...prev,
            [idPedido]: !prev[idPedido]
        }));
    };

    // Función para obtener la fecha sin hora
    const obtenerFechaSinHora = (fecha) => {
        const d = new Date(fecha);
        return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    };

    // Filtrar por fecha
    const pedidosPorFecha = () => {
        const hoy = obtenerFechaSinHora(new Date());
        const ayer = new Date(hoy);
        ayer.setDate(ayer.getDate() - 1);
        const hace7Dias = new Date(hoy);
        hace7Dias.setDate(hace7Dias.getDate() - 7);
        const hace30Dias = new Date(hoy);
        hace30Dias.setDate(hace30Dias.getDate() - 30);

        switch (filtroFecha) {
            case 'hoy':
                return pedidos.filter(p => {
                    const fechaPedido = obtenerFechaSinHora(p.fecha_pedido);
                    return fechaPedido.getTime() === hoy.getTime();
                });
            case 'ayer':
                return pedidos.filter(p => {
                    const fechaPedido = obtenerFechaSinHora(p.fecha_pedido);
                    return fechaPedido.getTime() === ayer.getTime();
                });
            case 'semana':
                return pedidos.filter(p => {
                    const fechaPedido = obtenerFechaSinHora(p.fecha_pedido);
                    return fechaPedido >= hace7Dias && fechaPedido <= hoy;
                });
            case 'mes':
                return pedidos.filter(p => {
                    const fechaPedido = obtenerFechaSinHora(p.fecha_pedido);
                    return fechaPedido >= hace30Dias && fechaPedido <= hoy;
                });
            case 'todos':
            default:
                return pedidos;
        }
    };

    const pedidosPorFechaFiltrados = pedidosPorFecha();

    // Filtrar por estado
    const pedidosFiltrados = filtroEstado === 'todos'
        ? pedidosPorFechaFiltrados
        : pedidosPorFechaFiltrados.filter(p => p.estado === filtroEstado);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-brand-600 mx-auto mb-4"></div>
                    <p className="text-lg text-neutral-600">Cargando pedidos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <h1 className="font-display text-4xl text-brand-700 mb-2">Gestión de Pedidos</h1>
                    <p className="text-neutral-600">Administra el estado de las órdenes en tiempo real</p>
                </div>
            </header>

            {/* Filtros */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filtro por Fecha */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-4">
                    <div className="flex items-center gap-3 mb-3">
                        <svg className="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <h3 className="text-sm font-semibold text-gray-700">Filtrar por Fecha</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {[
                            { value: 'hoy', label: 'Hoy' },
                            { value: 'ayer', label: 'Ayer' },
                            { value: 'semana', label: 'Última Semana' },
                            { value: 'mes', label: 'Último Mes' },
                            { value: 'todos', label: 'Todos' }
                        ].map((opcion) => {
                            const hoy = new Date();
                            const ayer = new Date();
                            ayer.setDate(ayer.getDate() - 1);
                            const hace7Dias = new Date();
                            hace7Dias.setDate(hace7Dias.getDate() - 7);
                            const hace30Dias = new Date();
                            hace30Dias.setDate(hace30Dias.getDate() - 30);
                            
                            let cantidad = 0;
                            const obtenerFecha = (fecha) => {
                                const d = new Date(fecha);
                                return new Date(d.getFullYear(), d.getMonth(), d.getDate());
                            };
                            const hoyFecha = obtenerFecha(hoy);
                            const ayerFecha = obtenerFecha(ayer);
                            
                            switch (opcion.value) {
                                case 'hoy':
                                    cantidad = pedidos.filter(p => obtenerFecha(p.fecha_pedido).getTime() === hoyFecha.getTime()).length;
                                    break;
                                case 'ayer':
                                    cantidad = pedidos.filter(p => obtenerFecha(p.fecha_pedido).getTime() === ayerFecha.getTime()).length;
                                    break;
                                case 'semana':
                                    cantidad = pedidos.filter(p => {
                                        const fechaPedido = obtenerFecha(p.fecha_pedido);
                                        return fechaPedido >= obtenerFecha(hace7Dias) && fechaPedido <= hoyFecha;
                                    }).length;
                                    break;
                                case 'mes':
                                    cantidad = pedidos.filter(p => {
                                        const fechaPedido = obtenerFecha(p.fecha_pedido);
                                        return fechaPedido >= obtenerFecha(hace30Dias) && fechaPedido <= hoyFecha;
                                    }).length;
                                    break;
                                case 'todos':
                                    cantidad = pedidos.length;
                                    break;
                            }
                            
                            return (
                                <button
                                    key={opcion.value}
                                    onClick={() => setFiltroFecha(opcion.value)}
                                    className={`px-4 py-2 rounded-lg font-medium transition ${
                                        filtroFecha === opcion.value
                                            ? 'bg-brand-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {opcion.label}
                                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                                        filtroFecha === opcion.value
                                            ? 'bg-white text-brand-600'
                                            : 'bg-brand-100 text-brand-700'
                                    }`}>
                                        {cantidad}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Filtro por Estado */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <div className="flex items-center gap-3 mb-3">
                        <svg className="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-sm font-semibold text-gray-700">Filtrar por Estado</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {estados.map((estado) => {
                            const cantidad = estado.value === 'todos'
                                ? pedidosPorFechaFiltrados.length
                                : pedidosPorFechaFiltrados.filter(p => p.estado === estado.value).length;
                            
                            return (
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
                                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                                        filtroEstado === estado.value
                                            ? 'bg-white text-brand-600'
                                            : 'bg-brand-100 text-brand-700'
                                    }`}>
                                        {cantidad}
                                    </span>
                                </button>
                            );
                        })}
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
                                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100"
                            >
                                {/* Header del pedido */}
                                <div className="bg-white border-b-4 border-brand-600 px-6 py-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-brand-50 border-2 border-brand-200 rounded-lg px-3 py-2 shadow-sm">
                                                <p className="text-xs text-gray-600 font-semibold">Pedido</p>
                                                <p className="text-2xl font-bold text-gray-900">#{pedido.id_pedido}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600 font-semibold mb-1">Cliente</p>
                                                <p className="text-base font-bold text-gray-900">
                                                    {pedido.cliente?.nombre || pedido.Cliente?.nombre || 'Cliente anónimo'}
                                                </p>
                                                {(pedido.cliente?.telefono || pedido.Cliente?.telefono) && (
                                                    <p className="text-xs text-gray-700 font-semibold flex items-center gap-1 mt-0.5">
                                                        <svg className="w-3 h-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                        </svg>
                                                        {pedido.cliente?.telefono || pedido.Cliente?.telefono}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right bg-brand-50 border-2 border-brand-200 rounded-lg px-3 py-2 shadow-sm">
                                            <p className="text-xs text-gray-600 font-semibold">Total</p>
                                            <p className="text-xl font-bold text-gray-900">{formatearPrecio(pedido.total)}</p>
                                        </div>
                                    </div>
                                    {/* Estado y fecha en el header */}
                                    <div className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2 bg-gray-100 border border-gray-300 rounded-full px-3 py-1.5 shadow-sm">
                                            <svg className="w-3 h-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-gray-700 font-semibold">{formatearFecha(pedido.fecha_pedido)}</span>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${getColorEstado(pedido.estado)}`}>
                                            {estados.find(e => e.value === pedido.estado)?.label || pedido.estado}
                                        </span>
                                    </div>
                                </div>

                                {/* Contenido */}
                                <div className="p-6">

                                    {/* Detalles del pedido */}
                                    {pedido.detalles && pedido.detalles.length > 0 && (
                                        <div className="mb-4 bg-gray-50 rounded-lg p-4">
                                            <div className="flex justify-between items-center mb-3">
                                                <div className="flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                    </svg>
                                                    <p className="text-sm font-semibold text-gray-700">Productos ({pedido.detalles.length})</p>
                                                </div>
                                                {pedido.detalles.length > 3 && (
                                                    <button
                                                        onClick={() => toggleExpandirPedido(pedido.id_pedido)}
                                                        className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1 transition-colors"
                                                    >
                                                        {pedidosExpandidos[pedido.id_pedido] ? (
                                                            <>
                                                                Ver menos
                                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                                </svg>
                                                            </>
                                                        ) : (
                                                            <>
                                                                Ver todos
                                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                                </svg>
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                                                {(pedidosExpandidos[pedido.id_pedido] ? pedido.detalles : pedido.detalles.slice(0, 3)).map((detalle, index) => (
                                                    <div key={index} className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                                                        <div className="flex justify-between items-start gap-3">
                                                            <div className="flex-1">
                                                                <div className="flex items-start gap-2">
                                                                    <span className="inline-flex items-center justify-center min-w-6 h-6 bg-gray-800 text-white rounded-md text-xs font-bold px-1.5 shadow-sm">
                                                                        {detalle.cantidad}×
                                                                    </span>
                                                                    <div className="flex-1">
                                                                        <p className="text-sm font-bold text-gray-900 leading-tight">
                                                                            {detalle.producto?.nombre || detalle.Producto?.nombre || 'Producto'}
                                                                        </p>
                                                                        {(detalle.precioProducto?.nombre_presentacion || detalle.PrecioProducto?.nombre_presentacion) && (
                                                                            <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">
                                                                                {detalle.precioProducto?.nombre_presentacion || detalle.PrecioProducto?.nombre_presentacion}
                                                                            </span>
                                                                        )}
                                                                        {detalle.instrucciones_especiales && (
                                                                            <div className="mt-2 flex items-start gap-1">
                                                                                <svg className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                                </svg>
                                                                                <p className="text-xs text-gray-600 italic leading-tight">
                                                                                    {detalle.instrucciones_especiales}
                                                                                </p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-sm font-bold text-brand-700 whitespace-nowrap">
                                                                    {formatearPrecio(detalle.subtotal)}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    {formatearPrecio(detalle.precio_unitario)}/u
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Notas */}
                                    {pedido.notas && (
                                        <div className="mb-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                                            <div className="flex items-start gap-2">
                                                <svg className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                                </svg>
                                                <div className="flex-1">
                                                    <p className="text-xs font-semibold text-amber-800 mb-1">Notas del pedido</p>
                                                    <p className="text-sm text-amber-900 leading-relaxed">{pedido.notas}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Acciones - Cambiar estado */}
                                    {pedido.estado !== 'entregado' && pedido.estado !== 'cancelado' && (
                                        <div className="space-y-3 pt-4 border-t border-gray-200">
                                            <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                <svg className="w-4 h-4 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Acciones disponibles
                                            </p>
                                            <div className="grid grid-cols-2 gap-2">
                                                {pedido.estado === 'pendiente' && (
                                                    <button
                                                        onClick={() => actualizarEstado(pedido.id_pedido, 'en_preparacion')}
                                                        disabled={actualizando === pedido.id_pedido}
                                                        className="px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:scale-95 transition-all text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                        </svg>
                                                        Preparar
                                                    </button>
                                                )}
                                                {pedido.estado === 'en_preparacion' && (
                                                    <button
                                                        onClick={() => actualizarEstado(pedido.id_pedido, 'listo')}
                                                        disabled={actualizando === pedido.id_pedido}
                                                        className="px-4 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 active:scale-95 transition-all text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        Listo
                                                    </button>
                                                )}
                                                {pedido.estado === 'listo' && (
                                                    <button
                                                        onClick={() => actualizarEstado(pedido.id_pedido, 'entregado')}
                                                        disabled={actualizando === pedido.id_pedido}
                                                        className="px-4 py-2.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 active:scale-95 transition-all text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                                        </svg>
                                                        Entregar
                                                    </button>
                                                )}
                                                {pedido.estado !== 'cancelado' && (
                                                    <button
                                                        onClick={() => actualizarEstado(pedido.id_pedido, 'cancelado')}
                                                        disabled={actualizando === pedido.id_pedido}
                                                        className="px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 active:scale-95 transition-all text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
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
