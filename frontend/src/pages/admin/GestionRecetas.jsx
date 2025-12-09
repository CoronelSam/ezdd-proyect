import { useEffect, useState } from 'react';
import { productosService, ingredientesService, recetasService, preciosService } from '../../services';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import AlertMessage from '../../components/AlertMessage';

const GestionRecetas = () => {
    const [productos, setProductos] = useState([]);
    const [ingredientes, setIngredientes] = useState([]);
    const [precios, setPrecios] = useState([]);
    const [recetas, setRecetas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalPresentacionesAbierto, setModalPresentacionesAbierto] = useState(false);
    const [modalRecetaAbierto, setModalRecetaAbierto] = useState(false);
    const [modalIngredienteAbierto, setModalIngredienteAbierto] = useState(false);
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    const [precioSeleccionado, setPrecioSeleccionado] = useState(null);
    const [recetaSeleccionada, setRecetaSeleccionada] = useState(null);
    const [busquedaProducto, setBusquedaProducto] = useState('');
    const [alerta, setAlerta] = useState({ show: false, message: '', type: '' });
    const [modalNuevaRecetaAbierto, setModalNuevaRecetaAbierto] = useState(false);

    const [formDataIngrediente, setFormDataIngrediente] = useState({
        id_ingrediente: '',
        cantidad_necesaria: ''
    });

    const [formNuevaReceta, setFormNuevaReceta] = useState({
        id_producto: '',
        id_precio: '',
        ingredientes: []
    });

    const [ingredienteTemp, setIngredienteTemp] = useState({
        id_ingrediente: '',
        cantidad_necesaria: ''
    });

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const [productosData, ingredientesData] = await Promise.all([
                productosService.getAll(),
                ingredientesService.getAll()
            ]);
            setProductos(productosData.filter(p => p.activo));
            setIngredientes(ingredientesData.filter(i => i.activo));
        } catch (error) {
            console.error('Error al cargar datos:', error);
            mostrarAlerta('Error al cargar datos', 'error');
        } finally {
            setLoading(false);
        }
    };

    const cargarPresentacionesProducto = async (idProducto) => {
        try {
            const preciosData = await preciosService.getByProducto(idProducto, false);
            setPrecios(preciosData);
        } catch (error) {
            console.error('Error al cargar presentaciones:', error);
            mostrarAlerta('Error al cargar presentaciones del producto', 'error');
        }
    };

    const cargarRecetasPrecio = async (idPrecio) => {
        try {
            const recetasData = await recetasService.getByPrecio(idPrecio);
            setRecetas(recetasData);
        } catch (error) {
            console.error('Error al cargar recetas:', error);
            mostrarAlerta('Error al cargar recetas de la presentación', 'error');
        }
    };

    const mostrarAlerta = (message, type = 'info') => {
        setAlerta({ show: true, message, type });
        setTimeout(() => setAlerta({ show: false, message: '', type: '' }), 5000);
    };

    const handleVerPresentaciones = async (producto) => {
        setProductoSeleccionado(producto);
        setModalPresentacionesAbierto(true);
        await cargarPresentacionesProducto(producto.id_producto);
    };

    const handleVerReceta = async (precio) => {
        setPrecioSeleccionado(precio);
        setModalRecetaAbierto(true);
        await cargarRecetasPrecio(precio.id_precio);
    };

    const handleAgregarIngrediente = () => {
        setRecetaSeleccionada(null);
        setFormDataIngrediente({
            id_ingrediente: '',
            cantidad_necesaria: ''
        });
        setModalIngredienteAbierto(true);
    };

    const handleEditarReceta = (receta) => {
        setRecetaSeleccionada(receta);
        setFormDataIngrediente({
            id_ingrediente: receta.id_ingrediente,
            cantidad_necesaria: receta.cantidad_necesaria
        });
        setModalIngredienteAbierto(true);
    };

    const handleSubmitIngrediente = async (e) => {
        e.preventDefault();
        
        try {
            if (recetaSeleccionada) {
                // Actualizar receta existente
                await recetasService.update(recetaSeleccionada.id_receta, {
                    cantidad_necesaria: parseFloat(formDataIngrediente.cantidad_necesaria)
                });
                mostrarAlerta('Receta actualizada exitosamente', 'success');
            } else {
                // Crear nueva receta vinculada al precio
                await recetasService.create({
                    id_precio: precioSeleccionado.id_precio,
                    id_ingrediente: parseInt(formDataIngrediente.id_ingrediente),
                    cantidad_necesaria: parseFloat(formDataIngrediente.cantidad_necesaria)
                });
                mostrarAlerta('Ingrediente agregado a la receta exitosamente', 'success');
            }
            
            await cargarRecetasPrecio(precioSeleccionado.id_precio);
            setModalIngredienteAbierto(false);
            resetFormIngrediente();
        } catch (error) {
            console.error('Error al guardar ingrediente:', error);
            mostrarAlerta(error.message || 'Error al guardar el ingrediente', 'error');
        }
    };

    const handleEliminarReceta = async (idReceta) => {
        if (!window.confirm('¿Está seguro de eliminar este ingrediente de la receta?')) {
            return;
        }

        try {
            await recetasService.delete(idReceta);
            mostrarAlerta('Ingrediente eliminado de la receta', 'success');
            await cargarRecetasPrecio(precioSeleccionado.id_precio);
        } catch (error) {
            console.error('Error al eliminar receta:', error);
            mostrarAlerta('Error al eliminar el ingrediente', 'error');
        }
    };

    const handleAbrirModalNuevaReceta = () => {
        setFormNuevaReceta({
            id_producto: '',
            id_precio: '',
            ingredientes: []
        });
        setIngredienteTemp({
            id_ingrediente: '',
            cantidad_necesaria: ''
        });
        setPrecios([]);
        setModalNuevaRecetaAbierto(true);
    };

    const handleProductoChangeNuevaReceta = async (idProducto) => {
        setFormNuevaReceta({ ...formNuevaReceta, id_producto: idProducto, id_precio: '', ingredientes: [] });
        if (idProducto) {
            try {
                const preciosData = await preciosService.getByProducto(idProducto, false);
                setPrecios(preciosData.filter(p => p.activo));
            } catch (error) {
                console.error('Error al cargar precios:', error);
                mostrarAlerta('Error al cargar presentaciones', 'error');
            }
        } else {
            setPrecios([]);
        }
    };

    const handleAgregarIngredienteTemp = () => {
        if (!ingredienteTemp.id_ingrediente || !ingredienteTemp.cantidad_necesaria) {
            mostrarAlerta('Selecciona un ingrediente y la cantidad', 'warning');
            return;
        }

        const ingrediente = ingredientes.find(i => i.id_ingrediente === parseInt(ingredienteTemp.id_ingrediente));
        if (!ingrediente) return;

        const yaExiste = formNuevaReceta.ingredientes.some(
            i => i.id_ingrediente === parseInt(ingredienteTemp.id_ingrediente)
        );

        if (yaExiste) {
            mostrarAlerta('Este ingrediente ya está en la lista', 'warning');
            return;
        }

        setFormNuevaReceta(prev => ({
            ...prev,
            ingredientes: [...prev.ingredientes, {
                id_ingrediente: parseInt(ingredienteTemp.id_ingrediente),
                cantidad_necesaria: parseFloat(ingredienteTemp.cantidad_necesaria),
                nombre: ingrediente.nombre,
                unidad_medida: ingrediente.unidad_medida
            }]
        }));

        setIngredienteTemp({
            id_ingrediente: '',
            cantidad_necesaria: ''
        });
    };

    const handleEliminarIngredienteTemp = (idIngrediente) => {
        setFormNuevaReceta(prev => ({
            ...prev,
            ingredientes: prev.ingredientes.filter(i => i.id_ingrediente !== idIngrediente)
        }));
    };

    const handleCrearReceta = async (e) => {
        e.preventDefault();

        if (!formNuevaReceta.id_producto) {
            mostrarAlerta('Selecciona un producto', 'warning');
            return;
        }

        if (!formNuevaReceta.id_precio) {
            mostrarAlerta('Selecciona una presentación', 'warning');
            return;
        }

        if (formNuevaReceta.ingredientes.length === 0) {
            mostrarAlerta('Agrega al menos un ingrediente', 'warning');
            return;
        }

        try {
            // Crear cada receta individualmente vinculada al precio
            for (const ingrediente of formNuevaReceta.ingredientes) {
                await recetasService.create({
                    id_precio: parseInt(formNuevaReceta.id_precio),
                    id_ingrediente: ingrediente.id_ingrediente,
                    cantidad_necesaria: ingrediente.cantidad_necesaria
                });
            }

            mostrarAlerta('Receta creada exitosamente', 'success');
            setModalNuevaRecetaAbierto(false);
            setFormNuevaReceta({ id_producto: '', id_precio: '', ingredientes: [] });
            setPrecios([]);
            await cargarDatos();
        } catch (error) {
            console.error('Error al crear receta:', error);
            mostrarAlerta(error.message || 'Error al crear la receta', 'error');
        }
    };

    const resetFormIngrediente = () => {
        setFormDataIngrediente({
            id_ingrediente: '',
            cantidad_necesaria: ''
        });
        setRecetaSeleccionada(null);
    };

    const handleCerrarModalPresentaciones = () => {
        setModalPresentacionesAbierto(false);
        setProductoSeleccionado(null);
        setPrecios([]);
    };

    const handleCerrarModalReceta = () => {
        setModalRecetaAbierto(false);
        setPrecioSeleccionado(null);
        setRecetas([]);
    };

    const productosFiltrados = productos.filter(producto =>
        producto.nombre.toLowerCase().includes(busquedaProducto.toLowerCase()) ||
        producto.descripcion?.toLowerCase().includes(busquedaProducto.toLowerCase())
    );

    const ingredientesDisponibles = ingredientes.filter(ing => 
        !recetas.some(r => r.id_ingrediente === ing.id_ingrediente)
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <PageHeader
                    title="Gestión de Recetas"
                    subtitle="Administra los ingredientes necesarios para cada producto"
                />
                <Button
                    onClick={handleAbrirModalNuevaReceta}
                    variant="primary"
                    className="flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nueva Receta
                </Button>
            </div>

            {alerta.show && (
                <div className="mb-4">
                    <AlertMessage message={alerta.message} type={alerta.type} />
                </div>
            )}

            {/* Barra de búsqueda */}
            <div className="mb-6">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Buscar productos..."
                        value={busquedaProducto}
                        onChange={(e) => setBusquedaProducto(e.target.value)}
                        className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <svg
                        className="absolute left-3 top-3 h-5 w-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>
            </div>

            {/* Lista de productos */}
            {productosFiltrados.length === 0 ? (
                <EmptyState
                    message="No se encontraron productos"
                    description="Intenta con otros términos de búsqueda"
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {productosFiltrados.map((producto) => (
                        <div
                            key={producto.id_producto}
                            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        {producto.nombre}
                                    </h3>
                                    {producto.descripcion && (
                                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                            {producto.descripcion}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <Button
                                onClick={() => handleVerPresentaciones(producto)}
                                variant="primary"
                                className="w-full flex items-center justify-center"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                Ver Presentaciones
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal de presentaciones del producto */}
            <Modal
                mostrar={modalPresentacionesAbierto}
                onCerrar={handleCerrarModalPresentaciones}
                titulo={`Presentaciones: ${productoSeleccionado?.nombre || ''}`}
                maxWidth="max-w-3xl"
            >
                <div className="space-y-4">
                    {productoSeleccionado?.descripcion && (
                        <p className="text-gray-600 text-sm mb-4">
                            {productoSeleccionado.descripcion}
                        </p>
                    )}

                    {precios.length === 0 ? (
                        <EmptyState
                            message="No hay presentaciones para este producto"
                            description="Agrega presentaciones en la gestión de productos"
                        />
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {precios.map((precio) => (
                                <div
                                    key={precio.id_precio}
                                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-lg font-semibold text-gray-900">
                                                    {precio.nombre_presentacion}
                                                </h4>
                                                {!precio.activo && (
                                                    <span className="px-2 py-1 text-xs font-semibold text-red-600 bg-red-100 rounded">
                                                        Inactivo
                                                    </span>
                                                )}
                                            </div>
                                            {precio.descripcion && (
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {precio.descripcion}
                                                </p>
                                            )}
                                            <p className="text-lg font-bold text-green-600 mt-2">
                                                ${parseFloat(precio.precio).toFixed(2)}
                                            </p>
                                        </div>
                                        <Button
                                            onClick={() => handleVerReceta(precio)}
                                            variant="primary"
                                            disabled={!precio.activo}
                                            className="flex items-center justify-center"
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                            Ver Receta
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Modal>

            {/* Modal de receta de la presentación */}
            <Modal
                mostrar={modalRecetaAbierto}
                onCerrar={handleCerrarModalReceta}
                titulo={`Receta: ${productoSeleccionado?.nombre || ''} - ${precioSeleccionado?.nombre_presentacion || ''}`}
                maxWidth="max-w-4xl"
            >
                <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <p className="text-sm font-medium text-blue-900">
                                    Receta específica para: {precioSeleccionado?.nombre_presentacion}
                                </p>
                                <p className="text-sm text-blue-700 mt-1">
                                    Precio: ${parseFloat(precioSeleccionado?.precio || 0).toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={handleAgregarIngrediente}
                        variant="primary"
                        className="w-full"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Agregar Ingrediente
                    </Button>

                    {recetas.length === 0 ? (
                        <EmptyState
                            message="No hay ingredientes en esta receta"
                            description="Agrega ingredientes para completar la receta de esta presentación"
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Ingrediente
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Cantidad
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Unidad
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {recetas.map((receta) => (
                                        <tr key={receta.id_receta} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {receta.ingrediente?.nombre}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {parseFloat(receta.cantidad_necesaria).toFixed(2)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {receta.ingrediente?.unidad_medida}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEditarReceta(receta)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                        title="Editar"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleEliminarReceta(receta.id_receta)}
                                                        className="text-red-600 hover:text-red-900"
                                                        title="Eliminar"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </Modal>

            {/* Modal para agregar/editar ingrediente */}
            <Modal
                mostrar={modalIngredienteAbierto}
                onCerrar={() => {
                    setModalIngredienteAbierto(false);
                    resetFormIngrediente();
                }}
                titulo={recetaSeleccionada ? 'Editar Ingrediente' : 'Agregar Ingrediente'}
                maxWidth="max-w-md"
            >
                <form onSubmit={handleSubmitIngrediente} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ingrediente
                        </label>
                        <select
                            value={formDataIngrediente.id_ingrediente}
                            onChange={(e) => setFormDataIngrediente({
                                ...formDataIngrediente,
                                id_ingrediente: e.target.value
                            })}
                            disabled={!!recetaSeleccionada}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                            required
                        >
                            <option value="">Seleccionar ingrediente</option>
                            {recetaSeleccionada ? (
                                <option value={recetaSeleccionada.id_ingrediente}>
                                    {recetaSeleccionada.ingrediente?.nombre}
                                </option>
                            ) : (
                                ingredientesDisponibles.map((ing) => (
                                    <option key={ing.id_ingrediente} value={ing.id_ingrediente}>
                                        {ing.nombre} ({ing.unidad_medida})
                                    </option>
                                ))
                            )}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cantidad Necesaria
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={formDataIngrediente.cantidad_necesaria}
                            onChange={(e) => setFormDataIngrediente({
                                ...formDataIngrediente,
                                cantidad_necesaria: e.target.value
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                        {formDataIngrediente.id_ingrediente && (
                            <p className="mt-1 text-sm text-gray-500">
                                Unidad: {
                                    recetaSeleccionada 
                                        ? recetaSeleccionada.ingrediente?.unidad_medida
                                        : ingredientes.find(i => i.id_ingrediente === parseInt(formDataIngrediente.id_ingrediente))?.unidad_medida
                                }
                            </p>
                        )}
                    </div>

                    <div className="flex gap-3 justify-end pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                                setModalIngredienteAbierto(false);
                                resetFormIngrediente();
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" variant="primary">
                            {recetaSeleccionada ? 'Actualizar' : 'Agregar'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Modal Nueva Receta */}
            <Modal
                mostrar={modalNuevaRecetaAbierto}
                onCerrar={() => setModalNuevaRecetaAbierto(false)}
                titulo="Crear Nueva Receta"
                maxWidth="max-w-3xl"
            >
                <form onSubmit={handleCrearReceta} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Producto
                            </label>
                            <select
                                value={formNuevaReceta.id_producto}
                                onChange={(e) => handleProductoChangeNuevaReceta(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            >
                                <option value="">Seleccionar producto</option>
                                {productos.map((prod) => (
                                    <option key={prod.id_producto} value={prod.id_producto}>
                                        {prod.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Presentación
                            </label>
                            <select
                                value={formNuevaReceta.id_precio}
                                onChange={(e) => setFormNuevaReceta({ ...formNuevaReceta, id_precio: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                                disabled={!formNuevaReceta.id_producto}
                            >
                                <option value="">Seleccionar presentación</option>
                                {precios.map((precio) => (
                                    <option key={precio.id_precio} value={precio.id_precio}>
                                        {precio.nombre_presentacion} - ${parseFloat(precio.precio).toFixed(2)}
                                    </option>
                                ))}
                            </select>
                            {!formNuevaReceta.id_producto && (
                                <p className="mt-1 text-sm text-gray-500">
                                    Primero selecciona un producto
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Ingredientes de la Receta</h3>
                        
                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Ingrediente
                                    </label>
                                    <select
                                        value={ingredienteTemp.id_ingrediente}
                                        onChange={(e) => setIngredienteTemp({ ...ingredienteTemp, id_ingrediente: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Seleccionar ingrediente</option>
                                        {ingredientes.map((ing) => (
                                            <option key={ing.id_ingrediente} value={ing.id_ingrediente}>
                                                {ing.nombre} ({ing.unidad_medida})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Cantidad
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            value={ingredienteTemp.cantidad_necesaria}
                                            onChange={(e) => setIngredienteTemp({ ...ingredienteTemp, cantidad_necesaria: e.target.value })}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="0.00"
                                        />
                                        <Button
                                            type="button"
                                            onClick={handleAgregarIngredienteTemp}
                                            variant="primary"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {formNuevaReceta.ingredientes.length === 0 ? (
                            <EmptyState
                                message="No hay ingredientes agregados"
                                description="Agrega ingredientes para completar la receta"
                            />
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                                Ingrediente
                                            </th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                                Cantidad
                                            </th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                                Unidad
                                            </th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {formNuevaReceta.ingredientes.map((ing) => (
                                            <tr key={ing.id_ingrediente}>
                                                <td className="px-4 py-2 text-sm text-gray-900">{ing.nombre}</td>
                                                <td className="px-4 py-2 text-sm text-gray-900">{ing.cantidad_necesaria}</td>
                                                <td className="px-4 py-2 text-sm text-gray-900">{ing.unidad_medida}</td>
                                                <td className="px-4 py-2 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleEliminarIngredienteTemp(ing.id_ingrediente)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 justify-end pt-4 border-t">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setModalNuevaRecetaAbierto(false)}
                        >
                            Cancelar
                        </Button>
                        <Button 
                            type="submit" 
                            variant="primary"
                            disabled={formNuevaReceta.ingredientes.length === 0}
                        >
                            Crear Receta
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default GestionRecetas;
