import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { authService, empleadosService } from '../../services';

const GestionEmpleados = () => {
    const { usuario, actualizarUsuario } = useAuth();
    const [empleados, setEmpleados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        telefono: '',
        puesto: 'Mesero',
        salario: '',
        activo: true,
        clave: ''
    });
    const [error, setError] = useState(null);
    const [exito, setExito] = useState(null);

    const puestos = ['Gerente', 'Chef', 'Mesero', 'Cajero', 'Cocinero', 'Bartender', 'Ayudante de Cocina', 'Recepcionista'];

    useEffect(() => {
        cargarEmpleados();
    }, []);

    const cargarEmpleados = async () => {
        try {
            setLoading(true);
            const data = await empleadosService.getAll();
            setEmpleados(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error al cargar empleados:', error);
            setError('No se pudieron cargar los empleados');
            setEmpleados([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setExito(null);

        try {
            if (empleadoSeleccionado) {
                // Al editar, remover clave si está vacía
                const dataToSend = { ...formData };
                if (!dataToSend.clave) {
                    delete dataToSend.clave;
                }
                const empleadoActualizado = await empleadosService.update(empleadoSeleccionado.id_empleado, dataToSend);
                setExito('Empleado actualizado exitosamente');
                
                // Si el empleado actualizado es el usuario logueado, actualizar el contexto
                if (usuario?.tipo === 'empleado' && usuario?.id_empleado === empleadoSeleccionado.id_empleado) {
                    actualizarUsuario({
                        nombre: empleadoActualizado.nombre,
                        email: empleadoActualizado.email,
                        empleado: {
                            ...usuario.empleado,
                            nombre: empleadoActualizado.nombre,
                            email: empleadoActualizado.email,
                            puesto: empleadoActualizado.puesto
                        }
                    });
                }
            } else {
                await authService.registrarEmpleado(formData);
                setExito('Empleado creado exitosamente con usuario de acceso');
            }
            
            await cargarEmpleados();
            cerrarModal();
        } catch (error) {
            console.error('Error al guardar empleado:', error);
            setError(error.response?.data?.error || 'Error al guardar el empleado');
        }
    };

    const handleEliminar = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este empleado?')) return;

        try {
            await empleadosService.delete(id);
            setExito('Empleado eliminado exitosamente');
            await cargarEmpleados();
        } catch (error) {
            console.error('Error al eliminar empleado:', error);
            setError('Error al eliminar el empleado');
        }
    };

    const handleToggleEstado = async (empleado) => {
        try {
            if (empleado.activo) {
                await empleadosService.desactivar(empleado.id_empleado);
                setExito('Empleado desactivado exitosamente');
            } else {
                await empleadosService.reactivar(empleado.id_empleado);
                setExito('Empleado reactivado exitosamente');
            }
            await cargarEmpleados();
            setTimeout(() => setExito(null), 3000);
        } catch (error) {
            console.error('Error al cambiar estado del empleado:', error);
            setError('Error al cambiar el estado del empleado');
        }
    };

    const abrirModalNuevo = () => {
        setEmpleadoSeleccionado(null);
        setFormData({
            nombre: '',
            email: '',
            telefono: '',
            puesto: 'Mesero',
            salario: '',
            activo: true,
            clave: ''
        });
        setMostrarModal(true);
    };

    const abrirModalEditar = (empleado) => {
        setEmpleadoSeleccionado(empleado);
        setFormData({
            nombre: empleado.nombre,
            email: empleado.email,
            telefono: empleado.telefono || '',
            puesto: empleado.puesto,
            salario: empleado.salario,
            activo: empleado.activo
        });
        setMostrarModal(true);
    };

    const cerrarModal = () => {
        setMostrarModal(false);
        setEmpleadoSeleccionado(null);
        setError(null);
    };

    const formatearPrecio = (precio) => {
        return new Intl.NumberFormat('es-HN', {
            style: 'currency',
            currency: 'HNL'
        }).format(precio);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-yellow-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-yellow-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-orange-500 to-red-600">Gestión de Empleados</h1>
                        <p className="text-gray-600 mt-1">Administra tu equipo de trabajo</p>
                    </div>
                    <button
                        onClick={abrirModalNuevo}
                        className="px-6 py-3 bg-linear-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition flex items-center gap-2 shadow-lg"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Nuevo Empleado
                    </button>
                </div>

                {/* Mensajes */}
                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        {error}
                    </div>
                )}
                {exito && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                        {exito}
                    </div>
                )}

                {/* Lista de Empleados */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Empleado
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Puesto
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Contacto
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Salario
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {empleados.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        No hay empleados registrados
                                    </td>
                                </tr>
                            ) : (
                                empleados.map((empleado) => (
                                    <tr key={empleado.id_empleado} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                                                    <span className="text-white font-semibold">
                                                        {empleado.nombre.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {empleado.nombre}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        ID: {empleado.id_empleado}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {empleado.puesto}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{empleado.email}</div>
                                            {empleado.telefono && (
                                                <div className="text-sm text-gray-500">{empleado.telefono}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatearPrecio(empleado.salario)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                empleado.activo 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {empleado.activo ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-3">
                                                <button
                                                    onClick={() => abrirModalEditar(empleado)}
                                                    className="text-orange-600 hover:text-orange-900"
                                                    title="Editar"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleToggleEstado(empleado)}
                                                    className={`${empleado.activo ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'}`}
                                                    title={empleado.activo ? 'Desactivar' : 'Reactivar'}
                                                >
                                                    {empleado.activo ? (
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleEliminar(empleado.id_empleado)}
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

            {/* Modal Crear/Editar */}
            {mostrarModal && (
                <div className="fixed inset-0 bg-linear-to-br from-orange-50/80 via-white/80 to-yellow-50/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            {empleadoSeleccionado ? 'Editar Empleado' : 'Nuevo Empleado'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre Completo *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>

                            {!empleadoSeleccionado && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Contraseña *
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        value={formData.clave}
                                        onChange={(e) => setFormData({ ...formData, clave: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Teléfono
                                </label>
                                <input
                                    type="tel"
                                    value={formData.telefono}
                                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Puesto *
                                </label>
                                <select
                                    required
                                    value={formData.puesto}
                                    onChange={(e) => setFormData({ ...formData, puesto: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                >
                                    {puestos.map(puesto => (
                                        <option key={puesto} value={puesto}>{puesto}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Salario *
                                </label>
                                <input
                                    type="number"
                                    required
                                    step="0.01"
                                    min="0"
                                    value={formData.salario}
                                    onChange={(e) => setFormData({ ...formData, salario: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={cerrarModal}
                                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 bg-linear-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition shadow-lg"
                                >
                                    {empleadoSeleccionado ? 'Actualizar' : 'Crear Empleado'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionEmpleados;
