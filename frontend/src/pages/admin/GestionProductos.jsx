import { useEffect, useState } from 'react';
import { categoriasService, preciosService, productosService } from '../../services';

const GestionProductos = () => {
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [modalPrecios, setModalPrecios] = useState(false);
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    const [precios, setPrecios] = useState([]);
    const [filtroCategoria, setFiltroCategoria] = useState('todas');
    const [busqueda, setBusqueda] = useState('');

    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        id_categoria: '',
        imagen_url: '',
        activo: true
    });

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const [productosData, categoriasData] = await Promise.all([
                productosService.getAll(),
                categoriasService.getAll()
            ]);
            setProductos(productosData);
            setCategorias(categoriasData);
        } catch (error) {
            console.error('Error al cargar datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const abrirModal = (producto = null) => {
        if (producto) {
            setProductoSeleccionado(producto);
            setFormData({
                nombre: producto.nombre,
                descripcion: producto.descripcion || '',
                id_categoria: producto.id_categoria,
                imagen_url: producto.imagen_url || '',
                activo: producto.activo
            });
        } else {
            setProductoSeleccionado(null);
            setFormData({
                nombre: '',
                descripcion: '',
                id_categoria: '',
                imagen_url: '',
                activo: true
            });
        }
        setModalAbierto(true);
    };

    const cerrarModal = () => {
        setModalAbierto(false);
        setProductoSeleccionado(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (productoSeleccionado) {
                await productosService.update(productoSeleccionado.id_producto, formData);
            } else {
                await productosService.create(formData);
            }
            await cargarDatos();
            cerrarModal();
        } catch (error) {
            console.error('Error al guardar producto:', error);
            alert('Error al guardar el producto');
        }
    };

    const eliminarProducto = async (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
            try {
                await productosService.delete(id);
                await cargarDatos();
            } catch (error) {
                console.error('Error al eliminar:', error);
                alert('Error al eliminar el producto');
            }
        }
    };

    const abrirGestionPrecios = async (producto) => {
        setProductoSeleccionado(producto);
        try {
            const preciosData = await preciosService.getByProducto(producto.id_producto);
            setPrecios(preciosData);
            setModalPrecios(true);
        } catch (error) {
            console.error('Error al cargar precios:', error);
        }
    };

    const productosFiltrados = productos.filter(p => {
        const matchCategoria = filtroCategoria === 'todas' || p.id_categoria === parseInt(filtroCategoria);
        const matchBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                            (p.descripcion && p.descripcion.toLowerCase().includes(busqueda.toLowerCase()));
        return matchCategoria && matchBusqueda;
    });

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
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Gestión de Productos</h1>
                        <p className="text-gray-600 mt-1">Administra el menú del restaurante</p>
                    </div>
                    <button
                        onClick={() => abrirModal()}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Nuevo Producto
                    </button>
                </div>

                {/* Filtros */}
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Buscar producto..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <select
                            value={filtroCategoria}
                            onChange={(e) => setFiltroCategoria(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="todas">Todas las categorías</option>
                            {categorias.map(cat => (
                                <option key={cat.id_categoria} value={cat.id_categoria}>
                                    {cat.nombre}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Lista de Productos */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {productosFiltrados.map((producto) => (
                        <div key={producto.id_producto} className="bg-white rounded-lg shadow hover:shadow-lg transition">
                            <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg flex items-center justify-center">
                                <svg className="h-20 w-20 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="text-lg font-semibold text-gray-900">{producto.nombre}</h3>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        producto.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {producto.activo ? 'Activo' : 'Inactivo'}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                    {producto.descripcion || 'Sin descripción'}
                                </p>
                                <p className="text-xs text-gray-500 mb-4">
                                    Categoría: {producto.categoria?.nombre || categorias.find(c => c.id_categoria === producto.id_categoria)?.nombre || 'N/A'}
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => abrirGestionPrecios(producto)}
                                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                                    >
                                        Precios
                                    </button>
                                    <button
                                        onClick={() => abrirModal(producto)}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => eliminarProducto(producto.id_producto)}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {productosFiltrados.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No se encontraron productos</p>
                    </div>
                )}
            </div>

            {/* Modal Crear/Editar */}
            {modalAbierto && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {productoSeleccionado ? 'Editar Producto' : 'Nuevo Producto'}
                            </h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.nombre}
                                        onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                                    <textarea
                                        value={formData.descripcion}
                                        onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                                        rows="3"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
                                    <select
                                        required
                                        value={formData.id_categoria}
                                        onChange={(e) => setFormData({...formData, id_categoria: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Seleccionar categoría</option>
                                        {categorias.map(cat => (
                                            <option key={cat.id_categoria} value={cat.id_categoria}>
                                                {cat.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">URL de Imagen</label>
                                    <input
                                        type="url"
                                        value={formData.imagen_url}
                                        onChange={(e) => setFormData({...formData, imagen_url: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="activo"
                                        checked={formData.activo}
                                        onChange={(e) => setFormData({...formData, activo: e.target.checked})}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="activo" className="ml-2 block text-sm text-gray-900">
                                        Producto activo
                                    </label>
                                </div>
                            </div>
                            <div className="mt-6 flex gap-3">
                                <button
                                    type="button"
                                    onClick={cerrarModal}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                >
                                    {productoSeleccionado ? 'Actualizar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Gestión de Precios */}
            {modalPrecios && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Gestión de Precios</h2>
                                <p className="text-gray-600">{productoSeleccionado?.nombre}</p>
                            </div>
                            <button
                                onClick={() => setModalPrecios(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-600 mb-4">
                                Gestión de precios disponible. Aquí puedes agregar diferentes presentaciones y precios para este producto.
                            </p>
                            <div className="space-y-3">
                                {precios.map((precio) => (
                                    <div key={precio.id_precio} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-900">{precio.nombre_presentacion}</p>
                                            <p className="text-sm text-gray-500">{precio.descripcion}</p>
                                        </div>
                                        <p className="text-lg font-bold text-blue-600">
                                            L. {parseFloat(precio.precio).toFixed(2)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionProductos;
