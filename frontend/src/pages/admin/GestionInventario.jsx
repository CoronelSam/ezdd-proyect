import { useEffect, useState } from 'react';
import { ingredientesService, inventariosService } from '../../services';

const GestionInventario = () => {
    const [inventarios, setInventarios] = useState([]);
    const [ingredientes, setIngredientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [inventarioSeleccionado, setInventarioSeleccionado] = useState(null);
    const [busqueda, setBusqueda] = useState('');
    const [filtroStock, setFiltroStock] = useState('todos');

    const [formData, setFormData] = useState({
        id_ingrediente: '',
        cantidad_actual: ''
    });

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const [inventariosData, ingredientesData] = await Promise.all([
                inventariosService.getAll(),
                ingredientesService.getAll()
            ]);
            setInventarios(inventariosData);
            setIngredientes(ingredientesData);
        } catch (error) {
            console.error('Error al cargar datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const abrirModal = (inventario = null) => {
        if (inventario) {
            setInventarioSeleccionado(inventario);
            setFormData({
                id_ingrediente: inventario.id_ingrediente,
                cantidad_actual: inventario.cantidad_actual
            });
        } else {
            setInventarioSeleccionado(null);
            setFormData({
                id_ingrediente: '',
                cantidad_actual: ''
            });
        }
        setModalAbierto(true);
    };

    const cerrarModal = () => {
        setModalAbierto(false);
        setInventarioSeleccionado(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (inventarioSeleccionado) {
                await inventariosService.update(inventarioSeleccionado.id_inventario, formData);
            } else {
                await inventariosService.create(formData);
            }
            await cargarDatos();
            cerrarModal();
        } catch (error) {
            console.error('Error al guardar inventario:', error);
            alert('Error al guardar el inventario');
        }
    };

    const eliminarInventario = async (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este registro de inventario?')) {
            try {
                await inventariosService.delete(id);
                await cargarDatos();
            } catch (error) {
                console.error('Error al eliminar:', error);
                alert('Error al eliminar el inventario');
            }
        }
    };

    const getNivelStock = (cantidadActual, stockMinimo) => {
        const num = parseFloat(cantidadActual);
        const minimo = parseFloat(stockMinimo || 10);
        if (num < minimo) return 'bajo';
        if (num < minimo * 3) return 'medio';
        return 'alto';
    };

    const inventariosFiltrados = inventarios.filter(inv => {
        const ingrediente = inv.ingrediente || ingredientes.find(i => i.id_ingrediente === inv.id_ingrediente);
        const nombreIngrediente = ingrediente?.nombre || '';
        const unidadMedida = ingrediente?.unidad_medida || '';
        
        const matchBusqueda = nombreIngrediente.toLowerCase().includes(busqueda.toLowerCase()) ||
                            unidadMedida.toLowerCase().includes(busqueda.toLowerCase());
        
        const nivelStock = getNivelStock(inv.cantidad_actual, ingrediente?.stock_minimo);
        const matchStock = filtroStock === 'todos' || nivelStock === filtroStock;
        
        return matchBusqueda && matchStock;
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
                        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">Gestión de Inventario</h1>
                        <p className="text-gray-600 mt-1">Control de stock de ingredientes</p>
                    </div>
                    <button
                        onClick={() => abrirModal()}
                        className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition flex items-center gap-2 shadow-lg"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Nuevo Inventario
                    </button>
                </div>

                {/* Estadísticas Rápidas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Ingredientes</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{inventarios.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Stock Bajo</p>
                                <p className="text-3xl font-bold text-red-600 mt-1">
                                    {inventarios.filter(i => {
                                        const ingrediente = i.ingrediente || ingredientes.find(ing => ing.id_ingrediente === i.id_ingrediente);
                                        return getNivelStock(i.cantidad_actual, ingrediente?.stock_minimo) === 'bajo';
                                    }).length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Stock Alto</p>
                                <p className="text-3xl font-bold text-green-600 mt-1">
                                    {inventarios.filter(i => {
                                        const ingrediente = i.ingrediente || ingredientes.find(ing => ing.id_ingrediente === i.id_ingrediente);
                                        return getNivelStock(i.cantidad_actual, ingrediente?.stock_minimo) === 'alto';
                                    }).length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filtros */}
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Buscar ingrediente..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                        <select
                            value={filtroStock}
                            onChange={(e) => setFiltroStock(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                            <option value="todos">Todos los niveles</option>
                            <option value="bajo">Stock bajo (≤ 10)</option>
                            <option value="medio">Stock medio (11-50)</option>
                            <option value="alto">Stock alto (&gt; 50)</option>
                        </select>
                    </div>
                </div>

                {/* Tabla de Inventarios */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
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
                                    Estado
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Última Actualización
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {inventariosFiltrados.map((inventario) => {
                                const ingrediente = inventario.ingrediente || ingredientes.find(i => i.id_ingrediente === inventario.id_ingrediente);
                                const nivelStock = getNivelStock(inventario.cantidad_actual, ingrediente?.stock_minimo);
                                
                                return (
                                    <tr key={inventario.id_inventario} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {ingrediente?.nombre || 'Desconocido'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 font-medium">
                                                {parseFloat(inventario.cantidad_actual).toFixed(2)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">
                                                {ingrediente?.unidad_medida || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                nivelStock === 'bajo' ? 'bg-red-100 text-red-800' :
                                                nivelStock === 'medio' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-green-100 text-green-800'
                                            }`}>
                                                {nivelStock === 'bajo' ? 'Stock Bajo' :
                                                 nivelStock === 'medio' ? 'Stock Medio' :
                                                 'Stock Alto'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(inventario.fecha_actualizacion).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-3">
                                                <button
                                                    onClick={() => abrirModal(inventario)}
                                                    className="text-orange-600 hover:text-orange-900"
                                                    title="Editar"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => eliminarInventario(inventario.id_inventario)}
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
                                );
                            })}
                        </tbody>
                    </table>
                    {inventariosFiltrados.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No se encontraron registros de inventario</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Crear/Editar */}
            {modalAbierto && (
                <div className="fixed inset-0 bg-gradient-to-br from-orange-50/80 via-white/80 to-yellow-50/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {inventarioSeleccionado ? 'Actualizar Inventario' : 'Nuevo Inventario'}
                            </h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Ingrediente *
                                    </label>
                                    <select
                                        required
                                        disabled={!!inventarioSeleccionado}
                                        value={formData.id_ingrediente}
                                        onChange={(e) => setFormData({...formData, id_ingrediente: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                                    >
                                        <option value="">Seleccionar ingrediente</option>
                                        {ingredientes.map(ing => (
                                            <option key={ing.id_ingrediente} value={ing.id_ingrediente}>
                                                {ing.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Cantidad Actual *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={formData.cantidad_actual}
                                        onChange={(e) => setFormData({...formData, cantidad_actual: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Ingrese la cantidad actual"
                                    />
                                    {formData.id_ingrediente && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Unidad: {ingredientes.find(i => i.id_ingrediente === parseInt(formData.id_ingrediente))?.unidad_medida || 'N/A'}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="mt-6 flex gap-3">
                                <button
                                    type="button"
                                    onClick={cerrarModal}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                                >
                                    {inventarioSeleccionado ? 'Actualizar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionInventario;
