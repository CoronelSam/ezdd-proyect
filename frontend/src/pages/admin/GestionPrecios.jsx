import { useEffect, useState, useMemo } from 'react';
import { preciosService, productosService } from '../../services';
import AlertMessage from '../../components/AlertMessage';
import ModalConfirmacion from '../../components/ModalConfirmacion';

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
    const [busqueda, setBusqueda] = useState('');
    const [filtroCategoria, setFiltroCategoria] = useState('');
    const [mostrarInactivos, setMostrarInactivos] = useState(false);
    const [modalConfirmacion, setModalConfirmacion] = useState(false);
    const [accionConfirmacion, setAccionConfirmacion] = useState(null);

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
            // No seleccionar automáticamente ningún producto
        } catch (err) {
            console.error('Error al cargar productos:', err);
            setError('No se pudieron cargar los productos');
        } finally {
            setLoading(false);
        }
    };

    const productosFiltrados = useMemo(() => {
        return productos.filter(producto => {
            const cumpleBusqueda = producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                                  producto.descripcion?.toLowerCase().includes(busqueda.toLowerCase());
            
            const cumpleCategoria = !filtroCategoria || producto.id_categoria === parseInt(filtroCategoria);
            
            const cumpleActivo = mostrarInactivos || producto.activo;
            
            return cumpleBusqueda && cumpleCategoria && cumpleActivo;
        });
    }, [productos, busqueda, filtroCategoria, mostrarInactivos]);

    const categorias = useMemo(() => {
        const categoriasUnicas = new Map();
        productos.forEach(producto => {
            if (producto.categoria && !categoriasUnicas.has(producto.id_categoria)) {
                categoriasUnicas.set(producto.id_categoria, producto.categoria.nombre);
            }
        });
        return Array.from(categoriasUnicas.entries()).map(([id, nombre]) => ({ id, nombre }));
    }, [productos]);

    const cargarPrecios = async (idProducto) => {
        try {
            const data = await preciosService.getByProducto(idProducto, false);
            setPrecios(data);
        } catch (err) {
            console.error('Error al cargar precios:', err);
            setPrecios([]);
        }
    };

    const handleProductoChange = (producto) => {
        setProductoSeleccionado(producto);
        setError(null);
        setExito(null);
        setBusqueda('');
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

    const handleToggleActivo = (precio) => {
        setAccionConfirmacion({
            tipo: precio.activo ? 'advertencia' : 'exito',
            titulo: precio.activo ? 'Desactivar Precio' : 'Activar Precio',
            mensaje: precio.activo 
                ? `¿Está seguro de desactivar el precio "${precio.nombre_presentacion}"?`
                : `¿Está seguro de activar el precio "${precio.nombre_presentacion}"?`,
            descripcion: precio.activo
                ? 'El precio no estará disponible para nuevos pedidos hasta que sea reactivado.'
                : 'El precio estará disponible inmediatamente para nuevos pedidos.',
            textoBotonConfirmar: precio.activo ? 'Desactivar' : 'Activar',
            textoBotonCancelar: 'Cancelar',
            onConfirmar: async () => {
                setModalConfirmacion(false);
                try {
                    setError(null);
                    await preciosService.update(precio.id_precio, {
                        id_producto: productoSeleccionado.id_producto,
                        nombre_presentacion: precio.nombre_presentacion,
                        descripcion: precio.descripcion || null,
                        precio: parseFloat(precio.precio),
                        activo: !precio.activo
                    });
                    setExito(`Precio ${precio.activo ? 'desactivado' : 'activado'} exitosamente`);
                    await cargarPrecios(productoSeleccionado.id_producto);
                    setTimeout(() => setExito(null), 3000);
                } catch (err) {
                    console.error('Error al cambiar estado del precio:', err);
                    setError(err.response?.data?.error || `No se pudo ${precio.activo ? 'desactivar' : 'activar'} el precio`);
                }
                setAccionConfirmacion(null);
            },
            onCancelar: () => {
                setModalConfirmacion(false);
                setAccionConfirmacion(null);
            }
        });
        setModalConfirmacion(true);
    };

    const handleEliminar = (precio) => {
        setAccionConfirmacion({
            tipo: 'error',
            titulo: 'Eliminar Precio',
            mensaje: `¿Está seguro de eliminar permanentemente el precio "${precio.nombre_presentacion}"?`,
            descripcion: 'Esta acción no se puede deshacer. El precio será eliminado de forma permanente.',
            textoBotonConfirmar: 'Eliminar',
            textoBotonCancelar: 'Cancelar',
            onConfirmar: async () => {
                setModalConfirmacion(false);
                try {
                    setError(null);
                    await preciosService.delete(precio.id_precio);
                    setExito('Precio eliminado exitosamente');
                    await cargarPrecios(productoSeleccionado.id_producto);
                    setTimeout(() => setExito(null), 3000);
                } catch (err) {
                    console.error('Error al eliminar precio:', err);
                    setError(err.response?.data?.error || 'No se pudo eliminar el precio');
                }
                setAccionConfirmacion(null);
            },
            onCancelar: () => {
                setModalConfirmacion(false);
                setAccionConfirmacion(null);
            }
        });
        setModalConfirmacion(true);
    };

    const formatearPrecio = (precio) => {
        return new Intl.NumberFormat('es-HN', {
            style: 'currency',
            currency: 'HNL'
        }).format(precio);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">Gestión de Precios</h1>
                    <p className="text-gray-600 mt-2">Administra los precios de los productos</p>
                </div>

                {/* Mensajes */}
                <AlertMessage tipo="error" mensaje={error} onClose={() => setError(null)} />
                <AlertMessage tipo="exito" mensaje={exito} onClose={() => setExito(null)} />

                {/* Buscador y Filtros */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-4 mb-4">
                        {/* Buscador */}
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Buscar Producto
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre o descripción..."
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                                <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>

                        {/* Filtro por Categoría */}
                        <div className="md:w-64">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Categoría
                            </label>
                            <select
                                value={filtroCategoria}
                                onChange={(e) => setFiltroCategoria(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            >
                                <option value="">Todas las categorías</option>
                                {categorias.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                ))}
                            </select>
                        </div>

                        {/* Mostrar inactivos */}
                        <div className="flex items-end">
                            <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                                <input
                                    type="checkbox"
                                    checked={mostrarInactivos}
                                    onChange={(e) => setMostrarInactivos(e.target.checked)}
                                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                                />
                                <span className="text-sm text-gray-700">Ver inactivos</span>
                            </label>
                        </div>
                    </div>

                    {/* Grid de productos */}
                    {!productoSeleccionado && (
                        <div className="mt-6">
                            <p className="text-sm text-gray-600 mb-4">
                                Mostrando {productosFiltrados.length} de {productos.length} productos
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                                {productosFiltrados.length === 0 ? (
                                    <div className="col-span-full text-center py-8 text-gray-500">
                                        No se encontraron productos
                                    </div>
                                ) : (
                                    productosFiltrados.map(producto => (
                                        <button
                                            key={producto.id_producto}
                                            onClick={() => handleProductoChange(producto)}
                                            className="text-left p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:shadow-md transition group"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition">
                                                    {producto.nombre}
                                                </h3>
                                                {!producto.activo && (
                                                    <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                                                        Inactivo
                                                    </span>
                                                )}
                                            </div>
                                            {producto.descripcion && (
                                                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                                    {producto.descripcion}
                                                </p>
                                            )}
                                            {producto.categoria && (
                                                <span className="inline-block px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-full">
                                                    {producto.categoria.nombre}
                                                </span>
                                            )}
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Detalles del Producto */}
                {productoSeleccionado && (
                    <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg shadow-md p-6 mb-6">
                        {/* Botón volver */}
                        <button
                            onClick={() => setProductoSeleccionado(null)}
                            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Volver a la lista
                        </button>

                        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                            <div className="flex-1">
                                <div className="flex items-start gap-3 mb-2">
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        {productoSeleccionado.nombre}
                                    </h2>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                        productoSeleccionado.activo 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {productoSeleccionado.activo ? 'Activo' : 'Inactivo'}
                                    </span>
                                </div>
                                <p className="text-gray-700 mb-3">
                                    {productoSeleccionado.descripcion || 'Sin descripción'}
                                </p>
                                {productoSeleccionado.categoria && (
                                    <span className="inline-block px-3 py-1 text-sm bg-white text-orange-700 rounded-full border border-orange-200">
                                        📂 {productoSeleccionado.categoria.nombre}
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={abrirModalNuevo}
                                className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-red-700 flex items-center gap-2 shadow-lg whitespace-nowrap"
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
                {productoSeleccionado && (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Precios Configurados ({precios.length})
                            </h3>
                        </div>

                        {precios.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-orange-100 mb-4">
                                    <svg className="w-10 h-10 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <p className="text-gray-500 text-lg mb-2">No hay precios configurados</p>
                                <p className="text-gray-400 text-sm mb-6">Agrega el primer precio para este producto</p>
                                <button
                                    onClick={abrirModalNuevo}
                                    className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium transition"
                                >
                                    Agregar primer precio
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                                {precios.map(precio => (
                                    <div 
                                        key={precio.id_precio} 
                                        className="border-2 border-gray-200 rounded-lg p-4 hover:border-orange-400 hover:shadow-md transition group"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex-1">
                                                <h4 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-orange-600 transition">
                                                    {precio.nombre_presentacion}
                                                </h4>
                                                <span className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium ${
                                                    precio.activo 
                                                        ? 'bg-green-100 text-green-700 border border-green-300' 
                                                        : 'bg-gray-100 text-gray-600 border border-gray-300'
                                                }`}>
                                                    {precio.activo ? '✓ Activo' : '✕ Inactivo'}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        {precio.descripcion && (
                                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                                {precio.descripcion}
                                            </p>
                                        )}
                                        
                                        <div className="pt-3 border-t border-gray-200">
                                            <p className="text-2xl font-bold text-orange-600 mb-3">
                                                {formatearPrecio(precio.precio)}
                                            </p>
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => abrirModalEditar(precio)}
                                                    className="text-orange-600 hover:text-orange-900"
                                                    title="Editar"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleToggleActivo(precio)}
                                                    className={`${precio.activo ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'}`}
                                                    title={precio.activo ? 'Desactivar' : 'Activar'}
                                                >
                                                    {precio.activo ? (
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleEliminar(precio)}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Eliminar"
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
                )}
            </div>

            {/* Modal Agregar/Editar */}
            {modalAbierto && (
                <div className="fixed inset-0 bg-gradient-to-br from-orange-50/80 via-white/80 to-yellow-50/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
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

            {accionConfirmacion && (
                <ModalConfirmacion
                    mostrar={modalConfirmacion}
                    tipo={accionConfirmacion.tipo}
                    titulo={accionConfirmacion.titulo}
                    mensaje={accionConfirmacion.mensaje}
                    descripcion={accionConfirmacion.descripcion}
                    textoBotonConfirmar={accionConfirmacion.textoBotonConfirmar}
                    textoBotonCancelar={accionConfirmacion.textoBotonCancelar}
                    onConfirmar={accionConfirmacion.onConfirmar}
                    onCancelar={accionConfirmacion.onCancelar}
                />
            )}
        </div>
    );
};

export default GestionPrecios;
