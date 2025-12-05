import { useEffect, useState } from 'react';
import { usuariosService } from '../../services';

const GestionUsuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
    const [modalPassword, setModalPassword] = useState(false);
    const [busqueda, setBusqueda] = useState('');
    const [filtroRol, setFiltroRol] = useState('todos');
    const [error, setError] = useState(null);
    const [exito, setExito] = useState(null);

    const [formData, setFormData] = useState({
        username: '',
        password: '',
        rol: 'empleado',
        activo: true
    });

    const [formPassword, setFormPassword] = useState({
        passwordActual: '',
        passwordNuevo: '',
        passwordConfirmar: ''
    });

    const roles = [
        { value: 'admin', label: 'Administrador' },
        { value: 'empleado', label: 'Empleado' },
        { value: 'cajero', label: 'Cajero' },
        { value: 'cocinero', label: 'Cocinero' }
    ];

    useEffect(() => {
        cargarUsuarios();
    }, []);

    const cargarUsuarios = async () => {
        try {
            setLoading(true);
            const data = await usuariosService.getAll();
            setUsuarios(data);
            setError(null);
        } catch (err) {
            console.error('Error al cargar usuarios:', err);
            setError('No se pudieron cargar los usuarios');
        } finally {
            setLoading(false);
        }
    };

    const abrirModal = (usuario = null) => {
        if (usuario) {
            setUsuarioSeleccionado(usuario);
            setFormData({
                username: usuario.username,
                password: '',
                rol: usuario.rol,
                activo: usuario.activo
            });
        } else {
            setUsuarioSeleccionado(null);
            setFormData({
                username: '',
                password: '',
                rol: 'empleado',
                activo: true
            });
        }
        setModalAbierto(true);
        setError(null);
    };

    const cerrarModal = () => {
        setModalAbierto(false);
        setUsuarioSeleccionado(null);
        setError(null);
    };

    const abrirModalPassword = (usuario) => {
        setUsuarioSeleccionado(usuario);
        setFormPassword({
            passwordActual: '',
            passwordNuevo: '',
            passwordConfirmar: ''
        });
        setModalPassword(true);
        setError(null);
    };

    const cerrarModalPassword = () => {
        setModalPassword(false);
        setUsuarioSeleccionado(null);
        setFormPassword({
            passwordActual: '',
            passwordNuevo: '',
            passwordConfirmar: ''
        });
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setExito(null);

        try {
            if (usuarioSeleccionado) {
                // Al editar, no enviamos password si está vacío
                const dataToSend = { ...formData };
                if (!dataToSend.password) {
                    delete dataToSend.password;
                }
                await usuariosService.update(usuarioSeleccionado.id_usuario_sistema, dataToSend);
                setExito('Usuario actualizado exitosamente');
            } else {
                // Al crear, password es requerido
                if (!formData.password || formData.password.length < 6) {
                    setError('La contraseña debe tener al menos 6 caracteres');
                    return;
                }
                await usuariosService.create(formData);
                setExito('Usuario creado exitosamente');
            }
            await cargarUsuarios();
            cerrarModal();
            setTimeout(() => setExito(null), 3000);
        } catch (err) {
            console.error('Error al guardar usuario:', err);
            setError(err.response?.data?.error || 'Error al guardar el usuario');
        }
    };

    const handleCambiarPassword = async (e) => {
        e.preventDefault();
        setError(null);
        setExito(null);

        if (formPassword.passwordNuevo.length < 6) {
            setError('La nueva contraseña debe tener al menos 6 caracteres');
            return;
        }

        if (formPassword.passwordNuevo !== formPassword.passwordConfirmar) {
            setError('Las contraseñas no coinciden');
            return;
        }

        try {
            await usuariosService.cambiarPassword(usuarioSeleccionado.id_usuario_sistema, {
                passwordActual: formPassword.passwordActual,
                passwordNuevo: formPassword.passwordNuevo
            });
            setExito('Contraseña cambiada exitosamente');
            cerrarModalPassword();
            setTimeout(() => setExito(null), 3000);
        } catch (err) {
            console.error('Error al cambiar contraseña:', err);
            setError(err.response?.data?.error || 'Error al cambiar la contraseña');
        }
    };

    const toggleEstado = async (usuario) => {
        try {
            if (usuario.activo) {
                await usuariosService.desactivar(usuario.id_usuario_sistema);
                setExito('Usuario desactivado');
            } else {
                await usuariosService.reactivar(usuario.id_usuario_sistema);
                setExito('Usuario reactivado');
            }
            await cargarUsuarios();
            setTimeout(() => setExito(null), 3000);
        } catch (err) {
            console.error('Error al cambiar estado:', err);
            setError('Error al cambiar el estado del usuario');
        }
    };

    const eliminarUsuario = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) {
            return;
        }

        try {
            await usuariosService.delete(id);
            setExito('Usuario eliminado exitosamente');
            await cargarUsuarios();
            setTimeout(() => setExito(null), 3000);
        } catch (err) {
            console.error('Error al eliminar:', err);
            setError('Error al eliminar el usuario');
        }
    };

    const usuariosFiltrados = usuarios.filter(u => {
        const matchBusqueda = u.username.toLowerCase().includes(busqueda.toLowerCase());
        const matchRol = filtroRol === 'todos' || u.rol === filtroRol;
        return matchBusqueda && matchRol;
    });

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
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">Gestión de Usuarios del Sistema</h1>
                        <p className="text-gray-600 mt-1">Administra los accesos al sistema</p>
                    </div>
                    <button
                        onClick={() => abrirModal()}
                        className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition flex items-center gap-2 shadow-lg"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Nuevo Usuario
                    </button>
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

                {/* Filtros */}
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Buscar por usuario..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                        <select
                            value={filtroRol}
                            onChange={(e) => setFiltroRol(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                            <option value="todos">Todos los roles</option>
                            {roles.map(rol => (
                                <option key={rol.value} value={rol.value}>{rol.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Tabla de Usuarios */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Usuario
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Rol
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Última Actividad
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {usuariosFiltrados.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        No se encontraron usuarios
                                    </td>
                                </tr>
                            ) : (
                                usuariosFiltrados.map((usuario) => (
                                    <tr key={usuario.id_usuario_sistema} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-md">
                                                        <span className="text-white font-medium text-sm">
                                                            {usuario.username.substring(0, 2).toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {usuario.username}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        ID: {usuario.id_usuario_sistema}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                usuario.rol === 'admin' ? 'bg-purple-100 text-purple-800' :
                                                usuario.rol === 'empleado' ? 'bg-blue-100 text-blue-800' :
                                                usuario.rol === 'cajero' ? 'bg-green-100 text-green-800' :
                                                'bg-orange-100 text-orange-800'
                                            }`}>
                                                {roles.find(r => r.value === usuario.rol)?.label || usuario.rol}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => toggleEstado(usuario)}
                                                className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    usuario.activo
                                                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                                                } transition cursor-pointer`}
                                            >
                                                {usuario.activo ? 'Activo' : 'Inactivo'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {usuario.ultima_conexion 
                                                ? new Date(usuario.ultima_conexion).toLocaleDateString('es-HN')
                                                : 'Nunca'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => abrirModalPassword(usuario)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="Cambiar contraseña"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => abrirModal(usuario)}
                                                    className="text-orange-600 hover:text-orange-900"
                                                    title="Editar"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => eliminarUsuario(usuario.id_usuario_sistema)}
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
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Crear/Editar Usuario */}
            {modalAbierto && (
                <div className="fixed inset-0 bg-gradient-to-br from-orange-50/80 via-white/80 to-yellow-50/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {usuarioSeleccionado ? 'Editar Usuario' : 'Nuevo Usuario'}
                            </h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Usuario *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.username}
                                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        placeholder="nombre.usuario"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Contraseña {usuarioSeleccionado ? '(dejar vacío para no cambiar)' : '*'}
                                    </label>
                                    <input
                                        type="password"
                                        required={!usuarioSeleccionado}
                                        minLength="6"
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        placeholder="Mínimo 6 caracteres"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Rol *
                                    </label>
                                    <select
                                        required
                                        value={formData.rol}
                                        onChange={(e) => setFormData({...formData, rol: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    >
                                        {roles.map(rol => (
                                            <option key={rol.value} value={rol.value}>{rol.label}</option>
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
                                        Usuario activo
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
                                    {usuarioSeleccionado ? 'Actualizar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Cambiar Contraseña */}
            {modalPassword && (
                <div className="fixed inset-0 bg-gradient-to-br from-orange-50/80 via-white/80 to-yellow-50/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-900">
                                Cambiar Contraseña
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">Usuario: {usuarioSeleccionado?.username}</p>
                        </div>
                        <form onSubmit={handleCambiarPassword} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Contraseña Actual *
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        value={formPassword.passwordActual}
                                        onChange={(e) => setFormPassword({...formPassword, passwordActual: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nueva Contraseña *
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        minLength="6"
                                        value={formPassword.passwordNuevo}
                                        onChange={(e) => setFormPassword({...formPassword, passwordNuevo: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        placeholder="Mínimo 6 caracteres"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Confirmar Nueva Contraseña *
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        minLength="6"
                                        value={formPassword.passwordConfirmar}
                                        onChange={(e) => setFormPassword({...formPassword, passwordConfirmar: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        placeholder="Repite la nueva contraseña"
                                    />
                                </div>
                            </div>
                            <div className="mt-6 flex gap-3">
                                <button
                                    type="button"
                                    onClick={cerrarModalPassword}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition shadow-lg"
                                >
                                    Cambiar Contraseña
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionUsuarios;
