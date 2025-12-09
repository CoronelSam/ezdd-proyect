import { useEffect, useState } from 'react';
import { categoriasService } from '../../services';
import ModalConfirmacion from '../../components/ModalConfirmacion';

const GestionCategorias = () => {
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
    const [busqueda, setBusqueda] = useState('');
    const [modalConfirmacion, setModalConfirmacion] = useState({
        mostrar: false,
        tipo: 'advertencia',
        titulo: '',
        mensaje: '',
        descripcion: '',
        accion: null,
        categoriaId: null
    });

    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: ''
    });

    useEffect(() => {
        cargarCategorias();
    }, []);

    const cargarCategorias = async () => {
        try {
            const data = await categoriasService.getAll();
            setCategorias(data);
        } catch (error) {
            console.error('Error al cargar categorías:', error);
        } finally {
            setLoading(false);
        }
    };

    const abrirModal = (categoria = null) => {
        if (categoria) {
            setCategoriaSeleccionada(categoria);
            setFormData({
                nombre: categoria.nombre,
                descripcion: categoria.descripcion || ''
            });
        } else {
            setCategoriaSeleccionada(null);
            setFormData({
                nombre: '',
                descripcion: ''
            });
        }
        setModalAbierto(true);
    };

    const cerrarModal = () => {
        setModalAbierto(false);
        setCategoriaSeleccionada(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (categoriaSeleccionada) {
                await categoriasService.update(categoriaSeleccionada.id_categoria, formData);
            } else {
                await categoriasService.create(formData);
            }
            await cargarCategorias();
            cerrarModal();
        } catch (error) {
            console.error('Error al guardar categoría:', error);
            const errorMessage = error.response?.data?.detalles 
                ? error.response.data.detalles.map(d => d.msg || d).join(', ')
                : error.response?.data?.error || 'Error al guardar la categoría';
            alert(errorMessage);
        }
    };

    const abrirModalDesactivar = (id) => {
        setModalConfirmacion({
            mostrar: true,
            tipo: 'advertencia',
            titulo: '¿Desactivar categoría?',
            mensaje: 'Los productos de esta categoría no estarán disponibles para los clientes',
            descripcion: 'Útil para casos como ley seca, falta de ingredientes o menús temporales. Podrás reactivarla en cualquier momento.',
            accion: 'desactivar',
            categoriaId: id
        });
    };

    const abrirModalEliminar = (id) => {
        setModalConfirmacion({
            mostrar: true,
            tipo: 'peligro',
            titulo: '⚠️ Eliminar permanentemente',
            mensaje: 'Esta acción NO se puede deshacer',
            descripcion: 'Se eliminará la categoría y toda su información de forma permanente',
            accion: 'eliminar',
            categoriaId: id
        });
    };

    const cerrarModalConfirmacion = () => {
        setModalConfirmacion({
            mostrar: false,
            tipo: 'advertencia',
            titulo: '',
            mensaje: '',
            descripcion: '',
            accion: null,
            categoriaId: null
        });
    };

    const confirmarAccion = async () => {
        const { accion, categoriaId } = modalConfirmacion;
        
        try {
            if (accion === 'desactivar') {
                const resultado = await categoriasService.delete(categoriaId);
                // Mostrar mensaje si hay productos afectados
                if (resultado?.productos_afectados > 0) {
                    alert(`✅ Categoría desactivada exitosamente.\n\n${resultado.productos_afectados} producto(s) activo(s) ya no estarán disponibles para los clientes.`);
                }
            } else if (accion === 'eliminar') {
                await categoriasService.deletePermanente(categoriaId);
            }
            await cargarCategorias();
            cerrarModalConfirmacion();
        } catch (error) {
            console.error(`Error al ${accion}:`, error);
            let errorMessage = error.response?.data?.error || `Error al ${accion} la categoría`;
            
            // Personalizar mensaje según el error
            if (errorMessage.includes('productos asociados')) {
                errorMessage = '❌ No se puede eliminar esta categoría porque tiene productos asociados.\n\nPrimero debes eliminar o reasignar todos los productos de esta categoría.';
            }
            
            alert(errorMessage);
            cerrarModalConfirmacion();
        }
    };

    const reactivarCategoria = async (id) => {
        try {
            await categoriasService.reactivar(id);
            await cargarCategorias();
        } catch (error) {
            console.error('Error al reactivar:', error);
            const errorMessage = error.response?.data?.error || 'Error al reactivar la categoría';
            alert(errorMessage);
        }
    };

    const categoriasFiltradas = categorias.filter(c =>
        c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        (c.descripcion && c.descripcion.toLowerCase().includes(busqueda.toLowerCase()))
    );

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
                        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">Gestión de Categorías</h1>
                        <p className="text-gray-600 mt-1">Organiza los productos del menú</p>
                    </div>
                    <button
                        onClick={() => abrirModal()}
                        className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition flex items-center gap-2 shadow-lg"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Nueva Categoría
                    </button>
                </div>

                {/* Buscador */}
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <input
                        type="text"
                        placeholder="Buscar categoría..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                </div>

                {/* Lista de Categorías */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoriasFiltradas.map((categoria) => (
                        <div key={categoria.id_categoria} className={`bg-white rounded-lg shadow hover:shadow-lg transition p-6 ${!categoria.activa ? 'opacity-75 border-2 border-yellow-200' : ''}`}>
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        {categoria.nombre}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {categoria.descripcion || 'Sin descripción'}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center shadow-md">
                                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-gray-200 space-y-2">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => abrirModal(categoria)}
                                        className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition text-sm font-medium shadow-md"
                                    >
                                        Editar
                                    </button>
                                    {categoria.activa ? (
                                        <button
                                            onClick={() => abrirModalDesactivar(categoria.id_categoria)}
                                            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition text-sm font-medium"
                                            title="Desactivar categoría"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                            </svg>
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => reactivarCategoria(categoria.id_categoria)}
                                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm font-medium"
                                            title="Reactivar categoría"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </button>
                                    )}
                                    <button
                                        onClick={() => abrirModalEliminar(categoria.id_categoria)}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
                                        title="Eliminar permanentemente"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                                {!categoria.activa && (
                                    <div className="flex items-center justify-center gap-2 text-xs text-yellow-600 bg-yellow-50 py-1 px-2 rounded">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        Desactivada
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {categoriasFiltradas.length === 0 && (
                    <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <p className="mt-4 text-gray-500">No se encontraron categorías</p>
                    </div>
                )}
            </div>

            {/* Modal Crear/Editar */}
            {modalAbierto && (
                <div className="fixed inset-0 bg-gradient-to-br from-orange-50/80 via-white/80 to-yellow-50/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {categoriaSeleccionada ? 'Editar Categoría' : 'Nueva Categoría'}
                            </h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nombre *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.nombre}
                                        onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        placeholder="Ej: Bebidas, Entradas, Platos Fuertes..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Descripción
                                    </label>
                                    <textarea
                                        value={formData.descripcion}
                                        onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                                        rows="3"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        placeholder="Descripción opcional de la categoría..."
                                    />
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
                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition font-medium shadow-lg"
                                >
                                    {categoriaSeleccionada ? 'Actualizar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Confirmación */}
            <ModalConfirmacion
                mostrar={modalConfirmacion.mostrar}
                tipo={modalConfirmacion.tipo}
                titulo={modalConfirmacion.titulo}
                mensaje={modalConfirmacion.mensaje}
                descripcion={modalConfirmacion.descripcion}
                textoBotonConfirmar={modalConfirmacion.accion === 'desactivar' ? 'Desactivar' : 'Eliminar'}
                textoBotonCancelar="Cancelar"
                onConfirmar={confirmarAccion}
                onCancelar={cerrarModalConfirmacion}
            />
        </div>
    );
};

export default GestionCategorias;
