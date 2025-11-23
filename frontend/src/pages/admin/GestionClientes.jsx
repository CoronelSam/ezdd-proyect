import { useEffect, useState } from 'react';
import { clientesService, pedidosService } from '../../services';

const GestionClientes = () => {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState('');
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
    const [pedidosCliente, setPedidosCliente] = useState([]);
    const [modalPedidos, setModalPedidos] = useState(false);

    useEffect(() => {
        cargarClientes();
    }, []);

    const cargarClientes = async () => {
        try {
            const data = await clientesService.getAll();
            setClientes(data);
        } catch (error) {
            console.error('Error al cargar clientes:', error);
        } finally {
            setLoading(false);
        }
    };

    const verPedidosCliente = async (cliente) => {
        setClienteSeleccionado(cliente);
        try {
            const pedidos = await pedidosService.getByCliente(cliente.id_cliente);
            setPedidosCliente(pedidos);
            setModalPedidos(true);
        } catch (error) {
            console.error('Error al cargar pedidos:', error);
            alert('Error al cargar los pedidos del cliente');
        }
    };

    const calcularTotalGastado = (pedidos) => {
        return pedidos.reduce((total, pedido) => total + parseFloat(pedido.total || 0), 0);
    };

    const clientesFiltrados = clientes.filter(c =>
        c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.telefono.includes(busqueda)
    );

    const estadoPedidoBadge = (estado) => {
        const clases = {
            pendiente: 'bg-yellow-100 text-yellow-800',
            en_preparacion: 'bg-blue-100 text-blue-800',
            listo: 'bg-purple-100 text-purple-800',
            entregado: 'bg-green-100 text-green-800',
            cancelado: 'bg-red-100 text-red-800'
        };
        
        const textos = {
            pendiente: 'Pendiente',
            en_preparacion: 'En Preparación',
            listo: 'Listo',
            entregado: 'Entregado',
            cancelado: 'Cancelado'
        };
        
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${clases[estado] || 'bg-gray-100 text-gray-800'}`}>
                {textos[estado] || estado}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Gestión de Clientes</h1>
                    <p className="text-gray-600 mt-1">Base de datos de clientes registrados</p>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Clientes</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{clientes.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Nuevos Hoy</p>
                                <p className="text-3xl font-bold text-green-600 mt-1">
                                    {clientes.filter(c => {
                                        const hoy = new Date().toDateString();
                                        return new Date(c.createdAt).toDateString() === hoy;
                                    }).length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Con Pedidos</p>
                                <p className="text-3xl font-bold text-purple-600 mt-1">
                                    {clientes.filter(c => c.pedidos && c.pedidos.length > 0).length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Buscador */}
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <input
                        type="text"
                        placeholder="Buscar cliente por nombre o teléfono..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Tabla de Clientes */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Cliente
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Teléfono
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Pedidos
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Registro
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {clientesFiltrados.map((cliente) => (
                                <tr key={cliente.id_cliente} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                                    <span className="text-white font-medium text-sm">
                                                        {cliente.nombre.substring(0, 2).toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {cliente.nombre}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    ID: {cliente.id_cliente}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{cliente.telefono}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {cliente.pedidos?.length || 0} pedidos
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(cliente.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => verPedidosCliente(cliente)}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            Ver Pedidos
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {clientesFiltrados.length === 0 && (
                        <div className="text-center py-12">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <p className="mt-4 text-gray-500">No se encontraron clientes</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Pedidos del Cliente */}
            {modalPedidos && clienteSeleccionado && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Historial de Pedidos</h2>
                                <p className="text-gray-600 mt-1">
                                    Cliente: {clienteSeleccionado.nombre} | Tel: {clienteSeleccionado.telefono}
                                </p>
                                {pedidosCliente.length > 0 && (
                                    <p className="text-sm text-gray-500 mt-2">
                                        Total gastado: L. {calcularTotalGastado(pedidosCliente).toFixed(2)}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={() => setModalPedidos(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6">
                            {pedidosCliente.length === 0 ? (
                                <div className="text-center py-8">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                    <p className="mt-4 text-gray-500">Este cliente no ha realizado pedidos aún</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {pedidosCliente.map((pedido) => (
                                        <div key={pedido.id_pedido} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        Pedido #{pedido.id_pedido}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(pedido.fecha_pedido).toLocaleString()}
                                                    </p>
                                                </div>
                                                {estadoPedidoBadge(pedido.estado)}
                                            </div>
                                            {pedido.detallePedidos && pedido.detallePedidos.length > 0 && (
                                                <div className="space-y-2 mb-3">
                                                    {pedido.detallePedidos.map((detalle, index) => (
                                                        <div key={index} className="flex justify-between text-sm">
                                                            <span className="text-gray-600">
                                                                {detalle.cantidad}x {detalle.producto?.nombre || 'Producto'}
                                                                {detalle.precioProducto && (
                                                                    <span className="text-gray-400 text-xs ml-1">
                                                                        ({detalle.precioProducto.nombre_presentacion})
                                                                    </span>
                                                                )}
                                                            </span>
                                                            <span className="text-gray-900 font-medium">
                                                                L. {(detalle.cantidad * parseFloat(detalle.precio_unitario)).toFixed(2)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                                                <span className="text-sm font-medium text-gray-700">Total</span>
                                                <span className="text-lg font-bold text-blue-600">
                                                    L. {parseFloat(pedido.total).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionClientes;
