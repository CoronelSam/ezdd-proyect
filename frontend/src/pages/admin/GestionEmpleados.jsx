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
            setEmpleados(data);
        } catch (error) {
            console.error('Error al cargar empleados:', error);
            setError('No se pudieron cargar los empleados');
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
                const empleadoActualizado = await empleadosService.update(empleadoSeleccionado.id_empleado, formData);
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

    const abrirModalNuevo = () => {
        setEmpleadoSeleccionado(null);
        setFormData({
            nombre: '',
            email: '',
            telefono: '',
            puesto: 'Mesero',
            salario: '',
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
            clave: '' // No mostramos la contraseña actual
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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Gestión de Empleados</h1>
                        <p className="text-gray-600 mt-1">Administra tu equipo de trabajo</p>
                    </div>
                    <button
                        onClick={abrirModalNuevo}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
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
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
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
                                            <button
                                                onClick={() => abrirModalEditar(empleado)}
                                                className="text-blue-600 hover:text-blue-900 mr-4"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => handleEliminar(empleado.id_empleado)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Eliminar
                                            </button>
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
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
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Contraseña {!empleadoSeleccionado && '*'}
                                </label>
                                <input
                                    type="password"
                                    required={!empleadoSeleccionado}
                                    value={formData.clave}
                                    onChange={(e) => setFormData({ ...formData, clave: e.target.value })}
                                    placeholder={empleadoSeleccionado ? "Dejar en blanco para no cambiar" : ""}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Teléfono
                                </label>
                                <input
                                    type="tel"
                                    value={formData.telefono}
                                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
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
