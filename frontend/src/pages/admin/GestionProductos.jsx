import { useEffect, useState } from 'react';
import { categoriasService, preciosService, productosService } from '../../services';
import { Can } from '../../context/AbilityContext';
import { usePermissions } from '../../hooks/usePermissions';
import { APP_CONSTANTS } from '../../config/constants';
import ModalConfirmacion from '../../components/ModalConfirmacion';

const { MODULOS } = APP_CONSTANTS;

const GestionProductos = () => {
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [modalPrecios, setModalPrecios] = useState(false);
    const [modalPrecioForm, setModalPrecioForm] = useState(false);
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    const [precioSeleccionado, setPrecioSeleccionado] = useState(null);
    const [precios, setPrecios] = useState([]);
    const [filtroCategoria, setFiltroCategoria] = useState('todas');
    const [busqueda, setBusqueda] = useState('');
    const [imagenPreview, setImagenPreview] = useState(null);
    const [archivoImagen, setArchivoImagen] = useState(null);
    const [alertaPrecio, setAlertaPrecio] = useState({ show: false, message: '', type: '' });
    const [modalConfirmacion, setModalConfirmacion] = useState(false);
    const [accionConfirmacion, setAccionConfirmacion] = useState(null);

    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        id_categoria: '',
        activo: true
    });

    const [formPrecioData, setFormPrecioData] = useState({
        nombre_presentacion: '',
        descripcion: '',
        precio: '',
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

    const handleImagenChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validar tipo de archivo
            if (!file.type.startsWith('image/')) {
                alert('Por favor selecciona un archivo de imagen válido');
                return;
            }

            // Validar tamaño (máximo 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('La imagen no debe superar los 5MB');
                return;
            }

            setArchivoImagen(file);
            
            // Crear preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagenPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const limpiarImagen = () => {
        setArchivoImagen(null);
        setImagenPreview(null);
    };

    const abrirModal = (producto = null) => {
        if (producto) {
            setProductoSeleccionado(producto);
            setFormData({
                nombre: producto.nombre,
                descripcion: producto.descripcion || '',
                id_categoria: producto.id_categoria,
                activo: producto.activo
            });
            setImagenPreview(producto.imagen_url);
        } else {
            setProductoSeleccionado(null);
            setFormData({
                nombre: '',
                descripcion: '',
                id_categoria: '',
                activo: true
            });
            setImagenPreview(null);
        }
        setArchivoImagen(null);
        setModalAbierto(true);
    };

    const cerrarModal = () => {
        setModalAbierto(false);
        setProductoSeleccionado(null);
        limpiarImagen();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Crear FormData para enviar archivos
            const formDataToSend = new FormData();
            formDataToSend.append('nombre', formData.nombre);
            formDataToSend.append('descripcion', formData.descripcion);
            formDataToSend.append('id_categoria', formData.id_categoria);
            formDataToSend.append('activo', formData.activo);

            // Agregar imagen si se seleccionó una nueva
            if (archivoImagen) {
                formDataToSend.append('imagen', archivoImagen);
            }

            if (productoSeleccionado) {
                await productosService.update(productoSeleccionado.id_producto, formDataToSend);
            } else {
                await productosService.create(formDataToSend);
            }
            
            await cargarDatos();
            cerrarModal();
        } catch (error) {
            console.error('Error al guardar producto:', error);
            alert(error.response?.data?.error || 'Error al guardar el producto');
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
            // Cargar todos los precios, incluyendo inactivos
            const preciosData = await preciosService.getByProducto(producto.id_producto, false);
            setPrecios(preciosData);
            setModalPrecios(true);
        } catch (error) {
            console.error('Error al cargar precios:', error);
            mostrarAlertaPrecio('Error al cargar precios', 'error');
        }
    };

    const mostrarAlertaPrecio = (message, type = 'info') => {
        setAlertaPrecio({ show: true, message, type });
        setTimeout(() => setAlertaPrecio({ show: false, message: '', type: '' }), 5000);
    };

    const abrirModalNuevoPrecio = () => {
        setPrecioSeleccionado(null);
        setFormPrecioData({
            nombre_presentacion: '',
            descripcion: '',
            precio: '',
            activo: true
        });
        setModalPrecioForm(true);
    };

    const abrirModalEditarPrecio = (precio) => {
        setPrecioSeleccionado(precio);
        setFormPrecioData({
            nombre_presentacion: precio.nombre_presentacion,
            descripcion: precio.descripcion || '',
            precio: precio.precio,
            activo: precio.activo
        });
        setModalPrecioForm(true);
    };

    const handleSubmitPrecio = async (e) => {
        e.preventDefault();
        try {
            if (precioSeleccionado) {
                await preciosService.update(precioSeleccionado.id_precio, formPrecioData);
                mostrarAlertaPrecio('Precio actualizado exitosamente', 'success');
            } else {
                await preciosService.create({
                    ...formPrecioData,
                    id_producto: productoSeleccionado.id_producto
                });
                mostrarAlertaPrecio('Precio creado exitosamente', 'success');
            }
            // Recargar todos los precios incluyendo inactivos
            const preciosData = await preciosService.getByProducto(productoSeleccionado.id_producto, false);
            setPrecios(preciosData);
            setModalPrecioForm(false);
        } catch (error) {
            console.error('Error al guardar precio:', error);
            mostrarAlertaPrecio(error.response?.data?.error || 'Error al guardar el precio', 'error');
        }
    };

    const handleEliminarPrecio = (precio) => {
        setAccionConfirmacion({
            tipo: 'peligro',
            titulo: 'Eliminar Precio',
            mensaje: `¿Estás seguro de eliminar el precio "${precio.nombre_presentacion}"?`,
            descripcion: 'Esta acción no se puede deshacer. El precio será eliminado permanentemente.',
            textoBotonConfirmar: 'Eliminar',
            textoBotonCancelar: 'Cancelar',
            onConfirmar: async () => {
                setModalConfirmacion(false);
                try {
                    await preciosService.delete(precio.id_precio);
                    mostrarAlertaPrecio('Precio eliminado exitosamente', 'success');
                    const preciosData = await preciosService.getByProducto(productoSeleccionado.id_producto, false);
                    setPrecios(preciosData);
                } catch (error) {
                    console.error('Error al eliminar precio:', error);
                    mostrarAlertaPrecio('Error al eliminar el precio', 'error');
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

    const handleToggleActivoPrecio = (precio) => {
        const nuevoEstado = !precio.activo;
        setAccionConfirmacion({
            tipo: nuevoEstado ? 'info' : 'advertencia',
            titulo: nuevoEstado ? 'Activar Precio' : 'Desactivar Precio',
            mensaje: `¿Estás seguro de ${nuevoEstado ? 'activar' : 'desactivar'} el precio "${precio.nombre_presentacion}"?`,
            descripcion: nuevoEstado 
                ? 'El precio estará disponible para los clientes.'
                : 'El precio no estará disponible para los clientes, pero podrás reactivarlo cuando quieras.',
            textoBotonConfirmar: nuevoEstado ? 'Activar' : 'Desactivar',
            textoBotonCancelar: 'Cancelar',
            onConfirmar: async () => {
                setModalConfirmacion(false);
                try {
                    await preciosService.update(precio.id_precio, { activo: nuevoEstado });
                    mostrarAlertaPrecio(`Precio ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente`, 'success');
                    const preciosData = await preciosService.getByProducto(productoSeleccionado.id_producto, false);
                    setPrecios(preciosData);
                } catch (error) {
                    console.error('Error al cambiar estado:', error);
                    mostrarAlertaPrecio('Error al cambiar el estado del precio', 'error');
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

    const productosFiltrados = productos.filter(p => {
        const matchCategoria = filtroCategoria === 'todas' || p.id_categoria === parseInt(filtroCategoria);
        const matchBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                            (p.descripcion && p.descripcion.toLowerCase().includes(busqueda.toLowerCase()));
        return matchCategoria && matchBusqueda;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">Gestión de Productos</h1>
                        <p className="text-gray-600 mt-1">Administra el menú del restaurante</p>
                    </div>
                    <Can I="create" a={MODULOS.PRODUCTO}>
                        <button
                            onClick={() => abrirModal()}
                            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition flex items-center gap-2 shadow-lg"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Nuevo Producto
                        </button>
                    </Can>
                </div>

                {/* Filtros */}
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Buscar producto..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                        <select
                            value={filtroCategoria}
                            onChange={(e) => setFiltroCategoria(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                            <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg flex items-center justify-center overflow-hidden">
                                {producto.imagen_url ? (
                                    <img 
                                        src={producto.imagen_url} 
                                        alt={producto.nombre}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <svg className="h-20 w-20 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                )}
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
                                    <Can I="read" a={MODULOS.PRECIO}>
                                        <button
                                            onClick={() => abrirGestionPrecios(producto)}
                                            className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition text-sm shadow-md"
                                        >
                                            Precios
                                        </button>
                                    </Can>
                                    <Can I="update" a={MODULOS.PRODUCTO}>
                                        <button
                                            onClick={() => abrirModal(producto)}
                                            className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition text-sm shadow-md"
                                        >
                                            Editar
                                        </button>
                                    </Can>
                                    <Can I="delete" a={MODULOS.PRODUCTO}>
                                        <button
                                            onClick={() => eliminarProducto(producto.id_producto)}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </Can>
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
                <div className="fixed inset-0 bg-gradient-to-br from-orange-50/80 via-white/80 to-yellow-50/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {productoSeleccionado ? 'Editar Producto' : 'Nuevo Producto'}
                            </h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="space-y-4">
                                {/* Preview de imagen */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Imagen del Producto
                                    </label>
                                    <div className="mb-3">
                                        {imagenPreview ? (
                                            <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                                                <img 
                                                    src={imagenPreview} 
                                                    alt="Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={limpiarImagen}
                                                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                                                <svg className="h-20 w-20 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImagenChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    />
                                    <p className="mt-1 text-sm text-gray-500">
                                        Formatos permitidos: JPG, PNG, WEBP. Tamaño máximo: 5MB
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.nombre}
                                        onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                                    <textarea
                                        value={formData.descripcion}
                                        onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                                        rows="3"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
                                    <select
                                        required
                                        value={formData.id_categoria}
                                        onChange={(e) => setFormData({...formData, id_categoria: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    >
                                        <option value="">Seleccionar categoría</option>
                                        {categorias.map(cat => (
                                            <option key={cat.id_categoria} value={cat.id_categoria}>
                                                {cat.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="activo"
                                        checked={formData.activo}
                                        onChange={(e) => setFormData({...formData, activo: e.target.checked})}
                                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
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
                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition shadow-lg"
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
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-orange-50 to-yellow-50">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Gestión de Precios</h2>
                                <p className="text-gray-600">{productoSeleccionado?.nombre}</p>
                            </div>
                            <button
                                onClick={() => setModalPrecios(false)}
                                className="text-gray-400 hover:text-gray-600 transition"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Alerta */}
                            {alertaPrecio.show && (
                                <div className={`mb-4 p-4 rounded-lg ${
                                    alertaPrecio.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
                                    alertaPrecio.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
                                    'bg-blue-50 text-blue-800 border border-blue-200'
                                }`}>
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium">{alertaPrecio.message}</p>
                                        <button
                                            onClick={() => setAlertaPrecio({ show: false, message: '', type: '' })}
                                            className="text-current opacity-70 hover:opacity-100"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Botón agregar precio */}
                            <Can I="create" a={MODULOS.PRECIO}>
                                <button
                                    onClick={abrirModalNuevoPrecio}
                                    className="mb-6 w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition flex items-center justify-center gap-2 shadow-md"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Agregar Nuevo Precio
                                </button>
                            </Can>

                            {/* Lista de precios */}
                            {precios.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-orange-100 mb-4">
                                        <svg className="w-10 h-10 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-500 text-lg mb-2">No hay precios configurados</p>
                                    <p className="text-gray-400 text-sm">Agrega el primer precio para este producto</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {precios.map((precio) => (
                                        <div key={precio.id_precio} className="border-2 border-gray-200 rounded-lg p-4 hover:border-orange-400 hover:shadow-md transition group">
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
                                                    L. {parseFloat(precio.precio).toFixed(2)}
                                                </p>
                                                <div className="flex justify-end gap-2">
                                                    <Can I="update" a={MODULOS.PRECIO}>
                                                        <button
                                                            onClick={() => abrirModalEditarPrecio(precio)}
                                                            className="text-blue-600 hover:text-blue-900 transition"
                                                            title="Editar"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>
                                                    </Can>
                                                    <Can I="update" a={MODULOS.PRECIO}>
                                                        <button
                                                            onClick={() => handleToggleActivoPrecio(precio)}
                                                            className={`${precio.activo ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'} transition`}
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
                                                    </Can>
                                                    <Can I="delete" a={MODULOS.PRECIO}>
                                                        <button
                                                            onClick={() => handleEliminarPrecio(precio)}
                                                            className="text-red-600 hover:text-red-900 transition"
                                                            title="Eliminar"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </Can>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Formulario Precio */}
            {modalPrecioForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
                    <div className="bg-white rounded-lg max-w-md w-full shadow-2xl">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-xl font-bold text-gray-900">
                                {precioSeleccionado ? 'Editar Precio' : 'Agregar Nuevo Precio'}
                            </h3>
                        </div>

                        <form onSubmit={handleSubmitPrecio} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre de Presentación *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formPrecioData.nombre_presentacion}
                                    onChange={(e) => setFormPrecioData({...formPrecioData, nombre_presentacion: e.target.value})}
                                    placeholder="Ej: Individual, Familiar, Combo"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Descripción
                                </label>
                                <textarea
                                    value={formPrecioData.descripcion}
                                    onChange={(e) => setFormPrecioData({...formPrecioData, descripcion: e.target.value})}
                                    placeholder="Descripción opcional del precio"
                                    rows="3"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Precio (HNL) *
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={formPrecioData.precio}
                                    onChange={(e) => setFormPrecioData({...formPrecioData, precio: e.target.value})}
                                    placeholder="0.00"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="precio-activo"
                                    checked={formPrecioData.activo}
                                    onChange={(e) => setFormPrecioData({...formPrecioData, activo: e.target.checked})}
                                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                />
                                <label htmlFor="precio-activo" className="ml-2 block text-sm text-gray-900">
                                    Precio activo
                                </label>
                            </div>

                            <div className="flex gap-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => setModalPrecioForm(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition shadow-lg"
                                >
                                    {precioSeleccionado ? 'Actualizar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Confirmación */}
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

export default GestionProductos;
