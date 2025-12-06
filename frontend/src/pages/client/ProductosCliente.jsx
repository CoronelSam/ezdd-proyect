import { useCallback, useEffect, useState } from 'react';
import { useCarrito } from '../../hooks/useCarrito';
import { categoriasService, preciosService, productosService } from '../../services';

/**
 * Página de productos para clientes
 * Muestra el catálogo de productos con filtros y búsqueda
 */
function ProductosCliente() {
    const { agregarItem } = useCarrito();
    
    const [productos, setProductos] = useState([]);
    const [productosFiltrados, setProductosFiltrados] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [preciosMap, setPreciosMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Estados para filtros
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('todas');
    const [busqueda, setBusqueda] = useState('');
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    
    // Estados para agregar al carrito
    const [precioSeleccionado, setPrecioSeleccionado] = useState(null);
    const [cantidad, setCantidad] = useState(1);
    const [instrucciones, setInstrucciones] = useState('');
    const [mensajeAgregado, setMensajeAgregado] = useState(false);

    useEffect(() => {
        cargarDatos();
    }, []);

    const aplicarFiltros = useCallback(() => {
        let resultado = [...productos];

        // Filtrar por categoría
        if (categoriaSeleccionada !== 'todas') {
            resultado = resultado.filter(
                producto => producto.id_categoria === parseInt(categoriaSeleccionada)
            );
        }

        // Filtrar por búsqueda
        if (busqueda.trim()) {
            const terminoBusqueda = busqueda.toLowerCase();
            resultado = resultado.filter(
                producto =>
                    producto.nombre?.toLowerCase().includes(terminoBusqueda) ||
                    producto.descripcion?.toLowerCase().includes(terminoBusqueda)
            );
        }

        setProductosFiltrados(resultado);
    }, [productos, categoriaSeleccionada, busqueda]);

    useEffect(() => {
        aplicarFiltros();
    }, [aplicarFiltros]);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            setError(null);

            // Cargar productos, categorías y precios en paralelo
            const [productosData, categoriasData] = await Promise.all([
                productosService.getAll(),
                categoriasService.getAll({ activo: true })
            ]);

            // Crear un mapa para almacenar precios por producto
            const preciosTemp = {};

            // Para cada producto, obtener sus precios
            await Promise.all(
                productosData.map(async (producto) => {
                    if (!producto.id_producto) {
                        preciosTemp[producto.id_producto || 'sin_id'] = [];
                        return;
                    }

                    try {
                        let precios = await preciosService.getByProducto(producto.id_producto, true);

                        // Si no hay precios en precio_productos, usar el precio del producto
                        if (precios.length === 0 && producto.precio) {
                            precios = [{
                                id_precio: `producto_${producto.id_producto}`,
                                nombre_presentacion: 'Precio estándar',
                                precio: producto.precio,
                                activo: true
                            }];
                        }

                        preciosTemp[producto.id_producto] = precios;
                    } catch (err) {
                        console.error(`Error al cargar precios del producto ${producto.id_producto}:`, err);
                        preciosTemp[producto.id_producto] = [];
                    }
                })
            );

            setPreciosMap(preciosTemp);
            setProductos(productosData);
            setCategorias(categoriasData);
        } catch (err) {
            console.error('Error al cargar datos:', err);
            setError('No se pudieron cargar los productos. Por favor, intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const obtenerPrecioMinimo = (idProducto) => {
        const precios = preciosMap[idProducto] || [];
        if (precios.length === 0) return null;
        
        const preciosActivos = precios.filter(p => p.activo);
        if (preciosActivos.length === 0) return null;
        
        return Math.min(...preciosActivos.map(p => parseFloat(p.precio)));
    };

    const formatearPrecio = (precio) => {
        if (!precio) return 'Precio no disponible';
        return new Intl.NumberFormat('es-HN', {
            style: 'currency',
            currency: 'HNL'
        }).format(precio);
    };

    const abrirDetalleProducto = (producto) => {
        setProductoSeleccionado(producto);
        
        // Seleccionar el primer precio activo por defecto
        const precios = preciosMap[producto.id_producto] || [];
        const preciosActivos = precios.filter(p => p.activo);
        if (preciosActivos.length > 0) {
            setPrecioSeleccionado(preciosActivos[0]);
        }
        setCantidad(1);
        setInstrucciones('');
        setMensajeAgregado(false);
    };

    const cerrarDetalleProducto = () => {
        setProductoSeleccionado(null);
        setPrecioSeleccionado(null);
        setCantidad(1);
        setInstrucciones('');
        setMensajeAgregado(false);
    };

    const handleAgregarAlCarrito = () => {
        if (!productoSeleccionado || !precioSeleccionado) return;
        
        agregarItem(productoSeleccionado, precioSeleccionado, cantidad, instrucciones);
        setMensajeAgregado(true);
        
        // Ocultar mensaje después de 2 segundos
        setTimeout(() => {
            setMensajeAgregado(false);
        }, 2000);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-brand-50 to-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-lg text-neutral-600">Cargando productos...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-brand-50 to-white p-6">
                <div className="max-w-md w-full bg-white shadow-lg rounded-xl p-8 text-center">
                    <svg className="mx-auto h-16 w-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">Error</h2>
                    <p className="text-neutral-600 mb-6">{error}</p>
                    <button
                        onClick={cargarDatos}
                        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-yellow-50">
            {/* Filtros y búsqueda */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Búsqueda */}
                        <div>
                            <label htmlFor="busqueda" className="block text-sm font-medium text-gray-700 mb-2">
                                Buscar producto
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    id="busqueda"
                                    placeholder="Buscar por nombre o descripción..."
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                    className="w-full px-4 py-3 pl-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>

                        {/* Filtro por categoría */}
                        <div>
                            <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-2">
                                Filtrar por categoría
                            </label>
                            <select
                                id="categoria"
                                value={categoriaSeleccionada}
                                onChange={(e) => setCategoriaSeleccionada(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="todas">Todas las categorías</option>
                                {categorias.map((categoria) => (
                                    <option key={categoria.id_categoria} value={categoria.id_categoria}>
                                        {categoria.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Información de resultados */}
                    <div className="mt-4 text-sm text-neutral-600">
                        Mostrando {productosFiltrados.length} de {productos.length} productos
                    </div>
                </div>

                {/* Grid de productos */}
                {productosFiltrados.length === 0 ? (
                    <div className="text-center py-16">
                        <svg className="mx-auto h-24 w-24 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No se encontraron productos</h3>
                        <p className="text-neutral-500">Intenta ajustar los filtros de búsqueda</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {productosFiltrados.map((producto) => {
                            const precioMinimo = obtenerPrecioMinimo(producto.id_producto);
                            const precios = preciosMap[producto.id_producto] || [];
                            const tieneMultiplesPrecios = precios.filter(p => p.activo).length > 1;

                            return (
                                <div
                                    key={producto.id_producto}
                                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1"
                                    onClick={() => abrirDetalleProducto(producto)}
                                >
                                    {/* Imagen placeholder */}
                                    <div className="h-48 bg-linear-to-br from-brand-100 to-brand-200 flex items-center justify-center relative">
                                        <svg className="h-20 w-20 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        {/* Badge de disponibilidad */}
                                        <div className="absolute top-3 right-3">
                                            {producto.activo ? (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-500 text-white shadow-lg">
                                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    Disponible
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-500 text-white shadow-lg">
                                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                    </svg>
                                                    No disponible
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Contenido */}
                                    <div className="p-4">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-1">
                                            {producto.nombre}
                                        </h3>
                                        <p className="text-sm text-neutral-600 mb-3 line-clamp-2 h-10">
                                            {producto.descripcion || 'Sin descripción'}
                                        </p>

                                        {/* Precio */}
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-2xl font-bold text-blue-600">
                                                    {precioMinimo ? formatearPrecio(precioMinimo) : 'N/A'}
                                                </p>
                                                {tieneMultiplesPrecios && (
                                                    <p className="text-xs text-neutral-500">Desde este precio</p>
                                                )}
                                            </div>
                                            <button 
                                                className={`px-4 py-2 rounded-lg transition text-sm font-medium ${
                                                    producto.activo 
                                                        ? 'bg-blue-500 text-white hover:bg-blue-600' 
                                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                }`}
                                                disabled={!producto.activo}
                                            >
                                                {producto.activo ? 'Ver detalles' : 'No disponible'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal de detalle del producto */}
            {productoSeleccionado && (
                <div className="fixed inset-0 bg-linear-to-br from-orange-50/80 via-white/80 to-yellow-50/80 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={cerrarDetalleProducto}>
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        {/* Header del modal */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-800">{productoSeleccionado.nombre}</h2>
                            <button
                                onClick={cerrarDetalleProducto}
                                className="text-gray-400 hover:text-gray-600 transition"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Contenido del modal */}
                        <div className="p-6">
                            {/* Badge de disponibilidad */}
                            {!productoSeleccionado.activo && (
                                <div className="mb-6 p-4 bg-red-50 border-2 border-red-500 rounded-lg flex items-center gap-3">
                                    <svg className="w-6 h-6 text-red-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    <div>
                                        <p className="font-semibold text-red-700">Producto No Disponible</p>
                                        <p className="text-sm text-red-600">Este producto está temporalmente fuera de stock</p>
                                    </div>
                                </div>
                            )}

                            {/* Imagen placeholder */}
                            <div className="h-64 bg-linear-to-br from-brand-100 to-brand-200 rounded-xl flex items-center justify-center mb-6">
                                <svg className="h-32 w-32 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>

                            {/* Descripción */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Descripción</h3>
                                <p className="text-neutral-600">
                                    {productoSeleccionado.descripcion || 'Sin descripción disponible'}
                                </p>
                            </div>

                            {/* Opciones de precio */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">Selecciona tu opción</h3>
                                <div className="space-y-3">
                                    {(preciosMap[productoSeleccionado.id_producto] || [])
                                        .filter(precio => precio.activo)
                                        .map((precio) => (
                                            <div
                                                key={precio.id_precio}
                                                onClick={() => setPrecioSeleccionado(precio)}
                                                className={`border-2 rounded-lg p-4 flex justify-between items-center cursor-pointer transition ${
                                                    precioSeleccionado?.id_precio === precio.id_precio
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-200 hover:border-blue-300'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                                        precioSeleccionado?.id_precio === precio.id_precio
                                                            ? 'border-blue-500'
                                                            : 'border-gray-300'
                                                    }`}>
                                                        {precioSeleccionado?.id_precio === precio.id_precio && (
                                                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-800">{precio.nombre_presentacion}</p>
                                                        {precio.descripcion && (
                                                            <p className="text-sm text-neutral-500">{precio.descripcion}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="text-xl font-bold text-blue-600">
                                                    {formatearPrecio(precio.precio)}
                                                </p>
                                            </div>
                                        ))}
                                </div>
                            </div>

                            {/* Control de cantidad */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">Cantidad</h3>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center border-2 border-neutral-200 rounded-lg">
                                        <button
                                            onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                                            className="px-4 py-2 hover:bg-neutral-100 transition"
                                        >
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                            </svg>
                                        </button>
                                        <span className="px-6 py-2 border-x-2 border-neutral-200 min-w-16 text-center font-semibold text-lg">
                                            {cantidad}
                                        </span>
                                        <button
                                            onClick={() => setCantidad(cantidad + 1)}
                                            className="px-4 py-2 hover:bg-neutral-100 transition"
                                        >
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                        </button>
                                    </div>
                                    {precioSeleccionado && (
                                        <div className="flex-1 text-right">
                                            <p className="text-sm text-gray-500">Subtotal</p>
                                            <p className="text-2xl font-bold text-blue-600">
                                                {formatearPrecio(precioSeleccionado.precio * cantidad)}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Instrucciones especiales */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">Instrucciones especiales (opcional)</h3>
                                <textarea
                                    placeholder="Ej: Sin cebolla, extra queso, etc."
                                    value={instrucciones}
                                    onChange={(e) => setInstrucciones(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    rows="3"
                                />
                            </div>

                            {/* Mensaje de agregado exitoso */}
                            {mensajeAgregado && (
                                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <p className="text-green-700 font-medium">¡Producto agregado al carrito!</p>
                                </div>
                            )}

                            {/* Información adicional */}
                            <div className="grid grid-cols-2 gap-4 bg-neutral-50 rounded-lg p-4">
                                <div>
                                    <p className="text-sm text-neutral-500 mb-1">Categoría</p>
                                    <p className="font-medium text-gray-800">
                                        {categorias.find(c => c.id_categoria === productoSeleccionado.id_categoria)?.nombre || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-neutral-500 mb-1">Estado</p>
                                    <p className="font-medium text-gray-800">
                                        {productoSeleccionado.activo ? 'Disponible' : 'No disponible'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer del modal */}
                        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3">
                            <button
                                onClick={cerrarDetalleProducto}
                                className="flex-1 px-6 py-3 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-100 transition font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleAgregarAlCarrito}
                                disabled={!precioSeleccionado || !productoSeleccionado.activo}
                                className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                {productoSeleccionado.activo ? 'Agregar al carrito' : 'Producto no disponible'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProductosCliente;
