import { useEffect, useState } from 'react';
import { preciosService, productosService } from '../../services';

const GestionPrecios = () => {
    const [productos, setProductos] = useState([]);
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    const [precios, setPrecios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState(null);
    const [exito, setExito] = useState(null);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [precioEditando, setPrecioEditando] = useState(null);

    const [formData, setFormData] = useState({
        nombre_presentacion: '',
        descripcion: '',
        precio: '',
        activo: true
    });

    useEffect(() => {
        cargarProductos();
    }, []);

    useEffect(() => {
        if (productoSeleccionado) {
            cargarPrecios(productoSeleccionado.id_producto);
        }
    }, [productoSeleccionado]);

    const cargarProductos = async () => {
        try {
            setLoading(true);
            const data = await productosService.getAll();
            setProductos(data);
            if (data.length > 0) {
                setProductoSeleccionado(data[0]);
            }
        } catch (err) {
            console.error('Error al cargar productos:', err);
            setError('No se pudieron cargar los productos');
        } finally {
            setLoading(false);
        }
    };

    const cargarPrecios = async (idProducto) => {
        try {
            const data = await preciosService.getByProducto(idProducto, false);
            setPrecios(data);
        } catch (err) {
            console.error('Error al cargar precios:', err);
            setPrecios([]);
        }
    };

    const handleProductoChange = (e) => {
        const producto = productos.find(p => p.id_producto === parseInt(e.target.value));
        setProductoSeleccionado(producto);
        setError(null);
        setExito(null);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const abrirModalNuevo = () => {
        setModoEdicion(false);
        setPrecioEditando(null);
        setFormData({
            nombre_presentacion: '',
            descripcion: '',
            precio: '',
            activo: true
        });
        setModalAbierto(true);
        setError(null);
        setExito(null);
    };

    const abrirModalEditar = (precio) => {
        setModoEdicion(true);
        setPrecioEditando(precio);
        setFormData({
            nombre_presentacion: precio.nombre_presentacion || '',
            descripcion: precio.descripcion || '',
            precio: precio.precio || '',
            activo: precio.activo !== false
        });
        setModalAbierto(true);
        setError(null);
        setExito(null);
    };

    const cerrarModal = () => {
        setModalAbierto(false);
        setModoEdicion(false);
        setPrecioEditando(null);
        setFormData({
            nombre_presentacion: '',
            descripcion: '',
            precio: '',
            activo: true
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setExito(null);
        setGuardando(true);

        try {
            const datosEnviar = {
                id_producto: productoSeleccionado.id_producto,
                nombre_presentacion: formData.nombre_presentacion,
                descripcion: formData.descripcion || null,
                precio: parseFloat(formData.precio),
                activo: formData.activo
            };

            if (modoEdicion && precioEditando) {
                await preciosService.update(precioEditando.id_precio, datosEnviar);
                setExito('Precio actualizado exitosamente');
            } else {
                await preciosService.create(datosEnviar);
                setExito('Precio creado exitosamente');
            }

            await cargarPrecios(productoSeleccionado.id_producto);
            cerrarModal();
        } catch (err) {
            console.error('Error al guardar precio:', err);
            setError(err.response?.data?.error || 'No se pudo guardar el precio');
        } finally {
            setGuardando(false);
        }
    };

    const handleEliminar = async (idPrecio) => {
        if (!window.confirm('¿Estás seguro de que deseas desactivar este precio?')) {
            return;
        }

        try {
            setError(null);
            await preciosService.delete(idPrecio);
            setExito('Precio desactivado exitosamente');
            await cargarPrecios(productoSeleccionado.id_producto);
        } catch (err) {
            console.error('Error al eliminar precio:', err);
            setError(err.response?.data?.error || 'No se pudo desactivar el precio');
        }
    };

    const formatearPrecio = (precio) => {
        return new Intl.NumberFormat('es-HN', {
            style: 'currency',
            currency: 'HNL'
        }).format(precio);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Gestión de Precios</h1>
                    <p className="text-gray-600 mt-2">Administra los precios de los productos</p>
                </div>

                {/* Mensajes */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}
                {exito && (
                    <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
                        <p className="text-green-700">{exito}</p>
                    </div>
                )}

                {/* Selector de Producto */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Selecciona un Producto
                    </label>
                    <select
                        value={productoSeleccionado?.id_producto || ''}
                        onChange={handleProductoChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        {productos.map(producto => (
                            <option key={producto.id_producto} value={producto.id_producto}>
                                {producto.nombre} {!producto.activo ? '(Inactivo)' : ''}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Detalles del Producto */}
                {productoSeleccionado && (
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg shadow-md p-6 mb-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    {productoSeleccionado.nombre}
                                </h2>
                                <p className="text-gray-700 mb-4">
                                    {productoSeleccionado.descripcion || 'Sin descripción'}
                                </p>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                    productoSeleccionado.activo 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                    {productoSeleccionado.activo ? 'Producto Activo' : 'Producto Inactivo'}
                                </span>
                            </div>
                            <button
                                onClick={abrirModalNuevo}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Agregar Precio
                            </button>
                        </div>
                    </div>
                )}

                {/* Lista de Precios */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Precios Configurados ({precios.length})
                        </h3>
                    </div>

                    {precios.length === 0 ? (
                        <div className="p-12 text-center">
                            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-gray-500">No hay precios configurados para este producto</p>
                            <button
                                onClick={abrirModalNuevo}
                                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Agregar el primer precio
                            </button>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {precios.map(precio => (
                                <div key={precio.id_precio} className="p-6 hover:bg-gray-50 transition">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h4 className="text-lg font-semibold text-gray-900">
                                                    {precio.nombre_presentacion}
                                                </h4>
                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                    precio.activo 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {precio.activo ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </div>
                                            {precio.descripcion && (
                                                <p className="text-gray-600 text-sm mb-2">{precio.descripcion}</p>
                                            )}
                                            <p className="text-2xl font-bold text-blue-600">
                                                {formatearPrecio(precio.precio)}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => abrirModalEditar(precio)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                title="Editar"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleEliminar(precio.id_precio)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                title="Desactivar"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Agregar/Editar */}
            {modalAbierto && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-xl font-bold text-gray-900">
                                {modoEdicion ? 'Editar Precio' : 'Agregar Nuevo Precio'}
                            </h3>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre de Presentación *
                                </label>
                                <input
                                    type="text"
                                    name="nombre_presentacion"
                                    required
                                    value={formData.nombre_presentacion}
                                    onChange={handleInputChange}
                                    placeholder="Ej: Individual, Familiar, Combo"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Descripción
                                </label>
                                <textarea
                                    name="descripcion"
                                    value={formData.descripcion}
                                    onChange={handleInputChange}
                                    placeholder="Descripción opcional del precio"
                                    rows="3"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Precio (HNL) *
                                </label>
                                <input
                                    type="number"
                                    name="precio"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={formData.precio}
                                    onChange={handleInputChange}
                                    placeholder="0.00"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="activo"
                                    id="activo"
                                    checked={formData.activo}
                                    onChange={handleInputChange}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="activo" className="ml-2 text-sm text-gray-700">
                                    Precio activo
                                </label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={cerrarModal}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={guardando}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {guardando ? 'Guardando...' : modoEdicion ? 'Actualizar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionPrecios;
