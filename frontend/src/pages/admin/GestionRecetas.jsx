import { useEffect, useState } from 'react';
import { productosService, ingredientesService, recetasService } from '../../services';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import AlertMessage from '../../components/AlertMessage';

const GestionRecetas = () => {
    const [productos, setProductos] = useState([]);
    const [ingredientes, setIngredientes] = useState([]);
    const [recetas, setRecetas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [modalIngredienteAbierto, setModalIngredienteAbierto] = useState(false);
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    const [recetaSeleccionada, setRecetaSeleccionada] = useState(null);
    const [busquedaProducto, setBusquedaProducto] = useState('');
    const [alerta, setAlerta] = useState({ show: false, message: '', type: '' });
    const [costoProducto, setCostoProducto] = useState(null);
    const [modalCostoAbierto, setModalCostoAbierto] = useState(false);

    const [formDataIngrediente, setFormDataIngrediente] = useState({
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

    const cargarRecetasProducto = async (idProducto) => {
        try {
            const recetasData = await recetasService.getByProducto(idProducto);
            console.log('Recetas cargadas:', recetasData);
            setRecetas(recetasData);
        } catch (error) {
            console.error('Error al cargar recetas:', error);
            mostrarAlerta('Error al cargar recetas del producto', 'error');
        }
    };

    const mostrarAlerta = (message, type = 'info') => {
        setAlerta({ show: true, message, type });
        setTimeout(() => setAlerta({ show: false, message: '', type: '' }), 5000);
    };

    const handleVerRecetas = async (producto) => {
        console.log('Abriendo receta para producto:', producto);
        setProductoSeleccionado(producto);
        setModalAbierto(true);
        await cargarRecetasProducto(producto.id_producto);
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
                // Crear nueva receta
                await recetasService.create({
                    id_producto: productoSeleccionado.id_producto,
                    id_ingrediente: parseInt(formDataIngrediente.id_ingrediente),
                    cantidad_necesaria: parseFloat(formDataIngrediente.cantidad_necesaria)
                });
                mostrarAlerta('Ingrediente agregado a la receta exitosamente', 'success');
            }
            
            await cargarRecetasProducto(productoSeleccionado.id_producto);
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
            await cargarRecetasProducto(productoSeleccionado.id_producto);
        } catch (error) {
            console.error('Error al eliminar receta:', error);
            mostrarAlerta('Error al eliminar el ingrediente', 'error');
        }
    };

    const handleCalcularCosto = async (producto) => {
        try {
            const costo = await recetasService.calcularCosto(producto.id_producto);
            setCostoProducto({ producto, costo });
            setModalCostoAbierto(true);
        } catch (error) {
            console.error('Error al calcular costo:', error);
            mostrarAlerta('Error al calcular el costo del producto', 'error');
        }
    };

    const resetFormIngrediente = () => {
        setFormDataIngrediente({
            id_ingrediente: '',
            cantidad_necesaria: ''
        });
        setRecetaSeleccionada(null);
    };

    const handleCerrarModal = () => {
        setModalAbierto(false);
        setProductoSeleccionado(null);
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
            <PageHeader
                title="Gestión de Recetas"
                subtitle="Administra los ingredientes necesarios para cada producto"
            />

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
                            <div className="flex flex-col gap-2">
                                <Button
                                    onClick={() => handleVerRecetas(producto)}
                                    variant="primary"
                                    className="w-full"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    Ver Receta
                                </Button>
                                <Button
                                    onClick={() => handleCalcularCosto(producto)}
                                    variant="secondary"
                                    className="w-full"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                    Calcular Costo
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal de recetas del producto */}
            <Modal
                mostrar={modalAbierto}
                onCerrar={handleCerrarModal}
                titulo={`Receta: ${productoSeleccionado?.nombre || ''}`}
                maxWidth="max-w-4xl"
            >
                <div className="space-y-4">
                    {productoSeleccionado?.descripcion && (
                        <p className="text-gray-600 text-sm">
                            {productoSeleccionado.descripcion}
                        </p>
                    )}

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
                            description="Agrega ingredientes para completar la receta"
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
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Costo
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
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    L. {(parseFloat(receta.ingrediente?.precio_compra || 0) * 
                                                      parseFloat(receta.cantidad_necesaria)).toFixed(2)}
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

            {/* Modal de costo del producto */}
            <Modal
                mostrar={modalCostoAbierto}
                onCerrar={() => {
                    setModalCostoAbierto(false);
                    setCostoProducto(null);
                }}
                titulo="Costo del Producto"
                maxWidth="max-w-md"
            >
                {costoProducto && (
                    <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {costoProducto.producto.nombre}
                            </h3>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Costo de ingredientes:</span>
                                    <span className="text-2xl font-bold text-blue-600">
                                        L. {parseFloat(costoProducto.costo.costo_total || 0).toFixed(2)}
                                    </span>
                                </div>
                                {costoProducto.costo.ingredientes && costoProducto.costo.ingredientes.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-blue-200">
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Desglose:</h4>
                                        <div className="space-y-1">
                                            {costoProducto.costo.ingredientes.map((ing, idx) => (
                                                <div key={idx} className="flex justify-between text-sm">
                                                    <span className="text-gray-600">{ing.nombre}</span>
                                                    <span className="text-gray-900">L. {parseFloat(ing.costo || 0).toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="text-sm text-gray-500">
                            <p>* Este es el costo basado en los ingredientes de la receta.</p>
                            <p>* Para calcular el precio de venta, considera los costos operativos y el margen de ganancia.</p>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default GestionRecetas;
