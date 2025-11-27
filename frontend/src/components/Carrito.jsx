import { useState } from 'react';
import { useCarrito } from '../hooks/useCarrito';
import { useAuth } from '../hooks/useAuth';
import { pedidosService } from '../services';

const Carrito = () => {
    const {
        items,
        eliminarItem,
        actualizarCantidad,
        actualizarInstrucciones,
        limpiarCarrito,
        calcularTotal,
        isOpen,
        setIsOpen
    } = useCarrito();
    
    const { usuario } = useAuth();

    const [procesando, setProcesando] = useState(false);
    const [error, setError] = useState(null);
    const [pedidoCreado, setPedidoCreado] = useState(null);
    const [notasGenerales, setNotasGenerales] = useState('');

    const formatearPrecio = (precio) => {
        return new Intl.NumberFormat('es-HN', {
            style: 'currency',
            currency: 'HNL'
        }).format(precio);
    };

    const handleRealizarPedido = async () => {
        try {
            setProcesando(true);
            setError(null);

            // Preparar los detalles del pedido
            const detalles = items.map(item => ({
                id_producto: item.producto.id_producto,
                id_precio: item.precio.id_precio,
                cantidad: item.cantidad,
                precio_unitario: parseFloat(item.precio.precio),
                instrucciones_especiales: item.instrucciones || ''
            }));

            // Crear el pedido
            const pedidoData = {
                detalles,
                notas: notasGenerales || '',
                id_cliente: usuario?.id_cliente || null // Asociar pedido al cliente autenticado
            };

            console.log('📤 Enviando pedido:', pedidoData);
            console.log('👤 Usuario actual:', usuario);

            const response = await pedidosService.create(pedidoData);
            
            console.log('✅ Respuesta completa del servidor:', response);
            console.log('📦 Objeto pedido:', response.pedido);
            console.log('🆔 ID del pedido:', response.pedido?.id_pedido);
            
            // La respuesta tiene la estructura { mensaje, pedido }
            if (response && response.pedido && response.pedido.id_pedido) {
                console.log('✅ Pedido creado exitosamente, limpiando carrito...');
                setPedidoCreado(response.pedido);
                limpiarCarrito();
                setNotasGenerales('');
            } else {
                console.error('❌ Estructura de respuesta inesperada:', response);
                console.error('❌ response.pedido existe?', !!response.pedido);
                console.error('❌ response.pedido.id_pedido existe?', response.pedido?.id_pedido);
                throw new Error('Respuesta inválida del servidor');
            }
        } catch (err) {
            console.error('❌ Error al crear pedido:', err);
            if (err.response) {
                console.error('Detalles de la respuesta de error:', err.response.data);
                console.error('Status:', err.response.status);
            } else {
                console.error('Error sin respuesta del servidor:', err.message);
            }
            setError('No se pudo crear el pedido. Por favor, intenta de nuevo.');
        } finally {
            setProcesando(false);
        }
    };

    const cerrarConfirmacion = () => {
        setPedidoCreado(null);
        setIsOpen(false);
    };

    if (!isOpen) return null;

    // Modal de confirmación del pedido
    if (pedidoCreado) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-2xl max-w-md w-full p-6">
                    <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Pedido Realizado!</h2>
                        <p className="text-gray-600 mb-4">
                            Tu pedido #{pedidoCreado.id_pedido} ha sido creado exitosamente
                        </p>
                        <div className="bg-neutral-50 rounded-lg p-4 mb-6">
                            <p className="text-sm text-neutral-500 mb-1">Total</p>
                            <p className="text-2xl font-bold text-blue-600">
                                {formatearPrecio(pedidoCreado.total)}
                            </p>
                            <p className="text-sm text-neutral-500 mt-2">Estado: {pedidoCreado.estado}</p>
                        </div>
                        <button
                            onClick={cerrarConfirmacion}
                            className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium"
                        >
                            Continuar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50/95 via-white/95 to-purple-50/95 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
            <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-gray-100">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-5 flex justify-between items-center rounded-t-3xl">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-xl">
                            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">
                                Mi Pedido
                            </h2>
                            <p className="text-blue-100 text-sm">{items.length} {items.length === 1 ? 'producto' : 'productos'}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-xl transition"
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Contenido */}
                <div className="flex-1 overflow-y-auto p-6">
                    {items.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="mx-auto h-32 w-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-6">
                                <svg className="h-16 w-16 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-3">Tu carrito está vacío</h3>
                            <p className="text-gray-500 mb-6">¡Explora nuestro menú y agrega tus platillos favoritos!</p>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition transform hover:scale-105"
                            >
                                Ver Menú
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4 mb-6">
                                {items.map((item) => (
                                    <div
                                        key={`${item.producto.id_producto}-${item.precio.id_precio}`}
                                        className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl p-5 border border-blue-100 shadow-sm hover:shadow-md transition"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-800">{item.producto.nombre}</h3>
                                                <p className="text-sm text-neutral-600">{item.precio.nombre_presentacion}</p>
                                                <p className="text-blue-600 font-medium mt-1">
                                                    {formatearPrecio(item.precio.precio)}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => eliminarItem(item.producto.id_producto, item.precio.id_precio)}
                                                className="text-red-500 hover:text-red-700 transition"
                                            >
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>

                                        {/* Control de cantidad */}
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="text-sm text-neutral-600">Cantidad:</span>
                                            <div className="flex items-center border border-gray-200 rounded-lg">
                                                <button
                                                    onClick={() => actualizarCantidad(
                                                        item.producto.id_producto,
                                                        item.precio.id_precio,
                                                        item.cantidad - 1
                                                    )}
                                                    className="px-3 py-1 hover:bg-neutral-100 transition"
                                                >
                                                    -
                                                </button>
                                                <span className="px-4 py-1 border-x border-neutral-200 min-w-[3rem] text-center">
                                                    {item.cantidad}
                                                </span>
                                                <button
                                                    onClick={() => actualizarCantidad(
                                                        item.producto.id_producto,
                                                        item.precio.id_precio,
                                                        item.cantidad + 1
                                                    )}
                                                    className="px-3 py-1 hover:bg-neutral-100 transition"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>

                                        {/* Instrucciones especiales */}
                                        <textarea
                                            placeholder="Instrucciones especiales (opcional)"
                                            value={item.instrucciones || ''}
                                            onChange={(e) => actualizarInstrucciones(
                                                item.producto.id_producto,
                                                item.precio.id_precio,
                                                e.target.value
                                            )}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            rows="2"
                                        />

                                        {/* Subtotal */}
                                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-neutral-200">
                                            <span className="text-sm text-neutral-600">Subtotal:</span>
                                            <span className="font-semibold text-gray-800">
                                                {formatearPrecio(item.precio.precio * item.cantidad)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Notas generales del pedido */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Notas adicionales para tu pedido
                                </label>
                                <textarea
                                    placeholder="Ej: Sin cebolla, extra salsa, etc."
                                    value={notasGenerales}
                                    onChange={(e) => setNotasGenerales(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    rows="3"
                                />
                            </div>

                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-red-700 text-sm">{error}</p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="sticky bottom-0 bg-gradient-to-r from-gray-50 to-blue-50/50 border-t-2 border-blue-100 px-6 py-5 rounded-b-3xl">
                        <div className="flex justify-between items-center mb-5">
                            <span className="text-lg font-semibold text-gray-700">Total a pagar:</span>
                            <div className="text-right">
                                <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    {formatearPrecio(calcularTotal())}
                                </span>
                                <p className="text-sm text-gray-500 mt-1">Incluye todos los productos</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={limpiarCarrito}
                                className="flex-1 px-6 py-3.5 border-2 border-red-400 text-red-600 rounded-xl hover:bg-red-50 transition font-semibold"
                            >
                                Vaciar carrito
                            </button>
                            <button
                                onClick={handleRealizarPedido}
                                disabled={procesando}
                                className="flex-1 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-xl transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                            >
                                {procesando ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                        </svg>
                                        Procesando...
                                    </span>
                                ) : 'Realizar Pedido'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Carrito;
