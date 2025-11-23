import { useEffect, useState } from 'react';
import clientesService from '../../services/clientes.service';

const Contacto = () => {
    const [cliente, setCliente] = useState(null);
    const [editando, setEditando] = useState(false);
    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState(null);
    const [mensaje, setMensaje] = useState(null);
    
    const [formData, setFormData] = useState({
        nombre: '',
        telefono: ''
    });

    useEffect(() => {
        cargarDatosCliente();
    }, []);

    const cargarDatosCliente = async () => {
        try {
            setLoading(true);
            // Por ahora usamos un ID de cliente fijo (id: 1)
            // En producción, esto vendría de la sesión/autenticación
            const clienteId = localStorage.getItem('clienteId') || '1';
            const data = await clientesService.getById(clienteId);
            setCliente(data);
            setFormData({
                nombre: data.nombre || '',
                telefono: data.telefono || ''
            });
            setError(null);
        } catch (err) {
            console.error('Error al cargar datos del cliente:', err);
            setError('No se pudieron cargar tus datos');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validaciones
        if (!formData.nombre.trim()) {
            setError('El nombre es requerido');
            return;
        }
        
        if (!formData.telefono.trim()) {
            setError('El teléfono es requerido');
            return;
        }

        if (!/^\d{8,}$/.test(formData.telefono.replace(/[\s-]/g, ''))) {
            setError('El teléfono debe tener al menos 8 dígitos');
            return;
        }

        try {
            setGuardando(true);
            setError(null);
            
            const clienteId = localStorage.getItem('clienteId') || '1';
            await clientesService.update(clienteId, formData);
            
            setMensaje('¡Datos actualizados correctamente!');
            setEditando(false);
            await cargarDatosCliente();
            
            // Limpiar mensaje después de 3 segundos
            setTimeout(() => setMensaje(null), 3000);
        } catch (err) {
            console.error('Error al actualizar datos:', err);
            setError('No se pudieron actualizar tus datos');
        } finally {
            setGuardando(false);
        }
    };

    const handleCancelar = () => {
        setFormData({
            nombre: cliente.nombre || '',
            telefono: cliente.telefono || ''
        });
        setEditando(false);
        setError(null);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 py-12">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
                        <p className="text-gray-600">Cargando información...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 py-12">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">Información de Contacto</h1>
                    <p className="text-gray-600">Mantén tu información actualizada para que podamos contactarte</p>
                </div>

                {/* Mensajes */}
                {mensaje && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-700 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {mensaje}
                        </p>
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {/* Tarjeta de información */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header de la tarjeta */}
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-4xl">
                                👤
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">{cliente?.nombre || 'Cliente'}</h2>
                                <p className="text-blue-100">Cliente frecuente</p>
                            </div>
                        </div>
                    </div>

                    {/* Contenido de la tarjeta */}
                    <div className="p-6">
                        {!editando ? (
                            // Vista de solo lectura
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-2">
                                        Nombre completo
                                    </label>
                                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                        <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                        </svg>
                                        <p className="text-lg text-gray-800">{cliente?.nombre}</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-2">
                                        Teléfono
                                    </label>
                                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                        <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                        </svg>
                                        <p className="text-lg text-gray-800">{cliente?.telefono}</p>
                                    </div>
                                </div>

                                {cliente?.email && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-2">
                                            Correo electrónico
                                        </label>
                                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                            </svg>
                                            <p className="text-lg text-gray-800">{cliente.email}</p>
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={() => setEditando(true)}
                                    className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                    </svg>
                                    Editar información
                                </button>
                            </div>
                        ) : (
                            // Formulario de edición
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                                        Nombre completo *
                                    </label>
                                    <input
                                        type="text"
                                        id="nombre"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Ingresa tu nombre completo"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
                                        Teléfono *
                                    </label>
                                    <input
                                        type="tel"
                                        id="telefono"
                                        name="telefono"
                                        value={formData.telefono}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Ej: 99887766"
                                        required
                                    />
                                    <p className="mt-1 text-sm text-gray-500">Ingresa tu número sin espacios ni guiones</p>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        disabled={guardando}
                                        className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {guardando ? 'Guardando...' : 'Guardar cambios'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCancelar}
                                        disabled={guardando}
                                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>

                {/* Información adicional */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        ¿Por qué necesitamos tu información?
                    </h3>
                    <ul className="text-blue-800 text-sm space-y-1 ml-7">
                        <li>• Para contactarte sobre el estado de tus pedidos</li>
                        <li>• Para notificarte cuando tu orden esté lista</li>
                        <li>• Para resolver cualquier problema con tu pedido</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Contacto;
