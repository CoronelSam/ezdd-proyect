import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { clientesService } from '../../services';

const Contacto = () => {
    const { actualizarUsuario } = useAuth();
    const [cliente, setCliente] = useState(null);
    const [editandoPerfil, setEditandoPerfil] = useState(false);
    const [editandoClave, setEditandoClave] = useState(false);
    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState(null);
    const [exito, setExito] = useState(null);
    
    const [formPerfil, setFormPerfil] = useState({
        nombre: '',
        email: '',
        telefono: ''
    });

    const [formClave, setFormClave] = useState({
        claveActual: '',
        claveNueva: '',
        claveConfirmar: ''
    });

    useEffect(() => {
        cargarDatosCliente();
    }, []);

    const cargarDatosCliente = async () => {
        try {
            setLoading(true);
            const clienteId = localStorage.getItem('id_cliente');
            if (!clienteId) {
                setError('No se encontró la sesión del cliente');
                return;
            }
            
            const data = await clientesService.getById(clienteId);
            setCliente(data);
            setFormPerfil({
                nombre: data.nombre || '',
                email: data.email || '',
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

    const handlePerfilChange = (e) => {
        const { name, value } = e.target;
        setFormPerfil(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleClaveChange = (e) => {
        const { name, value } = e.target;
        setFormClave(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleGuardarPerfil = async (e) => {
        e.preventDefault();
        setError(null);
        setExito(null);
        setGuardando(true);

        try {
            const clienteId = localStorage.getItem('id_cliente');
            const resultado = await clientesService.update(clienteId, {
                nombre: formPerfil.nombre,
                email: formPerfil.email,
                telefono: formPerfil.telefono
            });
            
            // Actualizar el contexto de autenticación con los nuevos datos
            actualizarUsuario({
                nombre: resultado.cliente.nombre,
                email: resultado.cliente.email,
                telefono: resultado.cliente.telefono
            });
            
            setExito('Perfil actualizado exitosamente. Ahora puedes iniciar sesión con tu nuevo email.');
            setEditandoPerfil(false);
            await cargarDatosCliente();
            
            // Limpiar mensaje de éxito después de 5 segundos
            setTimeout(() => setExito(null), 5000);
        } catch (err) {
            console.error('Error al actualizar perfil:', err);
            setError(err.response?.data?.error || 'No se pudo actualizar el perfil');
        } finally {
            setGuardando(false);
        }
    };

    const handleGuardarClave = async (e) => {
        e.preventDefault();
        setError(null);
        setExito(null);

        // Validaciones
        if (formClave.claveNueva.length < 6) {
            setError('La nueva contraseña debe tener al menos 6 caracteres');
            return;
        }

        if (formClave.claveNueva !== formClave.claveConfirmar) {
            setError('Las contraseñas no coinciden');
            return;
        }

        setGuardando(true);

        try {
            const clienteId = localStorage.getItem('id_cliente');
            await clientesService.update(clienteId, {
                claveActual: formClave.claveActual,
                clave: formClave.claveNueva
            });
            
            setExito('Contraseña actualizada exitosamente. Ahora puedes iniciar sesión con tu nueva contraseña.');
            setEditandoClave(false);
            setFormClave({
                claveActual: '',
                claveNueva: '',
                claveConfirmar: ''
            });
            
            // Limpiar mensaje de éxito después de 5 segundos
            setTimeout(() => setExito(null), 5000);
        } catch (err) {
            console.error('Error al cambiar contraseña:', err);
            setError(err.response?.data?.error || 'No se pudo cambiar la contraseña');
        } finally {
            setGuardando(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-block w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                        <span className="text-3xl font-bold text-white">
                            {cliente?.nombre?.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
                    <p className="text-gray-600 mt-2">Administra tu información personal</p>
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Información Personal */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Información Personal</h2>
                            {!editandoPerfil && (
                                <button
                                    onClick={() => setEditandoPerfil(true)}
                                    className="text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Editar
                                </button>
                            )}
                        </div>

                        {!editandoPerfil ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Nombre Completo
                                    </label>
                                    <p className="text-gray-900 font-medium">{cliente?.nombre}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Email
                                    </label>
                                    <p className="text-gray-900 font-medium">{cliente?.email}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Teléfono
                                    </label>
                                    <p className="text-gray-900 font-medium">{cliente?.telefono || 'No registrado'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Fecha de Registro
                                    </label>
                                    <p className="text-gray-900 font-medium">
                                        {cliente?.fecha_registro ? new Date(cliente.fecha_registro).toLocaleDateString('es-HN') : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleGuardarPerfil} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nombre Completo *
                                    </label>
                                    <input
                                        type="text"
                                        name="nombre"
                                        required
                                        value={formPerfil.nombre}
                                        onChange={handlePerfilChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formPerfil.email}
                                        onChange={handlePerfilChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Teléfono
                                    </label>
                                    <input
                                        type="tel"
                                        name="telefono"
                                        value={formPerfil.telefono}
                                        onChange={handlePerfilChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditandoPerfil(false);
                                            setFormPerfil({
                                                nombre: cliente?.nombre || '',
                                                email: cliente?.email || '',
                                                telefono: cliente?.telefono || ''
                                            });
                                        }}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={guardando}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {guardando ? 'Guardando...' : 'Guardar'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Seguridad - Cambiar Contraseña */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Seguridad</h2>
                            {!editandoClave && (
                                <button
                                    onClick={() => setEditandoClave(true)}
                                    className="text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Cambiar Contraseña
                                </button>
                            )}
                        </div>

                        {!editandoClave ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                    <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    <div>
                                        <p className="font-medium text-gray-900">Contraseña</p>
                                        <p className="text-sm text-gray-500">••••••••</p>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
                                    <p className="font-medium text-blue-900 mb-1">💡 Consejo de Seguridad</p>
                                    <p>Usa una contraseña fuerte con al menos 6 caracteres que incluya letras y números.</p>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleGuardarClave} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Contraseña Actual *
                                    </label>
                                    <input
                                        type="password"
                                        name="claveActual"
                                        required
                                        value={formClave.claveActual}
                                        onChange={handleClaveChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Ingresa tu contraseña actual"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nueva Contraseña *
                                    </label>
                                    <input
                                        type="password"
                                        name="claveNueva"
                                        required
                                        minLength="6"
                                        value={formClave.claveNueva}
                                        onChange={handleClaveChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Mínimo 6 caracteres"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Confirmar Nueva Contraseña *
                                    </label>
                                    <input
                                        type="password"
                                        name="claveConfirmar"
                                        required
                                        minLength="6"
                                        value={formClave.claveConfirmar}
                                        onChange={handleClaveChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Repite la nueva contraseña"
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditandoClave(false);
                                            setFormClave({
                                                claveActual: '',
                                                claveNueva: '',
                                                claveConfirmar: ''
                                            });
                                        }}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={guardando}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {guardando ? 'Guardando...' : 'Cambiar Contraseña'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contacto;
